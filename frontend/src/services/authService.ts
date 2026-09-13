import {APP_CONFIG} from "../config/config.ts";
import { type LoginCredentials, type AuthResponse } from "../model/User.ts";

const API_URL = APP_CONFIG.BASE_URL + "/auth";

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'Login error');
    }

    const data: AuthResponse = await response.json();
    return data;
}