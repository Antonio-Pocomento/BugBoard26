package com.bugboard26.backend.controller;

import com.bugboard26.backend.exception.ResourceNotFoundException;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.*;
import com.bugboard26.backend.dto.comment.*;
import com.bugboard26.backend.dto.issue.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/issues")
public class IssueController {
    private static final List<String> ALLOWED_SORT_FIELDS =
            List.of("createdAt", "updatedAt", "resolvedAt", "priority", "status", "type", "title");

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public IssueController(IssueRepository issueRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(@RequestBody @Valid CreateIssueRequest request) {
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
        return ResponseEntity.status(HttpStatus.CREATED).body(new IssueResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues(GetIssueRequest request) {
        Specification<Issue> spec = Specification.where(IssueSpecification.hasType(request.getType()))
                .and(IssueSpecification.hasStatus(request.getStatus()))
                .and(IssueSpecification.hasPriority(request.getPriority()))
                .and(IssueSpecification.hasAssignee(request.getAssigneeId()))
                .and(IssueSpecification.hasAuthor(request.getAuthorId()))
                .and(IssueSpecification.resolvedAfter(request.getResolvedAfter()))
                .and(IssueSpecification.resolvedBefore(request.getResolvedBefore()));

        Sort sort = buildSort(request.getSortBy(), request.getDirection());

        List<IssueResponse> issues = issueRepository.findAll(spec, sort).stream()
                .map(IssueResponse::new)
                .toList();

        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssue(@PathVariable Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));
        return ResponseEntity.ok(new IssueResponse(issue));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        if (!issueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Issue not found: " + id);
        }

        List<CommentResponse> comments = commentRepository.findCommentsByIssue_IdOrderByCreatedAtAsc(id).stream()
                .map(CommentResponse::new)
                .toList();
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> changeIssue(@PathVariable Long id, @RequestBody @Valid ChangeIssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        issue.setTitle((request.getTitle() != null && !request.getTitle().isBlank()) ? request.getTitle() : issue.getTitle());
        issue.setDescription((request.getDescription() != null && !request.getDescription().isBlank()) ? request.getDescription() : issue.getDescription());
        issue.setStatus(request.getStatus() != null ? request.getStatus() : issue.getStatus());
        issue.setType(request.getType() != null ? request.getType() : issue.getType());

        Issue saved = issueRepository.save(issue);
        return ResponseEntity.status(HttpStatus.OK).body(new IssueResponse(saved));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long id, @RequestBody @Valid CreateCommentRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        User currentUser = getCurrentUser();
        Comment comment = new Comment();
        comment.setText(request.getText());
        comment.setAuthor(currentUser);
        comment.setIssue(issue);

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CommentResponse(saved));
    }

    private Sort buildSort(String sortBy, String direction) {
        String field = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy)) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}