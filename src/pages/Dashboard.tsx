import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { consultasApi, relatoriosApi } from "../services/api";
import { Users, Stethoscope, CalendarDays, TrendingUp, Clock, CheckCircle, XCircle, CalendarCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function StatusBar({ label, count, total, color }: {
    label: string;
    count: number;
    total: number;
    color: string;
}) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{count} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 0.5s ease" }} />
            </div>
        </div>
    );
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTHS_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

export default function Dashboard() {
    const { user } = useAuth();
    const [showAllHoje, setShowAllHoje] = useState(false);
    const today = new Date().toLocaleDateString("pt-BR");
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const hoje = new Date();
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 19);
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 3, 0, 23, 59, 59).toISOString().slice(0, 19);

    // const { data: pacientes = [] } = useQuery({ queryKey: ["pacientes"], queryFn: pacientesApi.listar });
    // const { data: medicos = [] } = useQuery({ queryKey: ["medicos"], queryFn: medicosApi.listar });
    const medicoId = user?.role === "MEDICO" ? (user.medico?.id ?? "me") : "all";
    const { data: consultas = [] } = useQuery({
        queryKey: ["consultas", dataInicio, dataFim, medicoId],
        queryFn: () => consultasApi.listar(dataInicio, dataFim),
    });
    // const { data: pagamentos = [] } = useQuery({ queryKey: ["pagamentos"], queryFn: pagamentosApi.listar });

    const { data: resumo } = useQuery({
        queryKey: ["dashboard-resumo"],
        queryFn: relatoriosApi.resumo,
        staleTime: 60 * 1000, // 1 minuto
    });

    const { data: faturamento } = useQuery({
        queryKey: ["faturamento", anoAtual],
        queryFn: () => relatoriosApi.faturamentoPorMes(anoAtual),
        enabled: user?.role === "ADMIN",
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const { data: medicoTop } = useQuery({
        queryKey: ["medico-mais-atendido"],
        queryFn: relatoriosApi.medicoMaisAtendido,
        enabled: user?.role === "ADMIN",
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const consultasFiltradas = user?.role === "MEDICO"
        ? consultas.filter((c) => {
            if (user.medico?.id && c.medicoId && String(c.medicoId) !== "")
                return String(c.medicoId) === String(user.medico.id);
            if (user.medico?.nome && c.medicoNome)
                return c.medicoNome === user.medico.nome;
            return false;
        })
        : consultas;

    const consultasHoje = consultasFiltradas.filter((c) =>
        c.data?.startsWith(today)
    );

    // Para status/totais usa apenas o mês atual
    const consultasMes = consultasFiltradas.filter((c) => {
        const [dia, mes, ano] = (c.data ?? "").split("/").map(Number);
        return ano === anoAtual && mes === mesAtual + 1;
    });

    const proximasConsultas = consultasFiltradas
        .filter((c) => {
            if (c.status === "CANCELADA" || c.status === "REALIZADA") return false;
            const [dia, mes, ano] = c.data.split("/").map(Number);
            const [hora, minuto] = (c.horario ?? "00:00").split(":").map(Number);
            const dataConsulta = new Date(ano, mes - 1, dia, hora, minuto);
            return dataConsulta >= new Date();
        })
        .sort((a, b) => {
            const toDate = (c: typeof a) => {
                const [dia, mes, ano] = c.data.split("/").map(Number);
                const [hora, minuto] = (c.horario ?? "00:00").split(":").map(Number);
                return new Date(ano, mes - 1, dia, hora, minuto).getTime();
            };
            return toDate(a) - toDate(b);
        })
        .slice(0, 5);

    const faturamentoMes = faturamento
        ? (faturamento[MONTHS_EN[mesAtual]] ?? 0)
        : 0;

    const totalConsultas = consultasMes.length;
    const agendadas = consultasMes.filter((c) => c.status === "AGENDADA").length;
    const confirmadas = consultasMes.filter((c) => c.status === "CONFIRMADA").length;
    const realizadas = consultasMes.filter((c) => c.status === "REALIZADA").length;
    const canceladas = consultasMes.filter((c) => c.status === "CANCELADA").length;

    const formatValor = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Lógica do gráfico corrigida e ordenada
    const faturamentoData = faturamento
        ? Object.entries(faturamento)
            .map(([mes, valor]) => {
                const indexDoMes = MONTHS_EN.indexOf(mes.toUpperCase());
                return {
                    mes: indexDoMes !== -1 ? MONTHS_SHORT[indexDoMes] : mes,
                    valor,
                };
            })
            .sort((a, b) => MONTHS_SHORT.indexOf(a.mes) - MONTHS_SHORT.indexOf(b.mes))
        : [];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Olá, {user?.medico?.nome?.split(" ")[0] ?? (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "")} 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {DAYS_PT[new Date().getDay()]}, {new Date().getDate()} de {MONTHS_PT[mesAtual]} de {anoAtual}
                </p>
            </div>

            {/* Cards principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user?.role !== "MEDICO" && (
                    <>
                        <StatCard icon={Users} label="Total de pacientes" value={resumo?.totalPacientes} color="bg-primary/10 text-primary" />
                        <StatCard icon={Stethoscope} label="Total de médicos" value={resumo?.totalMedicos} color="bg-blue-500/10 text-blue-500" />
                    </>
                )}
                <StatCard icon={CalendarDays} label="Consultas hoje" value={resumo?.consultasHoje} color="bg-amber-500/10 text-amber-500" />
                {user?.role === "ADMIN" && (
                    <StatCard icon={TrendingUp} label="Faturamento do mês" value={formatValor(faturamentoMes)} color="bg-green-500/10 text-green-500" />
                )}
                {user?.role === "MEDICO" && (
                    <StatCard icon={CalendarCheck} label="Minhas consultas" value={totalConsultas} color="bg-primary/10 text-primary" />
                )}
            </div>

            {/* Gráfico e médico top — só ADMIN */}
            {user?.role === "ADMIN" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
                        <h2 className="font-medium text-sm">Faturamento por mês — {anoAtual}</h2>
                        {faturamentoData.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                Nenhum dado de faturamento disponível.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={faturamentoData} barSize={28}>
                                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(v: number) => [formatValor(v), "Faturamento"]}
                                        contentStyle={{
                                            background: "var(--color-background-secondary)",
                                            border: "1px solid var(--color-border-tertiary)",
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <h2 className="font-medium text-sm">Médico mais atendido</h2>
                        {medicoTop ? (
                            <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {(medicoTop as any).nome?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">{(medicoTop as any).nome}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {(medicoTop as any).totalConsultas} consulta{(medicoTop as any).totalConsultas !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <div className="w-full mt-2 bg-muted rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full w-full" />
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                Nenhum dado disponível.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consultas por status */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <h2 className="font-medium text-sm">Consultas por status</h2>
                    <div className="space-y-3">
                        <StatusBar label="Agendadas" count={agendadas} total={totalConsultas} color="bg-amber-400" />
                        <StatusBar label="Confirmadas" count={confirmadas} total={totalConsultas} color="bg-blue-400" />
                        <StatusBar label="Realizadas" count={realizadas} total={totalConsultas} color="bg-green-400" />
                        <StatusBar label="Canceladas" count={canceladas} total={totalConsultas} color="bg-destructive" />
                    </div>
                    <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                        {totalConsultas} consulta{totalConsultas !== 1 ? "s" : ""} no total
                    </div>
                </div>

                {/* Próximas consultas */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
                    <h2 className="font-medium text-sm">Próximas consultas</h2>
                    {proximasConsultas.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Nenhuma consulta agendada.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {proximasConsultas.map((c) => {
                                const [dia, mes, ano] = c.data.split("/").map(Number);
                                const [hora, minuto] = (c.horario ?? "00:00").split(":").map(Number);
                                const dataConsulta = new Date(ano, mes - 1, dia, hora, minuto);
                                const isHoje = dataConsulta.toDateString() === new Date().toDateString();
                                const isAmanha = dataConsulta.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                const labelDia = isHoje ? "Hoje" : isAmanha ? "Amanhã" : c.data;
                                return (
                                    <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                            {c.pacienteNome?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{c.pacienteNome}</p>
                                            <p className="text-xs text-muted-foreground truncate">{c.medicoNome}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold tabular-nums">{c.horario?.slice(0, 5)}</p>
                                                <p className={`text-xs font-medium ${isHoje ? "text-primary" : isAmanha ? "text-amber-500" : "text-muted-foreground"}`}>
                                                    {labelDia}
                                                </p>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === "AGENDADA" ? "bg-amber-400" : "bg-blue-400"}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Consultas de hoje */}
            {consultasHoje.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-sm">Consultas de hoje</h2>
                        <span className="text-xs text-muted-foreground">{consultasHoje.length} consulta{consultasHoje.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Paciente</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Médico</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Horário</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {consultasHoje
                                .sort((a, b) => (a.horario ?? "").localeCompare(b.horario ?? ""))
                                .slice(0, showAllHoje ? undefined : 10)
                                .map((c) => (
                                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                    {c.pacienteNome?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{c.pacienteNome}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-primary text-xs">{c.medicoNome}</td>
                                        <td className="py-2.5 px-3 font-mono text-xs">{c.horario?.slice(0, 5)}</td>
                                        <td className="py-2.5 px-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "AGENDADA" ? "bg-amber-500/10 text-amber-600" :
                                                    c.status === "CONFIRMADA" ? "bg-blue-500/10 text-blue-600" :
                                                        c.status === "REALIZADA" ? "bg-green-500/10 text-green-600" :
                                                            "bg-destructive/10 text-destructive"
                                                }`}>
                                                    {c.status}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {consultasHoje.length > 10 && (
                        <button
                            onClick={() => setShowAllHoje((v) => !v)}
                            className="w-full text-sm text-muted-foreground hover:text-foreground py-2 border-t border-border transition-colors"
                        >
                            {showAllHoje
                                ? "Mostrar menos ↑"
                                : `Ver todas as ${consultasHoje.length} consultas ↓`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}