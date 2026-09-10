package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.CreateIssueRequest;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.IssueRepository;
import com.bugboard26.backend.repository.IssueSpecification;
import com.bugboard26.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/issues")
public class IssueController {
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueController(IssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody @Valid CreateIssueRequest request) {
        User currentUser = getCurrentUser();

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.UNKNOWN);
        issue.setAuthor(currentUser);

        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isBlank()) {
            User assignee = userRepository.findByEmail(request.getAssigneeEmail())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No user found with following email: " + request.getAssigneeEmail()));
            issue.setAssignee(assignee);
        }

        Issue saved = issueRepository.save(issue);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<?> getAllIssues(
            @RequestParam(required = false) IssueType type,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority) {
        Specification<Issue> spec = Specification.where(IssueSpecification.hasType(type))
                .and(IssueSpecification.hasStatus(status))
                .and(IssueSpecification.hasPriority(priority));
        return ResponseEntity.ok(issueRepository.findAll(spec));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
