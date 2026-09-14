package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.comment.CommentResponse;
import com.bugboard26.backend.dto.comment.CreateCommentRequest;
import com.bugboard26.backend.exception.ResourceNotFoundException;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.CommentRepository;
import com.bugboard26.backend.repository.IssueRepository;
import com.bugboard26.backend.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueControllerCreateCommentTest {

    @Mock
    private IssueRepository issueRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private IssueController issueController;

    private User admin;
    private User assignee;
    private User stranger;
    private Issue issue;

    @BeforeEach
    void setUp() {
        admin = buildUser(1L, "admin@bugboard26.com", Role.ADMIN);
        assignee = buildUser(2L, "dev@bugboard26.com", Role.NORMAL);
        stranger = buildUser(3L, "altro@bugboard26.com", Role.NORMAL);

        issue = new Issue();
        issue.setId(10L);
        issue.setTitle("Il bottone di invio non risponde");
        issue.setDescription("Cliccando su 'Invia' non succede nulla");
        issue.setType(IssueType.BUG);
        issue.setPriority(IssuePriority.MEDIUM);
        issue.setStatus(IssueStatus.TODO);
        issue.setAuthor(admin);
        issue.setAssignee(assignee);
        issue.setCreatedAt(Instant.parse("2026-01-01T10:00:00Z"));

        // Non tutti i test raggiungono il salvataggio:
        // lo stub è "lenient" per non far fallire quei test con UnnecessaryStubbingException.
        // Simula il comportamento del DB assegnando un id al commento salvato.
        lenient().when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId(100L);
            return c;
        });
    }

    @AfterEach
    void tearDown() {
        // Il SecurityContext va ripulito per non contaminare gli altri test.
        SecurityContextHolder.clearContext();
    }

    private User buildUser(Long id, String email, Role role) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setPasswordHash("hash-non-rilevante");
        u.setRole(role);
        return u;
    }

    // Simula un login
    private void authenticateAs(User user) {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication())
                .thenReturn(new UsernamePasswordAuthenticationToken(user.getEmail(), null));
        SecurityContextHolder.setContext(context);
    }

    // ---------------------------------------------------------------------
    // Creazione del commento
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("L'assegnatario può aggiungere un commento alla issue")
    void assigneeCanAddComment() {
        authenticateAs(assignee);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        CreateCommentRequest request = new CreateCommentRequest();
        request.setText("Bug Confirmed");

        ResponseEntity<CommentResponse> response = issueController.createComment(10L, request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getText()).isEqualTo(request.getText());
        assertThat(response.getBody().getAuthor().getEmail()).isEqualTo(assignee.getEmail());
        assertThat(response.getBody().getIssueId()).isEqualTo(issue.getId());
    }

    @Test
    @DisplayName("Un admin può aggiungere un commento anche se non è l'assegnatario")
    void adminCanAddComment() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        CreateCommentRequest request = new CreateCommentRequest();
        request.setText("Assigned [user] to solve this");

        ResponseEntity<CommentResponse> response = issueController.createComment(10L, request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getAuthor().getEmail()).isEqualTo(admin.getEmail());
    }

    @Test
    @DisplayName("Un utente che non è né admin né assegnatario può comunque commentare")
    void unrelatedUserCanAddComment() {
        authenticateAs(stranger);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        CreateCommentRequest request = new CreateCommentRequest();
        request.setText("The issue is present on my end too");

        ResponseEntity<CommentResponse> response = issueController.createComment(10L, request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getAuthor().getEmail()).isEqualTo(stranger.getEmail());
    }

    @Test
    @DisplayName("Il commento salvato è associato alla issue corretta e all'utente corrente come autore")
    void savedCommentHasCorrectIssueAndAuthor() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        CreateCommentRequest request = new CreateCommentRequest();
        request.setText("Verified");

        issueController.createComment(10L, request);

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());

        Comment savedComment = captor.getValue();
        assertThat(savedComment.getText()).isEqualTo(request.getText());
        assertThat(savedComment.getIssue()).isEqualTo(issue);
        assertThat(savedComment.getAuthor()).isEqualTo(admin);
    }

    @Test
    @DisplayName("Una issue inesistente genera ResourceNotFoundException e nessun commento viene salvato")
    void noIssueFound() {
        when(issueRepository.findById(99L)).thenReturn(Optional.empty());

        CreateCommentRequest request = new CreateCommentRequest();
        request.setText("This comment will not be saved");

        assertThatThrownBy(() -> issueController.createComment(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).save(any());
    }
}