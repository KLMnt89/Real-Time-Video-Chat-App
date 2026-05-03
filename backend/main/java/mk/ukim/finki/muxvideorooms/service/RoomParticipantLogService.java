package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.RoomParticipantLog;
import mk.ukim.finki.muxvideorooms.repository.RoomParticipantLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RoomParticipantLogService {

    private final RoomParticipantLogRepository repo;

    public RoomParticipantLogService(RoomParticipantLogRepository repo) {
        this.repo = repo;
    }

    public RoomParticipantLog logJoin(Long roomId, String participantName) {
        RoomParticipantLog log = new RoomParticipantLog();
        log.setRoomId(roomId);
        log.setParticipantName(participantName);
        log.setJoinedAt(LocalDateTime.now());
        return repo.save(log);
    }

    public void logLeave(Long roomId, String participantName) {
        repo.findFirstByRoomIdAndParticipantNameAndLeftAtIsNull(roomId, participantName)
            .ifPresent(log -> {
                log.setLeftAt(LocalDateTime.now());
                repo.save(log);
            });
    }

    public List<RoomParticipantLog> getByRoom(Long roomId) {
        return repo.findByRoomId(roomId);
    }
}
