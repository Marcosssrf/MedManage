import { consultasApi } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, User, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import type { Consulta } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FormCadastroConsulta } from "../components/Form-Consulta";

function getWeekDays(referenceDate: Date): Date[] {
    const day = referenceDate.getDay();
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function formatDateKey(date: Date): string {
    return date.toLocaleDateString("pt-BR");
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

const STATUS_COLORS: Record<string, string> = {
    AGENDADA: "bg-primary/20 border-primary text-primary",
    CONFIRMADA: "bg-green-500/20 border-green-500 text-green-600",
    REALIZADA: "bg-green-500/20 border-green-500 text-green-600",
    CANCELADA: "bg-destructive/20 border-destructive text-destructive",
};

export default function Consultas() {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [search] = useState("");
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { canAddConsulta, canCancelarConsulta } = usePermissions();

    const { data: consultas = [], isLoading } = useQuery({
        queryKey: ["consultas"],
        queryFn: consultasApi.listar,
    });

    const filtered = consultas
        .filter((c) => {
            const role = String(user?.role ?? "").toUpperCase();
            const verTudo = role === "ADMIN" || role === "SECRETARIA";
            const normalizedSearch = search.trim().toLowerCase();
            const matchSearch = (c.pacienteNome ?? "").toLowerCase().includes(normalizedSearch);

            if (verTudo) return matchSearch;

            const userMedicoId = user?.medico?.id;
            if (!userMedicoId) return false;

            return matchSearch && String(c.medicoId ?? "") === String(userMedicoId);
        })
        .sort((a, b) => a.data.localeCompare(b.data));

    const cancelarMutation = useMutation({
        mutationFn: (id: string | number) => consultasApi.cancelar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Consulta cancelada com sucesso!");
            setSelectedConsulta(null);
        },
        onError: () => toast.error("Erro ao cancelar consulta."),
    });

    const weekDays = getWeekDays(selectedDate);

    const consultasByDayHour = (day: Date, hour: number): Consulta[] => {
        const key = formatDateKey(day);
        return filtered.filter((c) => {
            const [h] = (c.horario ?? "").split(":").map(Number);
            return c.data === key && h === hour;
        });
    };

    const goToPrevWeek = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 7);
        setSelectedDate(d);
    };

    const goToNextWeek = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 7);
        setSelectedDate(d);
    };

    const today = new Date();
    const isToday = (date: Date) => formatDateKey(date) === formatDateKey(today);

    const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Consultas"
                description="Agenda semanal de consultas"
                action={canAddConsulta ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Consulta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Cadastrar Consulta</DialogTitle>
                            </DialogHeader>
                            <FormCadastroConsulta onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                ) : undefined}
            />

            {/* Navegação */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={goToPrevWeek}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextWeek}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-foreground">
                        {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                        {" — "}
                        {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                    />
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                        Hoje
                    </Button>
                </div>
            </div>

            {/* Grade da semana */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid border-b border-border" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
                    <div className="py-3 border-r border-border" />
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={`py-3 text-center border-r border-border last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}
                        >
                            <p className="text-xs text-muted-foreground">{DAYS_PT[day.getDay()]}</p>
                            <p className={`text-lg font-semibold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                {day.getDate()}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="overflow-y-auto max-h-[600px]">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">
                            Carregando agenda...
                        </div>
                    ) : (
                        HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="grid border-b border-border last:border-b-0"
                                style={{ gridTemplateColumns: "64px repeat(7, 1fr)", minHeight: "72px" }}
                            >
                                <div className="py-2 px-2 border-r border-border text-xs text-muted-foreground text-right pr-3 pt-2">
                                    {String(hour).padStart(2, "0")}:00
                                </div>
                                {weekDays.map((day, di) => {
                                    const items = consultasByDayHour(day, hour);
                                    return (
                                        <div
                                            key={di}
                                            className={`border-r border-border last:border-r-0 p-1 ${isToday(day) ? "bg-primary/5" : ""}`}
                                        >
                                            {items.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setSelectedConsulta(c)}
                                                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg border-l-2 mb-1 cursor-pointer transition-opacity hover:opacity-80 ${STATUS_COLORS[c.status] ?? "bg-muted border-muted-foreground text-muted-foreground"}`}
                                                >
                                                    <p className="font-medium truncate">{c.pacienteNome}</p>
                                                    <p className="opacity-70 truncate">{c.horario?.slice(0, 5)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-primary/20 border-l-2 border-primary" />
                    Agendada
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-green-500/20 border-l-2 border-green-500" />
                    Confirmada / Realizada
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-destructive/20 border-l-2 border-destructive" />
                    Cancelada
                </div>
            </div>

            {/* Popup de detalhes */}
            <Dialog open={!!selectedConsulta} onOpenChange={(o) => !o && setSelectedConsulta(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Consulta</DialogTitle>
                    </DialogHeader>
                    {selectedConsulta && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {selectedConsulta.pacienteNome?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{selectedConsulta.pacienteNome}</p>
                                    <p className="text-xs text-muted-foreground">Paciente</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Stethoscope className="w-4 h-4" />
                                    <span>{selectedConsulta.medicoNome ?? "Médico não informado"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>{selectedConsulta.data}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{selectedConsulta.horario?.slice(0, 5)}</span>
                                </div>
                                {selectedConsulta.observacoes && (
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <User className="w-4 h-4 mt-0.5" />
                                        <span>{selectedConsulta.observacoes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <Badge
                                    variant={selectedConsulta.status === "CANCELADA" ? "destructive" : "secondary"}
                                    className="text-xs"
                                >
                                    {selectedConsulta.status}
                                </Badge>
                                {canCancelarConsulta && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={selectedConsulta.status === "CANCELADA" || cancelarMutation.isPending}
                                        onClick={() => cancelarMutation.mutate(selectedConsulta.id!)}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancelar consulta
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}