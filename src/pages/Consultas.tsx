import { consultasApi, anamneseApi, prescricoesApi, configuracoesApi } from "../services/api";
import type { Consulta, Anamnese, Prescricao } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, X, Pencil, ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FormCadastroConsulta } from "../components/Form-Consulta";

// ─── Helpers ─────────────────────────────────
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeekDays(ref: Date): Date[] {
    const day = ref.getDay();
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function formatKey(d: Date) { return d.toLocaleDateString("pt-BR"); }
function isToday(d: Date) { return formatKey(d) === formatKey(new Date()); }

const STATUS_STYLE: Record<string, string> = {
    AGENDADA: "bg-primary/15 border-primary text-primary",
    CONFIRMADA: "bg-blue-500/10 border-blue-500 text-blue-600",
    REALIZADA: "bg-green-500/15 border-green-500 text-green-700",
    CANCELADA: "bg-destructive/10 border-destructive text-destructive line-through opacity-60",
    EM_ANDAMENTO: "bg-amber-400/20 border-amber-500 text-amber-700",
};

function consultaAtiva(status: string) {
    return status === "EM_ANDAMENTO" || status === "REALIZADA";
}

const TIPOS_RECEITA_MAP: Record<string, string> = {
    COMUM: "COMUM", CONTROLADA_B1: "CONTROLADA_B1",
    CONTROLADA_A: "CONTROLADA_A", ANTIMICROBIANO: "ANTIMICROBIANO",
};
const TIPOS_RECEITA_LABELS = [
    { label: "Receita Simples (Branca)", value: "COMUM" },
    { label: "Receita Azul (Controlada B1)", value: "CONTROLADA_B1" },
    { label: "Receita Amarela (Controlada A)", value: "CONTROLADA_A" },
    { label: "Antimicrobiano", value: "ANTIMICROBIANO" },
];
const EMPTY_RX = { medicamento: "", dosagem: "", frequencia: "", duracao: "", viaAdministracao: "Via oral", observacoes: "", tipoReceita: "COMUM" };

// ─── AnamneseForm ─────────────────────────────
// FIX PRINCIPAL: TA é definido FORA do componente AnamneseForm e recebe
// value + onChange diretamente como props — sem recreação a cada render.
// O estado é gerenciado no pai via formRef (ref) para evitar re-render
// enquanto o usuário digita, mas também setamos estado ao salvar.

interface TAProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}
function TextAreaField({ label, value, onChange }: TAProps) {
    return (
        <div>
            <Label className="text-muted-foreground text-xs">{label}</Label>
            <textarea
                className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

// CID autocomplete busca do backend
function CidAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const { data: cids = [] } = useQuery({
        queryKey: ["cids-search", query],
        queryFn: async () => {
            if (query.length < 1) return [];
            try {
                const all = await import("../services/api").then(m => (m as any).default ?? m).catch(() => null);
                // usa endpoint /cids com busca local
                const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/cids`, {
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                        Authorization: `Basic ${localStorage.getItem("credentials") ?? btoa(localStorage.getItem("username") + ":" + localStorage.getItem("senha"))}`,
                    }
                });
                if (!res.ok) return [];
                const data = await res.json();
                return data.filter((c: any) =>
                    c.codigo?.toLowerCase().includes(query.toLowerCase()) ||
                    c.descricao?.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 8);
            } catch { return []; }
        },
        enabled: query.length >= 1,
        staleTime: 60000,
    });

    return (
        <div className="relative">
            <Label className="text-muted-foreground text-xs">Código CID</Label>
            <Input
                className="mt-1"
                value={query}
                onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
                placeholder="Ex: I20 ou Angina"
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
            />
            {open && cids.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {cids.map((c: any) => (
                        <button
                            key={c.codigo}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onMouseDown={() => { setQuery(c.codigo); onChange(c.codigo); setOpen(false); }}
                        >
                            <span className="font-mono font-medium">{c.codigo}</span>
                            {c.descricao && <span className="text-muted-foreground ml-2">— {c.descricao}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function AnamneseForm({ consulta, onClose }: { consulta: Consulta; onClose: () => void }) {
    const queryClient = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["anamnese", consulta.id],
        queryFn: () => anamneseApi.buscarPorConsulta(consulta.id!),
    });

    // Estado controlado — único source of truth, sem ref duplicado
    const [fields, setFields] = useState({
        queixaPrincipal: "",
        historiaMolestiaPrincipal: "",
        exameFisico: "",
        hipoteseDiagnostica: "",
        solicitacaoDeExames: "",
        encaminhamento: "",
        condutaMedica: "",
        cidCodigo: "",
    });

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && !isLoading) {
            if (existing) {
                setFields({
                    queixaPrincipal: existing.queixaPrincipal ?? "",
                    historiaMolestiaPrincipal: existing.historiaMolestiaPrincipal ?? "",
                    exameFisico: existing.exameFisico ?? "",
                    hipoteseDiagnostica: existing.hipoteseDiagnostica ?? "",
                    solicitacaoDeExames: existing.solicitacaoDeExames ?? "",
                    encaminhamento: existing.encaminhamento ?? "",
                    condutaMedica: existing.condutaMedica ?? "",
                    cidCodigo: existing.cidCodigo ?? "",
                });
            }
            setInitialized(true);
        }
    }, [existing, isLoading, initialized]);

    const set = useCallback((field: string) => (value: string) => {
        setFields(prev => ({ ...prev, [field]: value }));
    }, []);

    const mutation = useMutation({
        mutationFn: (data: typeof fields) => {
            const payload: Omit<Anamnese, "id"> = {
                consultaId: consulta.id!,
                queixaPrincipal: data.queixaPrincipal,
                historiaMolestiaPrincipal: data.historiaMolestiaPrincipal || undefined,
                exameFisico: data.exameFisico || undefined,
                hipoteseDiagnostica: data.hipoteseDiagnostica || undefined,
                solicitacaoDeExames: data.solicitacaoDeExames || undefined,
                encaminhamento: data.encaminhamento || undefined,
                condutaMedica: data.condutaMedica || undefined,
                cidCodigo: data.cidCodigo || undefined,
            };
            // Backend não tem PATCH — sempre POST (existsByConsultaId vai lançar erro se já existe)
            // Para edição precisamos recriar. O backend lança erro se já existe anamnese.
            // Se já existe, usamos atualizar (que no nosso api.ts também faz POST — mas o backend vai negar)
            // Solução: apenas permite criar uma vez. Se já existe, mostra mensagem.
            if (existing?.id) {
                toast.error("O backend não permite atualizar anamnese — já existe uma para esta consulta.");
                return Promise.reject(new Error("Já existe anamnese"));
            }
            return anamneseApi.cadastrar(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["anamnese", consulta.id] });
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Anamnese salva!");
            onClose();
        },
        onError: (err: any) => {
            if (!err.message?.includes("Já existe")) toast.error("Erro ao salvar anamnese.");
        },
    });

    if (isLoading || !initialized) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>;

    const jaExiste = !!existing?.id;

    return (
        <div className="space-y-4 py-2">
            {jaExiste && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                    Anamnese já registrada (somente leitura — o backend não suporta edição).
                </div>
            )}
            <TextAreaField label="Queixa Principal *" value={fields.queixaPrincipal} onChange={set("queixaPrincipal")} />
            <TextAreaField label="História da Moléstia Atual" value={fields.historiaMolestiaPrincipal} onChange={set("historiaMolestiaPrincipal")} />
            <TextAreaField label="Exame Físico" value={fields.exameFisico} onChange={set("exameFisico")} />
            <TextAreaField label="Hipótese Diagnóstica" value={fields.hipoteseDiagnostica} onChange={set("hipoteseDiagnostica")} />
            <TextAreaField label="Exames Solicitados" value={fields.solicitacaoDeExames} onChange={set("solicitacaoDeExames")} />
            <TextAreaField label="Encaminhamento" value={fields.encaminhamento} onChange={set("encaminhamento")} />
            <TextAreaField label="Conduta Médica" value={fields.condutaMedica} onChange={set("condutaMedica")} />
            <CidAutocomplete value={fields.cidCodigo} onChange={set("cidCodigo")} />

            {!jaExiste && (
                <div className="flex gap-3 pt-2">
                    <Button onClick={() => mutation.mutate(fields)} disabled={mutation.isPending || !fields.queixaPrincipal.trim()} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        {mutation.isPending ? "Salvando..." : "Salvar Anamnese"}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                </div>
            )}
            {jaExiste && (
                <Button variant="outline" onClick={onClose} className="w-full">Fechar</Button>
            )}
        </div>
    );
}

// ─── PrescricoesPanel ─────────────────────────
// FIX: Inputs controlados dentro do dialog de adicionar medicamento
// extraídos como componente com estado próprio para não perder foco

interface AddRxFormProps {
    onSave: (rx: typeof EMPTY_RX) => void;
    onCancel: () => void;
    loading: boolean;
}
function AddRxForm({ onSave, onCancel, loading }: AddRxFormProps) {
    const [form, setForm] = useState({ ...EMPTY_RX });
    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="space-y-3 py-2">
            <div>
                <Label>Medicamento *</Label>
                <Input className="mt-1" value={form.medicamento} onChange={set("medicamento")} placeholder="Ex: Ácido Acetilsalicílico" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Dosagem</Label>
                    <Input className="mt-1" value={form.dosagem} onChange={set("dosagem")} placeholder="100mg" />
                </div>
                <div>
                    <Label>Via de Administração</Label>
                    <Input className="mt-1" value={form.viaAdministracao} onChange={set("viaAdministracao")} placeholder="Via oral" />
                </div>
                <div>
                    <Label>Frequência</Label>
                    <Input className="mt-1" value={form.frequencia} onChange={set("frequencia")} placeholder="1x ao dia" />
                </div>
                <div>
                    <Label>Duração</Label>
                    <Input className="mt-1" value={form.duracao} onChange={set("duracao")} placeholder="30 dias" />
                </div>
            </div>
            <div>
                <Label>Observações</Label>
                <Input className="mt-1" value={form.observacoes} onChange={set("observacoes")} placeholder="Tomar após o café..." />
            </div>
            <div>
                <Label>Tipo de Receita</Label>
                <select
                    className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.tipoReceita}
                    onChange={set("tipoReceita")}
                >
                    {TIPOS_RECEITA_LABELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
            <div className="flex gap-3 pt-1">
                <Button className="flex-1" onClick={() => onSave(form)} disabled={loading || !form.medicamento.trim()}>
                    {loading ? "Salvando..." : "Adicionar"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    );
}

function PrescricoesPanel({ consulta }: { consulta: Consulta }) {
    const queryClient = useQueryClient();

    const { data: consultaCompleta, isLoading } = useQuery({
        queryKey: ["consulta-completa", consulta.id],
        queryFn: () => consultasApi.buscarPorId(consulta.id!),
    });

    const [addOpen, setAddOpen] = useState(false);

    const prescricoesList: Prescricao[] = (() => {
        const cc = consultaCompleta as any;
        const list = cc?.anamnese?.prescricoes ?? cc?.prescricoes ?? [];
        return list.map((p: any) => ({
            id: p.id, consultaId: consulta.id,
            medicamento: p.medicamento, dosagem: p.dosagem,
            frequencia: p.frequencia, duracao: p.duracao,
            viaAdministracao: p.viaAdministracao, via: p.viaAdministracao,
            observacoes: p.observacoes, tipoReceita: p.tipoReceita,
        }));
    })();

    const getPayloadBase = () => {
        const cc = consultaCompleta as any;
        const anamnese = cc?.anamnese;
        return {
            anamneseId: anamnese?.id as string | undefined,
            anamneseData: {
                queixaPrincipal: anamnese?.queixaPrincipal ?? "",
                historiaMolestiaPrincipal: anamnese?.historiaMolestiaPrincipal,
                exameFisico: anamnese?.exameFisico,
                hipoteseDiagnostica: anamnese?.hipoteseDiagnostica,
                solicitacaoDeExames: anamnese?.solicitacaoDeExames,
                encaminhamento: anamnese?.encaminhamento,
                condutaMedica: anamnese?.condutaMedica,
                cidCodigo: typeof anamnese?.cidCodigo === "object" ? anamnese?.cidCodigo?.codigo : anamnese?.cidCodigo,
            },
            existingPrescricoes: ((anamnese?.prescricoes ?? []) as any[]).map((p: any) => ({
                medicamento: p.medicamento, dosagem: p.dosagem ?? "",
                viaAdministracao: p.viaAdministracao ?? "", frequencia: p.frequencia ?? "",
                duracao: p.duracao ?? "", observacoes: p.observacoes,
                tipoReceita: TIPOS_RECEITA_MAP[p.tipoReceita] ?? "COMUM",
            })),
        };
    };

    const addMutation = useMutation({
        mutationFn: async (nova: typeof EMPTY_RX) => {
            const { anamneseData, existingPrescricoes } = getPayloadBase();
            const novaFormatada = {
                medicamento: nova.medicamento, dosagem: nova.dosagem ?? "",
                viaAdministracao: nova.viaAdministracao ?? "", frequencia: nova.frequencia ?? "",
                duracao: nova.duracao ?? "", observacoes: nova.observacoes || undefined,
                tipoReceita: TIPOS_RECEITA_MAP[nova.tipoReceita] ?? "COMUM",
            };
            return prescricoesApi.salvarComAnamnese(undefined, consulta.id!, [...existingPrescricoes, novaFormatada], anamneseData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consulta-completa", consulta.id] });
            queryClient.invalidateQueries({ queryKey: ["anamnese", consulta.id] });
            toast.success("Medicamento adicionado!");
            setAddOpen(false);
        },
        onError: () => toast.error("Erro ao adicionar medicamento."),
    });

    const deleteMutation = useMutation({
        mutationFn: async (prescricaoId: string) => {
            const { anamneseData, existingPrescricoes } = getPayloadBase();
            const cc = consultaCompleta as any;
            const restantes = ((cc?.anamnese?.prescricoes ?? []) as any[])
                .filter((p: any) => p.id !== prescricaoId)
                .map((p: any) => ({
                    medicamento: p.medicamento, dosagem: p.dosagem ?? "",
                    viaAdministracao: p.viaAdministracao ?? "", frequencia: p.frequencia ?? "",
                    duracao: p.duracao ?? "", observacoes: p.observacoes,
                    tipoReceita: TIPOS_RECEITA_MAP[p.tipoReceita] ?? "COMUM",
                }));
            return prescricoesApi.salvarComAnamnese(undefined, consulta.id!, restantes, anamneseData);
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["consulta-completa", consulta.id] }); toast.success("Removido!"); },
        onError: () => toast.error("Erro ao remover."),
    });

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando prescrições...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">Prescrições</h3>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Adicionar Medicamento
                </Button>
            </div>

            {prescricoesList.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">Nenhuma prescrição adicionada.</div>
            ) : (
                <div className="space-y-3">
                    {prescricoesList.map((p, idx) => (
                        <div key={p.id ?? idx} className="bg-muted/30 rounded-xl p-4 space-y-2">
                            <div className="flex items-start justify-between">
                                <p className="font-bold text-sm">{p.medicamento}</p>
                                <div className="flex items-center gap-2">
                                    {p.tipoReceita && (
                                        <span className="text-xs border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                                            {TIPOS_RECEITA_LABELS.find(t => t.value === p.tipoReceita)?.label ?? p.tipoReceita}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => p.id && deleteMutation.mutate(p.id)}
                                        className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                {p.dosagem && <p><span className="font-medium">Dosagem:</span> {p.dosagem}</p>}
                                {(p.viaAdministracao || p.via) && <p><span className="font-medium">Via:</span> {p.viaAdministracao ?? p.via}</p>}
                                {p.frequencia && <p><span className="font-medium">Frequência:</span> {p.frequencia}</p>}
                                {p.duracao && <p><span className="font-medium">Duração:</span> {p.duracao}</p>}
                                {p.observacoes && <p className="col-span-2"><span className="font-medium text-primary">Obs:</span> {p.observacoes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Adicionar Medicamento</DialogTitle></DialogHeader>
                    <AddRxForm
                        onSave={(rx) => addMutation.mutate(rx)}
                        onCancel={() => setAddOpen(false)}
                        loading={addMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── ConsultaDetail ────────────────────────────
function ConsultaDetail({ consulta, onBack, canEdit, canCancelar }: {
    consulta: Consulta; onBack: () => void; canEdit: boolean; canCancelar: boolean;
}) {
    const queryClient = useQueryClient();
    const [view, setView] = useState<"info" | "anamnese">("info");
    const [editOpen, setEditOpen] = useState(false);

    const { data: anamnese } = useQuery({
        queryKey: ["anamnese", consulta.id],
        queryFn: () => anamneseApi.buscarPorConsulta(consulta.id!),
        enabled: consultaAtiva(consulta.status),
    });

    const cancelMutation = useMutation({
        mutationFn: () => consultasApi.cancelar(consulta.id!),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["consultas"] }); toast.success("Consulta cancelada!"); onBack(); },
        onError: () => toast.error("Erro ao cancelar."),
    });

    const podeEditarClinico = canEdit && consultaAtiva(consulta.status);
    const statusLabel = consulta.status?.replace("_", " ") ?? "";

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            <div className="flex items-start gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Detalhes da Consulta</h1>
                    <p className="text-muted-foreground text-sm">Informações completas da consulta</p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-bold">Informações da Consulta</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                    <div><p className="text-xs text-muted-foreground">Paciente</p><p className="font-bold text-base">{consulta.pacienteNome ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Médico</p><p className="font-bold text-base">Dr. {consulta.medicoNome ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Data</p><p className="font-bold">{consulta.data}</p></div>
                    <div><p className="text-xs text-muted-foreground">Horário</p><p className="font-bold">{consulta.horario?.slice(0, 5)}</p></div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_STYLE[consulta.status] ?? "bg-muted text-muted-foreground"}`}>{statusLabel}</span>
                    </div>
                    {consulta.tipoConsulta && <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-bold capitalize">{consulta.tipoConsulta.replace("_", " ").toLowerCase()}</p></div>}
                </div>
            </div>

            {/* Anamnese */}
            {consultaAtiva(consulta.status) && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold">Anamnese</h2>
                        {podeEditarClinico && !anamnese?.id && (
                            <Button variant="outline" size="sm" onClick={() => setView(v => v === "anamnese" ? "info" : "anamnese")}>
                                <Pencil className="w-4 h-4 mr-1.5" />
                                {view === "anamnese" ? "Fechar" : "Registrar"}
                            </Button>
                        )}
                    </div>

                    {view === "anamnese" ? (
                        <AnamneseForm consulta={consulta} onClose={() => setView("info")} />
                    ) : anamnese ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                            {([
                                ["Queixa Principal", anamnese.queixaPrincipal],
                                ["História da Moléstia Atual", anamnese.historiaMolestiaPrincipal],
                                ["Exame Físico", anamnese.exameFisico],
                                ["Hipótese Diagnóstica", anamnese.hipoteseDiagnostica],
                                ["Exames Solicitados", anamnese.solicitacaoDeExames],
                                ["Encaminhamento", anamnese.encaminhamento],
                                ["Conduta Médica", anamnese.condutaMedica],
                                ["Código CID", anamnese.cidCodigo],
                            ] as [string, string | undefined][]).map(([label, value]) => value ? (
                                <div key={label} className={label === "Exame Físico" || label === "Conduta Médica" ? "sm:col-span-2" : ""}>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium mt-0.5">{value}</p>
                                </div>
                            ) : null)}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma anamnese registrada.{podeEditarClinico && " Clique em Registrar para adicionar."}
                        </p>
                    )}
                </div>
            )}

            {/* Prescrições */}
            {consultaAtiva(consulta.status) && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <PrescricoesPanel consulta={consulta} />
                </div>
            )}

            {!consultaAtiva(consulta.status) && consulta.status !== "CANCELADA" && (
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground text-center">
                    Anamnese e prescrições disponíveis apenas quando a consulta estiver <strong>Em Andamento</strong> ou <strong>Realizada</strong>.
                </div>
            )}

            {(canEdit || canCancelar) && consulta.status !== "CANCELADA" && consulta.status !== "REALIZADA" && (
                <div className="flex gap-3">
                    {canEdit && (
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar Consulta
                        </Button>
                    )}
                    {canCancelar && (
                        <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                            <X className="w-4 h-4 mr-2" /> {cancelMutation.isPending ? "Cancelando..." : "Cancelar Consulta"}
                        </Button>
                    )}
                </div>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta initialData={consulta} onSuccess={() => { setEditOpen(false); queryClient.invalidateQueries({ queryKey: ["consultas"] }); }} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Main calendar ────────────────────────────
export default function Consultas() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [newOpen, setNewOpen] = useState(false);
    const [prefillDate, setPrefillDate] = useState("");
    const [prefillHour, setPrefillHour] = useState("");
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { canAddConsulta, canCancelarConsulta } = usePermissions();

    const { data: consultas = [], isLoading } = useQuery({ queryKey: ["consultas"], queryFn: consultasApi.listar });
    const { data: config } = useQuery({ queryKey: ["configuracao-clinica"], queryFn: configuracoesApi.buscar, staleTime: 5 * 60 * 1000 });

    const horaAbertura = config?.horarioAbertura ? parseInt(config.horarioAbertura.split(":")[0], 10) : 8;
    const horaFechamento = config?.horarioFechamento ? parseInt(config.horarioFechamento.split(":")[0], 10) : 18;
    const HOURS = Array.from({ length: horaFechamento - horaAbertura }, (_, i) => i + horaAbertura);

    const filtered = consultas.filter((c) => {
        const role = String(user?.role ?? "").toUpperCase();
        if (role === "ADMIN" || role === "SECRETARIA") return true;
        return String(c.medicoId) === String(user?.medico?.id ?? "");
    });

    const weekDays = getWeekDays(selectedDate);
    const bySlot = (day: Date, hour: number) => filtered.filter((c) => {
        const [h] = (c.horario ?? "").split(":").map(Number);
        return c.data === formatKey(day) && h === hour;
    });

    const goBack = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); };
    const goNext = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); };

    if (selectedConsulta) {
        return <ConsultaDetail consulta={selectedConsulta} onBack={() => setSelectedConsulta(null)} canEdit={canAddConsulta} canCancelar={canCancelarConsulta} />;
    }

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Consultas</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Agenda semanal{config && ` · ${config.horarioAbertura?.slice(0, 5) ?? "--"} às ${config.horarioFechamento?.slice(0, 5) ?? "--"}`}
                    </p>
                </div>
                {canAddConsulta && (
                    <Button onClick={() => { setPrefillDate(""); setPrefillHour(""); setNewOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Consulta
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goBack}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium">
                        {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} — {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))} />
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid border-b border-border sticky top-0 bg-card z-10" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
                    <div className="border-r border-border" />
                    {weekDays.map((day, i) => (
                        <div key={i} className={`py-3 text-center border-r border-border last:border-0 ${isToday(day) ? "bg-primary/5" : ""}`}>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{DAYS_PT[day.getDay()]}</p>
                            <p className={`text-lg font-bold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                {day.getDate()}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="overflow-y-auto max-h-[580px]">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando agenda...</div>
                    ) : (
                        HOURS.map((hour) => (
                            <div key={hour} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: "72px" }}>
                                <div className="border-r border-border text-xs text-muted-foreground text-right pr-2 pt-2">{String(hour).padStart(2, "0")}:00</div>
                                {weekDays.map((day, di) => {
                                    const items = bySlot(day, hour);
                                    return (
                                        <div key={di}
                                            className={`border-r border-border last:border-0 p-1 cursor-pointer group ${isToday(day) ? "bg-primary/[0.03]" : "hover:bg-muted/20"} transition-colors`}
                                            onClick={() => { if (canAddConsulta) { setPrefillDate(day.toISOString().split("T")[0]); setPrefillHour(`${String(hour).padStart(2, "0")}:00`); setNewOpen(true); } }}
                                        >
                                            {items.length === 0 && canAddConsulta && (
                                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-4 h-4 text-muted-foreground/40" />
                                                </div>
                                            )}
                                            {items.map((c) => (
                                                <button key={c.id} onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c); }}
                                                    className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg border-l-2 mb-1 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}>
                                                    <p className="font-semibold truncate leading-tight">{c.pacienteNome}</p>
                                                    <p className="opacity-70 truncate">{c.horario?.slice(0, 5)} · {c.medicoNome?.split(" ")[0]}</p>
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

            <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                {[["AGENDADA", "bg-primary/15 border-primary"], ["CONFIRMADA", "bg-blue-500/10 border-blue-500"], ["REALIZADA", "bg-green-500/15 border-green-500"], ["EM ANDAMENTO", "bg-amber-400/20 border-amber-500"], ["CANCELADA", "bg-destructive/10 border-destructive"]].map(([label, cls]) => (
                    <div key={label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-sm border-l-2 ${cls}`} />{label}</div>
                ))}
            </div>

            <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nova Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta prefillData={prefillDate} prefillHorario={prefillHour}
                        onSuccess={() => { setNewOpen(false); queryClient.invalidateQueries({ queryKey: ["consultas"] }); }} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
