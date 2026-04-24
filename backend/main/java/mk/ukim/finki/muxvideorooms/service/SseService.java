package mk.ukim.finki.muxvideorooms.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String username) {
        SseEmitter emitter = new SseEmitter(1_800_000L); // 30 min
        emitters.put(username, emitter);
        emitter.onCompletion(() -> emitters.remove(username));
        emitter.onTimeout(() -> emitters.remove(username));
        emitter.onError(e -> emitters.remove(username));
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (Exception e) {
            emitters.remove(username);
        }
        return emitter;
    }

    public void broadcast(String eventType, Object data) {
        List<String> dead = new ArrayList<>();
        emitters.forEach((username, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name(eventType).data(data, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                dead.add(username);
            }
        });
        dead.forEach(emitters::remove);
    }
}
