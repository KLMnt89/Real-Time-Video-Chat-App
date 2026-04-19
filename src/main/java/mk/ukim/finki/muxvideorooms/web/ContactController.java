package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.enums.ContactStatus;
import mk.ukim.finki.muxvideorooms.service.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Contact> create(@RequestParam String firstName,
                                          @RequestParam String lastName,
                                          @RequestParam String email,
                                          @RequestParam(required = false) String phone) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactService.create(firstName, lastName, email, phone));
    }

    @PutMapping("/{id}")
    public Contact update(@PathVariable Long id,
                          @RequestParam String firstName,
                          @RequestParam String lastName,
                          @RequestParam String email,
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