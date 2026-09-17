package com.bugboard26.backend.config;

import com.bugboard26.backend.model.Role;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@SuppressWarnings({"java:S6437", "java:S106"})
@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@bugboard26.com";

        boolean adminExists = userRepository.findByEmail(adminEmail).isPresent();

        if (!adminExists) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("password"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println("Utente admin creato: " + adminEmail);
        }
        else
            System.out.println("Utente admin già presente: " + adminEmail + "\n[WARNING] ELIMINARE LA CLASSE AdminSeeder");
    }
}