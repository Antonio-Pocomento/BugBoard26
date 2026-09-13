import type { User } from "./User";

export interface Comment {
    id: number;
    text: string;
    author: User;
    issueId: number;
    createdAt: string;
}

export interface CreateCommentRequest {
    text: string;
}