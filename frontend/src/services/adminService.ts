import {APP_CONFIG} from "../config/config.ts";
import {type CreateUserRequest} from "../model/User.ts";

const API_URL = APP_CONFIG.BASE_URL + "/admin";
const REGISTER_USER = API_URL + "/user";

export const register = async (credentials: CreateUserRequest) => {
    const token = localStorage.getItem('JWT');

    const response = await fetch(REGISTER_USER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error('Errore nella registrazione');
    }
}