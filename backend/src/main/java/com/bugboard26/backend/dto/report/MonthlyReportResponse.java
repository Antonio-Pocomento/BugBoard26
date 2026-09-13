package com.bugboard26.backend.dto.report;

import lombok.Getter;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
public class MonthlyReportResponse {
    private String period;
    private long totalOpened;
    private long totalResolved;
    private Double avgResolutionHours;
    private List<UserReportMetrics> perUser;
}