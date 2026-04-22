package mk.ukim.finki.muxvideorooms.config;

import mk.ukim.finki.muxvideorooms.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;

    public DataInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        try {
            userService.createAdminIfNotExists();
        } catch (Exception e) {
            System.err.println("[DataInitializer] Failed to create admin user: " + e.getMessage());
        }
    }
}
