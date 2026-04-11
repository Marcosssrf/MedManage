import { FormCadastroMedico } from "../components/Form-Medico";
import {
    medicosApi,
    horariosApi,
    type Medico,
    type DiaHorario,
    DIA_SEMANA_LABEL,
    DIAS_SEMANA_ORDER,
} from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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

// Dias já cadastrados são bloqueados para evitar conflito 409
function HorarioDialog({
    open,
    onOpenChange,
    diasJaCadastrados,
    onSave,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    diasJaCadastrados: string[];
    onSave: (horarios: Omit<DiaHorario, "id">[]) => void;
}) {
    const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
    const [horaInicio, setHoraInicio] = useState("08:00");
    const [horaFim, setHoraFim] = useState("18:00");
    const [duracaoPadrao, setDuracaoPadrao] = useState(60);


    const handleOpenChange = (v: boolean) => {
        if (v) {
            setDiasSelecionados([]);
            setHoraInicio("08:00");
            setHoraFim("18:00");
            setDuracaoPadrao(60);
        }
        onOpenChange(v);
    };

    useEffect(() => {
        if (open) {
            setDiasSelecionados([]);
            setHoraInicio("08:00");
            setHoraFim("18:00");
            setDuracaoPadrao(60);
        }
    }, [open]);

    const toggleDia = (dia: string) =>
        setDiasSelecionados(prev =>
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        );

    const handleSave = () => {
        if (diasSelecionados.length === 0) { toast.error("Selecione ao menos um dia."); return; }
        if (!horaInicio || !horaFim) { toast.error("Preencha início e fim."); return; }
        if (horaFim <= horaInicio) { toast.error("O horário de fim deve ser após o início."); return; }
        if (duracaoPadrao < 5) { toast.error("Duração mínima é 5 minutos."); return; }

        const apenasNovos = diasSelecionados.filter(dia => !diasJaCadastrados.includes(dia));

        if (apenasNovos.length === 0) {
            toast.error("Todos os dias selecionados já estão cadastrados.");
            return;
        }

        onSave(apenasNovos.map(dia => ({
            diaSemana: dia,
            horaInicio,
            horaFim,
            duracaoPadrao,
        })));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Horário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-sm font-medium block mb-2">Dias da semana</label>
                        <div className="flex flex-wrap gap-2">
                            {DIAS_SEMANA_ORDER.map((dia) => {
                                const bloqueado = diasJaCadastrados.includes(dia);
                                const selecionado = diasSelecionados.includes(dia);
                                return (
                                    <button
                                        key={dia}
                                        type="button"
                                        disabled={bloqueado}
                                        onClick={() => toggleDia(dia)}
                                        title={bloqueado ? "Dia já cadastrado" : undefined}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors
                                            ${selecionado
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : bloqueado
                                                    ? "bg-muted text-muted-foreground border-border opacity-40 cursor-not-allowed"
                                                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                                            }`}
                                    >
                                        {DIA_SEMANA_LABEL[dia]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium block mb-1">Início</label>
                            <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Fim</label>
                            <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Duração Padrão (min)</label>
                        <Input
                            type="number"
                            min={5}
                            step={5}
                            value={duracaoPadrao}
                            onChange={(e) => setDuracaoPadrao(Number(e.target.value))}
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
            className={`flex items-center gap-2 ${ativo
                ? "text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                : "text-primary hover:text-primary border-primary/30 hover:bg-primary/5"
                }`}
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
    const [editingHorario, setEditingHorario] = useState<DiaHorario | undefined>();

    // Busca horários da API
    const { data: horarioData, isLoading: loadingHorarios } = useQuery({
        queryKey: ["horarios", medico.id],
        queryFn: () => horariosApi.buscarPorMedico(medico.id!),
        // Se o médico não tiver horários ainda, a API retorna 404 — tratamos como lista vazia
        retry: false,
    });

    const horarios: DiaHorario[] = horarioData?.horarios ?? [];
    const diasCadastrados = horarios.map(h => h.diaSemana);

    // Adicionar horário (POST com um único dia)
    const adicionarMutation = useMutation({
        mutationFn: (horarios: Omit<DiaHorario, "id">[]) =>
            horariosApi.salvar(medico.id!, horarios),
        onSuccess: (data) => {
            queryClient.setQueryData(["horarios", medico.id], (old: any) => ({
                ...old,
                horarios: [...(old?.horarios ?? []), ...data.horarios],
            }));
            toast.success("Horário(s) adicionado(s)!");
            setHorarioDialogOpen(false); // fecha só depois que salvou
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao salvar horário."),
    });

    // Editar horário: deleta todos e recria com os novos dados
    // (a API não tem PATCH por dia individual; a abordagem mais simples é recriar)
    const editarMutation = useMutation({
        mutationFn: async (updated: Omit<DiaHorario, "id">) => {
            // Remove o dia antigo e reenvia todos com o dia atualizado
            const novosHorarios = horarios
                .filter(h => h.id !== editingHorario?.id)
                .map(h => ({
                    diaSemana: h.diaSemana,
                    horaInicio: h.horaInicio,
                    horaFim: h.horaFim,
                    duracaoPadrao: h.duracaoPadrao,
                }));
            novosHorarios.push(updated);
            await horariosApi.deletarTodos(medico.id!);
            if (novosHorarios.length > 0) {
                await horariosApi.salvar(medico.id!, novosHorarios);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["horarios", medico.id] });
            toast.success("Horário atualizado!");
            setHorarioDialogOpen(false);
            setEditingHorario(undefined);
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao atualizar horário."),
    });

    const removerMutation = useMutation({
        mutationFn: (horarioId: string) =>
            horariosApi.deletarUm(medico.id!, horarioId),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["horarios", medico.id] });
            toast.success("Horário removido!");
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao remover horário."),
    });

    const handleSaveHorario = (horarios: Omit<DiaHorario, "id">[]) => {
        adicionarMutation.mutate(horarios);
    };

    const isSaving = adicionarMutation.isPending || editarMutation.isPending || removerMutation.isPending;

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
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${medico.ativo !== false
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground line-through"
                    }`}>
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
                            disabled={isSaving}
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Horário
                        </Button>
                    )}
                </div>

                {loadingHorarios ? (
                    <div className="py-8 text-center text-muted-foreground animate-pulse text-sm">
                        Carregando horários...
                    </div>
                ) : horarios.length === 0 ? (
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
                                        {DIA_SEMANA_LABEL[h.diaSemana] ?? h.diaSemana}
                                    </p>
                                    {canEdit && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => { setEditingHorario(h); setHorarioDialogOpen(true); }}
                                                disabled={isSaving}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removerMutation.mutate(h.id)}
                                                disabled={isSaving}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
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
                                        <p className="font-semibold">{h.horaInicio}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Fim</p>
                                        <p className="font-semibold">{h.horaFim}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Duração Padrão</p>
                                        <p className="font-semibold">{h.duracaoPadrao} min</p>
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
                diasJaCadastrados={diasCadastrados}
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