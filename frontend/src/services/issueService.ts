import {APP_CONFIG} from "../config/config.ts";
import {type CreateIssueRequest} from "../model/Issue.ts";

const API_URL = APP_CONFIG.BASE_URL;
const REGISTER_ISSUE = API_URL + "/issues";

export const createIssue = async (issue: CreateIssueRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(REGISTER_ISSUE, {
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