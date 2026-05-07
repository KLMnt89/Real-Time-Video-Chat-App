package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.RoomParticipantLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomParticipantLogRepository extends JpaRepository<RoomParticipantLog, Long> {
    List<RoomParticipantLog> findByRoomId(Long roomId);
    Optional<RoomParticipantLog> findFirstByRoomIdAndParticipantNameAndLeftAtIsNull(Long roomId, String participantName);
    int countByRoomId(Long roomId);
}
