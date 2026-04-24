package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.model.ChatMessage;
import mk.ukim.finki.muxvideorooms.model.RoomNote;
import mk.ukim.finki.muxvideorooms.service.ChatMessageService;
import mk.ukim.finki.muxvideorooms.service.RoomNoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomDataController {

    private final ChatMessageService chatMessageService;
    private final RoomNoteService roomNoteService;

    public RoomDataController(ChatMessageService chatMessageService,
                              RoomNoteService roomNoteService) {
        this.chatMessageService = chatMessageService;
        this.roomNoteService = roomNoteService;
    }

    @GetMapping("/{roomId}/chat")
    public List<ChatMessage> getChat(@PathVariable Long roomId) {
        return chatMessageService.getByRoom(roomId);
    }

    @PostMapping("/{roomId}/chat")
    public ChatMessage sendMessage(@PathVariable Long roomId,
                                   @RequestParam String sender,
                                   @RequestParam String content) {
        return chatMessageService.save(roomId, sender, content);
    }

    @GetMapping("/{roomId}/note")
    public Map<String, Object> getNote(@PathVariable Long roomId) {
        return roomNoteService.getByRoom(roomId)
                .map(n -> Map.<String, Object>of(
                        "content", n.getContent() != null ? n.getContent() : "",
                        "updatedBy", n.getUpdatedBy() != null ? n.getUpdatedBy() : ""))
                .orElse(Map.of("content", "", "updatedBy", ""));
    }

    @PutMapping("/{roomId}/note")
    public RoomNote saveNote(@PathVariable Long roomId,
                             @RequestParam String content,
                             @RequestParam String updatedBy) {
        return roomNoteService.save(roomId, content, updatedBy);
    }
}
