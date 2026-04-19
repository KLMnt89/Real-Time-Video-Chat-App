package mk.ukim.finki.muxvideorooms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.muxvideorooms.model.enums.RoomStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String muxSpaceId;
    private String inviteCode;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime endedAt;
    private String createdBy;

    @ManyToMany
    @JoinTable(
            name = "room_participants",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private List<Contact> participants = new ArrayList<>();
}