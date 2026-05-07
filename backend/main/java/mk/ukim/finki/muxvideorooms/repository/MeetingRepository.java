package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.Meeting;
import mk.ukim.finki.muxvideorooms.model.enums.MeetingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @Override
    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findAll();

    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findByStatus(MeetingStatus status);

    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findByScheduledAtBetween(LocalDateTime from, LocalDateTime to);

    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findByStatusAndScheduledAtBetween(MeetingStatus status, LocalDateTime from, LocalDateTime to);

    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findByStatusAndStartedAtBefore(MeetingStatus status, LocalDateTime before);

    List<Meeting> findByCreatedBy(String createdBy);
    List<Meeting> findByParticipants_Id(Long contactId);

    @EntityGraph(attributePaths = {"participants", "room"})
    List<Meeting> findByGroupId(Long groupId);
}