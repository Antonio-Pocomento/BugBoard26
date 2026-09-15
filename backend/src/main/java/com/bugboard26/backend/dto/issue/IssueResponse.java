package com.bugboard26.backend.dto.issue;

import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.model.Issue;
import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import lombok.Getter;

import java.time.Instant;

@Getter
public class IssueResponse {
    private final Long id;
    private final String title;
    private final String description;
    private final IssueType type;
    private final IssuePriority priority;
    private final IssueStatus status;
    private final String imageUrl;
    private final UserResponse author;
    private final UserResponse assignee;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final Instant resolvedAt;
    private final UserResponse resolvedBy;

    public IssueResponse(Issue issue) {
        this.id = issue.getId();
        this.title = issue.getTitle();
        this.description = issue.getDescription();
        this.type = issue.getType();
        this.priority = issue.getPriority();
        this.status = issue.getStatus();
        this.imageUrl = issue.getImagePath() != null ? "/issues/images/" + issue.getImagePath() : null;
        this.author = new UserResponse(issue.getAuthor());
        this.assignee = issue.getAssignee() != null ? new UserResponse(issue.getAssignee()) : null;
        this.createdAt = issue.getCreatedAt();
        this.updatedAt = issue.getUpdatedAt();
        this.resolvedAt = issue.getResolvedAt();
        this.resolvedBy = issue.getResolvedBy() != null ? new UserResponse(issue.getResolvedBy()) : null;
    }
}