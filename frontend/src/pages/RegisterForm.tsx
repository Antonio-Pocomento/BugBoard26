import React, { useState } from "react";
import { register } from "../services/adminService.ts";
import { type Role } from "../model/User.ts";
import './RegisterForm.css';
import {useNavigate} from "react-router-dom";

export function RegisterForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [role, setRole] = useState<Role>("NORMAL");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        try {
            setIsLoading(true);
            await register({ email, password, role });
            setError(null);
            setSuccess(`L'utente ${email} è stato registrato con successo!`);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('NORMAL');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
            setSuccess(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-grid-bg page-centered page-centered--top">
            <form onSubmit={handleRegisterSubmit} className="surface-card reg-form">
                <h2 className="surface-card__title">Registra nuovo utente</h2>
                {error && <div className="alert alert--error">{error}</div>}
                {success && <div className="alert alert--success">{success}</div>}

                <label className="field-label">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="nome@azienda.it" />

                <label className="field-label">Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" placeholder="Almeno 8 caratteri" />

                <label className="field-label">Conferma password</label>
                <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field-input" placeholder="Ripeti la password" />

                <label className="field-label">Ruolo</label>
                <select className="field-input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    <option value="ADMIN">Admin</option>
                    <option value="NORMAL">Normal</option>
                    <option value="READONLY">ReadOnly</option>
                </select>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                        ← Indietro
                    </button>
                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        Registra
                    </button>
                </div>
            </form>
        </div>
    );
}