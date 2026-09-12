package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.CreateCommentRequest;
import com.bugboard26.backend.dto.CreateIssueRequest;
import com.bugboard26.backend.dto.GetIssueRequest;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.CommentRepository;
import com.bugboard26.backend.repository.IssueRepository;
import com.bugboard26.backend.repository.IssueSpecification;
import com.bugboard26.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/issues")
public class IssueController {
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public IssueController(IssueRepository issueRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
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
    public ResponseEntity<?> getAllIssues(GetIssueRequest request) {
        Specification<Issue> spec = Specification.where(IssueSpecification.hasType(request.getType()))
                .and(IssueSpecification.hasStatus(request.getStatus()))
                .and(IssueSpecification.hasPriority(request.getPriority()));
        return ResponseEntity.ok(issueRepository.findAll(spec));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssue(@PathVariable Long id) {
        return issueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity getComments(@PathVariable Long id) {
        if(!issueRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List comments = commentRepository.findCommentsByIssue_Id(id);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity createComment(@PathVariable Long id, @RequestBody @Valid CreateCommentRequest comment) {
        if(!issueRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        User currentUser = getCurrentUser();
        Comment c = new Comment();
        c.setText(comment.getText());
        c.setAuthor(currentUser);
        c.setIssue(issueRepository.findById(id).get());
        commentRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
