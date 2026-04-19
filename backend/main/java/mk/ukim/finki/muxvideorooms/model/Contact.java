package mk.ukim.finki.muxvideorooms.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.finki.muxvideorooms.model.enums.ContactStatus;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    @Enumerated(EnumType.STRING)
    private ContactStatus status;

    private LocalDateTime createdAt;
}