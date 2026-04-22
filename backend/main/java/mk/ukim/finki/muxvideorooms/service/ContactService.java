package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.enums.ContactStatus;
import mk.ukim.finki.muxvideorooms.repository.ContactRepository;
import mk.ukim.finki.muxvideorooms.repository.MeetingRepository;
import mk.ukim.finki.muxvideorooms.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final RoomRepository roomRepository;
    private final MeetingRepository meetingRepository;

    public ContactService(ContactRepository contactRepository,
                          RoomRepository roomRepository,
                          MeetingRepository meetingRepository) {
        this.contactRepository = contactRepository;
        this.roomRepository = roomRepository;
        this.meetingRepository = meetingRepository;
    }

    public List<Contact> getAll() {
        return contactRepository.findAll();
    }

    public Contact getById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found: " + id));
    }

    public List<Contact> searchByName(String query) {
        return contactRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
    }

    public List<Contact> getByStatus(ContactStatus status) {
        return contactRepository.findByStatus(status);
    }

    public Contact create(String firstName, String lastName, String email, String phone) {
        if (contactRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Contact with email already exists: " + email);
        }
        Contact c = new Contact();
        c.setFirstName(firstName);
        c.setLastName(lastName);
        c.setEmail(email);
        c.setPhone(phone);
        c.setStatus(ContactStatus.OFFLINE);
        c.setCreatedAt(LocalDateTime.now());
        return contactRepository.save(c);
    }

    public Contact update(Long id, String firstName, String lastName, String email, String phone) {
        Contact c = getById(id);
        c.setFirstName(firstName);
        c.setLastName(lastName);
        c.setEmail(email);
        c.setPhone(phone);
        return contactRepository.save(c);
    }

    public Contact updateStatus(Long id, ContactStatus status) {
        Contact c = getById(id);
        c.setStatus(status);
        return contactRepository.save(c);
    }

    public void delete(Long id) {
        Contact contact = getById(id);
        roomRepository.findAll().forEach(room -> {
            if (room.getParticipants().remove(contact)) {
                roomRepository.save(room);
            }
        });
        meetingRepository.findAll().forEach(meeting -> {
            if (meeting.getParticipants().remove(contact)) {
                meetingRepository.save(meeting);
            }
        });
        contactRepository.delete(contact);
    }
}