import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CheckCircle, ChevronDown, ChevronUp, CreditCard, Plus, XCircle} from "lucide-react";
import {toast} from "sonner";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../components/ui/dialog";
import type {Consulta, ProcedimentoTiss} from "../services/api";
import {pagamentosApi, procedimentosTissApi} from "../services/api";

// ─── Constantes ────────────────────────────────
const TIPOS_ATENDIMENTO = [
    { label: "Consulta", value: "CONSULTA" },
    { label: "Exame", value: "EXAME" },
    { label: "Cirurgia", value: "CIRURGIA" },
    { label: "Terapia", value: "TERAPIA" },
    { label: "Internação", value: "INTERNACAO" },
    { label: "Urgência", value: "URGENCIA" },
    { label: "Outro", value: "OUTRO" },
];

const VIAS_ACESSO = [
    { label: "Não Aplicável", value: "NAO_APLICAVEL" },
    { label: "Única", value: "UNICA" },
    { label: "Mesma via", value: "MESMA_VIA" },
    { label: "Diferente via", value: "DIFERENTE_VIA" },
];

const STATUS_STYLE: Record<string, string> = {
    PENDENTE: "bg-amber-50 border-amber-300 text-amber-800",
    AUTORIZADO: "bg-green-50 border-green-400 text-green-800",
    NEGADO: "bg-red-50 border-red-400 text-red-800",
};

const STATUS_LABEL: Record<string, string> = {
    PENDENTE: "Pendente",
    AUTORIZADO: "Autorizado",
    NEGADO: "Negado",
};

const EMPTY_FORM = {
    codigoProcedimento: "",
    descricao: "",
    valor: "",
    quantidade: "1",
    dataExecucao: new Date().toISOString().split("T")[0],
    tipoAtendimento: "CONSULTA",
    viaAcesso: "NAO_APLICAVEL",
    numeroGuia: "",
    convenioNome: "",
    observacoes: "",
};

