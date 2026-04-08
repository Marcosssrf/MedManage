import { consultasApi, pagamentosApi } from "../services/api";
import type { Pagamento } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Search, CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "../hooks/usePermissions";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

const FORMA_PAGAMENTO = ["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "TRANSFERENCIA", "CONVENIO", "BOLETO"];
const TIPO_PAGAMENTO = ["PARTICULAR", "CONVENIO", "PLANO_SAUDE"];

const STATUS_COLORS: Record<string, string> = {
    PENDENTE: "bg-warning/20 text-warning border-warning",
    PAGO: "bg-green-500/20 text-green-600 border-green-500",
    CANCELADO: "bg-destructive/20 text-destructive border-destructive",
};

function FormPagamento({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient();
    const [consultaSearch, setConsultaSearch] = useState("");
    const [consultaSelecionada, setConsultaSelecionada] = useState<{ id: string | number; label: string } | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [valor, setValor] = useState("");
    const [formaPagamento, setFormaPagamento] = useState("");
    const [tipoPagamento, setTipoPagamento] = useState("");
    const [data, setData] = useState(new Date().toISOString().split("T")[0]);
    const { data: pagamentos = [] } = useQuery({
        queryKey: ["pagamentos"],
        queryFn: pagamentosApi.listar,
    });

    const { data: consultas = [] } = useQuery({
        queryKey: ["consultas"],
        queryFn: consultasApi.listar,
    });

    const consultasRealizadas = consultas.filter((c) => {
        const jaTemPagamento = pagamentos.some((p) => String(p.consultaId) === String(c.id));
        return c.status === "REALIZADA" && !jaTemPagamento;
    });

    const suggestions = consultasRealizadas
        .filter((c) =>
            (c.pacienteNome ?? "").toLowerCase().includes(consultaSearch.toLowerCase()) ||
            (c.medicoNome ?? "").toLowerCase().includes(consultaSearch.toLowerCase())
        )
        .slice(0, 6);

    const mutation = useMutation({
        mutationFn: pagamentosApi.registrar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
            toast.success("Pagamento registrado com sucesso!");
            onSuccess();
        },
        onError: () => toast.error("Erro ao registrar pagamento."),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consultaSelecionada) return toast.error("Selecione uma consulta.");
        if (!valor) return toast.error("Informe o valor.");
        if (!formaPagamento) return toast.error("Selecione a forma de pagamento.");
        if (!tipoPagamento) return toast.error("Selecione o tipo de pagamento.");

        mutation.mutate({
            consultaId: consultaSelecionada.id,
            valor: parseFloat(valor),
            formaPagamento,
            tipoPagamento,
            data,
        });
    };

    const selectClass = "w-full h-10 px-3 border border-border rounded-lg bg-card text-sm text-foreground";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

            {/* Consulta com autocomplete */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Consulta <span className="text-destructive">*</span></label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar por paciente ou médico..."
                        value={consultaSelecionada ? consultaSelecionada.label : consultaSearch}
                        onChange={(e) => {
                            if (consultaSelecionada) return;
                            setConsultaSearch(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                    />
                    {consultaSelecionada && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg leading-none"
                            onClick={() => { setConsultaSelecionada(null); setConsultaSearch(""); }}
                        >×</button>
                    )}
                    {showSuggestions && !consultaSelecionada && suggestions.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {suggestions.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3"
                                    onMouseDown={() => {
                                        setConsultaSelecionada({
                                            id: c.id!,
                                            label: `${c.pacienteNome} — ${c.medicoNome} (${c.data} ${c.horario?.slice(0, 5)})`,
                                        });
                                        setConsultaSearch("");
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
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
                            Nenhuma consulta realizada encontrada.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Valor (R$) <span className="text-destructive">*</span></label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Data <span className="text-destructive">*</span></label>
                    <Input
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Forma de Pagamento <span className="text-destructive">*</span></label>
                <select className={selectClass} value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                    <option value="">Selecione</option>
                    {FORMA_PAGAMENTO.map((f) => (
                        <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Pagamento <span className="text-destructive">*</span></label>
                <select className={selectClass} value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value)}>
                    <option value="">Selecione</option>
                    {TIPO_PAGAMENTO.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
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

export default function Pagamentos() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();
    const { isAdmin, isSecretaria } = usePermissions();

    const { data: pagamentos = [], isLoading, error } = useQuery({
        queryKey: ["pagamentos"],
        queryFn: pagamentosApi.listar,
    });

    const confirmarMutation = useMutation({
        mutationFn: (id: string | number) => pagamentosApi.confirmar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagamentos"] });
            toast.success("Pagamento confirmado!");
        },
        onError: () => toast.error("Erro ao confirmar pagamento."),
    });

    const filtered = pagamentos
        .filter((p) =>
            (p.pacienteNome ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (p.medicoNome ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (p.data ?? "").toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.data.localeCompare(a.data));

    const { paginated, page, totalPages, next, prev, goTo } = usePagination(filtered ?? [], 10);

    const total = pagamentos.reduce((acc, p) => acc + (p.valor ?? 0), 0);
    const pago = pagamentos.filter((p) => p.status === "PAGO");
    const pendentes = pagamentos.filter((p) => p.status === "PENDENTE");
    const totalConfirmado = pago.reduce((acc, p) => acc + (p.valor ?? 0), 0);

    const formatValor = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Pagamentos"
                description="Gerencie os pagamentos da clínica"
                action={(isAdmin || isSecretaria) ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Pagamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Registrar Pagamento</DialogTitle>
                            </DialogHeader>
                            <FormPagamento onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                ) : undefined}
            />

            {/* Cards resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total geral</p>
                        <p className="text-2xl font-semibold">{formatValor(total)}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Confirmados</p>
                        <p className="text-2xl font-semibold text-green-600">{formatValor(totalConfirmado)}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-warning/10 p-3 rounded-lg">
                        <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-semibold">{pendentes.length}</p>
                    </div>
                </div>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por paciente, médico ou data..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tabela */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">
                        Carregando pagamentos...
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Erro ao carregar pagamentos. Verifique o backend.
                    </div>
                ) : !filtered.length ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{search ? "Nenhum pagamento encontrado." : "Nenhum pagamento registrado."}</p>
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
                                    {(isAdmin || isSecretaria) && (
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((p, i) => (
                                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                    {p.pacienteNome?.charAt(0).toUpperCase() ?? "?"}
                                                </div>
                                                <span className="font-medium">{p.pacienteNome ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-primary">{p.medicoNome ?? "—"}</td>
                                        <td className="py-3 px-4 font-semibold">{formatValor(p.valor)}</td>
                                        <td className="py-3 px-4 text-muted-foreground text-xs">{p.formaPagamento?.replace("_", " ")}</td>
                                        <td className="py-3 px-4 text-muted-foreground text-xs">{p.tipoPagamento?.replace("_", " ")}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{p.data}</td>
                                        <td className="py-3 px-4">
                                            <Badge className={`text-xs border ${STATUS_COLORS[p.status] ?? "bg-muted text-muted-foreground"}`}>
                                                {p.status}
                                            </Badge>
                                        </td>
                                        {(isAdmin || isSecretaria) && (
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-600 hover:bg-green-500/10"
                                                    disabled={p.status === "PAGO" || confirmarMutation.isPending}
                                                    onClick={() => confirmarMutation.mutate(p.id!)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    {p.status === "PAGO" ? "Confirmado" : "Confirmar"}
                                                </Button>
                                            </td>
                                        )}
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
                            {filtered.length} pagamento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}