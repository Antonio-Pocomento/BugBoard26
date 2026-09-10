import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { type User } from './model/User';
import { login } from "./services/authService.ts";
import { Dashboard } from "./pages/Dashboard.tsx";
import { RegisterForm } from "./components/RegisterForm.tsx";
import { IssueForm } from "./components/IssueForm.tsx";
import "./App.css";

function App() {

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await login({ email, password });
            localStorage.setItem('JWT', response.token);
            setCurrentUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore durante il login");
        } finally {
            setIsLoading(false);
        }
    }

    function handleLogout() {
        setCurrentUser(null);
        setEmail('');
        setPassword('');
        localStorage.removeItem("JWT");
    };

    if (currentUser) {
        return (
            <Routes>
                <Route path="/" element={<Dashboard onLogout={handleLogout}/>}/>
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/issue" element={<IssueForm />} />
                {/* qualsiasi path sconosciuto riporta alla Dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    return (
        <div className="login-page">
            <form onSubmit={handleLoginSubmit} className="login-card">
                <h2>Accedi</h2>
                {error && (<div className="login-error">{error}</div>)}

                <div className="login-field-group">
                    <label className="login-label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                           className="login-input"
                           required />

                    <label className="login-label">Password</label>
                    <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                           className="login-input"
                           required />

                    <button type="submit" disabled={isLoading} className="login-button">
                        {isLoading ? 'Accesso in corso...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default App;