import React, {useState} from "react";
import {register} from "../services/adminService.ts";
import {type Role} from "../model/User.ts";
import './RegButton.css';

interface RegisterFormProps
{
    onUserCreated?: () => void;
}

export function RegisterForm({onUserCreated}:RegisterFormProps) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [role, setRole] = useState<Role>("READONLY");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if(password !== confirmPassword)
        {
            setError('Le password non coincidono');
            return;
        }

        try{
            setIsLoading(true);
            await register({email, password, role});

            setSuccess(`L'utente ${email} registrato con successo!`);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('READONLY');

            if(onUserCreated) onUserCreated();
        }catch (err){
            setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleRegisterSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type= "password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}/>
            <input type= "password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
            <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "READONLY" | "NORMAL")}>
                <option value="ADMIN">Admin</option>
                <option value="NORMAL">Normal</option>
                <option value="READONLY">ReadOnly</option>
            </select>
            <button className={"submitReg"} type="submit" disabled={isLoading}></button>
        </form>
    );

}

