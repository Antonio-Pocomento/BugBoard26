package com.bugboard26.backend.dto.report;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class UserReportMetrics {
    private Long userId;
    private String email;
    private long opened;
    private long resolved;
    private Double avgResolutionHours; // null if no issue has been resolved
}