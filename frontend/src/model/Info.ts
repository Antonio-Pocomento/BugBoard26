export interface UserReportInfo {
    userId: number;
    email: string;
    opened: number;
    resolved: number;
    avgResolutionLabel: string;
    resolutionRateLabel: string;
}

export interface MonthlyReportInfo {
    periodLabel: string;
    totalOpened: number;
    totalResolved: number;
    avgResolutionLabel: string;
    users: UserReportInfo[];
    isEmpty: boolean;
}