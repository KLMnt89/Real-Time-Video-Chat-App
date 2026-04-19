package mk.ukim.finki.muxvideorooms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.muxvideorooms.model.enums.MeetingStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status;

    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String createdBy;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToMany
    @JoinTable(
            name = "meeting_participants",
            joinColumns = @JoinColumn(name = "meeting_id"),
            inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private List<Contact> participants = new ArrayList<>();
}