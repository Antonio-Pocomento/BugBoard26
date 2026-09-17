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
    imageUrl?: string | null;
    author: User;
    assignee?: User | null;
    resolvedAt: string | null;
    resolvedBy?: User | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateIssueRequest {
    title: string;
    description: string;
    type: IssueType;
    priority?: IssuePriority;
    assigneeEmail?: string;
    image?: File | null;
}

export interface ChangeIssueRequest {
    title?: string;
    description?: string;
    status?: IssueStatus;
    type?: IssueType;
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
    sortBy?: "createdAt" | "updatedAt" | "resolvedAt" | "priority" | "type" | "title";
    direction?: "asc" | "desc";
}