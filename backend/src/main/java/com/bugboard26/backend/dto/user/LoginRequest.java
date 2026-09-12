package com.bugboard26.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email cannot be null")
    @Email(message = "Not a valid email")
    private String email;

    @NotBlank(message = "Password cannot be null")
    private String password;
}
