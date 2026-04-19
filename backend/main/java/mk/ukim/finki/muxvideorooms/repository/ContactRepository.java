package mk.ukim.finki.muxvideorooms.repository;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.enums.ContactStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByStatus(ContactStatus status);
    Optional<Contact> findByEmail(String email);
    List<Contact> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String first, String last);
}