// ─── Formulário de cadastro ─────────────────────
function AddProcedimentoForm({
                                 onSave,
                                 onCancel,
                                 loading,
                                 consultaId,
                             }: {
    onSave: (data: Omit<ProcedimentoTiss, "id" | "status" | "numeroAutorizacao">) => void;
    onCancel: () => void;
    loading: boolean;
    consultaId: string | number;
}) {
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const set = (field: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = () => {
        if (!form.codigoProcedimento.trim()) return toast.error("Informe o código do procedimento.");
        if (!form.descricao.trim()) return toast.error("Informe a descrição.");
        if (!form.valor || isNaN(Number(form.valor))) return toast.error("Informe um valor válido.");
        onSave({
            consultaId,
            codigoProcedimento: form.codigoProcedimento.trim(),
            descricao: form.descricao.trim(),
            valor: parseFloat(form.valor),
            quantidade: parseInt(form.quantidade) || 1,
            dataExecucao: form.dataExecucao,
            tipoAtendimento: form.tipoAtendimento,
            viaAcesso: form.viaAcesso,
            numeroGuia: form.numeroGuia || undefined,
            convenioNome: form.convenioNome || undefined,
            observacoes: form.observacoes || undefined,
        });
    };

    return (
        <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Código TISS *</Label>
                    <Input className="mt-1" value={form.codigoProcedimento} onChange={set("codigoProcedimento")} placeholder="Ex: 10101012" />
                </div>
                <div>
                    <Label>Data de Execução *</Label>
                    <Input className="mt-1" type="date" value={form.dataExecucao} onChange={set("dataExecucao")} />
                </div>
            </div>
            <div>
                <Label>Descrição *</Label>
                <Input className="mt-1" value={form.descricao} onChange={set("descricao")} placeholder="Ex: Consulta em clínica médica" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Valor (R$) *</Label>
                    <Input className="mt-1" type="number" step="0.01" min="0" value={form.valor} onChange={set("valor")} placeholder="0,00" />
                </div>
                <div>
                    <Label>Quantidade</Label>
                    <Input className="mt-1" type="number" min="1" value={form.quantidade} onChange={set("quantidade")} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Tipo de Atendimento</Label>
                    <select
                        className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        value={form.tipoAtendimento}
                        onChange={set("tipoAtendimento")}
                    >
                        {TIPOS_ATENDIMENTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <Label>Via de Acesso</Label>
                    <select
                        className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        value={form.viaAcesso}
                        onChange={set("viaAcesso")}
                    >
                        {VIAS_ACESSO.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Número da Guia</Label>
                    <Input className="mt-1" value={form.numeroGuia} onChange={set("numeroGuia")} placeholder="Ex: 202604100001" />
                </div>
                <div>
                    <Label>Convênio</Label>
                    <Input className="mt-1" value={form.convenioNome} onChange={set("convenioNome")} placeholder="Ex: Hapvida" />
                </div>
            </div>
            <div>
                <Label>Observações</Label>
                <Input className="mt-1" value={form.observacoes} onChange={set("observacoes")} placeholder="Observações adicionais..." />
            </div>
            <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                    {loading ? "Salvando..." : "Salvar Procedimento"}
                </Button>
                <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
            </div>
        </div>
    );
}

// ─── Card de procedimento ───────────────────────
function ProcedimentoCard({
                              proc,
                              onAutorizar,
                              onNegar,
                              canEdit,
                          }: {
    proc: ProcedimentoTiss;
    onAutorizar: (id: string | number, num: string) => void;
    onNegar: (id: string | number) => void;
    canEdit: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [autorizacaoDialog, setAutorizacaoDialog] = useState(false);
    const [numeroAutorizacao, setNumeroAutorizacao] = useState("");

    const statusReal = proc.statusAutorizacao ?? proc.status;
    const status: "PENDENTE" | "AUTORIZADO" | "NEGADO" =
        statusReal === "AUTORIZADO" || statusReal === "NEGADO"
            ? statusReal
            : proc.numeroAutorizacao
                ? "AUTORIZADO"
                : "PENDENTE";

    return (
        <div className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {proc.codigoProcedimento}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[status]}`}>
                            {STATUS_LABEL[status] ?? status}
                        </span>
                    </div>
                    <p className="font-medium text-sm mt-1 truncate">{proc.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {proc.quantidade}x · R$ {Number(proc.valor).toFixed(2)} · {proc.dataExecucao}
                        {proc.convenioNome && ` · ${proc.convenioNome}`}
                    </p>
                </div>
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {expanded && (
                <div className="pt-2 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span><strong>Tipo:</strong> {proc.tipoAtendimento}</span>
                        <span><strong>Via:</strong> {proc.viaAcesso?.replace("_", " ")}</span>
                        {proc.numeroGuia && <span><strong>Guia:</strong> {proc.numeroGuia}</span>}
                        {proc.numeroAutorizacao && <span><strong>Autorização:</strong> {proc.numeroAutorizacao}</span>}
                        {proc.observacoes && <span className="col-span-2"><strong>Obs:</strong> {proc.observacoes}</span>}
                    </div>
                    {/* Botões de ação apenas para PENDENTE — sem lixeira */}
                    {canEdit && status === "PENDENTE" && (
                        <div className="flex gap-2 pt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-green-400 text-green-700 hover:bg-green-50"
                                onClick={() => setAutorizacaoDialog(true)}
                            >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Autorizar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400 text-red-700 hover:bg-red-50"
                                onClick={() => onNegar(proc.id!)}
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Negar
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Dialog autorizar */}
            <Dialog open={autorizacaoDialog} onOpenChange={setAutorizacaoDialog}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Autorizar Procedimento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{proc.descricao}</p>
                        <div>
                            <Label>Número de Autorização</Label>
                            <Input
                                className="mt-1"
                                value={numeroAutorizacao}
                                onChange={e => setNumeroAutorizacao(e.target.value)}
                                placeholder="Ex: 987654321"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    if (!numeroAutorizacao.trim()) return toast.error("Informe o número de autorização.");
                                    onAutorizar(proc.id!, numeroAutorizacao.trim());
                                    setAutorizacaoDialog(false);
                                }}
                            >
                                Confirmar Autorização
                            </Button>
                            <Button variant="outline" onClick={() => setAutorizacaoDialog(false)}>Cancelar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Panel principal ────────────────────────────
export function ProcedimentosTissPanel({
                                           consulta,
                                           canEdit,
                                       }: {
    consulta: Consulta;
    canEdit: boolean;
}) {
    const queryClient = useQueryClient();
    const [addOpen, setAddOpen] = useState(false);

    const { data: procedimentos = [], isLoading } = useQuery({
        queryKey: ["procedimentos-tiss", consulta.id],
        queryFn: () => procedimentosTissApi.buscarPorConsulta(consulta.id!),
        enabled: !!consulta.id,
    });

    // Verifica se já existe pagamento PAGO ou PENDENTE para esta consulta
    const { data: pagamentoExistente } = useQuery({
        queryKey: ["pagamento-consulta", consulta.id],
        queryFn: async () => {
            const result = await pagamentosApi.buscar({ size: 100 });
            return result.conteudo.find(
                (p) =>
                    String(p.consulta?.id) === String(consulta.id) &&
                    (p.statusPagamento === "PAGO" || p.statusPagamento === "PENDENTE")
            ) ?? null;
        },
        enabled: !!consulta.id,
        staleTime: 0,
    });

    const jaTemPagamento = !!pagamentoExistente;

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["procedimentos-tiss", consulta.id] }).then(() =>
            queryClient.refetchQueries({ queryKey: ["procedimentos-tiss", consulta.id] })
        );

    const cadastrarMutation = useMutation({
        mutationFn: (dados: Omit<ProcedimentoTiss, "id" | "status" | "numeroAutorizacao">) =>
            procedimentosTissApi.cadastrar(dados),
        onSuccess: () => { invalidate(); setAddOpen(false); toast.success("Procedimento TISS cadastrado!"); },
        onError: () => toast.error("Erro ao cadastrar procedimento."),
    });

    const gerarPagamentoMutation = useMutation({
        mutationFn: () => procedimentosTissApi.gerarPagamento(consulta.id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
            queryClient.invalidateQueries({ queryKey: ["pagamentos-totais"] });
            queryClient.invalidateQueries({ queryKey: ["consultas-realizadas-sem-pagamento"] });
            queryClient.invalidateQueries({ queryKey: ["pagamento-consulta", consulta.id] });
            toast.success("Pagamento gerado com sucesso! Confira em Pagamentos.");
        },
        onError: (err: any) => {
            const msg = err?.message ?? "";
            if (msg.includes("já possui um pagamento")) {
                queryClient.invalidateQueries({ queryKey: ["pagamento-consulta", consulta.id] });
                toast.info("Esta consulta já possui pagamento registrado.");
            } else {
                toast.error(`Erro ao gerar pagamento: ${msg}`);
            }
        },
    });

    const autorizarMutation = useMutation({
        mutationFn: ({ id, num }: { id: string | number; num: string }) =>
            procedimentosTissApi.autorizar(id, num),
        onSuccess: async () => {
            await invalidate();
            toast.success("Procedimento autorizado!");

            // Após recarregar, verifica se todos estão autorizados para gerar pagamento
            const lista = await procedimentosTissApi.buscarPorConsulta(consulta.id!);
            const todosOk = lista.length > 0 && lista.every(
                (p) => (p.statusAutorizacao ?? p.status) === "AUTORIZADO" || !!p.numeroAutorizacao
            );

            if (todosOk && consulta.status === "REALIZADA" && !jaTemPagamento) {
                gerarPagamentoMutation.mutate();
            }
        },
        onError: () => toast.error("Erro ao autorizar procedimento."),
    });

    const negarMutation = useMutation({
        mutationFn: (id: string | number) => procedimentosTissApi.negar(id),
        onSuccess: () => { invalidate(); toast.success("Procedimento negado."); },
        onError: () => toast.error("Erro ao negar procedimento."),
    });

    const total = procedimentos.reduce((acc, p) => acc + (Number(p.valor) * (p.quantidade || 1)), 0);

    const todosAutorizados = procedimentos.length > 0 &&
        procedimentos.every(p =>
            (p.statusAutorizacao ?? p.status) === "AUTORIZADO" || !!p.numeroAutorizacao
        );
    const consultaRealizada = consulta.status === "REALIZADA";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-bold">Procedimentos TISS</h2>
                    {procedimentos.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {procedimentos.length} procedimento{procedimentos.length > 1 ? "s" : ""} · Total: R$ {total.toFixed(2)}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Botão só aparece se todos autorizados, consulta realizada e ainda não tem pagamento */}
                    {canEdit && todosAutorizados && consultaRealizada && !jaTemPagamento && (
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => gerarPagamentoMutation.mutate()}
                            disabled={gerarPagamentoMutation.isPending}
                        >
                            <CreditCard className="w-4 h-4 mr-1.5" />
                            {gerarPagamentoMutation.isPending ? "Gerando..." : `Gerar Pagamento · R$ ${total.toFixed(2)}`}
                        </Button>
                    )}
                    {jaTemPagamento && todosAutorizados && (
                        <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Pagamento gerado
                        </span>
                    )}
                    {canEdit && !addOpen && (
                        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                            <Plus className="w-4 h-4 mr-1.5" /> Adicionar
                        </Button>
                    )}
                </div>
            </div>

            {addOpen && (
                <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <p className="text-sm font-medium mb-3">Novo Procedimento TISS</p>
                    <AddProcedimentoForm
                        consultaId={consulta.id!}
                        onSave={dados => cadastrarMutation.mutate(dados)}
                        onCancel={() => setAddOpen(false)}
                        loading={cadastrarMutation.isPending}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">Carregando procedimentos...</div>
            ) : procedimentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nenhum procedimento TISS registrado.{canEdit && " Clique em Adicionar para incluir."}
                </p>
            ) : (
                <div className="space-y-2">
                    {procedimentos.map(proc => (
                        <ProcedimentoCard
                            key={proc.id}
                            proc={proc}
                            canEdit={canEdit}
                            onAutorizar={(id, num) => autorizarMutation.mutate({ id, num })}
                            onNegar={id => negarMutation.mutate(id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}