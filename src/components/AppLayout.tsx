import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, CalendarDays, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pacientes", icon: Users, label: "Pacientes" },
    { to: "/medicos", icon: Stethoscope, label: "Médicos" },
    { to: "/consultas", icon: CalendarDays, label: "Consultas" },
    { to: "/pagamentos", icon: CreditCard, label: "Pagamentos" },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Topbar */}
            <header className="h-16 border-b border-border bg-sidebar text-sidebar-foreground flex items-center px-6 gap-6 shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2 text-sidebar-primary font-bold text-lg mr-4">
                    <Stethoscope className="w-5 h-5" />
                    MedManage
                </div>

                {/* Nav links */}
                <nav className="flex items-center gap-1 flex-1">
                    {navItems.map((item) => (
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

                {/* User info + logout */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
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
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="h-8 border-t border-border bg-card flex items-center px-6">
                <p className="text-xs text-muted-foreground">© 2026 MedManage</p>
            </footer>
        </div>
    );
}