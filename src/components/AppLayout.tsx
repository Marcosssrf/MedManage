import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, CalendarDays, CreditCard, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN", "SECRETARIA", "MEDICO"] },
    { to: "/pacientes", icon: Users, label: "Pacientes", roles: ["ADMIN", "SECRETARIA", "MEDICO"] },
    { to: "/medicos", icon: Stethoscope, label: "Médicos", roles: ["ADMIN", "SECRETARIA"] },
    { to: "/consultas", icon: CalendarDays, label: "Consultas", roles: ["ADMIN", "SECRETARIA", "MEDICO"] },
    { to: "/pagamentos", icon: CreditCard, label: "Pagamentos", roles: ["ADMIN", "SECRETARIA"] },
    { to: "/usuarios", icon: ShieldCheck, label: "Usuários", roles: ["ADMIN"] },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const visibleItems = navItems.filter((item) =>
        item.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Fecha o menu ao redimensionar para desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Bloqueia scroll do body quando menu mobile está aberto
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Topbar */}
            <header className="h-16 border-b border-border bg-sidebar text-sidebar-foreground flex items-center px-4 md:px-6 gap-4 shrink-0 z-30">
                {/* Logo */}
                <div className="flex items-center gap-2 text-sidebar-primary font-bold text-lg mr-2 md:mr-4">
                    <Stethoscope className="w-5 h-5" />
                    <span>MedManage</span>
                </div>

                {/* Nav links — apenas desktop */}
                <nav className="hidden md:flex items-center gap-1 flex-1">
                    {visibleItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-sidebar-accent text-sidebar-primary"
                                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Spacer mobile */}
                <div className="flex-1 md:hidden" />

                {/* User info + logout — desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-sidebar-foreground leading-none">{user?.username}</p>
                        <p className="text-xs text-sidebar-muted mt-0.5">{user?.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors ml-1"
                        title="Sair"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                </div>

                {/* Avatar compacto + botão hambúrguer — mobile */}
                <div className="flex md:hidden items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="p-2 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                        aria-label="Menu"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Overlay mobile */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Drawer mobile */}
            <div
                className={`
                    fixed top-16 right-0 bottom-0 w-64 bg-sidebar border-l border-border z-20
                    flex flex-col transform transition-transform duration-200 ease-in-out md:hidden
                    ${menuOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Info do usuário */}
                <div className="px-4 py-4 border-b border-border">
                    <p className="text-sm font-medium text-sidebar-foreground">{user?.username}</p>
                    <p className="text-xs text-sidebar-muted mt-0.5">{user?.role}</p>
                </div>

                {/* Links de navegação */}
                <nav className="flex flex-col gap-1 p-3 flex-1">
                    {visibleItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-sidebar-accent text-sidebar-primary"
                                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Botão de logout */}
                <div className="p-3 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="h-8 border-t border-border bg-card flex items-center px-4 md:px-6">
                <p className="text-xs text-muted-foreground">© 2026 MedManage</p>
            </footer>
        </div>
    );
}