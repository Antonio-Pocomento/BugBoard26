export type Role = "ADMIN" | "NORMAL" | "READONLY";

export interface User
{
    id: number;
    username: string;
    email: string;
    role: Role;
    createdAt: string;
};

export interface LoginCredentials
{
    email: string;
    password: string;
};

export interface AuthResponse
{
    token: string;
    user: User;
};