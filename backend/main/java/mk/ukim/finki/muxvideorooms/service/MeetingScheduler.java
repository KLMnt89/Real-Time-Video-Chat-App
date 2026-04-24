package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Meeting;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class MeetingScheduler {

    private final MeetingService meetingService;
    private final SseService sseService;

    public MeetingScheduler(MeetingService meetingService, SseService sseService) {
        this.meetingService = meetingService;
        this.sseService = sseService;
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
}
