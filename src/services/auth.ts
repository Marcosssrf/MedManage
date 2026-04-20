const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface AuthUser {
    id: string;
    username: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    ativo?: boolean;
    medico?: {
        id: string;
        nome: string;
        crm: string;
        especialidade: string;
    };
}

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

export const authService = {
    login: async (username: string, senha: string): Promise<AuthUser> => {
        // 1. Obtém o token
        const tokenRes = await fetch(`${API_BASE_URL}/auth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ username, senha }),
        });

        if (!tokenRes.ok) throw new Error("Usuário ou senha inválidos");

        const tokenData = await tokenRes.json();
        const token: string = tokenData.accessToken ?? tokenData.token ?? tokenData.access_token;

        if (!token) throw new Error("Token não recebido do servidor");

        // 2. Busca os dados do usuário usando o token recém-obtido
        const meRes = await fetch(`${API_BASE_URL}/usuarios/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
            },
        });

        if (!meRes.ok) throw new Error("Erro ao carregar dados do usuário");

        const user: AuthUser = await meRes.json();

        if (user.ativo === false) {
            throw new Error("Usuário inativo. Contate o administrador.");
        }

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        return user;
    },

    logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    },

    getToken: (): string | null => {
        return localStorage.getItem("auth_token");
    },

    getUser: (): AuthUser | null => {
        const raw = localStorage.getItem("auth_user");
        return raw ? JSON.parse(raw) : null;
    },

    isAuthenticated: (): boolean => {
        const token = localStorage.getItem("auth_token");
        if (!token) return false;
        if (isTokenExpired(token)) {
            authService.logout();
            return false;
        }
        return true;
    },
};
