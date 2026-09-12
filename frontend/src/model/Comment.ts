export interface Author {
    id: number;
    email: string;
    role: string;
    createdAt: string;
}

export interface Comment
{
    id: number;
    text: string;
    author: Author;
    issue: number;
    createdAt: string;
}

export interface CreateCommentRequest{
    text: string;
}