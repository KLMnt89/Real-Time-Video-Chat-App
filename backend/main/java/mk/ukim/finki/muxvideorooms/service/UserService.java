package mk.ukim.finki.muxvideorooms.service;

import jakarta.annotation.PostConstruct;
import mk.ukim.finki.muxvideorooms.model.User;
import mk.ukim.finki.muxvideorooms.model.enums.UserRole;
import mk.ukim.finki.muxvideorooms.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        createAdminIfNotExists();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String encodePassword(String raw) {
        return passwordEncoder.encode(raw);
    }

    @Transactional
    public void createAdminIfNotExists() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("Huddle");
            admin.setUsername("admin");
            admin.setEmail("admin@huddle.mk");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ROLE_ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
        }
    }
}
