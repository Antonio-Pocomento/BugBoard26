package com.bugboard26.backend.dto.issue;

import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeIssueRequest {
    private String title;
    private String description;
    private IssueStatus status;
    private IssueType type;
    private IssuePriority priority;

    @Email(message = "Not a valid email")
    private String assigneeEmail;
}