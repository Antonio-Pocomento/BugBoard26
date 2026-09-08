export type Role = "ADMIN" | "NORMAL" | "READONLY";

export interface User
{
    id: number;
    email: string;
    role: Role;
    createdAt: string;
}

// LOGIN

export interface LoginCredentials
{
    email: string;
    password: string;
}

export interface AuthResponse
{
    token: string;
    user: User;
}

// REGISTER

export interface CreateUserRequest
{
    email: string;
    password: string;
    role: Role;
}