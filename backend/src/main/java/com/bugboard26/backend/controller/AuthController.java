package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.user.AuthResponse;
import com.bugboard26.backend.dto.user.LoginRequest;
import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;
import com.bugboard26.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Credentials");
        }

        User user = userOptional.get();
        boolean isPasswordValid = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!isPasswordValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Credentials");
        }

        String token = jwtService.generateToken(user);
        AuthResponse authResponse = new AuthResponse(token, new UserResponse(user));

        return ResponseEntity.ok(authResponse);
    }
}