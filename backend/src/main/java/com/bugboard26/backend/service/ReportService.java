package com.bugboard26.backend.service;

import com.bugboard26.backend.dto.report.MonthlyReportResponse;
import com.bugboard26.backend.dto.report.UserReportMetrics;
import com.bugboard26.backend.model.Issue;
import com.bugboard26.backend.model.User;
import com.bugboard26.backend.repository.IssueRepository;
import com.bugboard26.backend.repository.IssueSpecification;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final IssueRepository issueRepository;

    public ReportService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    public MonthlyReportResponse getMonthlyReport(YearMonth date) {
        Instant start = date.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = date.plusMonths(1).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Issue> opened = issueRepository.findAll(IssueSpecification.createdBetween(start, end));
        List<Issue> resolved = issueRepository.findAll(IssueSpecification.resolvedBetween(start, end));

        int totalIssuesInMonth = opened.size();

        Map<User, List<Issue>> openedByAuthor = opened.stream()
                .collect(Collectors.groupingBy(Issue::getAuthor));
        Map<User, List<Issue>> resolvedByResolver = resolved.stream()
                .filter(i -> i.getResolvedBy() != null)
                .collect(Collectors.groupingBy(Issue::getResolvedBy));

        Set<User> allUsers = new HashSet<>();
        allUsers.addAll(openedByAuthor.keySet());
        allUsers.addAll(resolvedByResolver.keySet());

        List<UserReportMetrics> perUser = allUsers.stream()
                .map(u -> {
                    List<Issue> userOpened = openedByAuthor.getOrDefault(u, List.of());
                    List<Issue> userResolved = resolvedByResolver.getOrDefault(u, List.of());
                    return new UserReportMetrics(
                            u.getId(), u.getEmail(),
                            userOpened.size(), userResolved.size(),
                            avgResolutionHours(userResolved),
                            resolutionRate(userResolved.size(), totalIssuesInMonth));
                })
                .sorted(Comparator.comparing(UserReportMetrics::getEmail))
                .toList();

        return new MonthlyReportResponse(
                date.toString(),
                opened.size(),
                resolved.size(),
                avgResolutionHours(resolved),
                perUser
        );
    }

    private Double avgResolutionHours(List<Issue> issues) {
        List<Double> hours = issues.stream()
                .filter(i -> i.getResolvedAt() != null)
                .map(i -> Duration.between(i.getCreatedAt(), i.getResolvedAt()).toMinutes() / 60.0)
                .toList();
        return hours.isEmpty() ? null : hours.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    private double resolutionRate(int userResolvedCount, int totalIssuesInMonth) {
        if (totalIssuesInMonth == 0) {
            return 0.0;
        }
        return (double) userResolvedCount / totalIssuesInMonth;
    }
}