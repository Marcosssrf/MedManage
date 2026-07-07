import {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    AlertCircle,
    Award,
    BarChart2,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Download,
    Stethoscope,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import {pagamentosApi, relatoriosApi} from "../services/api";
import PageHeader from "../components/PageHeader";
import {Button} from "../components/ui/button";
import {Skeleton} from "../components/ui/skeleton";
import {toast} from "sonner";

// ─── Constantes ──────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_EN    = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtShort = (v: number) => {
    if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `R$${(v / 1_000).toFixed(0)}k`;
    return fmt(v);
};

// ─── Export CSV ──────────────────────────────────────────────────────────────

function exportFaturamentoCSV(data: { mes: string; valor: number }[], ano: number) {
    const rows = data.map((r) => [`"${r.mes}"`, r.valor.toFixed(2).replace(".", ",")]);
    const csv  = [["Mês", "Faturamento (R$)"], ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `faturamento_${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
}

// ─── Tooltip customizado ──────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-md text-sm">
            <p className="font-medium text-foreground mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} className="text-muted-foreground">
                    {p.name}: <span className="font-semibold text-foreground">{fmt(p.value)}</span>
                </p>
            ))}
        </div>
    );
}

// ─── Cards de KPI ────────────────────────────────────────────────────────────

function KpiCard({
                     icon: Icon, label, value, sub, color, loading,
                 }: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    color: string;
    loading?: boolean;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ) : (
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-semibold mt-0.5 truncate">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Card do médico top ───────────────────────────────────────────────────────

function MedicoTopCard({ loading }: { loading: boolean }) {
    const { data: medicoTop, error } = useQuery({
        queryKey: ["medico-mais-atendido"],
        queryFn:  relatoriosApi.medicoMaisAtendido,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-medium">Médico mais atendido</h2>
                <span className="ml-auto text-xs text-muted-foreground">Acumulado</span>
            </div>

            {loading || (!medicoTop && !error) ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ) : error || !medicoTop ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 py-6">
                    <AlertCircle className="w-8 h-8 opacity-30" />
                    <p className="text-sm">Nenhum dado disponível</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-18 h-18 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 text-3xl font-bold w-[72px] h-[72px]">
                            {(medicoTop as any).nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1">
                            <Award className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="font-semibold text-base leading-tight">
                            {(medicoTop as any).nome}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {(medicoTop as any).totalConsultas} consulta
                            {(medicoTop as any).totalConsultas !== 1 ? "s" : ""} realizadas
                        </p>
                    </div>

                    {/* Barra decorativa */}
                    <div className="w-full mt-2 space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Desempenho</span>
                            <span className="text-amber-600 font-medium">★ Top</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-700"
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Gráfico de faturamento ───────────────────────────────────────────────────

function FaturamentoChart({
                              data,
                              loading,
                              ano,
                          }: {
    data: { mes: string; valor: number; valorAnt?: number }[];
    loading: boolean;
    ano: number;
}) {
    const [view, setView] = useState<"bar" | "line">("bar");
    const media = useMemo(
        () => data.reduce((s, d) => s + d.valor, 0) / (data.filter((d) => d.valor > 0).length || 1),
        [data]
    );

    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-sm font-medium flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" />
                        Faturamento mensal — {ano}
                    </h2>
                    {!loading && data.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Média: {fmt(media)} / mês
                        </p>
                    )}
                </div>
                {/* Toggle bar/line */}
                <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
                    <button
                        onClick={() => setView("bar")}
                        className={`px-3 py-1.5 transition-colors ${view === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        Barras
                    </button>
                    <button
                        onClick={() => setView("line")}
                        className={`px-3 py-1.5 transition-colors ${view === "line" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        Linha
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-[240px] flex items-end gap-2 px-2 pb-4">
                    {MONTHS_SHORT.map((m) => (
                        <div key={m} className="flex-1 flex flex-col items-center justify-end gap-1">
                            <Skeleton
                                className="w-full rounded-sm"
                                style={{ height: `${Math.random() * 60 + 20}%` }}
                            />
                            <Skeleton className="h-3 w-6" />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <BarChart2 className="w-8 h-8 opacity-30" />
                    <p className="text-sm">Nenhum dado de faturamento para {ano}</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    {view === "bar" ? (
                        <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 2" opacity={0.5} />
                            <XAxis
                                dataKey="mes"
                                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtShort}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                            <ReferenceLine
                                y={media}
                                stroke="var(--muted-foreground)"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                                label={{
                                    value: "Média",
                                    fill: "var(--muted-foreground)",
                                    fontSize: 11,
                                    position: "insideTopRight",
                                }}
                            />
                            <Bar
                                dataKey="valor"
                                name="Faturamento"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                                opacity={0.9}
                            />
                        </BarChart>
                    ) : (
                        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border)" strokeDasharray="4 2" opacity={0.5} />
                            <XAxis
                                dataKey="mes"
                                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmtShort}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                                y={media}
                                stroke="var(--muted-foreground)"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                            <Line
                                type="monotone"
                                dataKey="valor"
                                name="Faturamento"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    );
}

// ─── Tabela mensal ────────────────────────────────────────────────────────────

function TabelaMensal({
                          data,
                          loading,
                          ano,
                      }: {
    data: { mes: string; valor: number; index: number }[];
    loading: boolean;
    ano: number;
}) {
    const total   = data.reduce((s, d) => s + d.valor, 0);
    const meses   = data.filter((d) => d.valor > 0).length;
    const mesAtual = new Date().getMonth(); // 0-based

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-sm font-medium">Detalhamento por mês</h2>
                {!loading && (
                    <p className="text-xs text-muted-foreground">
                        {meses} {meses !== 1 ? "meses" : "mês"} com movimentação
                    </p>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Mês</th>
                        <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Faturamento</th>
                        <th className="text-right py-2.5 px-4 font-medium text-muted-foreground hidden sm:table-cell">% do total</th>
                        <th className="text-left py-2.5 px-4 font-medium text-muted-foreground hidden md:table-cell">Distribuição</th>
                        <th className="text-right py-2.5 px-4 font-medium text-muted-foreground hidden lg:table-cell">Var. anterior</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-b border-border">
                                {[1, 2, 3, 4, 5].map((c) => (
                                    <td key={c} className="py-3 px-4">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        data.map((row, i) => {
                            const pct     = total > 0 ? (row.valor / total) * 100 : 0;
                            const prev    = i > 0 ? data[i - 1].valor : null;
                            const varPct  = prev && prev > 0 ? ((row.valor - prev) / prev) * 100 : null;
                            const isHoje  = row.index === mesAtual && new Date().getFullYear() === ano;

                            return (
                                <tr
                                    key={row.mes}
                                    className={`border-b border-border last:border-0 transition-colors ${
                                        isHoje ? "bg-primary/5" : "hover:bg-muted/30"
                                    }`}
                                >
                                    <td className="py-3 px-4 font-medium">
                                            <span className="flex items-center gap-2">
                                                {row.mes}
                                                {isHoje && (
                                                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">
                                                        atual
                                                    </span>
                                                )}
                                            </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                                        {row.valor > 0 ? fmt(row.valor) : (
                                            <span className="text-muted-foreground font-normal">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell tabular-nums">
                                        {row.valor > 0 ? `${pct.toFixed(1)}%` : "—"}
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full max-w-[120px]">
                                            <div
                                                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                                        {varPct !== null ? (
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                                varPct > 0
                                                    ? "text-green-600"
                                                    : varPct < 0
                                                        ? "text-destructive"
                                                        : "text-muted-foreground"
                                            }`}>
                                                    {varPct > 0 ? (
                                                        <TrendingUp className="w-3 h-3" />
                                                    ) : varPct < 0 ? (
                                                        <TrendingDown className="w-3 h-3" />
                                                    ) : null}
                                                {varPct > 0 ? "+" : ""}{varPct.toFixed(1)}%
                                                </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                    {!loading && total > 0 && (
                        <tfoot>
                        <tr className="bg-muted/50 border-t border-border font-medium">
                            <td className="py-3 px-4">Total {ano}</td>
                            <td className="py-3 px-4 text-right tabular-nums">{fmt(total)}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground hidden sm:table-cell">100%</td>
                            <td className="hidden md:table-cell" />
                            <td className="hidden lg:table-cell" />
                        </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Relatorios() {
    const anoAtual = new Date().getFullYear();
    const [ano, setAno] = useState(anoAtual);

    const { data: faturamentoRaw, isLoading: loadFat, error: errFat } = useQuery({
        queryKey: ["faturamento", ano],
        queryFn:  () => relatoriosApi.faturamentoPorMes(ano),
        staleTime: 5 * 60 * 1000,
    });

    // Helpers de data
    const hoje     = new Date();
    const anoKpi   = hoje.getFullYear();
    const mesKpi   = hoje.getMonth() + 1; // 1-based
    const mesAntN  = mesKpi === 1 ? 12 : mesKpi - 1;
    const anoAntN  = mesKpi === 1 ? anoKpi - 1 : anoKpi;
    const pad      = (n: number) => String(n).padStart(2, "0");
    const ultimoDia = (a: number, m: number) => new Date(a, m, 0).getDate();

    const inicioMes    = `${anoKpi}-${pad(mesKpi)}-01`;
    const fimMes       = `${anoKpi}-${pad(mesKpi)}-${ultimoDia(anoKpi, mesKpi)}`;
    const inicioMesAnt = `${anoAntN}-${pad(mesAntN)}-01`;
    const fimMesAnt    = `${anoAntN}-${pad(mesAntN)}-${ultimoDia(anoAntN, mesAntN)}`;

    // Pagamentos PAGO do mês atual
    const { data: pagMesData, isLoading: loadPagMes } = useQuery({
        queryKey: ["pagamentos-totais-mes", inicioMes, fimMes],
        queryFn: async () => {
            const r = await pagamentosApi.buscar({ status: "PAGO", dataInicio: inicioMes, dataFim: fimMes, size: 100, page: 0 });
            if (r.totalPaginas <= 1) return r.conteudo;
            const rest = await Promise.all(
                Array.from({ length: r.totalPaginas - 1 }, (_, i) =>
                    pagamentosApi.buscar({ status: "PAGO", dataInicio: inicioMes, dataFim: fimMes, size: 100, page: i + 1 }).then(x => x.conteudo)
                )
            );
            return [...r.conteudo, ...rest.flat()];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Pagamentos PAGO do mês anterior
    const { data: pagMesAntData, isLoading: loadPagMesAnt } = useQuery({
        queryKey: ["pagamentos-totais-mes-ant", inicioMesAnt, fimMesAnt],
        queryFn: async () => {
            const r = await pagamentosApi.buscar({ status: "PAGO", dataInicio: inicioMesAnt, dataFim: fimMesAnt, size: 100, page: 0 });
            if (r.totalPaginas <= 1) return r.conteudo;
            const rest = await Promise.all(
                Array.from({ length: r.totalPaginas - 1 }, (_, i) =>
                    pagamentosApi.buscar({ status: "PAGO", dataInicio: inicioMesAnt, dataFim: fimMesAnt, size: 100, page: i + 1 }).then(x => x.conteudo)
                )
            );
            return [...r.conteudo, ...rest.flat()];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Total geral PAGO (acumulado)
    const { data: pagTotalData, isLoading: loadPagTotal } = useQuery({
        queryKey: ["pagamentos-totais-geral"],
        queryFn: async () => {
            const r = await pagamentosApi.buscar({ status: "PAGO", size: 100, page: 0 });
            if (r.totalPaginas <= 1) return r.conteudo;
            const rest = await Promise.all(
                Array.from({ length: r.totalPaginas - 1 }, (_, i) =>
                    pagamentosApi.buscar({ status: "PAGO", size: 100, page: i + 1 }).then(x => x.conteudo)
                )
            );
            return [...r.conteudo, ...rest.flat()];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Total PENDENTE (a receber)
    const { data: pagPendenteData, isLoading: loadPagPendente } = useQuery({
        queryKey: ["pagamentos-totais-pendente"],
        queryFn: async () => {
            const r = await pagamentosApi.buscar({ status: "PENDENTE", size: 100, page: 0 });
            if (r.totalPaginas <= 1) return r.conteudo;
            const rest = await Promise.all(
                Array.from({ length: r.totalPaginas - 1 }, (_, i) =>
                    pagamentosApi.buscar({ status: "PENDENTE", size: 100, page: i + 1 }).then(x => x.conteudo)
                )
            );
            return [...r.conteudo, ...rest.flat()];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Normaliza { JANUARY: 1200, ... } → array ordenado por mês
    const faturamentoData = useMemo(() => {
        if (!faturamentoRaw) return [];
        return MONTHS_EN.map((key, i) => ({
            mes:   MONTHS_SHORT[i],
            valor: (faturamentoRaw[key] ?? faturamentoRaw[key.charAt(0) + key.slice(1).toLowerCase()] ?? 0) as number,
            index: i,
        }));
    }, [faturamentoRaw]);

    // KPIs calculados a partir das queries dedicadas
    const kpis = useMemo(() => {
        const pagMes    = pagMesData    ?? [];
        const pagMesAnt = pagMesAntData ?? [];
        const pagTotal  = pagTotalData  ?? [];
        const pagPend   = pagPendenteData ?? [];

        const totalMes    = pagMes.reduce((s, p) => s + Number(p.valor ?? 0), 0);
        const totalMesAnt = pagMesAnt.reduce((s, p) => s + Number(p.valor ?? 0), 0);
        const varMes      = totalMesAnt > 0 ? ((totalMes - totalMesAnt) / totalMesAnt) * 100 : null;
        const totalGeral  = pagTotal.reduce((s, p) => s + Number(p.valor ?? 0), 0);
        const pendentes   = pagPend.reduce((s, p) => s + Number(p.valor ?? 0), 0);
        const ticketMedio = pagMes.length > 0 ? totalMes / pagMes.length : 0;

        return { totalMes, totalMesAnt, varMes, totalGeral, pendentes, ticketMedio, qntMes: pagMes.length };
    }, [pagMesData, pagMesAntData, pagTotalData, pagPendenteData]);

    const loadPag = loadPagMes || loadPagMesAnt || loadPagTotal || loadPagPendente;

    const loading = loadFat || loadPag;
    const mesNome = MONTHS_SHORT[new Date().getMonth()];

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Relatórios"
                description="Análise financeira e desempenho da clínica"
                action={
                    <div className="flex items-center gap-2">
                        {/* Seletor de ano */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
                            <button
                                onClick={() => setAno((a) => a - 1)}
                                className="p-2 hover:bg-muted transition-colors"
                                title="Ano anterior"
                            >
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <span className="px-3 text-sm font-medium tabular-nums">{ano}</span>
                            <button
                                onClick={() => setAno((a) => Math.min(a + 1, anoAtual))}
                                disabled={ano >= anoAtual}
                                className="p-2 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Próximo ano"
                            >
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportFaturamentoCSV(faturamentoData, ano)}
                            disabled={loading || faturamentoData.length === 0}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                    </div>
                }
            />

            {/* Erro de carregamento */}
            {errFat && (
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Erro ao carregar dados de faturamento. Verifique o backend.
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={TrendingUp}
                    label={`Faturamento — ${mesNome}`}
                    value={loading ? "..." : fmt(kpis.totalMes)}
                    sub={
                        kpis.varMes !== null
                            ? `${kpis.varMes > 0 ? "+" : ""}${kpis.varMes.toFixed(1)}% vs mês anterior`
                            : undefined
                    }
                    color={
                        kpis.varMes === null
                            ? "bg-primary/10 text-primary"
                            : kpis.varMes >= 0
                                ? "bg-green-500/10 text-green-600"
                                : "bg-destructive/10 text-destructive"
                    }
                    loading={loading}
                />
                <KpiCard
                    icon={DollarSign}
                    label="Receita total acumulada"
                    value={loading ? "..." : fmt(kpis.totalGeral)}
                    sub="Somente pagamentos confirmados"
                    color="bg-blue-500/10 text-blue-500"
                    loading={loading}
                />
                <KpiCard
                    icon={Stethoscope}
                    label={`Ticket médio — ${mesNome}`}
                    value={loading ? "..." : kpis.qntMes > 0 ? fmt(kpis.ticketMedio) : "—"}
                    sub={kpis.qntMes > 0 ? `${kpis.qntMes} pagamento${kpis.qntMes !== 1 ? "s" : ""} no mês` : "Sem dados"}
                    color="bg-purple-500/10 text-purple-500"
                    loading={loading}
                />
                <KpiCard
                    icon={AlertCircle}
                    label="A receber (pendente)"
                    value={loading ? "..." : fmt(kpis.pendentes)}
                    sub="Pagamentos não confirmados"
                    color="bg-amber-500/10 text-amber-500"
                    loading={loading}
                />
            </div>

            {/* Gráfico + Médico top */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FaturamentoChart
                        data={faturamentoData}
                        loading={loadFat}
                        ano={ano}
                    />
                </div>
                <MedicoTopCard loading={false} />
            </div>

            {/* Tabela detalhada */}
            <TabelaMensal
                data={faturamentoData}
                loading={loadFat}
                ano={ano}
            />
        </div>
    );
}