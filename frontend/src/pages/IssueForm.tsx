import { useState } from "react";
import { createIssue } from "../services/issueService.ts";
import { type IssuePriority, type IssueType } from "../model/Issue.ts";
import './IssueForm.css';
import {useNavigate} from "react-router-dom";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, coerente col limite backend
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function IssueForm() {
    const navigate = useNavigate();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<IssueType>("BUG");
    const [priority, setPriority] = useState<IssuePriority>("UNKNOWN");
    const [assigneeEmail, setAssigneeEmail] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setError(null);

        if (!file) {
            setImage(null);
            setImagePreviewUrl(null);
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Formato immagine non supportato. Usa PNG, JPEG, WEBP o GIF');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setError("L'immagine supera la dimensione massima di 5MB");
            e.target.value = '';
            return;
        }

        setImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    };

    const handleIssueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            await createIssue({ title, description, type, priority, assigneeEmail, image });
            setError(null);
            setSuccess('Issue segnalata con successo!');
            setTitle('');
            setDescription('');
            setType('BUG');
            setPriority('UNKNOWN');
            setAssigneeEmail('');
            setImage(null);
            setImagePreviewUrl(null);
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

                    <label className="field-label">Immagine (opzionale)</label>
                    <input
                        className="field-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleImageChange}
                    />
                    {imagePreviewUrl && (
                        <img className="issue-image-preview" src={imagePreviewUrl} alt="Anteprima allegato" />
                    )}

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