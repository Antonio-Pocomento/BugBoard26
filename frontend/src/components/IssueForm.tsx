import React, {useState} from "react";
import {createIssue} from "../services/issueService.ts";
import {type IssuePriority, type IssueType} from "../model/Issue.ts";
import './IssueObj.css';

export function IssueForm(){
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<IssueType>("BUG");
    const [priority, setPriority] = useState<IssuePriority>("UNKNOWN");
    const [assigneeEmail, setAssigneeEmail] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleIssueSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try{
            setIsLoading(true);
            await createIssue({title, description, type, priority, assigneeEmail});

            setSuccess('Issue segnalata con successo!');
            setTitle('');
            setDescription('');
            setType('BUG');
            setPriority('UNKNOWN');
            setAssigneeEmail('');
        }catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la segnalazione della issue');
        }finally{
            setIsLoading(false);
        }
    }

    return(
        <div className={"issue-page"}>
            <form className={"issue-form"} onSubmit= {handleIssueSubmit} >
                {error && <div className="issue-error">{error}</div>}
                <div className={"issue-card"}>
                    <label className={"issue-label"}>Title</label>
                    <input className={"issue-input"} type = "title" value = {title} onChange={(e) => setTitle(e.target.value)} />
                    <label className={"issue-label"}>Description</label>
                    <input className={"issue-input"} type = "description" value = {description} onChange={(e) => setDescription(e.target.value)} />
                    <label className={"issue-label"}>Type</label>
                    <select className={"issue-input"} value={type} onChange={(e) => setType(e.target.value as "QUESTION" | "BUG" | "DOCUMENTATION" | "FEATURE")}>
                        <option value="QUESTION">Question</option>
                        <option value="BUG">Bug</option>
                        <option value="DOCUMENTATION">Documentation</option>
                        <option value="FEATURE">Feature</option>
                    </select>
                    <label className={"issue-label"}>Priority</label>
                    <select className={"issue-input"} value={priority} onChange={(e) => setPriority(e.target.value as "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}>
                        <option value="UNKNOWN">Unknown</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                    <label className={"issue-label"}>Assignee Email</label>
                    <input className={"issue-input"} type = "assigneeEmail" value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)}/>
                    <button className={"submitIssue"} type={"submit"} disabled={isLoading}>Submit</button>
                </div>
            </form>
        </div>
    );
}