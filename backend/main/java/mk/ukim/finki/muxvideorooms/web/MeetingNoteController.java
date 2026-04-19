package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.model.MeetingNote;
import mk.ukim.finki.muxvideorooms.service.MeetingNoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings/{meetingId}/notes")
@CrossOrigin(origins = "*")
public class MeetingNoteController {

    private final MeetingNoteService noteService;

    public MeetingNoteController(MeetingNoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<MeetingNote> getByMeeting(@PathVariable Long meetingId) {
        return noteService.getByMeeting(meetingId);
    }

    @PostMapping
    public ResponseEntity<MeetingNote> create(@PathVariable Long meetingId,
                                              @RequestParam String content,
                                              @RequestParam String writtenBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.create(meetingId, content, writtenBy));
    }

    @PutMapping("/{noteId}")
    public MeetingNote update(@PathVariable Long meetingId,
                              @PathVariable Long noteId,
                              @RequestParam String content) {
        return noteService.update(noteId, content);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> delete(@PathVariable Long meetingId,
                                       @PathVariable Long noteId) {
        noteService.delete(noteId);
        return ResponseEntity.noContent().build();
    }
}