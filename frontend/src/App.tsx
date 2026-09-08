import React, { useState } from 'react';
import { type User } from './model/User';
import './App.css'
import {login} from "./services/authService.ts";

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
          const response = await login({email, password});
          localStorage.setItem('JWT', response.token);
          setCurrentUser(response.user);
      } catch (err) {
          setError(err instanceof Error ? err.message : "Errore durante il login");
      } finally {
          setIsLoading(false);
      }
    }

    const handleLogout = () =>
    {
        setCurrentUser(null);
        setEmail('');
        setPassword('');
        localStorage.removeItem("JWT");
    };

    if(currentUser)
    {
        return (
            <div>
                <h1>Benvenuto {currentUser.email}!</h1>
                <div>
                    <p><strong>ID:</strong> {currentUser.id}</p>
                    <p><strong>Ruolo:</strong> {currentUser.role}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        );
    }

  return (
    <form onSubmit={handleLoginSubmit}>
        <h2>Accedi</h2>
        {error && (<div style={{color: 'red'}}>{error}</div>)}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={isLoading}>Login</button>

        {isLoading ? 'Accesso in corso...' : 'Login'}
    </form>
  )
}

export default App;