import React, { useState } from "react";
import { register } from "../services/adminService.ts";
import { type Role } from "../model/User.ts";
import './RegisterForm.css';

export function RegisterForm() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [role, setRole] = useState<Role>("NORMAL");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        try {
            setIsLoading(true);
            await register({ email, password, role });

            setSuccess(`L'utente ${email} registrato con successo!`);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('NORMAL');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="reg-page">
            <form onSubmit={handleRegisterSubmit} className="reg-form">
                <h2 className="reg-title">Registra nuovo utente</h2>
                {error && <div className="reg-error">{error}</div>}
                {success && <div className="reg-success">{success}</div>}

                <label className="reg-label">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.it" />

                <label className="reg-label">Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Almeno 8 caratteri" />

                <label className="reg-label">Conferma password</label>
                <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la password" />

                <label className="reg-label">Ruolo</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    <option value="ADMIN">Admin</option>
                    <option value="NORMAL">Normal</option>
                    <option value="READONLY">ReadOnly</option>
                </select>

                <button className={"submitReg"} type="submit" disabled={isLoading}>
                    {isLoading ? 'Registrazione in corso...' : 'Registra'}
                </button>
            </form>
        </div>
    );
}