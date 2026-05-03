package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.lastSeenAt = :now WHERE u.username = :username AND (u.lastSeenAt IS NULL OR u.lastSeenAt < :threshold)")
    void updateLastSeenIfOld(@Param("username") String username,
                             @Param("now") LocalDateTime now,
                             @Param("threshold") LocalDateTime threshold);
}
