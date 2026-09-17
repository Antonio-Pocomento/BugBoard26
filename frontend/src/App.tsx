import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { type User } from './model/User';
import { login } from "./services/authService.ts";
import { Dashboard } from "./pages/Dashboard.tsx";
import { RegisterForm } from "./pages/RegisterForm.tsx";
import { IssueForm } from "./pages/IssueForm.tsx";
import "./App.css";
import { IssueViewer } from "./pages/IssueViewer.tsx";
import { IssueDetail } from "./pages/IssueDetail.tsx";
import { ReportForm } from "./pages/ReportForm.tsx";

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

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
            localStorage.setItem('user', JSON.stringify(response.user));
            setCurrentUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore durante il login");
        } finally {
            setIsLoading(false);
        }
    };

    function handleLogout() {
        setCurrentUser(null);
        setEmail('');
        setPassword('');
        localStorage.removeItem("JWT");
        localStorage.removeItem('user');
    }

    if (currentUser) {
        return (
            <Routes>
                <Route path="/" element={<Dashboard currentUser={currentUser} onLogout={handleLogout} />} />
                {currentUser.role === 'ADMIN' && <Route path="/register" element={<RegisterForm />} />}
                {currentUser.role !== 'READONLY' && <Route path="/issue" element={<IssueForm />} />}
                <Route path="/issueViewer" element={<IssueViewer />} />
                <Route path="/issueViewer/:id" element={<IssueDetail />} />
                {currentUser.role === 'ADMIN' && <Route path="/reportViewer" element={<ReportForm />} />}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    return (
        <div className="page-grid-bg page-centered page-centered--middle">
            <form onSubmit={handleLoginSubmit} className="surface-card login-card">
                <h2 className="surface-card__title">Accedi</h2>
                {error && <div className="alert alert--error">{error}</div>}

                <div className="login-field-group">
                    <label className="field-label">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="field-input"
                        required
                    />

                    <label className="field-label">Password</label>
                    <input
                        type="password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="field-input"
                        required
                    />

                    <button type="submit" disabled={isLoading} className="btn-primary login-button">
                        {isLoading ? 'Accesso in corso...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default App;