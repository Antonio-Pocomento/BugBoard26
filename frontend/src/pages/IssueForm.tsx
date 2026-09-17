import { useState } from "react";
import { createIssue } from "../services/issueService.ts";
import { type IssuePriority, type IssueType } from "../model/Issue.ts";
import './IssueForm.css';
import {useNavigate} from "react-router-dom";

export function IssueForm() {
    const navigate = useNavigate();
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

        try {
            setIsLoading(true);
            await createIssue({ title, description, type, priority, assigneeEmail });
            setError(null);
            setSuccess('Issue segnalata con successo!');
            setTitle('');
            setDescription('');
            setType('BUG');
            setPriority('UNKNOWN');
            setAssigneeEmail('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la segnalazione della issue');
            setSuccess(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-grid-bg page-centered page-centered--top">
            <form className="issue-form" onSubmit={handleIssueSubmit}>
                {error && <div className="alert alert--error">{error}</div>}
                {success && <div className="alert alert--success">{success}</div>}
                <div className="surface-card surface-card--raised">
                    <label className="field-label">Titolo</label>
                    <input className="field-input" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />

                    <label className="field-label">Descrizione</label>
                    <textarea className="field-input" required value={description} onChange={(e) => setDescription(e.target.value)} />

                    <label className="field-label">Tipo</label>
                    <select className="field-input" value={type} onChange={(e) => setType(e.target.value as IssueType)}>
                        <option value="QUESTION">Question</option>
                        <option value="BUG">Bug</option>
                        <option value="DOCUMENTATION">Documentation</option>
                        <option value="FEATURE">Feature</option>
                    </select>

                    <label className="field-label">Priorità</label>
                    <select className="field-input" value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)}>
                        <option value="UNKNOWN">Unknown</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>

                    <label className="field-label">Email Assegnatario (facoltativa)</label>
                    <input className="field-input" type="email" value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} />

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                            ← Indietro
                        </button>
                        <button className="btn-primary" type="submit" disabled={isLoading}>
                            {isLoading ? 'Invio...' : 'Invia'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}