package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.Meeting;
import mk.ukim.finki.muxvideorooms.model.enums.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByStatus(MeetingStatus status);
    List<Meeting> findByCreatedBy(String createdBy);
    List<Meeting> findByScheduledAtBetween(LocalDateTime from, LocalDateTime to);
    List<Meeting> findByParticipants_Id(Long contactId);
}