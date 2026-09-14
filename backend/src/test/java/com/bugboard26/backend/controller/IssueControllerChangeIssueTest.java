package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.issue.ChangeIssueRequest;
import com.bugboard26.backend.dto.issue.IssueResponse;
import com.bugboard26.backend.exception.ResourceNotFoundException;
import com.bugboard26.backend.model.*;
import com.bugboard26.backend.repository.IssueRepository;
import com.bugboard26.backend.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
class IssueControllerChangeIssueTest {

    @Mock
    private IssueRepository issueRepository;
    @Mock
    private UserRepository userRepository;

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
        stranger = buildUser(3L, "altro_utente@bugboard26.com", Role.NORMAL);

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
        lenient().when(issueRepository.save(any(Issue.class))).thenAnswer(inv -> inv.getArgument(0));
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
    // Autorizzazione
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("L'utente assegnatario può modificare la issue a lui assegnata")
    void assigneeCanModifyAssignedIssue() {
        authenticateAs(assignee);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setStatus(IssueStatus.IN_PROGRESS);

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getStatus()).isEqualTo(IssueStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Un admin può modificare qualunque issue, anche se non è l'assegnatario")
    void adminCanModifyAnyIssue() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setPriority(IssuePriority.HIGH);

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getPriority()).isEqualTo(IssuePriority.HIGH);
    }

    @Test
    @DisplayName("Un utente che non è né admin né assegnatario riceve AccessDeniedException")
    void unauthorizedUserCantChangeIssue() {
        authenticateAs(stranger);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setTitle("This will not be changed");

        assertThatThrownBy(() -> issueController.changeIssue(10L, request))
                .isInstanceOf(AccessDeniedException.class);

        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("Una issue inesistente genera ResourceNotFoundException")
    void noIssueFound() {
        when(issueRepository.findById(99L)).thenReturn(Optional.empty());

        ChangeIssueRequest request = new ChangeIssueRequest();

        assertThatThrownBy(() -> issueController.changeIssue(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ---------------------------------------------------------------------
    // Transizione di stato / timestamp di risoluzione
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("Il passaggio a RESOLVED imposta resolvedAt e resolvedBy con l'utente corrente")
    void changingToResolvedSetsTimestamps() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setStatus(IssueStatus.RESOLVED);

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getStatus()).isEqualTo(IssueStatus.RESOLVED);
        assertThat(response.getBody().getResolvedAt()).isNotNull();
        assertThat(response.getBody().getResolvedBy().getEmail()).isEqualTo(admin.getEmail());
    }

    @Test
    @DisplayName("L'uscita da RESOLVED azzera resolvedAt e resolvedBy")
    void changingFromResolvedResetsTimestamps() {
        issue.setStatus(IssueStatus.RESOLVED);
        issue.setResolvedAt(Instant.parse("2026-02-01T09:00:00Z"));
        issue.setResolvedBy(admin);

        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setStatus(IssueStatus.IN_PROGRESS);

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getResolvedAt()).isNull();
        assertThat(response.getBody().getResolvedBy()).isNull();
    }

    @Test
    @DisplayName("Restare in RESOLVED non sovrascrive il timestamp di risoluzione originale")
    void resolvedIntoResolvedNoOverwriteTimestamp() {
        Instant timestampOriginale = Instant.parse("2026-02-01T09:00:00Z");
        issue.setStatus(IssueStatus.RESOLVED);
        issue.setResolvedAt(timestampOriginale);
        issue.setResolvedBy(admin);

        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setStatus(IssueStatus.RESOLVED); // stato invariato
        request.setPriority(IssuePriority.CRITICAL);

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getResolvedAt()).isEqualTo(timestampOriginale);
        assertThat(response.getBody().getResolvedBy().getEmail()).isEqualTo(admin.getEmail());
    }

    // ---------------------------------------------------------------------
    // Gestione dell'assegnatario
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("Un admin può riassegnare la issue a un altro utente esistente")
    void adminCanChangeAssignee() {
        User nuovoAssegnatario = buildUser(4L, "other_dev@bugboard26.com", Role.NORMAL);

        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));
        when(userRepository.findByEmail(nuovoAssegnatario.getEmail())).thenReturn(Optional.of(nuovoAssegnatario));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setAssigneeEmail(nuovoAssegnatario.getEmail());

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getAssignee().getEmail()).isEqualTo(nuovoAssegnatario.getEmail());
    }

    @Test
    @DisplayName("Un admin può rimuovere l'assegnatario passando una email vuota")
    void adminCanRemoveAssignee() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setAssigneeEmail("");

        ResponseEntity<IssueResponse> response = issueController.changeIssue(10L, request);

        assertThat(response.getBody().getAssignee()).isNull();
    }

    @Test
    @DisplayName("L'assegnatario stesso non può cambiare l'assegnatario della issue")
    void assigneeCantChangeItself() {
        authenticateAs(assignee);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setAssigneeEmail(stranger.getEmail());

        assertThatThrownBy(() -> issueController.changeIssue(10L, request))
                .isInstanceOf(AccessDeniedException.class);

        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("Riassegnare a un'email che non corrisponde a nessun utente lancia IllegalArgumentException")
    void invalidAssigneeEmail() {
        authenticateAs(admin);
        when(issueRepository.findById(10L)).thenReturn(Optional.of(issue));
        when(userRepository.findByEmail("i_dont_exist@bugboard26.com")).thenReturn(Optional.empty());

        ChangeIssueRequest request = new ChangeIssueRequest();
        request.setAssigneeEmail("i_dont_exist@bugboard26.com");

        assertThatThrownBy(() -> issueController.changeIssue(10L, request))
                .isInstanceOf(IllegalArgumentException.class);
    }
}