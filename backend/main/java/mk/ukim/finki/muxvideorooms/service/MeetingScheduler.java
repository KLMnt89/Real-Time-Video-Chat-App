package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Meeting;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class MeetingScheduler {

    private final MeetingService meetingService;
    private final RoomService roomService;
    private final SseService sseService;

    @Value("${room.auto-close.minutes:120}")
    private int roomAutoCloseMinutes;

    public MeetingScheduler(MeetingService meetingService, RoomService roomService, SseService sseService) {
        this.meetingService = meetingService;
        this.roomService    = roomService;
        this.sseService     = sseService;
    }

    @Scheduled(fixedDelay = 60_000)
    public void checkScheduledMeetings() {
        List<Meeting> started = meetingService.startDue();
        if (!started.isEmpty()) {
            sseService.broadcast("meeting.started", Map.of(
                    "count", started.size(),
                    "titles", started.stream().map(Meeting::getTitle).toList()
            ));
        }
    }

    @Scheduled(fixedDelay = 60_000)
    public void markAbandonedMeetings() {
        List<Meeting> passed = meetingService.markAbandoned();
        if (!passed.isEmpty()) {
            sseService.broadcast("meeting.passed", Map.of(
                    "count", passed.size(),
                    "titles", passed.stream().map(Meeting::getTitle).toList()
            ));
        }
    }

    @Scheduled(fixedDelay = 300_000)
    public void autoCloseStaleRooms() {
        roomService.endStaleRooms(roomAutoCloseMinutes);
    }
}
