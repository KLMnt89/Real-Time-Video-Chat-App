package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.model.enums.RoomStatus;
import mk.ukim.finki.muxvideorooms.repository.ContactRepository;
import mk.ukim.finki.muxvideorooms.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final ContactRepository contactRepository;
    private final LiveKitService liveKitService;

    @Value("${livekit.public-url:ws://localhost:7880}")
    private String liveKitPublicUrl;

    public RoomService(RoomRepository roomRepository,
                       ContactRepository contactRepository,
                       LiveKitService liveKitService) {
        this.roomRepository = roomRepository;
        this.contactRepository = contactRepository;
        this.liveKitService = liveKitService;
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

    public Room create(String name, String createdBy, List<Long> participantIds) {
        String liveKitRoomName = liveKitService.createRoom();
        Room room = new Room();
        room.setName(name);
        room.setLiveKitRoomName(liveKitRoomName);
        room.setInviteCode(UUID.randomUUID().toString());
        room.setStatus(RoomStatus.ACTIVE);
        room.setCreatedAt(LocalDateTime.now());
        room.setCreatedBy(createdBy);
        if (participantIds != null && !participantIds.isEmpty()) {
            List<Contact> participants = contactRepository.findAllById(participantIds);
            room.setParticipants(participants);
        }
        return roomRepository.save(room);
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

    public Map<String, String> joinRoom(String inviteCode, String participantId) {
        Room room = getByInviteCode(inviteCode);
        if (room.getStatus() == RoomStatus.ENDED) {
            throw new RuntimeException("Room has ended");
        }
        String token = liveKitService.createParticipantToken(room.getLiveKitRoomName(), participantId);
        return Map.of("token", token, "url", liveKitPublicUrl);
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
}