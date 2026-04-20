import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { consultasApi, configuracoesApi, medicosApi } from "../services/api";
import type { Consulta } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FormCadastroConsulta } from "../components/Form-Consulta";
import { ConsultaDetail } from "../consultas/ConsultaDetail";
import { MedicoFiltro } from "../consultas/SharedComponents";
import { DAYS_PT, STATUS_STYLE, STATUS_LEGEND } from "../consultas/constants";
import { getWeekDays, formatKey, isToday, buildWeekRange } from "../utils/utils";
import { useIsMobile } from "../hooks/use-mobile";

const MAX_VISIBLE_PER_SLOT = 2;

export default function Consultas() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [newOpen, setNewOpen] = useState(false);
    const [prefillDate, setPrefillDate] = useState("");
    const [prefillHour, setPrefillHour] = useState("");
    const [medicoFiltroId, setMedicoFiltroId] = useState<string | null>(null);
    const [overflowSlot, setOverflowSlot] = useState<{ day: Date; hour: number; items: Consulta[] } | null>(null);

    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { canAddConsulta, canCancelarConsulta } = usePermissions();
    const isMobile = useIsMobile();

    const role = String(user?.role ?? "").toUpperCase();
    const isAdminOrSecretaria = role === "ADMIN" || role === "SECRETARIA";

    const weekDays = getWeekDays(selectedDate);
    const { dataInicio, dataFim } = buildWeekRange(weekDays);

    const { data: consultas = [], isLoading } = useQuery({
        queryKey: ["consultas", dataInicio, dataFim],
        queryFn: () => consultasApi.listar(dataInicio, dataFim),
        staleTime: 30 * 1000,
    });

    const { data: config } = useQuery({
        queryKey: ["configuracao-clinica"],
        queryFn: configuracoesApi.buscar,
        staleTime: 5 * 60 * 1000,
    });

    const { data: todosMedicos = [] } = useQuery({
        queryKey: ["medicos"],
        queryFn: () => medicosApi.listar(),
        enabled: isAdminOrSecretaria,
        staleTime: 5 * 60 * 1000,
    });

    const medicosUnicos = todosMedicos
        .filter(m => m.ativo !== false)
        .map(m => ({ id: String(m.id), nome: m.nome }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const horaAbertura = config?.horarioAbertura ? parseInt(config.horarioAbertura.split(":")[0], 10) : 8;
    const horaFechamento = config?.horarioFechamento ? parseInt(config.horarioFechamento.split(":")[0], 10) : 18;
    const HOURS = Array.from({ length: horaFechamento - horaAbertura }, (_, i) => i + horaAbertura);

    const filtered = consultas.filter((c) => {
        if (!isAdminOrSecretaria) return true;
        if (!medicoFiltroId) return true;
        if (c.medicoId && String(c.medicoId) !== "") return String(c.medicoId) === medicoFiltroId;
        const medicoSelecionado = medicosUnicos.find(m => m.id === medicoFiltroId);
        return medicoSelecionado ? c.medicoNome === medicoSelecionado.nome : false;
    });

    const bySlot = (day: Date, hour: number) =>
        filtered
            .filter((c) => {
                const [h] = (c.horario ?? "").split(":").map(Number);
                return c.data === formatKey(day) && h === hour;
            })
            .sort((a, b) => {
                const timeA = a.horario ?? "";
                const timeB = b.horario ?? "";
                if (timeA !== timeB) return timeA.localeCompare(timeB);
                return (a.pacienteNome ?? "").localeCompare(b.pacienteNome ?? "", "pt-BR");
            });

    // Navegação semana (desktop) e dia (mobile)
    const goBack = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - (isMobile ? 1 : 7));
        setSelectedDate(d);
    };
    const goNext = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + (isMobile ? 1 : 7));
        setSelectedDate(d);
    };

    if (selectedConsulta) {
        return (
            <ConsultaDetail
                consulta={selectedConsulta}
                onBack={() => setSelectedConsulta(null)}
                canEdit={canAddConsulta}
                canCancelar={canCancelarConsulta}
            />
        );
    }

    // No mobile, mostra apenas o dia selecionado
    const visibleDays = isMobile ? [selectedDate] : weekDays;

    return (
        <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Consultas</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {isMobile ? "Agenda diária" : "Agenda semanal"}
                        {config && ` · ${config.horarioAbertura?.slice(0, 5) ?? "--"} às ${config.horarioFechamento?.slice(0, 5) ?? "--"}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdminOrSecretaria && (
                        <MedicoFiltro
                            medicos={medicosUnicos}
                            onSelect={(id) => setMedicoFiltroId(id)}
                        />
                    )}
                    {canAddConsulta && (
                        <Button onClick={() => { setPrefillDate(""); setPrefillHour(""); setNewOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2" /> Nova Consulta
                        </Button>
                    )}
                </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goBack}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium">
                        {isMobile
                            ? selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
                            : `${weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`
                        }
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                    />
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
                </div>
            </div>

            {/* Grade */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Slots horários + header dentro do mesmo scroll */}
                <div className="overflow-y-scroll max-h-[640px]">
                    {/* Cabeçalho dos dias — sticky dentro do scroll */}
                    <div
                        className="grid border-b border-border sticky top-0 bg-card z-10"
                        style={{ gridTemplateColumns: `56px repeat(${visibleDays.length}, 1fr)` }}
                    >
                        <div className="border-r border-border" />
                        {visibleDays.map((day, i) => (
                            <div key={i} className={`py-3 text-center border-r border-border last:border-0 ${isToday(day) ? "bg-primary/5" : ""}`}>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{DAYS_PT[day.getDay()]}</p>
                                <p className={`text-lg font-bold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                    {day.getDate()}
                                </p>
                            </div>
                        ))}
                    </div>
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando agenda...</div>
                    ) : (
                        HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="grid border-b border-border last:border-0"
                                style={{ gridTemplateColumns: `56px repeat(${visibleDays.length}, 1fr)`, minHeight: "72px" }}
                            >
                                <div className="border-r border-border text-xs text-muted-foreground text-right pr-2 pt-2">
                                    {String(hour).padStart(2, "0")}:00
                                </div>
                                {visibleDays.map((day, di) => {
                                    const items = bySlot(day, hour);
                                    const visible = items.slice(0, MAX_VISIBLE_PER_SLOT);
                                    const overflow = items.length - MAX_VISIBLE_PER_SLOT;
                                    return (
                                        <div
                                            key={di}
                                            className={`border-r border-border last:border-0 p-1 cursor-pointer group ${isToday(day) ? "bg-primary/[0.03]" : "hover:bg-muted/20"} transition-colors`}
                                            onClick={() => {
                                                if (canAddConsulta) {
                                                    setPrefillDate(`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`);
                                                    setPrefillHour(`${String(hour).padStart(2, "0")}:00`);
                                                    setNewOpen(true);
                                                }
                                            }}
                                        >
                                            {items.length === 0 && canAddConsulta && (
                                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-4 h-4 text-muted-foreground/40" />
                                                </div>
                                            )}
                                            {visible.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c); }}
                                                    className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg border-l-2 mb-1 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}
                                                >
                                                    <p className="font-semibold truncate leading-tight">{c.pacienteNome}</p>
                                                    <p className="opacity-70 truncate">{c.horario?.slice(0, 5)} · {c.medicoNome?.split(" ")[0]}</p>
                                                </button>
                                            ))}
                                            {overflow > 0 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOverflowSlot({ day, hour, items }); }}
                                                    className="w-full text-left text-[11px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                                                >
                                                    +{overflow} mais
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                {STATUS_LEGEND.map(([label, cls]) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm border-l-2 ${cls}`} />
                        {label}
                    </div>
                ))}
            </div>

            {/* Dialog Nova Consulta */}
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nova Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta
                        prefillData={prefillDate}
                        prefillHorario={prefillHour}
                        onSuccess={() => {
                            setNewOpen(false);
                            queryClient.invalidateQueries({ queryKey: ["consultas"], exact: false });
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog overflow de consultas no slot */}
            <Dialog open={!!overflowSlot} onOpenChange={(open) => { if (!open) setOverflowSlot(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">
                            {overflowSlot && (
                                <>
                                    {overflowSlot.day.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                                    {" · "}
                                    {String(overflowSlot.hour).padStart(2, "0")}:00
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-1.5 mt-1 max-h-[60vh] overflow-y-auto">
                        {overflowSlot?.items.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => { setOverflowSlot(null); setSelectedConsulta(c); }}
                                className={`w-full text-left text-[12px] px-3 py-2 rounded-lg border-l-2 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}
                            >
                                <p className="font-semibold leading-tight">{c.pacienteNome}</p>
                                <p className="opacity-70">{c.horario?.slice(0, 5)} · {c.medicoNome}</p>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}