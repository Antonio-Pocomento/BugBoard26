package com.bugboard26.backend.repository;

import com.bugboard26.backend.model.Issue;
import com.bugboard26.backend.model.IssuePriority;
import com.bugboard26.backend.model.IssueStatus;
import com.bugboard26.backend.model.IssueType;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

// root = Issue
// query = CriteriaQuery
// cb = CriteriaBuilder

public class IssueSpecification {

    private IssueSpecification() {
        throw new IllegalStateException("Utility class");
    }

    public static Specification<Issue> hasType(IssueType type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Issue> hasStatus(IssueStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Issue> hasPriority(IssuePriority priority) {
        return (root, query, cb) ->
                priority == null ? null : cb.equal(root.get("priority"), priority);
    }

    public static Specification<Issue> hasAssignee(Long assigneeId) {
        return (root, query, cb) ->
                assigneeId == null ? null : cb.equal(root.get("assignee").get("id"), assigneeId);
    }

    public static Specification<Issue> hasAuthor(Long authorId) {
        return (root, query, cb) ->
                authorId == null ? null : cb.equal(root.get("author").get("id"), authorId);
    }

    public static Specification<Issue> resolvedAfter(Instant instant) {
        return (root, query, cb) ->
                instant == null ? null : cb.greaterThanOrEqualTo(root.get("resolvedAt"), instant);
    }

    public static Specification<Issue> resolvedBefore(Instant instant) {
        return (root, query, cb) ->
                instant == null ? null : cb.lessThanOrEqualTo(root.get("resolvedAt"), instant);
    }

    public static Specification<Issue> createdBetween(Instant from, Instant to) {
        return (root, query, cb) ->
                (from == null || to == null) ? null : cb.between(root.get("createdAt"), from, to);
    }

    public static Specification<Issue> resolvedBetween(Instant from, Instant to) {
        return (root, query, cb) ->
                (from == null || to == null) ? null : cb.between(root.get("resolvedAt"), from, to);
    }

    public static Specification<Issue> orderByPriority(Sort.Direction direction) {
        return (root, query, cb) -> {
            Expression<IssuePriority> priorityPath = root.get("priority");
            Expression<Integer> priorityRank = cb.<IssuePriority, Integer>selectCase(priorityPath)
                    .when(IssuePriority.UNKNOWN, 0)
                    .when(IssuePriority.LOW, 1)
                    .when(IssuePriority.MEDIUM, 2)
                    .when(IssuePriority.HIGH, 3)
                    .when(IssuePriority.CRITICAL, 4)
                    .otherwise(5);

            query.orderBy(direction == Sort.Direction.ASC ? cb.asc(priorityRank) : cb.desc(priorityRank));
            return null;
        };
    }
}