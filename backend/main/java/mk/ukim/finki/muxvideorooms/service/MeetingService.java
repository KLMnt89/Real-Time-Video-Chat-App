package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.Meeting;
import mk.ukim.finki.muxvideorooms.model.Room;
import mk.ukim.finki.muxvideorooms.model.enums.MeetingStatus;
import mk.ukim.finki.muxvideorooms.repository.ContactRepository;
import mk.ukim.finki.muxvideorooms.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ContactRepository contactRepository;
    private final RoomService roomService;

    public MeetingService(MeetingRepository meetingRepository,
                          ContactRepository contactRepository,
                          RoomService roomService) {
        this.meetingRepository = meetingRepository;
        this.contactRepository = contactRepository;
        this.roomService = roomService;
    }

    public List<Meeting> getAll() {
        return meetingRepository.findAll();
    }

    public Meeting getById(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + id));
    }

    public List<Meeting> getByStatus(MeetingStatus status) {
        return meetingRepository.findByStatus(status);
    }

    public List<Meeting> getForToday() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return meetingRepository.findByScheduledAtBetween(start, end);
    }

    public List<Meeting> getByContact(Long contactId) {
        return meetingRepository.findByParticipants_Id(contactId);
    }

    public Meeting create(String title, String description,
                          LocalDateTime scheduledAt, String createdBy,
                          List<Long> participantIds) {
        Meeting meeting = new Meeting();
        meeting.setTitle(title);
        meeting.setDescription(description);
        meeting.setScheduledAt(scheduledAt);
        meeting.setCreatedBy(createdBy);
        meeting.setStatus(MeetingStatus.SCHEDULED);
        if (participantIds != null && !participantIds.isEmpty()) {
            meeting.setParticipants(contactRepository.findAllById(participantIds));
        }
        return meetingRepository.save(meeting);
    }

    public Meeting start(Long id, String createdBy, List<Long> participantIds) {
        Meeting meeting = getById(id);
        Room room = roomService.create(meeting.getTitle(), createdBy, participantIds);
        meeting.setRoom(room);
        meeting.setStatus(MeetingStatus.ACTIVE);
        meeting.setStartedAt(LocalDateTime.now());
        return meetingRepository.save(meeting);
    }

    public Meeting end(Long id) {
        Meeting meeting = getById(id);
        if (meeting.getRoom() != null) {
            roomService.endRoom(meeting.getRoom().getId());
        }
        meeting.setStatus(MeetingStatus.ENDED);
        meeting.setEndedAt(LocalDateTime.now());
        return meetingRepository.save(meeting);
    }

    public Meeting cancel(Long id) {
        Meeting meeting = getById(id);
        meeting.setStatus(MeetingStatus.CANCELLED);
        return meetingRepository.save(meeting);
    }

    public Meeting update(Long id, String title, String description, LocalDateTime scheduledAt) {
        Meeting meeting = getById(id);
        meeting.setTitle(title);
        meeting.setDescription(description);
        meeting.setScheduledAt(scheduledAt);
        return meetingRepository.save(meeting);
    }

    public void delete(Long id) {
        Meeting meeting = getById(id);
        if (meeting.getRoom() != null) {
            roomService.endRoom(meeting.getRoom().getId());
        }
        meetingRepository.delete(meeting);
    }
}