package mk.ukim.finki.muxvideorooms.web;

import jakarta.validation.constraints.NotBlank;
import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> getAll() {
        return roomService.getAll();
    }

    @GetMapping("/active")
    public List<Room> getActive() {
        return roomService.getActive();
    }

    @GetMapping("/{id}")
    public Room getById(@PathVariable Long id) {
        return roomService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Room> create(@RequestParam @NotBlank String name,
                                       @RequestParam @NotBlank String createdBy,
                                       @RequestParam(required = false) List<Long> participantIds) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.create(name, createdBy, participantIds));
    }

    @PutMapping("/{id}")
    public Room update(@PathVariable Long id, @RequestParam String name) {
        return roomService.update(id, name);
    }

    @PostMapping("/{id}/participants/{contactId}")
    public Room addParticipant(@PathVariable Long id, @PathVariable Long contactId) {
        return roomService.addParticipant(id, contactId);
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<Map<String, String>> join(@PathVariable String inviteCode,
                                                    @RequestParam String participantId) {
        return ResponseEntity.ok(roomService.joinRoom(inviteCode, participantId));
    }

    @PostMapping("/{id}/end")
    public Room endRoom(@PathVariable Long id) {
        return roomService.endRoom(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}