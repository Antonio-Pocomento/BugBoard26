export type IssuePriority = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED";
export type IssueType = "QUESTION" | "BUG" | "DOCUMENTATION" | "FEATURE";

import type { User } from "./User";

export interface Issue {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    priority: IssuePriority;
    status: IssueStatus;
    imagePath?: string | null;
    author: User;
    assignee?: User | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateIssueRequest {
    title: string;
    description: string;
    type: IssueType;
    priority?: IssuePriority;
    assigneeEmail?: string;
}

export interface GetIssueRequest {
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeId?: number;
    authorId?: number;
    resolvedAfter?: string;
    resolvedBefore?: string;
    sortBy?: "createdAt" | "updatedAt" | "resolvedAt" | "priority" | "status" | "type" | "title";
    direction?: "asc" | "desc";
}