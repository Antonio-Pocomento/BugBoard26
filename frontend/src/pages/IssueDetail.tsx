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
            {error && <div className="issue-error">{error}</div>}

            <h1><span className={"title-label"}>Titolo: </span><span>{issue?.title}</span></h1>
            <h2><span className={"description-label"}>Descrizione: </span><span>{issue?.description}</span></h2>
            <h2><span className={"type-label"}>Tipo: </span><span>{issue?.type}</span></h2>
            <h2><span className={"priority-label"}>Priorità: </span><span>{issue?.priority}</span></h2>
            <h2><span className={"status-label"}>Status: </span><span>{issue?.status}</span></h2>
            <h2><span className={"assignee-label"}>Assegnatario: </span><span>{issue?.assignee?.email ?? "Nessuno"}</span></h2>
            {issue?.status === 'RESOLVED' && (
                <h2><span className={"resolved-by-label"}>Risolto da: </span><span>{issue?.resolvedBy?.email ?? "—"}</span></h2>
            )}
            <h2><span className={"creation-label"}>Data di creazione: </span><span>{issue?.createdAt}</span></h2>

            <div>
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <h2>Autore: {comment.author.email}</h2>
                        <h2>{comment.text}</h2>
                    </div>
                ))}
            </div>

            {currentUser?.role !== 'READONLY' && (
                <form onSubmit={createFrontendComment}>
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} className={"CommentText"} />
                    <button type="submit" className="HandleComment">Pubblica Commento</button>
                </form>
            )}

            {(currentUser?.role === 'ADMIN' || currentUser?.id === issue?.assignee?.id) && (
                <div>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}/>
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

                    <button title={"Modifica Issue"} onClick={changeIssue}>Cliccami</button>
                </div>
            )}
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