import { useEffect, useState } from "react";
import { type Issue, type IssuePriority, type IssueStatus, type IssueType } from "../model/Issue.ts";
import { getIssues } from "../services/issueService.ts";
import "./IssueViewer.css"
import { useNavigate } from "react-router-dom";

function MyButton({ title, onClick, disabled }: { title: string, onClick?: () => void, disabled?: boolean }) {
    return (
        <button className="dashboard-button" onClick={onClick} disabled={disabled}>{title}</button>
    );
}

export function IssueViewer(){
    const navigate = useNavigate();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [type, setType] = useState<IssueType | undefined>();
    const [status, setStatus] = useState<IssueStatus | undefined>();
    const [priority, setPriority] = useState<IssuePriority | undefined>();
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [direction, setDirection] = useState<string>("asc");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleIssueViewer = async () => {
        setError(null);
        try {
            setIsLoading(true);
            const data = await getIssues({ type, status, priority, sortBy, direction});
            setIssues(data);
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
            {error && <div className="issue-error">{error}</div>}

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
                <select value={type ?? ""} onChange={(e) => setType(e.target.value === "" ? undefined : e.target.value as IssueType)}>
                    <option value="">Tutti i tipi</option>
                    <option value="QUESTION">Question</option>
                    <option value="BUG">Bug</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="FEATURE">Feature</option>
                </select>
                <select value={status ?? ""} onChange={(e) => setStatus(e.target.value === "" ? undefined : e.target.value as IssueStatus)}>
                    <option value="">Tutti gli stati</option>
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
                <select value={priority ?? ""} onChange={(e) => setPriority(e.target.value === "" ? undefined : e.target.value as IssuePriority)}>
                    <option value="">Tutte le priorità</option>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
                <select value={sortBy ?? "createdAt"} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">createdAt</option>
                    <option value="updatedAt">updatedAt</option>
                    <option value="resolvedAt">resolvedAt</option>
                    <option value="priority">priority</option>
                    <option value="status">status</option>
                    <option value="title">title</option>
                </select>
                <select value={direction ?? "asc"} onChange={(e) => setDirection(e.target.value)}>
                    <option value="asc">asc</option>
                    <option value="desc">desc</option>
                </select>
                <MyButton title={isLoading ? "Caricamento..." : "Filtra Issue"} onClick={handleIssueViewer} disabled={isLoading} />
            </div>
        </div>
    )
}