package mk.ukim.finki.muxvideorooms.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.enums.ContactStatus;
import mk.ukim.finki.muxvideorooms.service.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public List<Contact> getAll(@RequestParam(required = false) String search,
                                @RequestParam(required = false) ContactStatus status) {
        if (search != null) return contactService.searchByName(search);
        if (status != null) return contactService.getByStatus(status);
        return contactService.getAll();
    }

    @GetMapping("/{id}")
    public Contact getById(@PathVariable Long id) {
        return contactService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Contact> create(@RequestParam @NotBlank String firstName,
                                          @RequestParam @NotBlank String lastName,
                                          @RequestParam @NotBlank @Email String email,
                                          @RequestParam(required = false) String phone) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactService.create(firstName, lastName, email, phone));
    }

    @PutMapping("/{id}")
    public Contact update(@PathVariable Long id,
                          @RequestParam @NotBlank String firstName,
                          @RequestParam @NotBlank String lastName,
                          @RequestParam @NotBlank @Email String email,
                          @RequestParam(required = false) String phone) {
        return contactService.update(id, firstName, lastName, email, phone);
    }

    @PatchMapping("/{id}/status")
    public Contact updateStatus(@PathVariable Long id,
                                @RequestParam ContactStatus status) {
        return contactService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}