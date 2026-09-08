package com.bugboard26.backend.dto;

import com.bugboard26.backend.model.IssueType;
import com.bugboard26.backend.model.Priority;
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

    // optional, LOW assigned if not specified
    private Priority priority;

    // optional, null assigned if not specified
    private Long assigneeId;
}