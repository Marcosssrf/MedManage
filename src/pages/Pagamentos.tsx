import type {Pagamento, PagamentoResponseDTO} from "../services/api";
import {consultasApi, pagamentosApi} from "../services/api";
import {keepPreviousData, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import PageHeader from "../components/PageHeader";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Badge} from "../components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../components/ui/dialog";
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    Download,
    Loader2,
    Plus,
    Search,
    TrendingUp,
    X,
} from "lucide-react";
import {toast} from "sonner";
import {usePermissions} from "../hooks/usePermissions";
import {Skeleton, SkeletonTableBody} from "../components/ui/skeleton";
import {useDebounce} from "../hooks/useDebounce";

const PAGE_SIZE = 20;

const FORMA_PAGAMENTO = ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "TRANSFERENCIA", "BOLETO"];
const TIPO_PAGAMENTO  = ["PARTICULAR", "PLANO_SAUDE"];

const STATUS_COLORS: Record<string, string> = {
    PENDENTE:  "bg-warning/20 text-warning border-warning",
    PAGO:      "bg-green-500/20 text-green-600 border-green-500",
    CANCELADO: "bg-destructive/20 text-destructive border-destructive",
};

// ─── Paginação servidor ───────────────────────────────────────────────────────

function PaginacaoServidor({
                               paginaAtual,
                               totalPaginas,
                               totalElementos,
                               tamanhoPagina,
                               onMudar,
                               isLoading,
                           }: {
    paginaAtual:     number;
    totalPaginas:    number;
    totalElementos:  number;
    tamanhoPagina:   number;
    onMudar:         (p: number) => void;
    isLoading:       boolean;
}) {
    const inicio = paginaAtual * tamanhoPagina + 1;
    const fim    = Math.min((paginaAtual + 1) * tamanhoPagina, totalElementos);

    if (totalPaginas <= 1) {
        return (
            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                {totalElementos} pagamento{totalElementos !== 1 ? "s" : ""} encontrado{totalElementos !== 1 ? "s" : ""}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
                {inicio}–{fim} de {totalElementos} pagamento{totalElementos !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"
                        onClick={() => onMudar(paginaAtual - 1)}
                        disabled={paginaAtual === 0 || isLoading}
                        className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPaginas }, (_, i) => i)
                    .filter(i => i === 0 || i === totalPaginas - 1 || Math.abs(i - paginaAtual) <= 1)
                    .reduce<(number | "…")[]>((acc, curr, idx, arr) => {
                        if (idx > 0 && curr - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(curr);
                        return acc;
                    }, [])
                    .map((item, i) =>
                        item === "…" ? (
                            <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                        ) : (
                            <Button key={item}
                                    variant={item === paginaAtual ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onMudar(item as number)}
                                    disabled={isLoading}
                                    className="h-8 w-8 p-0 text-xs">
                                {(item as number) + 1}
                            </Button>
                        )
                    )
                }

                <Button variant="ghost" size="sm"
                        onClick={() => onMudar(paginaAtual + 1)}
                        disabled={paginaAtual >= totalPaginas - 1 || isLoading}
                        className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// ─── Formulário de novo pagamento (inalterado) ────────────────────────────────

function FormPagamento({ onSuccess, initialData }: { onSuccess: () => void; initialData?: { consultaId: string | number; label: string; valor: number; data: string } }) {
    const queryClient = useQueryClient();
    const [consultaSearch, setConsultaSearch] = useState("");
    const [consultaSelecionada, setConsultaSelecionada] = useState<{ id: string | number; label: string } | null>(
        initialData ? { id: initialData.consultaId, label: initialData.label } : null
    );
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [valor, setValor] = useState(initialData ? String(initialData.valor) : "");
    const [formaPagamento, setFormaPagamento] = useState("");
    const [tipoPagamento, setTipoPagamento] = useState("");
    const [data, setData] = useState(initialData?.data ?? new Date().toISOString().split("T")[0]);
    const [numeroParcelas, setNumeroParcelas] = useState(1);

    // Busca consultas realizadas sem pagamento ativo para o autocomplete
    const { data: consultasRealizadas = [] } = useQuery({
        queryKey: ["consultas-realizadas-sem-pagamento"],
        queryFn: async () => {
            // Busca todas as páginas de pagamentos para não perder nenhuma consulta já paga
            const primeira = await pagamentosApi.buscar({ size: 100, page: 0 });
            const demais = primeira.totalPaginas > 1
                ? await Promise.all(
                    Array.from({ length: primeira.totalPaginas - 1 }, (_, i) =>
                        pagamentosApi.buscar({ size: 100, page: i + 1 }).then(r => r.conteudo)
                    )
                )
                : [];
            const todosPagamentos = [...primeira.conteudo, ...demais.flat()];

            const consultasComPagamentoAtivo = new Set(
                todosPagamentos
                    .filter((p) => p.statusPagamento === "PAGO" || p.statusPagamento === "PENDENTE")
                    .map((p) => String(p.consulta?.id ?? ""))
            );

            const consultas = await consultasApi.listar();
            return consultas.filter((c) =>
                c.status === "REALIZADA" && !consultasComPagamentoAtivo.has(String(c.id))
            );
        },
        staleTime: 0,
    });

    const suggestions = consultasRealizadas
        .filter((c) =>
            (c.pacienteNome ?? "").toLowerCase().includes(consultaSearch.toLowerCase()) ||
            (c.medicoNome  ?? "").toLowerCase().includes(consultaSearch.toLowerCase())
        ).slice(0, 6);

    const mutation = useMutation({
        mutationFn: (d: Omit<Pagamento, "id" | "status">) => pagamentosApi.registrar(d),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
            queryClient.invalidateQueries({ queryKey: ["consultas-realizadas-sem-pagamento"] });
            toast.success("Pagamento registrado!");
            onSuccess();
        },
        onError: (err: any) => {
            const msg = err?.message ?? "";
            // Força recarregamento imediato da lista (remove consultas já pagas)
            queryClient.refetchQueries({ queryKey: ["consultas-realizadas-sem-pagamento"] });
            if (msg.includes("já foi paga")) {
                toast.error("Esta consulta já possui pagamento. A lista foi atualizada.");
                setConsultaSelecionada(null);
                setConsultaSearch("");
            } else {
                toast.error(`Erro ao registrar pagamento: ${msg}`);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consultaSelecionada) return toast.error("Selecione uma consulta.");
        if (!valor)              return toast.error("Informe o valor.");
        if (!formaPagamento)     return toast.error("Selecione a forma de pagamento.");
        if (!tipoPagamento)      return toast.error("Selecione o tipo de pagamento.");
        mutation.mutate({ consultaId: consultaSelecionada.id, valor: parseFloat(valor), formaPagamento, tipoPagamento, data, numeroParcelas });
    };

    const sel = "w-full h-10 px-3 border border-border rounded-lg bg-card text-sm text-foreground";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Consulta <span className="text-destructive">*</span></label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Buscar por paciente ou médico..."
                           value={consultaSelecionada ? consultaSelecionada.label : consultaSearch}
                           onChange={(e) => { if (consultaSelecionada) return; setConsultaSearch(e.target.value); setShowSuggestions(true); }}
                           onFocus={() => setShowSuggestions(true)}
                           onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                           autoComplete="off"
                    />
                    {consultaSelecionada && (
                        <button type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg"
                                onClick={() => { setConsultaSelecionada(null); setConsultaSearch(""); }}>×</button>
                    )}
                    {showSuggestions && !consultaSelecionada && suggestions.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {suggestions.map((c) => (
                                <button key={c.id} type="button"
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3"
                                        onMouseDown={() => {
                                            setConsultaSelecionada({ id: c.id!, label: `${c.pacienteNome} — ${c.medicoNome} (${c.data} ${c.horario?.slice(0, 5)})` });
                                            setConsultaSearch(""); setShowSuggestions(false);
                                        }}>
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                        {c.pacienteNome?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{c.pacienteNome}</p>
                                        <p className="text-xs text-muted-foreground">{c.medicoNome} · {c.data} {c.horario?.slice(0, 5)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {showSuggestions && !consultaSelecionada && consultaSearch.length > 0 && suggestions.length === 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg p-3 text-sm text-muted-foreground text-center">
                            Nenhuma consulta encontrada.
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Valor (R$) <span className="text-destructive">*</span></label>
                    <Input type="number" min="0" step="0.01" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Data <span className="text-destructive">*</span></label>
                    <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Forma de Pagamento <span className="text-destructive">*</span></label>
                <select className={sel} value={formaPagamento} onChange={(e) => { setFormaPagamento(e.target.value); if (e.target.value !== "CARTAO_CREDITO") setNumeroParcelas(1); }}>
                    <option value="">Selecione</option>
                    {FORMA_PAGAMENTO.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
                </select>
            </div>
            {formaPagamento === "CARTAO_CREDITO" && (
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Parcelas <span className="text-destructive">*</span></label>
                    <select className={sel} value={numeroParcelas} onChange={(e) => setNumeroParcelas(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n}x {n === 1 ? "(à vista)" : `de R$ ${valor ? (parseFloat(valor) / n).toFixed(2) : "0,00"}`}</option>
                        ))}
                    </select>
                </div>
            )}
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Pagamento <span className="text-destructive">*</span></label>
                <select className={sel} value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value)}>
                    <option value="">Selecione</option>
                    {TIPO_PAGAMENTO.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Registrando..." : "Registrar pagamento"}
                </Button>
            </div>
        </form>
    );
}

// ─── Export CSV (opera sobre os dados da página atual visível) ────────────────

function exportToCSV(pagamentos: PagamentoResponseDTO[]) {
    const headers = ["Paciente", "Médico", "Valor (R$)", "Forma", "Tipo", "Data", "Status"];
    const rows = pagamentos.map((p) => [
        p.consulta?.pacienteNome ?? "—",
        p.consulta?.medicoNome   ?? "—",
        Number(p.valor).toFixed(2).replace(".", ","),
        p.formaPagamento?.replace(/_/g, " ") ?? "",
        p.tipoPagamento?.replace(/_/g, " ")  ?? "",
        p.dataPagamento ? String(p.dataPagamento) : "",
        p.statusPagamento ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pagamentos_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
}

// ─── Listagem principal ───────────────────────────────────────────────────────

// Gera primeiro e último dia de um mês "YYYY-MM"
function mesParaIntervalo(mes: string): { dataInicio: string; dataFim: string } {
    const [ano, m] = mes.split("-").map(Number);
    const ultimo = new Date(ano, m, 0).getDate();
    return {
        dataInicio: `${mes}-01`,
        dataFim:    `${mes}-${String(ultimo).padStart(2, "0")}`,
    };
}

// Lista últimos 24 meses para o select
function mesesDisponiveis() {
    const lista: { value: string; label: string }[] = [];
    const agora = new Date();
    for (let i = 0; i < 24; i++) {
        const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        lista.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return lista;
}

export default function Pagamentos() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterMes, setFilterMes] = useState(""); // "YYYY-MM" ou "" = todos
    const [page, setPage] = useState(0); // 0-based para o backend

    const queryClient = useQueryClient();
    const { isAdmin, isSecretaria } = usePermissions();
    const canEdit = isAdmin || isSecretaria;

    // Debounce apenas no search de texto — filtros de data/status disparam imediato
    const searchDebounced = useDebounce(search, 400);

    // Deriva datas do mês selecionado
    const { dataInicio: filterDataInicio, dataFim: filterDataFim } = filterMes
        ? mesParaIntervalo(filterMes)
        : { dataInicio: "", dataFim: "" };

    // Reseta para página 0 quando qualquer filtro muda
    useEffect(() => { setPage(0); }, [searchDebounced, filterStatus, filterMes]);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["pagamentos", searchDebounced, filterStatus, filterDataInicio, filterDataFim, page],
        queryFn: () => pagamentosApi.buscar({
            search:     searchDebounced || undefined,
            status:     filterStatus    || undefined,
            dataInicio: filterDataInicio || undefined,
            dataFim:    filterDataFim    || undefined,
            page,
            size: PAGE_SIZE,
        }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    // Query separada para totais reais — respeita o máx de 100 do backend,
    // busca todas as páginas em paralelo se necessário.
    const { data: dadosTotais } = useQuery({
        queryKey: ["pagamentos-totais", searchDebounced, filterStatus, filterDataInicio, filterDataFim],
        queryFn: async () => {
            const params = {
                search:     searchDebounced || undefined,
                status:     filterStatus    || undefined,
                dataInicio: filterDataInicio || undefined,
                dataFim:    filterDataFim    || undefined,
                size: 100,
            };
            // Busca a 1ª página para saber quantas páginas existem
            const primeira = await pagamentosApi.buscar({ ...params, page: 0 });
            if (primeira.totalPaginas <= 1) return primeira.conteudo;
            // Busca o restante em paralelo
            const demais = await Promise.all(
                Array.from({ length: primeira.totalPaginas - 1 }, (_, i) =>
                    pagamentosApi.buscar({ ...params, page: i + 1 }).then(r => r.conteudo)
                )
            );
            return [...primeira.conteudo, ...demais.flat()];
        },
        staleTime: 30_000,
    });

    const confirmarMutation = useMutation({
        mutationFn: (id: string | number) => pagamentosApi.confirmar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
            queryClient.invalidateQueries({ queryKey: ["pagamentos-totais"] });
            toast.success("Pagamento confirmado!");
        },
        onError: () => toast.error("Erro ao confirmar pagamento."),
    });

    const hasFilters = !!(filterStatus || filterMes);
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const sel = "h-9 px-3 border border-border rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

    const pagamentos       = data?.conteudo        ?? [];
    const totalPaginas     = data?.totalPaginas     ?? 1;
    const totalElementos   = data?.totalElementos   ?? 0;

    // Métricas calculadas sobre TODOS os registros (não só a página atual)
    const todosPagamentos = dadosTotais ?? [];
    const totalGeral      = todosPagamentos.reduce((s, p) => s + Number(p.valor ?? 0), 0);
    const totalPago       = todosPagamentos.filter(p => p.statusPagamento === "PAGO").reduce((s, p) => s + Number(p.valor ?? 0), 0);
    const totalPendentes  = todosPagamentos.filter(p => p.statusPagamento === "PENDENTE").length;

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Pagamentos"
                description="Gerencie os pagamentos da clínica"
                action={canEdit ? (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"
                                onClick={() => exportToCSV(pagamentos)}
                                disabled={!pagamentos.length}>
                            <Download className="w-4 h-4 mr-2" />Exportar CSV
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" />Novo Pagamento</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
                                <FormPagamento onSuccess={() => setOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : undefined}
            />

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    [0, 1, 2].map(i => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                            <Skeleton className="w-11 h-11 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-7 w-32" />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg"><CreditCard className="w-5 h-5 text-primary" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {filterMes ? "Total do mês" : hasFilters || searchDebounced ? "Total filtrado" : "Total geral"}
                                </p>
                                <p className="text-2xl font-semibold">{fmt(totalGeral)}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-green-500/10 p-3 rounded-lg"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Confirmados</p>
                                <p className="text-2xl font-semibold text-green-600">{fmt(totalPago)}</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-warning/10 p-3 rounded-lg"><Clock className="w-5 h-5 text-warning" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                                <p className="text-2xl font-semibold">{totalPendentes}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por paciente ou médico..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {search !== searchDebounced && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                </div>

                <select className={sel} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="PAGO">Pago</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>

                <select className={sel} style={{ minWidth: 180 }} value={filterMes} onChange={(e) => setFilterMes(e.target.value)}>
                    <option value="">Todos os meses</option>
                    {mesesDisponiveis().map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>

                {(hasFilters || search) && (
                    <Button variant="ghost" size="sm"
                            onClick={() => { setFilterStatus(""); setFilterMes(""); setSearch(""); }}
                            className="text-muted-foreground">
                        <X className="w-4 h-4 mr-1" />Limpar filtros
                    </Button>
                )}
            </div>

            {/* Tabela */}
            <div className={`bg-card rounded-xl border border-border overflow-hidden transition-opacity ${isFetching && !isLoading ? "opacity-70" : "opacity-100"}`}>
                {error ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Erro ao carregar pagamentos. Verifique o backend.
                    </div>
                ) : isLoading ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border bg-muted/50">
                                {["#", "Paciente", "Médico", "Valor", "Forma", "Tipo", "Data", "Status", ...(canEdit ? ["Ações"] : [])].map(h => (
                                    <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody><SkeletonTableBody rows={8} cols={canEdit ? 9 : 8} /></tbody>
                        </table>
                    </div>
                ) : pagamentos.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{search || hasFilters ? "Nenhum pagamento encontrado com esses filtros." : "Nenhum pagamento registrado."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Paciente</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médico</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Forma</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                {canEdit && <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {pagamentos.map((p, i) => (
                                <tr key={String(p.id)}
                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                                        {page * PAGE_SIZE + i + 1}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                {p.consulta?.pacienteNome?.charAt(0).toUpperCase() ?? "?"}
                                            </div>
                                            <span className="font-medium">{p.consulta?.pacienteNome ?? "—"}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-primary">{p.consulta?.medicoNome ?? "—"}</td>
                                    <td className="py-3 px-4 font-semibold">{fmt(Number(p.valor))}</td>
                                    <td className="py-3 px-4 text-muted-foreground text-xs">{p.formaPagamento?.replace(/_/g, " ")}</td>
                                    <td className="py-3 px-4 text-muted-foreground text-xs">{p.tipoPagamento?.replace(/_/g, " ")}</td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {p.dataPagamento
                                            ? String(p.dataPagamento).split("-").reverse().join("/")
                                            : "—"}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge className={`text-xs border ${STATUS_COLORS[p.statusPagamento ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                                            {p.statusPagamento}
                                        </Badge>
                                    </td>
                                    {canEdit && (
                                        <td className="py-3 px-4">
                                            <Button variant="ghost" size="sm"
                                                    className="text-green-600 hover:text-green-600 hover:bg-green-500/10"
                                                    disabled={p.statusPagamento === "PAGO" || confirmarMutation.isPending}
                                                    onClick={() => confirmarMutation.mutate(p.id!)}>
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                {p.statusPagamento === "PAGO" ? "Confirmado" : "Confirmar"}
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <PaginacaoServidor
                            paginaAtual={page}
                            totalPaginas={totalPaginas}
                            totalElementos={totalElementos}
                            tamanhoPagina={PAGE_SIZE}
                            onMudar={setPage}
                            isLoading={isFetching}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}