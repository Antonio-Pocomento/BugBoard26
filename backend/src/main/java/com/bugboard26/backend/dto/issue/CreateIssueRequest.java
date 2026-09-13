package com.bugboard26.backend.dto.issue;

import com.bugboard26.backend.model.IssueType;
import com.bugboard26.backend.model.IssuePriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateIssueRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private IssueType type;

    // optional, UNKNOWN assigned if not specified
    private IssuePriority priority;

    // optional
    @Email(message = "Not a valid email")
    private String assigneeEmail;
}