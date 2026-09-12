import React, {useEffect, useState} from "react";
import {type Issue, type IssuePriority, type IssueStatus, type IssueType} from "../model/Issue.ts";
import {getIssues} from "../services/issueService.ts";
import "./IssueViewer.css"
import {useNavigate} from "react-router-dom";

function MyButton({ title, onClick }: { title: string, onClick?: () => void }) {
    return (
        //<button className="dashboard" onClick={onClick}>{title}</button>
        <button className="dashboard-button" onClick={onClick}>{title}</button>
    );
}

export function IssueViewer(){
    const navigate = useNavigate();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [type, setType] = useState<IssueType>();
    const [status, setStatus] = useState<IssueStatus>();
    const [priority, setPriority] = useState<IssuePriority>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleIssueViewer = async () => {
        setError(null);
        try {
            setIsLoading(true);
            const data = await getIssues({ type, status, priority });
            setIssues(data);
            setSuccess("Issue caricate con successo!");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la visualizzazione delle issues!');
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        handleIssueViewer();
    }, []);

    return(
        <div>
            <div className={"issue-list"}>
                {issues.map((issue)=>(
                    <div key={issue.id} className="issue-card" onClick={()=>navigate(`/issueViewer/${issue.id}`)}>
                        <h3>{issue.title}</h3>
                        <p>{issue.description}</p>
                        <p><strong>Type:</strong> {issue.type}</p>
                        <p><strong>Status:</strong> {issue.status}</p>
                        <p><strong>Priority:</strong> {issue.priority}</p>
                    </div>
                ))}
            </div>

            <div className="filters">
                <select value={type} onChange={(e) => setType(e.target.value as "QUESTION" | "BUG" | "DOCUMENTATION" | "FEATURE")}>
                    <option value=""></option>
                    <option value="QUESTION">Question</option>
                    <option value="BUG">Bug</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="FEATURE">Feature</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value as "TODO" | "IN_PROGRESS" | "DONE" | "CLOSED")}>
                    <option value=""></option>
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <select value={priority} onChange={(e) => setPriority(e.target.value as "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}>
                    <option value=""></option>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
                <MyButton title="Filtra Issue" onClick={handleIssueViewer} />
            </div>
        </div>
    )
}