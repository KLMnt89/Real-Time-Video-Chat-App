package mk.ukim.finki.muxvideorooms.web;

import jakarta.validation.constraints.NotBlank;
import mk.ukim.finki.muxvideorooms.model.Meeting;
import mk.ukim.finki.muxvideorooms.model.enums.MeetingStatus;
import mk.ukim.finki.muxvideorooms.service.MeetingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public List<Meeting> getAll(@RequestParam(required = false) MeetingStatus status) {
        if (status != null) return meetingService.getByStatus(status);
        return meetingService.getAll();
    }

    @GetMapping("/today")
    public List<Meeting> getToday() {
        return meetingService.getForToday();
    }

    @GetMapping("/by-group/{groupId}")
    public List<Meeting> getByGroup(@PathVariable Long groupId) {
        return meetingService.getByGroup(groupId);
    }

    @GetMapping("/{id}")
    public Meeting getById(@PathVariable Long id) {
        return meetingService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Meeting> create(@RequestParam @NotBlank String title,
                                          @RequestParam(required = false) String description,
                                          @RequestParam @NotBlank String scheduledAt,
                                          @RequestParam @NotBlank String createdBy,
                                          @RequestParam(required = false) List<Long> participantIds,
                                          @RequestParam(required = false) Long groupId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(meetingService.create(title, description,
                        LocalDateTime.parse(scheduledAt), createdBy, participantIds, groupId));
    }

    @PutMapping("/{id}")
    public Meeting update(@PathVariable Long id,
                          @RequestParam String title,
                          @RequestParam(required = false) String description,
                          @RequestParam String scheduledAt) {
        return meetingService.update(id, title, description, LocalDateTime.parse(scheduledAt));
    }

    @PostMapping("/{id}/start")
    public Meeting start(@PathVariable Long id,
                         @RequestParam String createdBy,
                         @RequestParam(required = false) List<Long> participantIds) {
        return meetingService.start(id, createdBy, participantIds);
    }

    @PostMapping("/{id}/end")
    public Meeting end(@PathVariable Long id) {
        return meetingService.end(id);
    }

    @PostMapping("/{id}/cancel")
    public Meeting cancel(@PathVariable Long id) {
        return meetingService.cancel(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        meetingService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}