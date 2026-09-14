package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.user.CreateUserRequest;
import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.exception.EmailAlreadyInUseException;
import com.bugboard26.backend.model.Role;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerCreateUserTest {

    private static final String HASHED_PASSWORD = "hashed-password";

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        // Simula il comportamento del DB assegnando id e data di creazione all'utente salvato.
        lenient().when(passwordEncoder.encode(anyString())).thenReturn(HASHED_PASSWORD);
        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(50L);
            u.setCreatedAt(Instant.parse("2026-01-01T10:00:00Z"));
            return u;
        });
    }

    private CreateUserRequest buildRequest(String email, String password, Role role) {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setRole(role);
        return request;
    }

    // ---------------------------------------------------------------------
    // Creazione dell'utente
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("Un nuovo utente con ruolo NORMAL viene creato correttamente")
    void createUserWithNormalRole() {
        when(userRepository.findByEmail("dev@bugboard26.com")).thenReturn(Optional.empty());

        CreateUserRequest request = buildRequest("dev@bugboard26.com", "password123", Role.NORMAL);

        ResponseEntity<UserResponse> response = adminController.createUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getEmail()).isEqualTo(request.getEmail());
        assertThat(response.getBody().getRole()).isEqualTo(Role.NORMAL);
    }

    @Test
    @DisplayName("Un nuovo utente con ruolo ADMIN viene creato correttamente")
    void createUserWithAdminRole() {
        when(userRepository.findByEmail("nuovoadmin@bugboard26.com")).thenReturn(Optional.empty());

        CreateUserRequest request = buildRequest("nuovoadmin@bugboard26.com", "password123", Role.ADMIN);

        ResponseEntity<UserResponse> response = adminController.createUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("Un nuovo utente con ruolo READONLY viene creato correttamente")
    void createUserWithReadonlyRole() {
        when(userRepository.findByEmail("lettore@bugboard26.com")).thenReturn(Optional.empty());

        CreateUserRequest request = buildRequest("lettore@bugboard26.com", "password123", Role.READONLY);

        ResponseEntity<UserResponse> response = adminController.createUser(request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().getRole()).isEqualTo(Role.READONLY);
    }

    @Test
    @DisplayName("L'utente salvato ha la password codificata e i campi corretti")
    void savedUserHasHashedPasswordAndCorrectFields() {
        when(userRepository.findByEmail("dev@bugboard26.com")).thenReturn(Optional.empty());

        CreateUserRequest request = buildRequest("dev@bugboard26.com", "password123", Role.NORMAL);

        adminController.createUser(request);

        verify(passwordEncoder).encode("password123");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User savedUser = captor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(request.getEmail());
        assertThat(savedUser.getRole()).isEqualTo(Role.NORMAL);
        assertThat(savedUser.getPasswordHash()).isEqualTo(HASHED_PASSWORD);
    }

    @Test
    @DisplayName("Un'email già in uso genera EmailAlreadyInUseException e nessun utente viene salvato")
    void emailAlreadyInUse() {
        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("dev@bugboard26.com");
        existingUser.setRole(Role.NORMAL);
        when(userRepository.findByEmail("dev@bugboard26.com")).thenReturn(Optional.of(existingUser));

        CreateUserRequest request = buildRequest("dev@bugboard26.com", "password123", Role.NORMAL);

        assertThatThrownBy(() -> adminController.createUser(request))
                .isInstanceOf(EmailAlreadyInUseException.class);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }
}