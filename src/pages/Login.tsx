import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, senha);
            navigate("/");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <Stethoscope className="w-8 h-8" />
                        <span className="text-2xl font-semibold text-foreground">MedManage</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Usuário</label>
                            <Input
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Senha</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    © 2026 MedManage
                </p>
            </div>
        </div>
    );
}