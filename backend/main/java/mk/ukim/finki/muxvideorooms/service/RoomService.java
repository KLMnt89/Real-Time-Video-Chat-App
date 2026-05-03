package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.model.enums.RoomStatus;
import mk.ukim.finki.muxvideorooms.repository.ContactRepository;
import mk.ukim.finki.muxvideorooms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final ContactRepository contactRepository;
    private final LiveKitService liveKitService;
    private final SseService sseService;
    private final RoomParticipantLogService participantLogService;

    @Value("${livekit.public-url:wss://videochatapp-jbc6g95h.livekit.cloud}")
    private String liveKitPublicUrl;

    public RoomService(RoomRepository roomRepository,
                       ContactRepository contactRepository,
                       LiveKitService liveKitService,
                       SseService sseService,
                       RoomParticipantLogService participantLogService) {
        this.roomRepository       = roomRepository;
        this.contactRepository    = contactRepository;
        this.liveKitService       = liveKitService;
        this.sseService           = sseService;
        this.participantLogService = participantLogService;
    }

    public List<Room> getAll() {
        return roomRepository.findAll();
    }

    public Room getById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
    }

    public Room getByInviteCode(String code) {
        return roomRepository.findByInviteCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid invite code: " + code));
    }

    public List<Room> getActive() {
        return roomRepository.findByStatus(RoomStatus.ACTIVE);
    }

    public Map<String, Object> createWithHostToken(String name, String createdBy, String hostIdentity, List<Long> participantIds) {
        long recentCount = roomRepository.countByCreatedByAndCreatedAtAfter(createdBy, LocalDateTime.now().minusHours(1));
        if (recentCount >= 10) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded: max 10 rooms per hour");
        }
        Room room = create(name, createdBy, participantIds);
        String identity = (hostIdentity != null && !hostIdentity.isBlank()) ? hostIdentity : createdBy;
        String token = liveKitService.createParticipantToken(room.getLiveKitRoomName(), identity, createdBy);
        Map<String, Object> result = new HashMap<>();
        result.put("id", room.getId());
        result.put("name", room.getName());
        result.put("inviteCode", room.getInviteCode());
        result.put("liveKitRoomName", room.getLiveKitRoomName());
        result.put("status", room.getStatus().name());
        result.put("createdBy", room.getCreatedBy());
        result.put("createdAt", room.getCreatedAt());
        result.put("token", token);
        result.put("url", liveKitPublicUrl);
        return result;
    }

    public Room create(String name, String createdBy, List<Long> participantIds) {
        String liveKitRoomName = liveKitService.createRoom();
        Room room = new Room();
        room.setName(name);
        room.setLiveKitRoomName(liveKitRoomName);
        room.setInviteCode(UUID.randomUUID().toString());
        room.setStatus(RoomStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();
        room.setCreatedAt(now);
        room.setExpiresAt(now.plusHours(24));
        room.setCreatedBy(createdBy);
        if (participantIds != null && !participantIds.isEmpty()) {
            List<Contact> participants = contactRepository.findAllById(participantIds);
            room.setParticipants(participants);
        }
        Room saved = roomRepository.save(room);
        sseService.broadcast("room.created", Map.of(
                "roomId", saved.getId(),
                "roomName", saved.getName(),
                "inviteCode", saved.getInviteCode()
        ));
        return saved;
    }

    public Room update(Long id, String name) {
        Room room = getById(id);
        room.setName(name);
        return roomRepository.save(room);
    }

    public Room addParticipant(Long roomId, Long contactId) {
        Room room = getById(roomId);
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found: " + contactId));
        if (!room.getParticipants().contains(contact)) {
            room.getParticipants().add(contact);
        }
        return roomRepository.save(room);
    }

    public Map<String, String> joinRoom(String inviteCode, String participantId, String displayName) {
        Room room = getByInviteCode(inviteCode);
        if (room.getStatus() == RoomStatus.ENDED) {
            throw new RuntimeException("Room has ended");
        }
        if (room.getExpiresAt() != null && LocalDateTime.now().isAfter(room.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.GONE, "invite_expired");
        }
        String name = (displayName != null && !displayName.isBlank()) ? displayName : participantId;
        String token = liveKitService.createParticipantToken(room.getLiveKitRoomName(), participantId, name);
        participantLogService.logJoin(room.getId(), name);
        return Map.of(
                "token", token,
                "url", liveKitPublicUrl,
                "roomId", String.valueOf(room.getId()),
                "roomName", room.getName()
        );
    }

    public Room endRoom(Long id) {
        Room room = getById(id);
        liveKitService.deleteRoom(room.getLiveKitRoomName());
        room.setStatus(RoomStatus.ENDED);
        room.setEndedAt(LocalDateTime.now());
        return roomRepository.save(room);
    }

    public void delete(Long id) {
        Room room = getById(id);
        if (room.getStatus() == RoomStatus.ACTIVE) {
            liveKitService.deleteRoom(room.getLiveKitRoomName());
        }
        roomRepository.delete(room);
    }

    public List<Room> endStaleRooms(int maxAgeMinutes) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(maxAgeMinutes);
        List<Room> stale = roomRepository.findByStatusAndCreatedAtBefore(RoomStatus.ACTIVE, cutoff);
        for (Room room : stale) {
            try {
                liveKitService.deleteRoom(room.getLiveKitRoomName());
            } catch (Exception ignored) {}
            room.setStatus(RoomStatus.ENDED);
            room.setEndedAt(LocalDateTime.now());
            roomRepository.save(room);
        }
        return stale;
    }
}