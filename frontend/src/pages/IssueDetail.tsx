import { useParams } from "react-router-dom";
import { createComment, getIssueComments, getIssueFromId } from "../services/issueService.ts";
import type { Issue as IssueModel } from "../model/Issue.ts";
import type { Comment } from "../model/Comment.ts";
import type { User } from "../model/User.ts";
import { useEffect, useState } from "react";
import "./IssueDetail.css"

export function IssueDetail() {
    const { id } = useParams<{ id: string }>();
    const [text, setText] = useState<string>("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [issue, setIssue] = useState<IssueModel | null>(null);
    const [error, setError] = useState<string | null>(null);

    const storedUser = localStorage.getItem('user');
    const currentUser: User | null = storedUser ? JSON.parse(storedUser) : null;

    const handleIssue = async () => {
        setError(null);
        try {
            const data = await getIssueFromId(Number(id));
            setIssue(data);
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
        </div>
    )
}