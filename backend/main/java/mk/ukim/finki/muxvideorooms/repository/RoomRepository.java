package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.model.enums.RoomStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByInviteCode(String inviteCode);

    @Override
    @EntityGraph(attributePaths = {"participants"})
    List<Room> findAll();

    @EntityGraph(attributePaths = {"participants"})
    List<Room> findByStatus(RoomStatus status);

    List<Room> findByCreatedBy(String createdBy);
}