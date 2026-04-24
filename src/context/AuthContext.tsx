import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {AuthUser} from "../services/auth";
import {authService} from "../services/auth";

interface AuthContextType {
    user: AuthUser | null;
    login: (username: string, senha: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(authService.getUser());
    const navigate = useNavigate();

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    // Verifica token expirado proativamente a cada 30s
    useEffect(() => {
        const check = () => {
            if (user && !authService.isAuthenticated()) {
                logout();
            }
        };

        check(); // checa imediatamente ao montar
        const interval = setInterval(check, 30_000);
        return () => clearInterval(interval);
    }, [user, logout]);

    const login = async (username: string, senha: string) => {
        const loggedUser = await authService.login(username, senha);
        setUser(loggedUser);
    };

    const refreshUser = async () => {
        const updated = await authService.fetchMe();
        if (updated) setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);