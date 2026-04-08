import { NavLink, Outlet } from "react-router-dom";
import {
    LayoutDashboard, Users, Stethoscope, CalendarDays, CreditCard,
    LogOut, Menu, X, ShieldCheck, BarChart2, Settings, ShieldAlert
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const navSections = [
    {
        label: "CLÍNICO",
        items: [
            { to: "/consultas", icon: CalendarDays, label: "Consultas", roles: ["ADMIN", "SECRETARIA", "MEDICO"] },
            { to: "/pacientes", icon: Users, label: "Pacientes", roles: ["ADMIN", "SECRETARIA", "MEDICO"] },
            { to: "/medicos", icon: Stethoscope, label: "Médicos", roles: ["ADMIN", "SECRETARIA"] },
        ],
    },
    {
        label: "FINANCEIRO",
        items: [
            { to: "/pagamentos", icon: CreditCard, label: "Pagamentos", roles: ["ADMIN", "SECRETARIA"] },
            { to: "/convenios", icon: ShieldAlert, label: "Convênios", roles: ["ADMIN", "SECRETARIA"] },
        ],
    },
    {
        label: "SISTEMA",
        items: [
            { to: "/usuarios", icon: ShieldCheck, label: "Usuários", roles: ["ADMIN"] },
            { to: "/relatorios", icon: BarChart2, label: "Relatórios", roles: ["ADMIN"] },
            { to: "/configuracoes", icon: Settings, label: "Configurações", roles: ["ADMIN"] },
        ],
    },
];

const dashboardItem = { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN", "SECRETARIA", "MEDICO"] };

// function roleLabel(role: string) {
//     if (role === "ADMIN") return "Administrador";
//     if (role === "SECRETARIA") return "Secretária";
//     if (role === "MEDICO") return "Médico";
//     return role;
// }

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const userRole = user?.role ?? "";
    const displayName = user?.medico?.nome ?? (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "");
    const initials = displayName?.charAt(0).toUpperCase() ?? "?";

    const NavItems = ({ onLinkClick }: { onLinkClick?: () => void }) => (
        <>
            <NavLink
                to={dashboardItem.to}
                end
                onClick={onLinkClick}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`
                }
            >
                <dashboardItem.icon className="w-4 h-4 shrink-0" />
                {dashboardItem.label}
            </NavLink>

            {navSections.map((section) => {
                const visible = section.items.filter((item) => item.roles.includes(userRole));
                if (visible.length === 0) return null;
                return (
                    <div key={section.label} className="mt-2">
                        <p className="text-[10px] font-semibold tracking-widest text-sidebar-muted px-3 mb-1.5 mt-3">
                            {section.label}
                        </p>
                        {visible.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onLinkClick}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                );
            })}
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border z-20">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sidebar-foreground font-bold text-base leading-tight">MedManage</p>
                        <p className="text-sidebar-muted text-xs leading-tight">Gestão Clínica</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    <NavItems />
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-sidebar-border shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMenuOpen(false)} />
            )}

            {/* Mobile drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-40 flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sidebar-foreground font-bold text-base leading-tight">MedManage</p>
                            <p className="text-sidebar-muted text-xs leading-tight">Gestão Clínica</p>
                        </div>
                    </div>
                    <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    <NavItems onLinkClick={() => setMenuOpen(false)} />
                </nav>
                <div className="px-3 py-4 border-t border-sidebar-border">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Right: topbar + main */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Topbar */}
                <header className="h-16 shrink-0 border-b border-border bg-card flex items-center px-4 md:px-6 gap-4 z-10">
                    {/* Mobile hamburger */}
                    <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" aria-label="Abrir menu">
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Welcome */}
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Bem-vindo ao MedManage</p>
                    </div>

                    {/* User info + avatar */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-foreground leading-tight">{user.username}</p>
                            <p className="text-xs text-muted-foreground leading-tight">
                                {user?.role ? `${user.role}` : ""}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-sidebar flex items-center justify-center text-sidebar-primary font-bold text-sm shrink-0 ring-2 ring-sidebar-primary/40">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
