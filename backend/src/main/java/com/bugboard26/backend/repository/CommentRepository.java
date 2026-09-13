package com.bugboard26.backend.repository;

import com.bugboard26.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findCommentsByIssue_IdOrderByCreatedAtAsc(Long issueId);
}