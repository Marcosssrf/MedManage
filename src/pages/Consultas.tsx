import {useMemo, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {CalendarDays, ChevronLeft, ChevronRight, Download, LayoutGrid, Plus} from "lucide-react";
import {Button} from "../components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/dialog";
import type {Consulta} from "../services/api";
import {configuracoesApi, consultasApi, medicosApi} from "../services/api";
import {useAuth} from "../context/AuthContext";
import {usePermissions} from "../hooks/usePermissions";
import {FormCadastroConsulta} from "../components/Form-Consulta";
import {ConsultaDetail} from "../consultas/ConsultaDetail";
import {MedicoFiltro} from "../consultas/SharedComponents";
import {DAYS_PT, STATUS_LEGEND, STATUS_STYLE} from "../consultas/constants";
import {buildWeekRange, formatKey, getWeekDays, isToday} from "../utils/utils";
import {useIsMobile} from "../hooks/use-mobile";
import {toast} from "sonner";

const MAX_VISIBLE_PER_SLOT = 2;

// ─── helpers ────────────────────────────────────────────────
function getMonthDays(ref: Date): Date[] {
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // pad start with days from previous month so grid starts on Sunday
    const startPad = firstDay.getDay();
    const days: Date[] = [];
    for (let i = startPad; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push(d);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    // pad end to complete last row
    while (days.length % 7 !== 0) days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startPad + 1));
    return days;
}

function buildMonthRange(ref: Date) {
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
        dataInicio: `${year}-${pad(month + 1)}-01T00:00:00`,
        dataFim: `${year}-${pad(month + 1)}-${new Date(year, month + 1, 0).getDate()}T23:59:59`,
    };
}

