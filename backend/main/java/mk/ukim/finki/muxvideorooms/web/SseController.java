package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.service.SseService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping("/subscribe")
    public SseEmitter subscribe(Authentication auth) {
        String username = auth != null ? auth.getName() : "anonymous_" + System.currentTimeMillis();
        return sseService.subscribe(username);
    }
}
