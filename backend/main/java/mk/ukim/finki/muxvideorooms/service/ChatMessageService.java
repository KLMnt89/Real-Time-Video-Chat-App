package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.ChatMessage;
import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.repository.ChatMessageRepository;
import mk.ukim.finki.muxvideorooms.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final RoomRepository roomRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              RoomRepository roomRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.roomRepository = roomRepository;
    }

    public List<ChatMessage> getByRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
        return chatMessageRepository.findByRoomOrderBySentAtAsc(room);
    }

    public ChatMessage save(Long roomId, String sender, String content) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
        ChatMessage msg = new ChatMessage();
        msg.setRoom(room);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setSentAt(LocalDateTime.now());
        return chatMessageRepository.save(msg);
    }
}
