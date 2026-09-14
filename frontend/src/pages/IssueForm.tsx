import { useState } from "react";
import { createIssue } from "../services/issueService.ts";
import { type IssuePriority, type IssueType } from "../model/Issue.ts";
import './IssueForm.css';

export function IssueForm(){
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<IssueType>("BUG");
    const [priority, setPriority] = useState<IssuePriority>("UNKNOWN");
    const [assigneeEmail, setAssigneeEmail] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleIssueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            setIsLoading(true);
            await createIssue({ title, description, type, priority, assigneeEmail });

            setSuccess('Issue segnalata con successo!');
            setTitle('');
            setDescription('');
            setType('BUG');
            setPriority('UNKNOWN');
            setAssigneeEmail('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la segnalazione della issue');
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <div className={"issue-page"}>
            <form className={"issue-form"} onSubmit={handleIssueSubmit}>
                {error && <div className="issue-error">{error}</div>}
                {success && <div className="issue-success">{success}</div>}
                <div className={"issue-card-form"}>
                    <label className={"issue-label"}>Title</label>
                    <input className={"issue-input"} type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />

                    <label className={"issue-label"}>Description</label>
                    <textarea className={"issue-input"} required value={description} onChange={(e) => setDescription(e.target.value)} />

                    <label className={"issue-label"}>Type</label>
                    <select className={"issue-input"} value={type} onChange={(e) => setType(e.target.value as IssueType)}>
                        <option value="QUESTION">Question</option>
                        <option value="BUG">Bug</option>
                        <option value="DOCUMENTATION">Documentation</option>
                        <option value="FEATURE">Feature</option>
                    </select>

                    <label className={"issue-label"}>Priority</label>
                    <select className={"issue-input"} value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
                        <option value="UNKNOWN">Unknown</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>

                    <label className={"issue-label"}>Assignee Email</label>
                    <input className={"issue-input"} type="email" value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} />

                    <button className={"submitIssue"} type={"submit"} disabled={isLoading}>
                        {isLoading ? 'Invio...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}