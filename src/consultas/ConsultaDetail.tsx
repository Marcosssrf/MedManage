import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { consultasApi, configuracoesApi, anamneseApi } from "../services/api";
import type { Consulta } from "../services/api";
import { FormCadastroConsulta } from "../components/Form-Consulta";
import { AnamneseForm, AnamneseView } from "../components/Form-Anamnese";
import { PrescricoesPanel } from "./PrescricoesPanel";
import { STATUS_STYLE } from "./constants";
import { consultaAtiva } from "../utils/utils";

interface Props {
    consulta: Consulta;
    onBack: () => void;
    canEdit: boolean;
    canCancelar: boolean;
}

export function ConsultaDetail({ consulta, onBack, canEdit, canCancelar }: Props) {
    const queryClient = useQueryClient();
    const [view, setView] = useState<"info" | "anamnese">("info");
    const [editOpen, setEditOpen] = useState(false);
    const [historicoOpen, setHistoricoOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(consulta.status);

    const { data: config } = useQuery({
        queryKey: ["configuracao-clinica"],
        queryFn: configuracoesApi.buscar,
        staleTime: 5 * 60 * 1000,
    });

    const { data: anamnese } = useQuery({
        queryKey: ["anamnese", consulta.id],
        // Removido o 'require'. Agora usa a importação direta lá do topo
        queryFn: () => anamneseApi.buscarPorConsulta(consulta.id!),
        enabled: consultaAtiva(consulta.status),
    });

    const { data: consultaCompleta } = useQuery({
        queryKey: ["consulta-completa", consulta.id],
        queryFn: () => consultasApi.buscarPorId(consulta.id!),
        enabled: historicoOpen,
    });

    const historico = (consultaCompleta as any)?.historicoClinico ?? null;
    const historicoLoading = historicoOpen && !consultaCompleta;
    const podeEditarClinico = canEdit && consultaAtiva(currentStatus);
    const statusLabel = currentStatus?.replace("_", " ") ?? "";

    const cancelMutation = useMutation({
        mutationFn: () => consultasApi.cancelar(consulta.id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Consulta cancelada!");
            onBack();
        },
        onError: () => toast.error("Erro ao cancelar."),
    });

    const statusMutation = useMutation({
        mutationFn: (novoStatus: "EM_ANDAMENTO" | "REALIZADA" | "CONFIRMADA" | "AGENDADA") =>
            consultasApi.mudarStatus(consulta.id!, novoStatus),
        onSuccess: (_, novoStatus) => {
            setCurrentStatus(novoStatus);
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            const labels: Record<string, string> = {
                EM_ANDAMENTO: "Em Andamento",
                REALIZADA: "Realizada",
                CONFIRMADA: "Confirmada",
                AGENDADA: "Agendada",
            };
            toast.success(`Status alterado para ${labels[novoStatus] ?? novoStatus}!`);
        },
        onError: () => toast.error("Erro ao alterar status."),
    });

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Detalhes da Consulta</h1>
                    <p className="text-muted-foreground text-sm">Informações completas da consulta</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setHistoricoOpen(true)}>
                    <ClipboardList className="w-4 h-4 mr-1.5" />
                    Histórico Médico
                </Button>
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
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_STYLE[currentStatus] ?? "bg-muted text-muted-foreground"}`}>
                            {statusLabel}
                        </span>
                    </div>
                    {consulta.tipoConsulta && (
                        <div>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <p className="font-bold capitalize">{consulta.tipoConsulta.replace("_", " ").toLowerCase()}</p>
                        </div>
                    )}
                    {consulta.observacoes && (
                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Observações</p>
                            <p className="text-sm font-medium mt-0.5">{consulta.observacoes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Anamnese */}
            {consultaAtiva(currentStatus) && (
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
                        <AnamneseView anamnese={anamnese} />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma anamnese registrada.{podeEditarClinico && " Clique em Registrar para adicionar."}
                        </p>
                    )}
                </div>
            )}

            {/* Prescrições */}
            {consultaAtiva(currentStatus) && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <PrescricoesPanel consulta={consulta} clinicaConfig={config ?? undefined} />
                </div>
            )}

            {!consultaAtiva(currentStatus) && currentStatus !== "CANCELADA" && (
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground text-center">
                    Anamnese e prescrições disponíveis apenas quando a consulta estiver <strong>Em Andamento</strong> ou <strong>Realizada</strong>.
                </div>
            )}

            {/* Botões de ação */}
            {currentStatus !== "CANCELADA" && (
                <div className="flex flex-wrap gap-3">
                    {(currentStatus === "AGENDADA" || currentStatus === "CONFIRMADA") && canEdit && (
                        <Button
                            onClick={() => statusMutation.mutate("EM_ANDAMENTO")}
                            disabled={statusMutation.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            {statusMutation.isPending ? "Alterando..." : "▶ Iniciar Atendimento"}
                        </Button>
                    )}
                    {currentStatus === "EM_ANDAMENTO" && canEdit && (
                        <Button
                            onClick={() => statusMutation.mutate("REALIZADA")}
                            disabled={statusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {statusMutation.isPending ? "Alterando..." : "✓ Concluir Consulta"}
                        </Button>
                    )}
                    {currentStatus === "AGENDADA" && canEdit && (
                        <Button variant="outline" onClick={() => statusMutation.mutate("CONFIRMADA")} disabled={statusMutation.isPending}>
                            {statusMutation.isPending ? "Alterando..." : "Confirmar"}
                        </Button>
                    )}
                    {currentStatus !== "REALIZADA" && canEdit && (
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar Consulta
                        </Button>
                    )}
                    {currentStatus !== "REALIZADA" && canCancelar && (
                        <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                            <X className="w-4 h-4 mr-2" />
                            {cancelMutation.isPending ? "Cancelando..." : "Cancelar Consulta"}
                        </Button>
                    )}
                </div>
            )}

            {/* Dialog Histórico Médico */}
            <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5" />
                            Histórico Médico — {consulta.pacienteNome}
                        </DialogTitle>
                    </DialogHeader>
                    {historicoLoading ? (
                        <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>
                    ) : !historico ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            Nenhum histórico clínico cadastrado para este paciente.
                        </div>
                    ) : (
                        <div className="space-y-5 py-2">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Dados Vitais</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        ["Tipo Sanguíneo", historico.tipoSanguineo],
                                        ["Peso", historico.peso ? `${historico.peso} kg` : undefined],
                                        ["Altura", historico.altura ? `${historico.altura} cm` : undefined],
                                    ].map(([label, value]) => (
                                        <div key={String(label)} className="bg-muted/40 rounded-lg p-3 text-center">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="font-bold mt-0.5">{value ?? "—"}</p>
                                        </div>
                                    ))}
                                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">IMC</p>
                                        <p className="font-bold mt-0.5">
                                            {historico.imc ? (() => {
                                                const imc = Number(historico.imc);
                                                const label = imc < 18.5 ? "Abaixo do peso" : imc < 25 ? "Peso normal" : imc < 30 ? "Sobrepeso" : imc < 35 ? "Obesidade I" : imc < 40 ? "Obesidade II" : "Obesidade III";
                                                return `${historico.imc} — ${label}`;
                                            })() : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Antecedentes Clínicos</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                                    {([
                                        ["Alergias", historico.alergias],
                                        ["Doenças Preexistentes", historico.doencasPreexistentes],
                                        ["Cirurgias Prévias", historico.cirurgiasPrevias],
                                        ["Histórico Familiar", historico.historicoFamiliar],
                                        ["Medicamentos em Uso", historico.medicamentosUso],
                                    ] as [string, string | undefined][]).map(([label, value]) => (
                                        <div key={label}>
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-sm font-medium mt-0.5">
                                                {value || <span className="text-muted-foreground italic">Não informado</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Hábitos de Vida</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        ["Tabagismo", historico.tabagismo],
                                        ["Etilismo", historico.etilismo],
                                        ["Atividade Física", historico.atividadeFisica],
                                        ["Uso de Drogas", historico.usoDrogas],
                                    ].map(([label, value]) => (
                                        <span key={String(label)} className={`text-xs px-3 py-1 rounded-full border font-medium ${value ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-muted border-border text-muted-foreground"}`}>
                                            {String(label)}: {value ? "Sim" : "Não"}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Editar */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta
                        initialData={consulta}
                        onSuccess={() => { setEditOpen(false); queryClient.invalidateQueries({ queryKey: ["consultas"] }); }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}