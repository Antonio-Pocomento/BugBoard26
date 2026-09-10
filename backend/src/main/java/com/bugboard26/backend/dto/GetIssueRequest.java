package com.bugboard26.backend.dto;

import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetIssueRequest {
    private IssueType type;
    private IssueStatus status;
    private IssuePriority priority;
}