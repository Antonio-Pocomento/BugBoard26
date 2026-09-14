import { useParams } from "react-router-dom";
import {changeIssueFromId, createComment, getIssueComments, getIssueFromId} from "../services/issueService.ts";
import type {ChangeIssueRequest, Issue as IssueModel, IssuePriority, IssueStatus, IssueType} from "../model/Issue.ts";
import type { Comment } from "../model/Comment.ts";
import type { User } from "../model/User.ts";
import React, { useEffect, useState } from "react";
import "./IssueDetail.css";

export function IssueDetail() {
    const { id } = useParams<{ id: string }>();
    const [text, setText] = useState<string>("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [issue, setIssue] = useState<IssueModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [status, setStatus] = useState<IssueStatus>();
    const [type, setType] = useState<IssueType>();
    const [priority, setPriority] = useState<IssuePriority>();
    const [assigneeEmail, setAssigneeEmail] = useState<string>("");



    const storedUser = localStorage.getItem('user');
    const currentUser: User | null = storedUser ? JSON.parse(storedUser) : null;

    const handleIssue = async () => {
        setError(null);
        try {
            const data = await getIssueFromId(Number(id));
            setIssue(data);
            setTitle(data.title);
            setDescription(data.description);
            setStatus(data.status);
            setType(data.type);
            setPriority(data.priority);
            setAssigneeEmail(data.assignee?.email ?? "");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nel caricamento della issue');
        }
    }

    const handleComments = async () => {
        setError(null);
        try {
            const data = await getIssueComments(Number(id));
            setComments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore nel caricamento dei commenti');
        }
    }

    useEffect(() => {
        handleIssue();
        handleComments();
    }, [id]);

    async function createFrontendComment(e: React.FormEvent) {
        e.preventDefault();
        if (!id || !text.trim()) return;

        try {
            await createComment(Number(id), { text });
            setText("");
            await handleComments();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore nella creazione del commento");
        }
    }

    return (
        <div className={"issueId-page"}>
            <div className="issueId-content">
                {error && <div className="issue-error">{error}</div>}

                <header className="issueId-header">
                    <h1 className="issueId-title">{issue?.title}</h1>
                    <div className="issueId-badges">
                        <span className={`badge badge-type-${issue?.type?.toLowerCase()}`}>{issue?.type}</span>
                        <span className={`badge badge-status-${issue?.status?.toLowerCase()}`}>{issue?.status}</span>
                        <span className={`badge badge-priority-${issue?.priority?.toLowerCase()}`}>{issue?.priority}</span>
                    </div>
                </header>

                <p className="issueId-description">{issue?.description}</p>

                <dl className="issueId-meta">
                    <div className="issueId-meta-row">
                        <dt>Assegnatario</dt>
                        <dd>{issue?.assignee?.email ?? "Nessuno"}</dd>
                    </div>
                    {issue?.status === 'RESOLVED' && (
                        <div className="issueId-meta-row">
                            <dt>Risolto da</dt>
                            <dd>{issue?.resolvedBy?.email ?? "—"}</dd>
                        </div>
                    )}
                    <div className="issueId-meta-row">
                        <dt>Creata il</dt>
                        <dd>{issue?.createdAt}</dd>
                    </div>
                </dl>

                <section className="issueId-comments">
                    <h2 className="issueId-section-title">Commenti</h2>
                    {comments.length === 0 && <p className="issueId-empty">Nessun commento ancora.</p>}
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-card">
                            <span className="comment-author">{comment.author.email}</span>
                            <p className="comment-text">{comment.text}</p>
                        </div>
                    ))}
                </section>

                {currentUser?.role !== 'READONLY' && (
                    <form onSubmit={createFrontendComment} className="comment-form">
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className={"CommentText"} placeholder="Scrivi un commento..." />
                        <button type="submit" className="HandleComment">Pubblica</button>
                    </form>
                )}

                {(currentUser?.role === 'ADMIN' || currentUser?.id === issue?.assignee?.id) && (
                    <section className="issueId-edit">
                        <h2 className="issueId-section-title">Modifica issue</h2>
                        <div className="issueId-edit-grid">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo" />
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrizione" />
                            <select value={type} onChange={(e) => setType(e.target.value as IssueType)}>
                                <option value="QUESTION">Question</option>
                                <option value="BUG">Bug</option>
                                <option value="DOCUMENTATION">Documentation</option>
                                <option value="FEATURE">Feature</option>
                            </select>
                            <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)}>
                                <option value="TODO">Todo</option>
                                <option value="IN_PROGRESS">In_Progress</option>
                                <option value="ON_HOLD">On_Hold</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
                                <option value="UNKNOWN">Unknown</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>

                            {currentUser?.role === 'ADMIN' && (
                                <input
                                    type="email"
                                    placeholder="Email nuovo assegnatario (vuoto = rimuovi)"
                                    value={assigneeEmail}
                                    onChange={(e) => setAssigneeEmail(e.target.value)}
                                />
                            )}
                        </div>

                        <button title={"Modifica Issue"} onClick={changeIssue} className="save-issue-button">Salva modifiche</button>
                    </section>
                )}
            </div>
        </div>
    )

    async function changeIssue(e: React.MouseEvent) {
        e.preventDefault();
        setError(null);
        try {
            const request: ChangeIssueRequest = { title, description, status, type, priority };
            if (currentUser?.role === 'ADMIN') {
                request.assigneeEmail = assigneeEmail;
            }

            const updated = await changeIssueFromId(Number(id), request);
            setIssue(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore nella modifica della issue");
        }
    }
}