package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.user.LoginResponse;
import com.bugboard26.backend.dto.user.LoginRequest;
import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.exception.InvalidCredentialsException;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;
import com.bugboard26.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new InvalidCredentialsException("Credenziali Errate"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token, new UserResponse(user)));
    }
}