package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.model.User;
import mk.ukim.finki.muxvideorooms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public record UpdateUserRequest(String firstName, String lastName,
                                    String username, String email, String password) {}

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(toMap(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal User user,
                                      @RequestBody UpdateUserRequest req) {
        if (req.firstName() != null)  user.setFirstName(req.firstName());
        if (req.lastName() != null)   user.setLastName(req.lastName());

        if (req.username() != null && !req.username().equals(user.getUsername())) {
            if (userService.existsByUsername(req.username())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
            }
            user.setUsername(req.username());
        }

        if (req.email() != null && !req.email().equals(user.getEmail())) {
            if (userService.existsByEmail(req.email())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }
            user.setEmail(req.email());
        }

        if (req.password() != null && !req.password().isBlank()) {
            userService.updatePassword(user, req.password());
        } else {
            userService.save(user);
        }

        return ResponseEntity.ok(toMap(user));
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
                "id", u.getId(),
                "firstName", u.getFirstName(),
                "lastName", u.getLastName(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name()
        );
    }
}
