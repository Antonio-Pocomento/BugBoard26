import {APP_CONFIG} from "../config/config.ts";
import {type CreateIssueRequest, type GetIssueRequest, type Issue} from "../model/Issue.ts";

const API_URL = APP_CONFIG.BASE_URL;
const ISSUE_URL = API_URL + "/issues";

export const createIssue = async (issue: CreateIssueRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(ISSUE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(issue),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue Creation Error")
    }
}

export const getIssue = async (issue: GetIssueRequest) => {
    const token = localStorage.getItem('JWT');
    const params = new URLSearchParams();
    if(issue.type) params.append("type",issue.type);
    if(issue.status) params.append("status",issue.status);
    if(issue.priority) params.append("priority",issue.priority);

    const queryString = params.toString();
    const requestUrl = queryString ? `${ISSUE_URL}?${queryString}` : ISSUE_URL;

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue Get Error")
    }
    const data: Issue[] = await response.json();
    return data;
}

export const getIssueFromId = async (id: number) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(`${ISSUE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        throw new Error(errorBody?.message ?? "Issue Get Error")
    }
    const data: Issue = await response.json();
    return data;
}