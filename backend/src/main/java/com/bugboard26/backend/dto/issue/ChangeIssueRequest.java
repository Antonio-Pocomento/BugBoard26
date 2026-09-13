package com.bugboard26.backend.dto.issue;

import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeIssueRequest {
    private String title;
    private String description;
    private IssueStatus status;
    private IssueType type;
}
