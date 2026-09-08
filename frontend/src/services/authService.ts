import { type LoginCredentials, type AuthResponse } from "../model/User.ts";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if(!response.ok)
    {
        throw new Error('Email o password non corretti.');
    }

    const data: AuthResponse = await response.json();
    return data;
}