package com.bugboard26.backend.repository;

import com.bugboard26.backend.model.Issue;
import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import org.springframework.data.jpa.domain.Specification;

/// root = Issue
/// query = CriteriaQuery
/// cb = CriteriaBuilder

public class IssueSpecification {
    public static Specification<Issue> hasType(IssueType type) {
        return (root, query, cb) ->
                type==null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Issue> hasStatus(IssueStatus status) {
        return (root, query, cb) ->
                status==null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Issue> hasPriority(IssuePriority priority) {
        return (root, query, cb) ->
                priority==null ? null : cb.equal(root.get("priority"), priority);
    }
}
