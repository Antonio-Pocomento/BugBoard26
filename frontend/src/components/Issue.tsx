import {useParams} from "react-router-dom";
import {getIssueFromId} from "../services/issueService.ts";
import type {Issue} from "../model/Issue.ts";
import {useState} from "react";
import "./Issue.css"

export function Issue(){
    const { id } = useParams<{ id: string }>();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleIssue = async (e:React.MouseEvent) =>{
        e.preventDefault();
        try {
            const numericId = Number(id)
            const data = await getIssueFromId(numericId);
            setIssue(data);
        } catch (err) {
            setError(err instanceof Error? err.message: 'Errore ');
        }
    }
    return (
        <div className={"issueId-page"}>
            <label>{issue?.title}</label>
            <label>{issue?.description}</label>
            <label>{issue?.type}</label>
            <label>{issue?.priority}</label>
            <label>{issue?.status}</label>
            <label>{issue?.createdAt}</label>
            <button className={"HandleIssueButton"} onClick={handleIssue}>HELLO</button>
        </div>
    )

}
