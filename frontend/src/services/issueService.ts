import {APP_CONFIG} from "../config/config.ts";
import {type ChangeIssueRequest, type CreateIssueRequest, type GetIssueRequest, type Issue} from "../model/Issue.ts";
import type {Comment, CreateCommentRequest} from "../model/Comment.ts";

const API_URL = APP_CONFIG.BASE_URL;
const ISSUE_URL = API_URL + "/issues";

export const createIssue = async (issue: CreateIssueRequest) => {
    const token = localStorage.getItem('JWT');

    const formData = new FormData();
    formData.append('title', issue.title);
    formData.append('description', issue.description);
    formData.append('type', issue.type);
    if (issue.priority) formData.append('priority', issue.priority);
    if (issue.assigneeEmail) formData.append('assigneeEmail', issue.assigneeEmail);
    if (issue.image) formData.append('image', issue.image);

    const response = await fetch(ISSUE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue Creation Error")
    }
}

export const getIssueImageObjectUrl = async (imageUrl: string) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(`${API_URL}${imageUrl}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Error loading image");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export const getIssues = async (request: GetIssueRequest) => {
    const token = localStorage.getItem('JWT');
    const params = new URLSearchParams();
    if (request.type) params.append("type", request.type);
    if (request.status) params.append("status", request.status);
    if (request.priority) params.append("priority", request.priority);
    if (request.assigneeId != null) params.append("assigneeId", String(request.assigneeId));
    if (request.authorId != null) params.append("authorId", String(request.authorId));
    if (request.resolvedAfter) params.append("resolvedAfter", request.resolvedAfter);
    if (request.resolvedBefore) params.append("resolvedBefore", request.resolvedBefore);
    if (request.sortBy) params.append("sortBy", request.sortBy);
    if (request.direction) params.append("direction", request.direction);

    const queryString = params.toString();
    const requestUrl = queryString ? `${ISSUE_URL}?${queryString}` : ISSUE_URL;

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Issues Get Error")
    }
    const data: Issue[] = await response.json();
    return data;
}

export const getIssueFromId = async (id: number) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(`${ISSUE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue ID Get Error")
    }
    const data: Issue = await response.json();
    return data;
}

export const changeIssueFromId = async (id: number, request: ChangeIssueRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(`${ISSUE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue ID Get Error")
    }
    const data: Issue = await response.json();
    return data;
}

export const getIssueComments = async (issueId: number) => {

    const token = localStorage.getItem('JWT');

    const response = await fetch(`${ISSUE_URL}/${issueId}/comments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if(!response.ok)
    {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue Comments Get Error")
    }

    const data: Comment[] = await response.json();
    return data;
}


export const createComment = async (issueId: number, request: CreateCommentRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(`${ISSUE_URL}/${issueId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Comment Creation Error")
    }
}