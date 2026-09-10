export type IssuePriority = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CLOSED";
export type IssueType = "QUESTION" | "BUG" | "DOCUMENTATION" | "FEATURE";

export interface Issue {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    priority: IssuePriority;
    status: IssueStatus;
    imagePath?: string | null;
    author: number;
    assignee?: number | null;
    createdAt: string;
}

export interface CreateIssueRequest {
    title: string;
    description: string;
    type: IssueType;
    priority?: IssuePriority;
    assigneeEmail?: string;
}