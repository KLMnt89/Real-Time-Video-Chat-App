package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.MeetingNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingNoteRepository extends JpaRepository<MeetingNote, Long> {
    List<MeetingNote> findByMeeting_Id(Long meetingId);
    List<MeetingNote> findByWrittenBy(String writtenBy);
}