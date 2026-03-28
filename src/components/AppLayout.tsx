import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, CalendarDays, CreditCard, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pacientes", icon: Users, label: "Pacientes" },
    { to: "/medicos", icon: Stethoscope, label: "Médicos" },
    { to: "/consultas", icon: CalendarDays, label: "Consultas" },
    { to: "/pagamentos", icon: CreditCard, label: "Pagamentos" },
];

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-sidebar-primary tracking-tight flex items-center gap-2">
                        <Stethoscope className="w-6 h-6" />
                        MedManage
                    </h1>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
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
                <div className="p-4 border-t border-sidebar-border">
                    <p className="text-xs text-sidebar-muted">© 2026 MedManage</p>
                </div>
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-foreground/30 z-40 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col bg-sidebar text-sidebar-foreground md:hidden"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <h1 className="text-xl font-bold text-sidebar-primary flex items-center gap-2">
                                    <Stethoscope className="w-6 h-6" />
                                    ClínicaPro
                                </h1>
                                <button onClick={() => setMobileOpen(false)} className="text-sidebar-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 px-3 space-y-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === "/"}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
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
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
