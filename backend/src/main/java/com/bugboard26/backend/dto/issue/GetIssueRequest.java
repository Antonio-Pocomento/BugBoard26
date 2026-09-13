package com.bugboard26.backend.dto.issue;

import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class GetIssueRequest {
    private IssueType type;
    private IssueStatus status;
    private IssuePriority priority;
    private Long assigneeId;
    private Long authorId;
    private Instant resolvedAfter;
    private Instant resolvedBefore;

    // "createdAt" (default), "updatedAt", "resolvedAt", "priority", "status", "type", "title"
    private String sortBy;

    // "asc" or "desc" (default: "desc")
    private String direction;
}