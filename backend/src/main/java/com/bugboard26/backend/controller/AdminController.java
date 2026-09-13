package com.bugboard26.backend.controller;

import com.bugboard26.backend.dto.report.MonthlyReportResponse;
import com.bugboard26.backend.dto.user.CreateUserRequest;
import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.exception.EmailAlreadyInUseException;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.UserRepository;
import com.bugboard26.backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReportService reportService;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, ReportService reportService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.reportService = reportService;
    }

    @PostMapping("/user")
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyInUseException("Email already in use: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponse(savedUser));
    }

    @GetMapping("/info")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(@RequestParam(required = false) String date) {
        YearMonth ym = (date != null) ? YearMonth.parse(date) : YearMonth.now();
        return ResponseEntity.ok(reportService.getMonthlyReport(ym));
    }
}
