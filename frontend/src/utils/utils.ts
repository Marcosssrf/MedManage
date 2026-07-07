export function getWeekDays(ref: Date): Date[] {
    const day = ref.getDay();
    const sunday = new Date(ref);
    sunday.setDate(ref.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d;
    });
}

export function formatKey(d: Date) {
    return d.toLocaleDateString("pt-BR");
}

export function isToday(d: Date) {
    return formatKey(d) === formatKey(new Date());
}

export function consultaAtiva(status: string) {
    return status === "EM_ANDAMENTO" || status === "REALIZADA";
}

export function buildWeekRange(weekDays: Date[]) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return {
        dataInicio: `${fmt(weekDays[0])}T00:00:00`,
        dataFim: `${fmt(weekDays[6])}T23:59:59`,
    };
}
