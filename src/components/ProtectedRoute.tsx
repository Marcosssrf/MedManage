import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

type ProtectedRouteProps = {
    children: React.ReactNode;
    roles?: string[];
};

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();

    // não logado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // logado mas sem permissão
    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}