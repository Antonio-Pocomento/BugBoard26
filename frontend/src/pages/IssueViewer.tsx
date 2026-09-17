import { useEffect, useState } from "react";
import { type GetIssueRequest, type Issue, type IssuePriority, type IssueStatus, type IssueType } from "../model/Issue.ts";
import { getIssues } from "../services/issueService.ts";
import "./IssueViewer.css";
import { useNavigate } from "react-router-dom";

type SortBy = NonNullable<GetIssueRequest["sortBy"]>;
type Direction = NonNullable<GetIssueRequest["direction"]>;

export function IssueViewer() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [type, setType] = useState<IssueType | undefined>();
    const [status, setStatus] = useState<IssueStatus | undefined>();
    const [priority, setPriority] = useState<IssuePriority | undefined>();
    const [sortBy, setSortBy] = useState<SortBy>("createdAt");
    const [direction, setDirection] = useState<Direction>("asc");

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleIssueViewer = async () => {

        try {
            setIsLoading(true);
            const filters: GetIssueRequest = { type, status, priority, sortBy, direction };
            const data = await getIssues(filters);
            setError(null);
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

    return (
        <div className="page-grid-bg">
            <div className="issue-list-wrapper">
                {error && <div className="alert alert--error">{error}</div>}

                <div className="filters">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                        ← Indietro
                    </button>
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
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                        <option value="createdAt">createdAt</option>
                        <option value="updatedAt">updatedAt</option>
                        <option value="resolvedAt">resolvedAt</option>
                        <option value="priority">priority</option>
                        <option value="title">title</option>
                    </select>
                    <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
                        <option value="asc">asc</option>
                        <option value="desc">desc</option>
                    </select>
                    <button className="btn-secondary btn-secondary--accent" onClick={handleIssueViewer} disabled={isLoading}>
                        Filtra Issue
                    </button>
                </div>

                <div className="issue-list">
                    {isLoading && issues.length === 0 && (
                        <p className="issue-list-status">Caricamento delle issue…</p>
                    )}
                    {!isLoading && issues.length === 0 && (
                        <p className="issue-list-status">Nessuna issue trovata.</p>
                    )}
                    {issues.map((issue) => (
                        <div key={issue.id} className="issue-card" onClick={() => navigate(`/issueViewer/${issue.id}`)}>
                            <h3>{issue.title}</h3>
                            <p>{issue.description}</p>
                            <div className="issue-card-badges">
                                <span className={`badge badge-type-${issue.type.toLowerCase()}`}>{issue.type}</span>
                                <span className={`badge badge-status-${issue.status.toLowerCase()}`}>{issue.status}</span>
                                <span className={`badge badge-priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
}
