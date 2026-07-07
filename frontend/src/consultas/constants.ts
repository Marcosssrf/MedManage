export const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const STATUS_STYLE: Record<string, string> = {
    AGENDADA: "bg-primary/15 border-primary text-primary",
    CONFIRMADA: "bg-blue-500/10 border-blue-500 text-blue-600",
    REALIZADA: "bg-green-500/15 border-green-500 text-green-700",
    CANCELADA: "bg-destructive/10 border-destructive text-destructive line-through opacity-60",
    EM_ANDAMENTO: "bg-amber-400/20 border-amber-500 text-amber-700",
};

export const STATUS_LEGEND = [
    ["AGENDADA", "bg-primary/15 border-primary"],
    ["CONFIRMADA", "bg-blue-500/10 border-blue-500"],
    ["REALIZADA", "bg-green-500/15 border-green-500"],
    ["EM ANDAMENTO", "bg-amber-400/20 border-amber-500"],
    ["CANCELADA", "bg-destructive/10 border-destructive"],
] as const;

export const TIPOS_RECEITA_MAP: Record<string, string> = {
    COMUM: "COMUM",
    CONTROLADA_B1: "CONTROLADA_B1",
    CONTROLADA_A: "CONTROLADA_A",
    ANTIMICROBIANO: "ANTIMICROBIANO",
};

export const TIPOS_RECEITA_LABELS = [
    { label: "Receita Simples (Branca)", value: "COMUM" },
    { label: "Receita Azul (Controlada B1)", value: "CONTROLADA_B1" },
    { label: "Receita Amarela (Controlada A)", value: "CONTROLADA_A" },
    { label: "Antimicrobiano", value: "ANTIMICROBIANO" },
];

export const EMPTY_RX = {
    medicamento: "",
    dosagem: "",
    frequencia: "",
    duracao: "",
    viaAdministracao: "Via oral",
    observacoes: "",
    tipoReceita: "COMUM",
};
