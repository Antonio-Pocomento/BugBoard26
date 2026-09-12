package com.bugboard26.backend.dto.user;

import com.bugboard26.backend.model.Role;
import com.bugboard26.backend.model.User;
import lombok.Getter;

import java.time.Instant;

@Getter
public class UserResponse {
    private final long id;
    private final String email;
    private final Role role;
    private final Instant createdAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
    }
}
