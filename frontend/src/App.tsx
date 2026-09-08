import React, { useState } from 'react';
import { type User } from './model/User';
import './App.css'
import {login} from "./services/authService.ts";
import {RegisterForm} from "./components/RegisterForm.tsx";

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
            <RegisterForm></RegisterForm>
        );
    }

  return (
      <div style={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          height:'100vh',
          fontFamily:'sans-serif'
      }}>
        <form onSubmit={handleLoginSubmit}
        style={{
            backgroundColor:'white',
            padding:'30px',
            borderRadius:'8px',
            boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
            width:'100%',
            maxWidth:'400px'
        }}>
            <h2 style={{textAlign:'center',marginBottom:'20px'}}>Accedi</h2>
            {error && (<div style={{color: 'red', marginBottom:'15px', padding:'10px', backgroundColor:'#ffe6e6', borderRadius:'4px'}}>{error}</div>)}

            <div style={{marginBottom:'15px'}}>
                <label style={{display:'block', marginBottom:'5px'}}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       style={{
                           width:'100%',
                           padding:'10px',
                           boxSizing:'border-box',
                           borderRadius:'4px',
                           border:'1px solid #ccc'
                       }}
                       required />

                <label style={{display:'block', marginBottom:'5px'}}>Password</label>
                <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                       style={{
                           width:'100%',
                           padding:'10px',
                           boxSizing:'border-box',
                           borderRadius:'4px',
                           border:'1px solid #ccc'
                       }}
                       required />

                <button type="submit" disabled={isLoading}
                style={{
                    width:'100%',
                    padding:'12px',
                    backgroundColor: isLoading ? '#a0c4ff' : '#0056b3',
                    color: 'white',
                    border:'none',
                    borderRadius:'4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontStyle:'16px',
                    marginTop:'12px'
                }}>{isLoading ? 'Accesso in corso...' : 'Login'}</button>
            </div>
        </form>
      </div>
  )
}

export default App;