import { createContext, useContext, useState, ReactNode } from "react";
import { authService } from "../services/auth";
import type { AuthUser } from "../services/auth";

interface AuthContextType {
    user: AuthUser | null;
    login: (username: string, senha: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(authService.getUser());

    const login = async (username: string, senha: string) => {
        const loggedUser = await authService.login(username, senha);
        setUser(loggedUser);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
