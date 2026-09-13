package com.bugboard26.backend.dto.comment;

import com.bugboard26.backend.dto.user.UserResponse;
import com.bugboard26.backend.model.Comment;
import lombok.Getter;

import java.time.Instant;

@Getter
public class CommentResponse {
    private final Long id;
    private final String text;
    private final UserResponse author;
    private final Long issueId;
    private final Instant createdAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        this.author = new UserResponse(comment.getAuthor());
        this.issueId = comment.getIssue().getId();
        this.createdAt = comment.getCreatedAt();
    }
}