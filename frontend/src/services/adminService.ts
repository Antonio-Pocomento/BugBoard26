import {APP_CONFIG} from "../config/config.ts";
import {type CreateUserRequest} from "../model/User.ts";
import type { MonthlyReportInfo, UserReportInfo } from "../model/Info.ts";

const API_URL = APP_CONFIG.BASE_URL + "/admin";
const REGISTER_USER = API_URL + "/user";
const INFO_URL = API_URL + "/info"

export const register = async (credentials: CreateUserRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(REGISTER_USER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'New user registration error');
    }
}

// Anno + mese, eg 2026-09
export const getInfo = async (reportDate?: string): Promise<MonthlyReportInfo> => {
    const token = localStorage.getItem('JWT');
    const url = reportDate ? `${INFO_URL}?date=${reportDate}` : `${INFO_URL}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'Monthly report fetch error');
    }

    const data = await response.json();

    const users: UserReportInfo[] = data.perUser
        .map((u: any) => ({
            userId: u.userId,
            email: u.email,
            opened: u.opened,
            resolved: u.resolved,
            avgResolutionLabel: formatHours(u.avgResolutionHours),
            resolutionRateLabel: formatRate(u.opened, u.resolved),
        }))
        .sort((a: UserReportInfo, b: UserReportInfo) => b.resolved - a.resolved);

    // MonthlyReportInfo
    return {
        periodLabel: formatPeriod(data.period),
        totalOpened: data.totalOpened,
        totalResolved: data.totalResolved,
        avgResolutionLabel: formatHours(data.avgResolutionHours),
        users,
        isEmpty: users.length === 0,
    };
}

function formatPeriod(period: string): string {
    const [year, month] = period.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const label = date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatHours(hours: number | null): string {
    if (hours == null) return "—";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    const days = Math.floor(hours / 24);
    const remHours = Math.round(hours % 24);
    return days > 0 ? `${days}g ${remHours}h` : `${hours.toFixed(1)}h`;
}

function formatRate(opened: number, resolved: number): string {
    if (opened === 0) return "—";
    return `${Math.min(100, Math.round((resolved / opened) * 100))}%`;
}