import { FormCadastroMedico } from "../components/Form-Medico";
import { medicosApi, type Medico } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
    Plus, Search, Users, ArrowLeft, Pencil, Trash2,
    BadgeCheck, Stethoscope, Clock
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

interface HorarioAtendimento {
    id: string;
    dias: string[];      // e.g. ["Segunda", "Quarta", "Sexta"]
    inicio: string;      // "08:00"
    termino: string;     // "12:00"
    duracaoMin: number;  // 30
}

// ─────────────────────────────────────────────
// Local storage helpers for horários
// ─────────────────────────────────────────────

function getHorarios(medicoId: string | number): HorarioAtendimento[] {
    try {
        const raw = localStorage.getItem(`horarios_medico_${medicoId}`);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveHorarios(medicoId: string | number, horarios: HorarioAtendimento[]) {
    localStorage.setItem(`horarios_medico_${medicoId}`, JSON.stringify(horarios));
}

function genId() {
    return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────
// Shared Field component
// ─────────────────────────────────────────────

const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
    </div>
);

// ─────────────────────────────────────────────
// Horário form dialog
// ─────────────────────────────────────────────

function HorarioDialog({
    open,
    onOpenChange,
    initial,
    onSave,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: HorarioAtendimento;
    onSave: (h: HorarioAtendimento) => void;
}) {
    const [dias, setDias] = useState<string[]>(initial?.dias ?? []);
    const [inicio, setInicio] = useState(initial?.inicio ?? "08:00");
    const [termino, setTermino] = useState(initial?.termino ?? "12:00");
    const [duracao, setDuracao] = useState(initial?.duracaoMin ?? 30);


    const toggleDia = (dia: string) =>
        setDias((prev) => prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]);

    const handleSave = () => {
        if (dias.length === 0) { toast.error("Selecione ao menos um dia."); return; }
        if (!inicio || !termino) { toast.error("Preencha início e término."); return; }
        onSave({ id: initial?.id ?? genId(), dias, inicio, termino, duracaoMin: duracao });
        onOpenChange(false);
    };

    // reset when dialog opens for a new entry
    const handleOpenChange = (v: boolean) => {
        if (v) {
            setDias(initial?.dias ?? []);
            setInicio(initial?.inicio ?? "08:00");
            setTermino(initial?.termino ?? "12:00");
            setDuracao(initial?.duracaoMin ?? 30);
        }
        onOpenChange(v);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar Horário" : "Adicionar Horário"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {/* Dias */}
                    <div>
                        <label className="text-sm font-medium block mb-2">Dias da semana</label>
                        <div className="flex flex-wrap gap-2">
                            {DIAS_SEMANA.map((dia) => (
                                <button
                                    key={dia}
                                    type="button"
                                    onClick={() => toggleDia(dia)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${dias.includes(dia)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                                        }`}
                                >
                                    {dia}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Início / Término */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium block mb-1">Início</label>
                            <Input
                                type="time"
                                value={inicio}
                                onChange={(e) => setInicio(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Término</label>
                            <Input
                                type="time"
                                value={termino}
                                onChange={(e) => setTermino(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Duração */}
                    <div>
                        <label className="text-sm font-medium block mb-1">Duração Padrão (min)</label>
                        <Input
                            type="number"
                            min={5}
                            step={5}
                            value={duracao}
                            onChange={(e) => setDuracao(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button onClick={handleSave} className="flex-1">Salvar</Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// Toggle Ativo Button
// ─────────────────────────────────────────────
function ToggleAtivoMedicoButton({ ativo, onToggle }: { ativo: boolean; onToggle: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onToggle}
            className={`flex items-center gap-2 ${ativo ? "text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5" : "text-primary hover:text-primary border-primary/30 hover:bg-primary/5"}`}
        >
            {ativo ? "Desativar Médico" : "Reativar Médico"}
        </Button>
    );
}

// ─────────────────────────────────────────────
// Detail view
// ─────────────────────────────────────────────

function MedicoDetail({
    medico,
    onBack,
    canEdit,
}: {
    medico: Medico;
    onBack: () => void;
    canEdit: boolean;
}) {
    const queryClient = useQueryClient();
    const [editDadosOpen, setEditDadosOpen] = useState(false);
    const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
    const [editingHorario, setEditingHorario] = useState<HorarioAtendimento | undefined>();
    const [horarios, setHorarios] = useState<HorarioAtendimento[]>(() =>
        getHorarios(medico.id!)
    );

    const handleSaveHorario = (h: HorarioAtendimento) => {
        const updated = horarios.some((x) => x.id === h.id)
            ? horarios.map((x) => (x.id === h.id ? h : x))
            : [...horarios, h];
        setHorarios(updated);
        saveHorarios(medico.id!, updated);
        toast.success(editingHorario ? "Horário atualizado!" : "Horário adicionado!");
        setEditingHorario(undefined);
    };

    const handleDeleteHorario = (id: string) => {
        const updated = horarios.filter((h) => h.id !== id);
        setHorarios(updated);
        saveHorarios(medico.id!, updated);
        toast.success("Horário removido!");
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            {/* Back */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </button>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{medico.nome}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${medico.ativo !== false ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground line-through"}`}>
                    {medico.ativo !== false ? "Ativo" : "Inativo"}
                </span>
            </div>

            {/* Dados Cadastrais */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                    <Field label="CPF" value={medico.cpf} />
                    <Field label="Data Nasc." value={medico.dataNascimento} />
                    <Field label="Idade" value={medico.idade} />
                    <Field label="Sexo" value={medico.sexo} />
                    <Field label="Estado Civil" value={medico.estadoCivil} />
                    <Field label="Telefone" value={medico.telefone} />
                    <Field label="Email" value={medico.email} />
                    <Field label="CEP" value={medico.cep} />
                    <Field
                        label="Endereço"
                        value={[medico.logradouro, medico.numero, medico.complemento].filter(Boolean).join(", ")}
                    />
                    <Field label="Bairro" value={medico.bairro} />
                    <Field
                        label="Cidade/UF"
                        value={medico.cidade && medico.uf ? `${medico.cidade}/${medico.uf}` : medico.cidade || medico.uf}
                    />
                    <Field label="CRM" value={medico.crm} />
                    <Field label="Estado CRM" value={medico.crmEstado} />
                    <Field label="Especialidade" value={medico.especialidade} />
                </div>
            </div>

            {canEdit && (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setEditDadosOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Editar
                    </Button>
                    <ToggleAtivoMedicoButton
                        ativo={medico.ativo !== false}
                        onToggle={() => {
                            medicosApi.atualizar(medico.id!, { ativo: !(medico.ativo !== false) } as any)
                                .then(() => {
                                    queryClient.invalidateQueries({ queryKey: ["medico", medico.id] });
                                    queryClient.invalidateQueries({ queryKey: ["medicos"] });
                                    toast.success(medico.ativo !== false ? "Médico inativado." : "Médico reativado.");
                                })
                                .catch(() => toast.error("Erro ao alterar status."));
                        }}
                    />
                </div>
            )}

            {/* Horários de Atendimento */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Horários de Atendimento</h2>
                    {canEdit && (
                        <Button
                            onClick={() => { setEditingHorario(undefined); setHorarioDialogOpen(true); }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Horário
                        </Button>
                    )}
                </div>

                {horarios.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Nenhum horário cadastrado.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {horarios.map((h) => (
                            <div key={h.id} className="bg-muted/40 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <p className="font-semibold text-base">
                                        {h.dias.join(", ")}
                                    </p>
                                    {canEdit && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => { setEditingHorario(h); setHorarioDialogOpen(true); }}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteHorario(h.id)}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Início</p>
                                        <p className="font-semibold">{h.inicio}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Término</p>
                                        <p className="font-semibold">{h.termino}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Duração Padrão</p>
                                        <p className="font-semibold">{h.duracaoMin} min</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit dados dialog */}
            <Dialog open={editDadosOpen} onOpenChange={setEditDadosOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Médico</DialogTitle>
                    </DialogHeader>
                    <FormCadastroMedico
                        initialData={medico}
                        onSuccess={() => setEditDadosOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Horário dialog */}
            <HorarioDialog
                open={horarioDialogOpen}
                onOpenChange={(v) => { setHorarioDialogOpen(v); if (!v) setEditingHorario(undefined); }}
                initial={editingHorario}
                onSave={handleSaveHorario}
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Main list
// ─────────────────────────────────────────────

export default function Medicos() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const { canAddMedico } = usePermissions();

    const { data: medicos, isLoading, error } = useQuery({
        queryKey: ["medicos", showInactive],
        queryFn: () => medicosApi.listar(showInactive),
    });

    // Busca detalhes completos ao clicar
    const { data: selectedMedico, isLoading: loadingDetalhe } = useQuery({
        queryKey: ["medico", selectedId],
        queryFn: () => medicosApi.buscarPorId(selectedId!),
        enabled: !!selectedId,
    });

    const filtered = medicos
        ?.filter((m) =>
            m.nome.toLowerCase().includes(search.toLowerCase()) ||
            m.crm?.toLowerCase().includes(search.toLowerCase()) ||
            m.especialidade?.toLowerCase().includes(search.toLowerCase()) ||
            m.cpf?.includes(search)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const { paginated, page, totalPages, next, prev, goTo } = usePagination(filtered ?? [], 10);

    // Loading skeleton enquanto busca detalhes
    if (selectedId && loadingDetalhe) {
        return (
            <div className="animate-fade-in space-y-6 max-w-4xl">
                <button
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    Carregando dados do médico...
                </div>
            </div>
        );
    }

    if (selectedId && selectedMedico) {
        return (
            <MedicoDetail
                medico={selectedMedico}
                onBack={() => setSelectedId(null)}
                canEdit={canAddMedico}
            />
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Médicos</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie os médicos da clínica</p>
                </div>
                {canAddMedico && (
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Médico
                    </Button>
                )}
            </div>

            {/* Summary card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total de Médicos</p>
                        <p className="text-2xl font-semibold">{medicos?.length ?? 0}</p>
                    </div>
                </div>
            </div>

            {/* Search + toggle inativos */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar médico por nome, CRM, CPF, especialidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={showInactive}
                        onClick={() => setShowInactive(v => !v)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${showInactive ? "bg-primary" : "bg-muted"}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${showInactive ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                    <span className="text-muted-foreground">Mostrar inativos</span>
                </label>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="animate-pulse">Carregando médicos...</div>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Erro ao carregar médicos. Verifique o backend.
                    </div>
                ) : !filtered?.length ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{search ? "Nenhum médico encontrado para a busca." : "Nenhum médico cadastrado."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Especialidade</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">CRM</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m, i) => (
                                    <tr
                                        key={m.id}
                                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedId(m.id!)}
                                    >
                                        <td className="py-3 px-4 text-muted-foreground">{(page - 1) * 10 + i + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                    {m.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{m.nome}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-primary font-medium text-xs">{m.especialidade}</td>
                                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{m.crm}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.ativo !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                {m.ativo !== false ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onNext={next}
                            onPrev={prev}
                            onGoTo={goTo}
                            total={filtered?.length ?? 0}
                            perPage={10}
                        />
                        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                            {filtered.length} médico{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}
            </div>

            {/* New medico dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Médico</DialogTitle>
                    </DialogHeader>
                    <FormCadastroMedico onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}