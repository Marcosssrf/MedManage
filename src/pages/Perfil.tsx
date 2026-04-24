import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { horariosApi, usuariosApi, DIA_SEMANA_LABEL, DIAS_SEMANA_ORDER, type DiaHorario } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
    KeyRound, Stethoscope, User,
    Briefcase, ShieldCheck, Clock, Pencil, Check, X, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";

function roleBadge(role: string) {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
        ADMIN:      { label: "Administrador", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        MEDICO:     { label: "Médico",         cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",       icon: <Stethoscope className="w-3.5 h-3.5" /> },
        SECRETARIA: { label: "Recepcionista",  cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",   icon: <Briefcase className="w-3.5 h-3.5" /> },
    };
    const r = map[role] ?? { label: role, cls: "bg-muted text-muted-foreground", icon: <User className="w-3.5 h-3.5" /> };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${r.cls}`}>
            {r.icon}{r.label}
        </span>
    );
}

function initials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
}

function HorarioDialog({
                           open, onOpenChange, initial, diasJaCadastrados, onSave,
                       }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: DiaHorario;
    diasJaCadastrados: string[];
    onSave: (horarios: Omit<DiaHorario, "id">[]) => void;
}) {
    const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
    const [horaInicio, setHoraInicio] = useState("08:00");
    const [horaFim, setHoraFim] = useState("18:00");
    const [duracaoPadrao, setDuracaoPadrao] = useState(60);

    useEffect(() => {
        if (open) {
            if (initial) {
                setDiasSelecionados([initial.diaSemana]);
                setHoraInicio(initial.horaInicio);
                setHoraFim(initial.horaFim);
                setDuracaoPadrao(initial.duracaoPadrao);
            } else {
                setDiasSelecionados([]);
                setHoraInicio("08:00");
                setHoraFim("18:00");
                setDuracaoPadrao(60);
            }
        }
    }, [open, initial]);

    const toggleDia = (dia: string) =>
        setDiasSelecionados(prev =>
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        );

    const handleSave = () => {
        if (diasSelecionados.length === 0) { toast.error("Selecione ao menos um dia."); return; }
        if (!horaInicio || !horaFim) { toast.error("Preencha início e fim."); return; }
        if (horaFim <= horaInicio) { toast.error("O horário de fim deve ser após o início."); return; }
        if (duracaoPadrao < 5) { toast.error("Duração mínima é 5 minutos."); return; }
        const apenasNovos = diasSelecionados.filter(dia =>
            !diasJaCadastrados.includes(dia) || (initial && dia === initial.diaSemana)
        );
        if (apenasNovos.length === 0) { toast.error("Todos os dias selecionados já estão cadastrados."); return; }
        onSave(apenasNovos.map(dia => ({ diaSemana: dia, horaInicio, horaFim, duracaoPadrao })));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initial ? "Editar Horário" : "Adicionar Horário"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-sm font-medium block mb-2">Dias da semana</label>
                        <div className="flex flex-wrap gap-2">
                            {DIAS_SEMANA_ORDER.map((dia) => {
                                const bloqueado = diasJaCadastrados.includes(dia) && dia !== initial?.diaSemana;
                                const selecionado = diasSelecionados.includes(dia);
                                return (
                                    <button key={dia} type="button" disabled={bloqueado} onClick={() => toggleDia(dia)}
                                            title={bloqueado ? "Dia já cadastrado" : undefined}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                                selecionado ? "bg-primary text-primary-foreground border-primary"
                                                    : bloqueado ? "bg-muted text-muted-foreground border-border opacity-40 cursor-not-allowed"
                                                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
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
                        <Input type="number" min={5} step={5} value={duracaoPadrao}
                               onChange={(e) => setDuracaoPadrao(Number(e.target.value))} />
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

export default function Perfil() {
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const [editingUsername, setEditingUsername] = useState(false);
    const [novoUsername, setNovoUsername] = useState(user?.username ?? "");

    const usernameMutation = useMutation({
        mutationFn: () => usuariosApi.patchMe({ username: novoUsername }),
        onSuccess: async (res) => {
            if (res.accessToken) localStorage.setItem("auth_token", res.accessToken);
            toast.success("Nome de usuário atualizado!");
            setEditingUsername(false);
            await refreshUser();
        },
        onError: (e: Error) => toast.error(e?.message || "Erro ao atualizar usuário."),
    });

    const handleSaveUsername = () => {
        const trimmed = novoUsername.trim();
        if (!trimmed) return toast.error("O nome de usuário não pode ser vazio.");
        if (trimmed === user?.username) { setEditingUsername(false); return; }
        if (trimmed.length < 3) return toast.error("O usuário deve ter ao menos 3 caracteres.");
        usernameMutation.mutate();
    };

    const cancelEditUsername = () => { setNovoUsername(user?.username ?? ""); setEditingUsername(false); };

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [showSenhas, setShowSenhas] = useState(false);

    const senhaMutation = useMutation({
        mutationFn: () => usuariosApi.patchMe({ senhaAtual, novaSenha }),
        onSuccess: () => {
            toast.success("Senha alterada com sucesso!");
            setSenhaAtual(""); setNovaSenha(""); setConfirmar(""); setShowSenhas(false);
        },
        onError: (e: Error) => toast.error(e?.message || "Erro ao alterar senha."),
    });

    const handleSenha = () => {
        if (!senhaAtual) return toast.error("Informe a senha atual.");
        if (!novaSenha) return toast.error("Informe a nova senha.");
        if (novaSenha.length < 6) return toast.error("A nova senha deve ter ao menos 6 caracteres.");
        if (novaSenha !== confirmar) return toast.error("As senhas não coincidem.");
        senhaMutation.mutate();
    };

    const medicoId = user?.medico?.id;
    const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
    const [editingHorario, setEditingHorario] = useState<DiaHorario | undefined>();

    const { data: horarioData, isLoading: loadingHorarios } = useQuery({
        queryKey: ["horarios-perfil", medicoId],
        queryFn: () => horariosApi.buscarPorMedico(medicoId!),
        enabled: !!medicoId,
    });

    const horarios: DiaHorario[] = horarioData?.horarios ?? [];
    const diasCadastrados = horarios.map((h: DiaHorario) => h.diaSemana);

    const adicionarMutation = useMutation({
        mutationFn: (novosHorarios: Omit<DiaHorario, "id">[]) => horariosApi.salvar(medicoId!, novosHorarios),
        onSuccess: (data) => {
            queryClient.setQueryData(["horarios-perfil", medicoId], (old: any) => ({
                ...old, horarios: [...(old?.horarios ?? []), ...data.horarios],
            }));
            toast.success("Horário(s) adicionado(s)!");
            setHorarioDialogOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao salvar horário."),
    });

    const editarMutation = useMutation({
        mutationFn: async (updatedHorarios: Omit<DiaHorario, "id">[]) => {
            if (!editingHorario?.id) throw new Error("Horário não encontrado para edição.");
            await horariosApi.deletarUm(medicoId!, editingHorario.id);
            await horariosApi.salvar(medicoId!, updatedHorarios);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["horarios-perfil", medicoId] });
            toast.success("Horário atualizado!");
            setHorarioDialogOpen(false);
            setEditingHorario(undefined);
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao atualizar horário."),
    });

    const removerMutation = useMutation({
        mutationFn: (horarioId: string) => horariosApi.deletarUm(medicoId!, horarioId),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["horarios-perfil", medicoId] });
            toast.success("Horário removido!");
        },
        onError: (err: Error) => toast.error(err.message || "Erro ao remover horário."),
    });

    const handleSaveHorario = (novosHorarios: Omit<DiaHorario, "id">[]) => {
        if (editingHorario) editarMutation.mutate(novosHorarios);
        else adicionarMutation.mutate(novosHorarios);
    };

    const isSaving = adicionarMutation.isPending || editarMutation.isPending || removerMutation.isPending;
    const displayName = user?.medico?.nome ?? user?.username ?? "";

    return (
        <div className="animate-fade-in space-y-8 max-w-4xl">

            {/* Cabeçalho */}
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 ring-2 ring-primary/20">
                    {initials(displayName)}
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">{displayName}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        {roleBadge(user?.role ?? "")}
                        <span className="text-sm text-muted-foreground">@{user?.username}</span>
                    </div>
                    {user?.medico && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {user.medico.especialidade} · CRM {user.medico.crm}
                        </p>
                    )}
                </div>
            </div>

            {/* Informações da conta */}
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
                <div className="flex items-center gap-2 px-6 py-4">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-base font-medium">Informações da conta</h2>
                </div>

                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Nome de usuário</p>
                        {editingUsername ? (
                            <div className="flex items-center gap-2">
                                <Input autoFocus value={novoUsername} onChange={e => setNovoUsername(e.target.value)}
                                       onKeyDown={e => { if (e.key === "Enter") handleSaveUsername(); if (e.key === "Escape") cancelEditUsername(); }}
                                       className="h-8 text-sm" placeholder="Nome de usuário" />
                                <button onClick={handleSaveUsername} disabled={usernameMutation.isPending}
                                        className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50" title="Salvar">
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={cancelEditUsername}
                                        className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors" title="Cancelar">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <p className="text-sm font-medium">@{user?.username}</p>
                                <button onClick={() => { setNovoUsername(user?.username ?? ""); setEditingUsername(true); }}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all" title="Editar nome de usuário">
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Perfil</p>
                        {roleBadge(user?.role ?? "")}
                    </div>

                    {user?.medico && (
                        <>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Nome completo</p>
                                <p className="text-sm font-medium">{user.medico.nome}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Especialidade</p>
                                <p className="text-sm font-medium">{user.medico.especialidade}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5">CRM</p>
                                <p className="text-sm font-medium">{user.medico.crm}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Troca de senha */}
                <div className="px-6 py-5">
                    {!showSenhas ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Senha</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Altere sua senha de acesso</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowSenhas(true)} className="flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5" /> Alterar senha
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <KeyRound className="w-3.5 h-3.5 text-muted-foreground" /> Alterar senha
                                </p>
                                <button onClick={() => { setShowSenhas(false); setSenhaAtual(""); setNovaSenha(""); setConfirmar(""); }}
                                        className="p-1 rounded hover:bg-muted transition-colors">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs">Senha atual *</Label>
                                    <Input type="password" className="mt-1" value={senhaAtual}
                                           onChange={e => setSenhaAtual(e.target.value)} placeholder="••••••••" />
                                </div>
                                <div>
                                    <Label className="text-xs">Nova senha *</Label>
                                    <Input type="password" className="mt-1" value={novaSenha}
                                           onChange={e => setNovaSenha(e.target.value)} placeholder="mín. 6 caracteres" />
                                </div>
                                <div>
                                    <Label className="text-xs">Confirmar senha *</Label>
                                    <Input type="password" className="mt-1" value={confirmar}
                                           onChange={e => setConfirmar(e.target.value)} placeholder="repita a nova senha"
                                           onKeyDown={e => { if (e.key === "Enter") handleSenha(); }} />
                                </div>
                            </div>
                            {novaSenha && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[1,2,3,4].map(i => {
                                            const strength = novaSenha.length >= 10 && /[A-Z]/.test(novaSenha) && /[0-9]/.test(novaSenha) && /[^a-zA-Z0-9]/.test(novaSenha)
                                                ? 4 : novaSenha.length >= 8 && (/[A-Z]/.test(novaSenha) || /[0-9]/.test(novaSenha))
                                                    ? 3 : novaSenha.length >= 6 ? 2 : 1;
                                            return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength
                                                ? strength === 1 ? "bg-red-400" : strength === 2 ? "bg-orange-400" : strength === 3 ? "bg-yellow-400" : "bg-green-400"
                                                : "bg-muted"}`} />;
                                        })}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {novaSenha.length < 6 ? "Muito curta" : novaSenha.length < 8 ? "Senha fraca"
                                            : novaSenha.length >= 8 && (/[A-Z]/.test(novaSenha) || /[0-9]/.test(novaSenha)) ? "Senha boa" : "Senha forte"}
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSenha} disabled={senhaMutation.isPending}>
                                    {senhaMutation.isPending ? "Salvando..." : "Salvar senha"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setShowSenhas(false); setSenhaAtual(""); setNovaSenha(""); setConfirmar(""); }}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Horários de Atendimento (só médico) */}
            {medicoId && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h2 className="text-base font-medium">Meus Horários de Atendimento</h2>
                        </div>
                        <Button onClick={() => { setEditingHorario(undefined); setHorarioDialogOpen(true); }}
                                className="flex items-center gap-2" disabled={isSaving} size="sm">
                            <Plus className="w-4 h-4" /> Adicionar Horário
                        </Button>
                    </div>

                    {loadingHorarios ? (
                        <div className="py-8 text-center text-muted-foreground animate-pulse text-sm">Carregando horários...</div>
                    ) : horarios.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Nenhum horário cadastrado.</p>
                            <p className="text-xs mt-1">Adicione seus horários de atendimento.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {horarios.map((h: DiaHorario) => (
                                <div key={h.id} className="bg-muted/40 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="font-semibold text-base">{DIA_SEMANA_LABEL[h.diaSemana] ?? h.diaSemana}</p>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => { setEditingHorario(h); setHorarioDialogOpen(true); }}
                                                    disabled={isSaving}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40" title="Editar">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => removerMutation.mutate(h.id)} disabled={isSaving}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40" title="Remover">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
            )}

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