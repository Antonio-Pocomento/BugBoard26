package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.AuthResponse;
import com.bugboard26.backend.dto.LoginRequest;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if(userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide");
        }

        User user = userOptional.get();

        boolean isPasswordValid = request.getPassword().equals(user.getPasswordHash());

        if (!isPasswordValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide.");
        }

        String token = "laosaidoa";
        AuthResponse authResponse = new AuthResponse(token, user);

        return ResponseEntity.ok(authResponse);
    }
}
