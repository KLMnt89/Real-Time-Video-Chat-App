package mk.ukim.finki.muxvideorooms.service;

import mk.ukim.finki.muxvideorooms.model.Contact;
import mk.ukim.finki.muxvideorooms.model.HuddleGroup;
import mk.ukim.finki.muxvideorooms.repository.ContactRepository;
import mk.ukim.finki.muxvideorooms.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final ContactRepository contactRepository;

    public GroupService(GroupRepository groupRepository, ContactRepository contactRepository) {
        this.groupRepository = groupRepository;
        this.contactRepository = contactRepository;
    }

    public List<HuddleGroup> getAll() {
        return groupRepository.findAll();
    }

    public HuddleGroup create(String name, String createdBy, List<Long> contactIds) {
        HuddleGroup group = new HuddleGroup();
        group.setName(name);
        group.setCreatedBy(createdBy);
        group.setCreatedAt(LocalDateTime.now());

        if (contactIds != null && !contactIds.isEmpty()) {
            List<Contact> contacts = contactRepository.findAllById(contactIds);
            group.setContacts(contacts);
        }

        return groupRepository.save(group);
    }

    public HuddleGroup update(Long id, String name, List<Long> contactIds) {
        HuddleGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        if (name != null && !name.isBlank()) group.setName(name);
        List<Contact> contacts = contactIds != null
                ? contactRepository.findAllById(contactIds)
                : new java.util.ArrayList<>();
        group.setContacts(contacts);
        return groupRepository.save(group);
    }

    public void delete(Long id) {
        groupRepository.deleteById(id);
    }
}
