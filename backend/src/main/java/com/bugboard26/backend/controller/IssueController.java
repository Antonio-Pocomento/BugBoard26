package com.bugboard26.backend.controller;

import com.bugboard26.backend.exception.ResourceNotFoundException;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.*;
import com.bugboard26.backend.dto.comment.*;
import com.bugboard26.backend.dto.issue.*;
import com.bugboard26.backend.service.LocalImageStorageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/issues")
public class IssueController {
    private static final List<String> ALLOWED_SORT_FIELDS =
            List.of("createdAt", "updatedAt", "resolvedAt", "priority", "type", "title");

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LocalImageStorageService localImageStorageService;

    public IssueController(IssueRepository issueRepository, UserRepository userRepository,
                           CommentRepository commentRepository, LocalImageStorageService localImageStorageService) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.localImageStorageService = localImageStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IssueResponse> createIssue(@ModelAttribute @Valid CreateIssueRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.READONLY) {
            throw new AccessDeniedException("Readonly users cannot add issues");
        }

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.UNKNOWN);
        issue.setAuthor(currentUser);

        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isBlank()) {
            issue.setAssignee(resolveAssignee(request.getAssigneeEmail()));
        }

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            issue.setImagePath(localImageStorageService.store(image));
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

        String sortField = (request.getSortBy() != null && ALLOWED_SORT_FIELDS.contains(request.getSortBy()))
                ? request.getSortBy() : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(request.getDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Sort sort;
        if ("priority".equals(sortField)) {
            spec = spec.and(IssueSpecification.orderByPriority(dir));
            sort = Sort.unsorted(); // l'ordinamento è già nella Specification, altrimenti findAll lo sovrascriverebbe
        } else {
            sort = Sort.by(dir, sortField);
        }

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

        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignee = issue.getAssignee() != null
                && issue.getAssignee().getId().equals(currentUser.getId());

        assertCanModify(currentUser, isAdmin, isAssignee);

        applyFieldUpdates(issue, request);
        applyStatusTransition(issue, request, currentUser);
        applyAssigneeUpdate(issue, request, isAdmin);

        Issue saved = issueRepository.save(issue);
        return ResponseEntity.status(HttpStatus.OK).body(new IssueResponse(saved));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long id, @RequestBody @Valid CreateCommentRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.READONLY) {
            throw new AccessDeniedException("Readonly users cannot add comments");
        }

        Comment comment = new Comment();
        comment.setText(request.getText());
        comment.setAuthor(currentUser);
        comment.setIssue(issue);

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CommentResponse(saved));
    }

    private void assertCanModify(User currentUser, boolean isAdmin, boolean isAssignee) {
        if (currentUser.getRole() == Role.READONLY) {
            throw new AccessDeniedException("You can't modify issues with readonly role'");
        }
        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("You can modify only issues you are assigned to");
        }
    }

    private void applyFieldUpdates(Issue issue, ChangeIssueRequest request) {
        issue.setTitle((request.getTitle() != null && !request.getTitle().isBlank()) ? request.getTitle() : issue.getTitle());
        issue.setDescription((request.getDescription() != null && !request.getDescription().isBlank()) ? request.getDescription() : issue.getDescription());
        issue.setType(request.getType() != null ? request.getType() : issue.getType());
        issue.setPriority(request.getPriority() != null ? request.getPriority() : issue.getPriority());
    }

    private void applyStatusTransition(Issue issue, ChangeIssueRequest request, User currentUser) {
        IssueStatus previousStatus = issue.getStatus();
        IssueStatus newStatus = request.getStatus() != null ? request.getStatus() : previousStatus;
        issue.setStatus(newStatus);

        if (newStatus == IssueStatus.RESOLVED && previousStatus != IssueStatus.RESOLVED) {
            issue.setResolvedAt(Instant.now());
            issue.setResolvedBy(currentUser);
        } else if (newStatus != IssueStatus.RESOLVED && previousStatus == IssueStatus.RESOLVED) {
            issue.setResolvedAt(null);
            issue.setResolvedBy(null);
        }
    }

    private void applyAssigneeUpdate(Issue issue, ChangeIssueRequest request, boolean isAdmin) {
        if (request.getAssigneeEmail() == null) {
            return;
        }
        if (!isAdmin) {
            throw new AccessDeniedException("Only an administrator can modify the assignee");
        }
        issue.setAssignee(request.getAssigneeEmail().isBlank() ? null : resolveAssignee(request.getAssigneeEmail()));
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private User resolveAssignee(String email) {
        User assignee = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user found with following email: " + email));

        if (assignee.getRole() == Role.READONLY) {
            throw new IllegalArgumentException("You can't assign an issue to a readonly user");
        }

        return assignee;
    }
}