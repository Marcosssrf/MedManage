// const BASE_URL = "https://medmanage-production.up.railway.app";
const BASE_URL = "https://medmanage-api.onrender.com";
// const BASE_URL = "http://localhost:8080";

export interface AuthUser {
    id: string;
    username: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    medico?: {
        id: string;
        nome: string;
        crm: string;
        especialidade: string;
    };
}

export const authService = {
    login: async (username: string, senha: string): Promise<AuthUser> => {
        const credentials = btoa(`${username}:${senha}`);
        const res = await fetch(`${BASE_URL}/usuarios/me`, {
            headers: {
                Authorization: `Basic ${credentials}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Usuário ou senha inválidos");
        const user: AuthUser = await res.json();
        localStorage.setItem("auth_credentials", credentials);
        localStorage.setItem("auth_user", JSON.stringify(user));
        return user;
    },

    logout: () => {
        localStorage.removeItem("auth_credentials");
        localStorage.removeItem("auth_user");
    },

    getCredentials: (): string | null => {
        return localStorage.getItem("auth_credentials");
    },

    getUser: (): AuthUser | null => {
        const raw = localStorage.getItem("auth_user");
        return raw ? JSON.parse(raw) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem("auth_credentials");
    },
};