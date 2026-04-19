package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Meeting;
import mk.ukim.finki.muxvideorooms.model.MeetingNote;
import mk.ukim.finki.muxvideorooms.repository.MeetingNoteRepository;
import mk.ukim.finki.muxvideorooms.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MeetingNoteService {

    private final MeetingNoteRepository noteRepository;
    private final MeetingRepository meetingRepository;

    public MeetingNoteService(MeetingNoteRepository noteRepository,
                              MeetingRepository meetingRepository) {
        this.noteRepository = noteRepository;
        this.meetingRepository = meetingRepository;
    }

    public List<MeetingNote> getByMeeting(Long meetingId) {
        return noteRepository.findByMeeting_Id(meetingId);
    }

    public MeetingNote getById(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found: " + id));
    }

    public MeetingNote create(Long meetingId, String content, String writtenBy) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        MeetingNote note = new MeetingNote();
        note.setMeeting(meeting);
        note.setContent(content);
        note.setWrittenBy(writtenBy);
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public MeetingNote update(Long id, String content) {
        MeetingNote note = getById(id);
        note.setContent(content);
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public void delete(Long id) {
        noteRepository.deleteById(id);
    }
}