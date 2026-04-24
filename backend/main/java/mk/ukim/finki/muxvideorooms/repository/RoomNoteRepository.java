package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.RoomNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomNoteRepository extends JpaRepository<RoomNote, Long> {
    Optional<RoomNote> findByRoom_Id(Long roomId);
}
