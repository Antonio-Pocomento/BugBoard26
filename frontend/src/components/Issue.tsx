import {useParams} from "react-router-dom";
import {createComment, getIssueComments, getIssueFromId} from "../services/issueService.ts";
import type {Issue} from "../model/Issue.ts";
import type {Comment} from "../model/Comment.ts";
import {useEffect, useState} from "react";
import "./Issue.css"

export function Issue(){
    const { id } = useParams<{ id: string }>();
    const [text, setText] = useState<string>("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleIssue = async () =>{
        setError(null);
        try {
            const numericId = Number(id)
            const data = await getIssueFromId(numericId);
            setIssue(data);
        } catch (err) {
            setError(err instanceof Error? err.message: 'Errore ');
        }
    }

    const handleComments = async () =>{
        setError(null);
        try {
            const numericId = Number(id)
            const data = await getIssueComments(numericId);
            setComments(data);
        } catch (err) {
            setError(err instanceof Error? err.message: 'Errore ');
        }
    }

    useEffect(() => {
        handleIssue();
        handleComments();
    }, []);

    return (
        <div className={"issueId-page"}>
            <h1>
                <span className={"title-label"}>Titolo: </span>
                <span>{issue?.title}</span>
            </h1>
            <h2>
                <span className={"description-label"}>Descrizione: </span>
                <span>{issue?.description}</span>
            </h2>
            <h2>
                <span className={"type-label"}>Tipo: </span>
                <span>{issue?.type}</span>
            </h2>
            <h2>
                <span className={"priority-label"}>Priorità: </span>
                <span>{issue?.priority}</span>
            </h2>
            <h2>
                <span className={"status-label"}>Status: </span>
                <span>{issue?.status}</span>
            </h2>
            <h2>
                <span className={"creation-label"}>Data di creazione: </span>
                <span>{issue?.createdAt}</span>
            </h2>
            <div>
               {
                    comments.map((comment) =>(
                        <div key={comment.id}>
                            <h2>Autore: {comment.author.email}</h2>
                            <h2>{comment.text}</h2>
                        </div>
                    ))
                }
            </div>
            <form>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className={"CommentText"}/>
                <button className="HandleComment" onClick={createFrontendComment}>Pubblica Commento</button>
            </form>
        </div>
    )

    /*
    const [issues, setIssues] = useState<Issue[]>([]);

    {issues.map((issue)=>(
                    <div key={issue.id} className="issue-card" onClick={()=>navigate(`/issueViewer/${issue.id}`)}>
                        <h3>{issue.title}</h3>
                        <p>{issue.description}</p>
                        <p><strong>Type:</strong> {issue.type}</p>
                        <p><strong>Status:</strong> {issue.status}</p>
                        <p><strong>Priority:</strong> {issue.priority}</p>
                    </div>
                ))}
     */

    async function createFrontendComment(e: React.MouseEvent) {
        e.preventDefault();
        const numericId = Number(id);
        if (!id || !text.trim()) return;

        try {
            await createComment(numericId, { text });
            setText("");
            await handleComments(); // per aggiornare la lista dopo la pubblicazione
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore nella creazione del commento");
        }
    }

}