function exportConsultasCSV(consultas: Consulta[]) {
    const headers = ["Paciente", "Médico", "Data", "Horário", "Tipo", "Status", "Observações"];
    const rows = consultas.map((c) => [
        c.pacienteNome ?? "—",
        c.medicoNome ?? "—",
        c.data,
        c.horario?.slice(0, 5) ?? "",
        c.tipoConsulta?.replace(/_/g, " ") ?? "",
        c.status,
        c.observacoes ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
}

// ─── Visão Mensal ────────────────────────────────────────────
function MonthView({
    selectedDate, consultas, isLoading, onDayClick, onConsultaClick, canAdd,
}: {
    selectedDate: Date;
    consultas: Consulta[];
    isLoading: boolean;
    onDayClick: (date: Date) => void;
    onConsultaClick: (c: Consulta) => void;
    canAdd: boolean;
}) {
    const days = getMonthDays(selectedDate);
    const currentMonth = selectedDate.getMonth();

    const byDay = useMemo(() => {
        const map: Record<string, Consulta[]> = {};
        for (const c of consultas) {
            const key = c.data; // already "dd/mm/yyyy"
            if (!map[key]) map[key] = [];
            map[key].push(c);
        }
        return map;
    }, [consultas]);

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                {DAYS_PT.map((d) => (
                    <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>
                ))}
            </div>

            {isLoading ? (
                <div className="p-16 text-center text-muted-foreground animate-pulse">Carregando agenda...</div>
            ) : (
                <div className="grid grid-cols-7">
                    {days.map((day, i) => {
                        const key = day.toLocaleDateString("pt-BR");
                        const items = byDay[key] ?? [];
                        const isCurrentMonth = day.getMonth() === currentMonth;
                        const todayClass = isToday(day);

                        return (
                            <div
                                key={i}
                                className={`min-h-[90px] border-r border-b border-border last-of-type:border-r-0 p-1.5 cursor-pointer transition-colors
                                    ${isCurrentMonth ? "bg-card hover:bg-muted/20" : "bg-muted/10 opacity-50"}
                                    ${todayClass ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : ""}
                                `}
                                onClick={() => canAdd && isCurrentMonth && onDayClick(day)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                                        ${todayClass ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                        {day.getDate()}
                                    </span>
                                    {items.length > 0 && (
                                        <span className="text-[10px] text-muted-foreground font-medium">{items.length}</span>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    {items.slice(0, 3).map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={(e) => { e.stopPropagation(); onConsultaClick(c); }}
                                            className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate hover:opacity-80 transition-opacity ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}
                                        >
                                            {c.horario?.slice(0, 5)} {c.pacienteNome?.split(" ")[0]}
                                        </button>
                                    ))}
                                    {items.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground px-1.5">+{items.length - 3} mais</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main ───────────────────────────────────────────────────
export default function Consultas() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"week" | "month">("week");
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
    const { dataInicio: weekInicio, dataFim: weekFim } = buildWeekRange(weekDays);
    const { dataInicio: monthInicio, dataFim: monthFim } = buildMonthRange(selectedDate);

    const dataInicio = viewMode === "month" ? monthInicio : weekInicio;
    const dataFim = viewMode === "month" ? monthFim : weekFim;

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
        if (!isAdminOrSecretaria || !medicoFiltroId) return true;
        if (c.medicoId && String(c.medicoId) !== "") return String(c.medicoId) === medicoFiltroId;
        const m = medicosUnicos.find(m => m.id === medicoFiltroId);
        return m ? c.medicoNome === m.nome : false;
    });

    const bySlot = (day: Date, hour: number) =>
        filtered.filter((c) => {
            const [h] = (c.horario ?? "").split(":").map(Number);
            return c.data === formatKey(day) && h === hour;
        }).sort((a, b) => {
            if (a.horario !== b.horario) return (a.horario ?? "").localeCompare(b.horario ?? "");
            return (a.pacienteNome ?? "").localeCompare(b.pacienteNome ?? "", "pt-BR");
        });

    const goBack = () => {
        const d = new Date(selectedDate);
        if (viewMode === "month") d.setMonth(d.getMonth() - 1);
        else d.setDate(d.getDate() - (isMobile ? 1 : 7));
        setSelectedDate(d);
    };
    const goNext = () => {
        const d = new Date(selectedDate);
        if (viewMode === "month") d.setMonth(d.getMonth() + 1);
        else d.setDate(d.getDate() + (isMobile ? 1 : 7));
        setSelectedDate(d);
    };

    const openNewWithDate = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        setPrefillDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
        setPrefillHour("");
        setNewOpen(true);
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

    const visibleDays = isMobile ? [selectedDate] : weekDays;

    const navLabel = () => {
        if (viewMode === "month") {
            return selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        }
        if (isMobile) return selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
        return `${weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;
    };

    return (
        <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Consultas</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {viewMode === "month" ? "Agenda mensal" : isMobile ? "Agenda diária" : "Agenda semanal"}
                        {config && ` · ${config.horarioAbertura?.slice(0, 5) ?? "--"} às ${config.horarioFechamento?.slice(0, 5) ?? "--"}`}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isAdminOrSecretaria && (
                        <MedicoFiltro medicos={medicosUnicos} onSelect={(id) => setMedicoFiltroId(id)} />
                    )}
                    {/* View mode toggle */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <CalendarDays className="w-3.5 h-3.5" />Semana
                        </button>
                        <button
                            onClick={() => setViewMode("month")}
                            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />Mês
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportConsultasCSV(filtered)} disabled={!filtered.length}>
                        <Download className="w-4 h-4 mr-2" />Exportar CSV
                    </Button>
                    {canAddConsulta && (
                        <Button onClick={() => { setPrefillDate(""); setPrefillHour(""); setNewOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2" />Nova Consulta
                        </Button>
                    )}
                </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goBack}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium capitalize">{navLabel()}</span>
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

            {/* Visão mensal */}
            {viewMode === "month" ? (
                <MonthView
                    selectedDate={selectedDate}
                    consultas={filtered}
                    isLoading={isLoading}
                    onDayClick={openNewWithDate}
                    onConsultaClick={setSelectedConsulta}
                    canAdd={canAddConsulta}
                />
            ) : (
                /* Visão semanal (original) */
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-y-scroll max-h-[640px]">
                        <div className="grid border-b border-border sticky top-0 bg-card z-10"
                            style={{ gridTemplateColumns: `56px repeat(${visibleDays.length}, 1fr)` }}>
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
                                <div key={hour} className="grid border-b border-border last:border-0"
                                    style={{ gridTemplateColumns: `56px repeat(${visibleDays.length}, 1fr)`, minHeight: "72px" }}>
                                    <div className="border-r border-border text-xs text-muted-foreground text-right pr-2 pt-2">
                                        {String(hour).padStart(2, "0")}:00
                                    </div>
                                    {visibleDays.map((day, di) => {
                                        const items = bySlot(day, hour);
                                        const visible = items.slice(0, MAX_VISIBLE_PER_SLOT);
                                        const overflow = items.length - MAX_VISIBLE_PER_SLOT;
                                        return (
                                            <div key={di}
                                                className={`border-r border-border last:border-0 p-1 cursor-pointer group ${isToday(day) ? "bg-primary/[0.03]" : "hover:bg-muted/20"} transition-colors`}
                                                onClick={() => {
                                                    if (canAddConsulta) {
                                                        setPrefillDate(`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`);
                                                        setPrefillHour(`${String(hour).padStart(2, "0")}:00`);
                                                        setNewOpen(true);
                                                    }
                                                }}>
                                                {items.length === 0 && canAddConsulta && (
                                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="w-4 h-4 text-muted-foreground/40" />
                                                    </div>
                                                )}
                                                {visible.map((c) => (
                                                    <button key={c.id}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c); }}
                                                        className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg border-l-2 mb-1 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}>
                                                        <p className="font-semibold truncate leading-tight">{c.pacienteNome}</p>
                                                        <p className="opacity-70 truncate">{c.horario?.slice(0, 5)} · {c.medicoNome?.split(" ")[0]}</p>
                                                    </button>
                                                ))}
                                                {overflow > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOverflowSlot({ day, hour, items }); }}
                                                        className="w-full text-left text-[11px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground hover:bg-muted transition-colors">
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
            )}

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

            {/* Dialog overflow */}
            <Dialog open={!!overflowSlot} onOpenChange={(open) => { if (!open) setOverflowSlot(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">
                            {overflowSlot && (
                                <>{overflowSlot.day.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · {String(overflowSlot.hour).padStart(2, "0")}:00</>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-1.5 mt-1 max-h-[60vh] overflow-y-auto">
                        {overflowSlot?.items.map((c) => (
                            <button key={c.id}
                                onClick={() => { setOverflowSlot(null); setSelectedConsulta(c); }}
                                className={`w-full text-left text-[12px] px-3 py-2 rounded-lg border-l-2 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}>
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
