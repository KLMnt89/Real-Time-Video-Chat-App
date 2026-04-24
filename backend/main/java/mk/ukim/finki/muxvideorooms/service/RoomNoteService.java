package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.model.RoomNote;
import mk.ukim.finki.muxvideorooms.repository.RoomNoteRepository;
import mk.ukim.finki.muxvideorooms.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class RoomNoteService {

    private final RoomNoteRepository roomNoteRepository;
    private final RoomRepository roomRepository;

    public RoomNoteService(RoomNoteRepository roomNoteRepository,
                           RoomRepository roomRepository) {
        this.roomNoteRepository = roomNoteRepository;
        this.roomRepository = roomRepository;
    }

    public Optional<RoomNote> getByRoom(Long roomId) {
        return roomNoteRepository.findByRoom_Id(roomId);
    }

    public RoomNote save(Long roomId, String content, String updatedBy) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
        RoomNote note = roomNoteRepository.findByRoom_Id(roomId)
                .orElseGet(() -> {
                    RoomNote n = new RoomNote();
                    n.setRoom(room);
                    return n;
                });
        note.setContent(content);
        note.setUpdatedAt(LocalDateTime.now());
        note.setUpdatedBy(updatedBy);
        return roomNoteRepository.save(note);
    }
}
