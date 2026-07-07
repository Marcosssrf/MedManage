import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type BloqueioAgenda,
    type BloqueioAgendaPayload,
    type TipoBloqueio,
    bloqueiosApi,
    medicosApi,
    TIPO_BLOQUEIO_LABEL,
} from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { CalendarOff, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";

const TIPOS: TipoBloqueio[] = ["FERIAS", "FERIADO", "MANUTENCAO_SALA", "OUTRO"];

const TIPO_COLOR: Record<TipoBloqueio, string> = {
    FERIAS:          "bg-blue-100 text-blue-700",
    FERIADO:         "bg-amber-100 text-amber-700",
    MANUTENCAO_SALA: "bg-orange-100 text-orange-700",
    OUTRO:           "bg-slate-100 text-slate-600",
};

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: BloqueioAgendaPayload = {
    medicoId:   null,
    dataInicio: today(),
    dataFim:    today(),
    tipo:       "FERIADO",
    motivo:     "",
};

function formatDate(iso: string) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

export default function BloqueiosAgenda() {
    const queryClient = useQueryClient();
    const [modalOpen,  setModalOpen]  = useState(false);
    const [deleteId,   setDeleteId]   = useState<string | null>(null);
    const [editing,    setEditing]    = useState<BloqueioAgenda | null>(null);
    const [form,       setForm]       = useState<BloqueioAgendaPayload>(EMPTY);
    const [filtroTipo, setFiltroTipo] = useState<TipoBloqueio | "">("");
    const [filtroScope, setFiltroScope] = useState<"todos" | "geral" | "medico">("todos");

    const { data: bloqueios = [], isLoading } = useQuery({
        queryKey: ["bloqueios-agenda"],
        queryFn:  bloqueiosApi.listar,
    });

    const { data: medicos = [] } = useQuery({
        queryKey: ["medicos-ativos"],
        queryFn:  () => medicosApi.listar(false),
    });

    const saveMutation = useMutation({
        mutationFn: (data: { id?: string; payload: BloqueioAgendaPayload }) =>
            data.id
                ? bloqueiosApi.atualizar(data.id, data.payload)
                : bloqueiosApi.criar(data.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bloqueios-agenda"] });
            toast.success(editing ? "Bloqueio atualizado!" : "Bloqueio criado!");
            setModalOpen(false);
        },
        onError: (e: Error) => toast.error(e.message || "Erro ao salvar bloqueio."),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => bloqueiosApi.deletar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bloqueios-agenda"] });
            toast.success("Bloqueio removido.");
            setDeleteId(null);
        },
        onError: (e: Error) => toast.error(e?.message || "Erro ao remover bloqueio."),
    });

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY);
        setModalOpen(true);
    };

    const openEdit = (b: BloqueioAgenda) => {
        setEditing(b);
        setForm({
            medicoId:   b.medicoId ?? null,
            dataInicio: b.dataInicio,
            dataFim:    b.dataFim,
            tipo:       b.tipo,
            motivo:     b.motivo ?? "",
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.dataInicio || !form.dataFim) {
            toast.error("Datas são obrigatórias.");
            return;
        }
        if (form.dataFim < form.dataInicio) {
            toast.error("Data de fim não pode ser anterior à data de início.");
            return;
        }
        const payload: BloqueioAgendaPayload = {
            ...form,
            medicoId: form.medicoId || null,
            motivo:   form.motivo?.trim() || undefined,
        };
        saveMutation.mutate({ id: editing?.id, payload });
    };

    const filtered = bloqueios.filter((b) => {
        if (filtroTipo && b.tipo !== filtroTipo) return false;
        if (filtroScope === "geral"  && b.medicoId)  return false;
        if (filtroScope === "medico" && !b.medicoId) return false;
        return true;
    });

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Bloqueios de Agenda</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gerencie férias, feriados e manutenções de sala
                    </p>
                </div>
                <Button onClick={openNew} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Bloqueio
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                {/* Escopo */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                    {(["todos", "geral", "medico"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFiltroScope(s)}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                filtroScope === s
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            {s === "todos" ? "Todos" : s === "geral" ? "Clínica geral" : "Por médico"}
                        </button>
                    ))}
                </div>

                {/* Tipo */}
                <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as TipoBloqueio | "")}
                    className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Todos os tipos</option>
                    {TIPOS.map((t) => (
                        <option key={t} value={t}>{TIPO_BLOQUEIO_LABEL[t]}</option>
                    ))}
                </select>
            </div>

            {/* Lista */}
            {isLoading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Nenhum bloqueio encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((b) => (
                        <div key={b.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                            {/* Header do card */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <CalendarOff className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-base truncate">
                                            {b.medicoNome ?? "Clínica (geral)"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(b.dataInicio)} → {formatDate(b.dataFim)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${TIPO_COLOR[b.tipo]}`}>
                                    {TIPO_BLOQUEIO_LABEL[b.tipo]}
                                </span>
                            </div>

                            {/* Motivo */}
                            {b.motivo && (
                                <p className="text-sm text-muted-foreground italic">"{b.motivo}"</p>
                            )}

                            {/* Ações */}
                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(b)}>
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteId(b.id!)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de criação/edição */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Bloqueio" : "Novo Bloqueio de Agenda"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Médico */}
                        <div>
                            <Label>Médico <span className="text-xs text-muted-foreground">(deixe em branco para bloquear toda a clínica)</span></Label>
                            <select
                                value={form.medicoId ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, medicoId: e.target.value || null }))}
                                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">— Clínica geral —</option>
                                {medicos.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo */}
                        <div>
                            <Label>Tipo *</Label>
                            <select
                                value={form.tipo}
                                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoBloqueio }))}
                                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {TIPOS.map((t) => (
                                    <option key={t} value={t}>{TIPO_BLOQUEIO_LABEL[t]}</option>
                                ))}
                            </select>
                        </div>

                        {/* Datas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Data de Início *</Label>
                                <Input
                                    className="mt-1"
                                    type="date"
                                    value={form.dataInicio}
                                    onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Data de Fim *</Label>
                                <Input
                                    className="mt-1"
                                    type="date"
                                    value={form.dataFim}
                                    onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Motivo */}
                        <div>
                            <Label>Motivo <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                            <Input
                                className="mt-1"
                                value={form.motivo ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                                placeholder="Ex: Recesso de fim de ano"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmar exclusão */}
            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover bloqueio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O período bloqueado voltará a ficar disponível para agendamentos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
