package mk.ukim.finki.muxvideorooms.web;

import mk.ukim.finki.muxvideorooms.model.HuddleGroup;
import mk.ukim.finki.muxvideorooms.service.GroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public List<HuddleGroup> getAll() {
        return groupService.getAll();
    }

    @PostMapping
    public ResponseEntity<HuddleGroup> create(@RequestBody CreateGroupRequest req) {
        HuddleGroup group = groupService.create(req.name(), req.createdBy(), req.contactIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HuddleGroup> update(@PathVariable Long id, @RequestBody UpdateGroupRequest req) {
        return ResponseEntity.ok(groupService.update(id, req.name(), req.contactIds()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateGroupRequest(String name, String createdBy, List<Long> contactIds) {}
    public record UpdateGroupRequest(String name, List<Long> contactIds) {}
}
