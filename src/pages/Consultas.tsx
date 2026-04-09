import { consultasApi, anamneseApi, prescricoesApi, configuracoesApi } from "../services/api";
import { authService } from "../services/auth";
import type { Consulta, Anamnese, Prescricao } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, X, Pencil, ArrowLeft, Save, ClipboardList, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FormCadastroConsulta } from "../components/Form-Consulta";

// ─── Helpers ─────────────────────────────────
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeekDays(ref: Date): Date[] {
    const day = ref.getDay();
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function formatKey(d: Date) { return d.toLocaleDateString("pt-BR"); }
function isToday(d: Date) { return formatKey(d) === formatKey(new Date()); }

const STATUS_STYLE: Record<string, string> = {
    AGENDADA: "bg-primary/15 border-primary text-primary",
    CONFIRMADA: "bg-blue-500/10 border-blue-500 text-blue-600",
    REALIZADA: "bg-green-500/15 border-green-500 text-green-700",
    CANCELADA: "bg-destructive/10 border-destructive text-destructive line-through opacity-60",
    EM_ANDAMENTO: "bg-amber-400/20 border-amber-500 text-amber-700",
};

function consultaAtiva(status: string) {
    return status === "EM_ANDAMENTO" || status === "REALIZADA";
}

const TIPOS_RECEITA_MAP: Record<string, string> = {
    COMUM: "COMUM", CONTROLADA_B1: "CONTROLADA_B1",
    CONTROLADA_A: "CONTROLADA_A", ANTIMICROBIANO: "ANTIMICROBIANO",
};
const TIPOS_RECEITA_LABELS = [
    { label: "Receita Simples (Branca)", value: "COMUM" },
    { label: "Receita Azul (Controlada B1)", value: "CONTROLADA_B1" },
    { label: "Receita Amarela (Controlada A)", value: "CONTROLADA_A" },
    { label: "Antimicrobiano", value: "ANTIMICROBIANO" },
];
const EMPTY_RX = { medicamento: "", dosagem: "", frequencia: "", duracao: "", viaAdministracao: "Via oral", observacoes: "", tipoReceita: "COMUM" };

// ─── Geração de PDF da Prescrição ─────────────
// Usa jsPDF. Instale com: npm install jspdf
// Os dados da clínica são lidos de configuracoesApi (query "configuracao-clinica")
// e passados como prop para a função.

interface ClinicaInfo {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    cidade?: string;
    cep?: string;
    telefone?: string;
    email?: string;
}

interface MedicamentoPDF {
    medicamento: string;
    dosagem?: string;
    frequencia?: string;
    duracao?: string;
    viaAdministracao?: string;
    observacoes?: string;
    tipoReceita?: string;
}

function gerarPrescricaoPDF(
    clinica: ClinicaInfo,
    pacienteNome: string,
    medicoNome: string,
    medicoCrm: string,
    dataConsulta: string,
    medicamentos: MedicamentoPDF[],
) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const MARGIN = 22;
    const PAGE_W = 210;
    const PAGE_H = 297;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const ROSA: [number, number, number] = [180, 90, 110];
    const CINZA_ESCURO: [number, number, number] = [50, 50, 50];
    const CINZA: [number, number, number] = [120, 120, 120];
    let y = MARGIN;

    const set = (size: number, bold: boolean, color: [number, number, number], italic = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", italic ? "italic" : bold ? "bold" : "normal");
        doc.setTextColor(...color);
    };

    // ── Cabeçalho: nome do médico à esquerda, contato à direita ──
    set(16, true, ROSA);
    doc.text(`Dr. ${medicoNome}`, MARGIN, y);
    y += 6;

    if ((clinica as any).especialidade) {
        set(9, false, CINZA, true);
        doc.text((clinica as any).especialidade, MARGIN, y);
        y += 5;
    }

    // Contato à direita alinhado
    const contatoLinhas: string[] = [];
    if (clinica.telefone) contatoLinhas.push(`Contato: ${clinica.telefone}`);
    if (clinica.endereco) contatoLinhas.push(clinica.endereco);
    const cidadeCep = [clinica.cidade, clinica.cep].filter(Boolean).join(" — ");
    if (cidadeCep) contatoLinhas.push(cidadeCep);
    if (clinica.cnpj) contatoLinhas.push(`CNPJ: ${clinica.cnpj}`);

    set(8, false, ROSA);
    contatoLinhas.forEach((linha, i) => {
        doc.text(linha, PAGE_W - MARGIN, MARGIN + i * 5.5, { align: "right" });
    });

    y = Math.max(y, MARGIN + contatoLinhas.length * 5.5) + 4;

    // Linha divisória fina
    doc.setDrawColor(...ROSA);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 12;

    // ── Nome do paciente ──────────────────────────────────────────
    set(12, false, CINZA_ESCURO);
    doc.text(`Sra./Sr. ${pacienteNome}`, MARGIN, y);
    y += 7;

    // ── Data e local ──────────────────────────────────────────────
    set(9, false, CINZA);
    const cidadeData = [clinica.cidade, dataConsulta].filter(Boolean).join(", ");
    doc.text(cidadeData, MARGIN, y);
    y += 14;

    // ── Medicamentos ──────────────────────────────────────────────
    medicamentos.forEach((med) => {
        if (y > 220) { doc.addPage(); y = MARGIN; }

        // Via de administração como subtítulo (ex: "Uso Interno - Via Oral")
        if (med.viaAdministracao) {
            set(10, false, CINZA_ESCURO);
            doc.text(`Uso Interno - ${med.viaAdministracao}`, MARGIN, y);
            y += 8;
        }

        // Nome do medicamento + dosagem + quantidade de pontos + quantidade
        const nomeMed = `${med.medicamento}${med.dosagem ? " " + med.dosagem : ""}`;
        set(11, false, CINZA_ESCURO);

        // Calcula quantos pontos cabem entre o nome e a duração
        const duracaoTexto = med.duracao ? med.duracao : "";
        const nomeW = doc.getTextWidth(nomeMed);
        const duracaoW = duracaoTexto ? doc.getTextWidth(duracaoTexto) : 0;
        const pontosW = CONTENT_W - nomeW - duracaoW - 2;
        const pontoPx = doc.getTextWidth(".");
        const numPontos = Math.max(0, Math.floor(pontosW / pontoPx));
        const pontos = ".".repeat(numPontos);

        doc.text(nomeMed, MARGIN, y);
        if (pontos) {
            set(11, false, CINZA);
            doc.text(pontos, MARGIN + nomeW + 1, y);
        }
        if (duracaoTexto) {
            set(11, false, CINZA_ESCURO);
            doc.text(duracaoTexto, PAGE_W - MARGIN, y, { align: "right" });
        }
        y += 8;

        // Posologia por extenso
        const partes: string[] = [];
        if (med.frequencia) partes.push(med.frequencia);
        if (med.duracao) partes.push(`por ${med.duracao}`);
        if (med.viaAdministracao) partes.push(`via ${med.viaAdministracao.toLowerCase()}`);

        if (partes.length > 0) {
            set(10, false, CINZA_ESCURO);
            const posologia = partes.join(", ");
            const linhas = doc.splitTextToSize(posologia, CONTENT_W);
            doc.text(linhas, MARGIN, y);
            y += linhas.length * 5.5;
        }

        if (med.observacoes) {
            y += 2;
            set(9, false, CINZA, true);
            const obsLinhas = doc.splitTextToSize(`Obs: ${med.observacoes}`, CONTENT_W);
            doc.text(obsLinhas, MARGIN, y);
            y += obsLinhas.length * 5;
        }

        y += 10; // espaço entre medicamentos
    });

    // ── Assinatura ────────────────────────────────────────────────
    // Sempre próxima ao rodapé
    const ASSIN_Y = Math.max(y + 10, PAGE_H - 70);

    // Linha de assinatura centrada
    const linhaW = 60;
    const linhaX = PAGE_W / 2 - linhaW / 2;
    doc.setDrawColor(...CINZA_ESCURO);
    doc.setLineWidth(0.4);
    doc.line(linhaX, ASSIN_Y, linhaX + linhaW, ASSIN_Y);

    set(9, false, CINZA_ESCURO);
    doc.text(`Dr. ${medicoNome}`, PAGE_W / 2, ASSIN_Y + 5.5, { align: "center" });
    if (medicoCrm) {
        set(8.5, false, CINZA);
        doc.text(`CRM: ${medicoCrm}`, PAGE_W / 2, ASSIN_Y + 11, { align: "center" });
    }

    // Contato no rodapé à direita (repetido, estilo da imagem)
    set(8, false, ROSA);
    const rodapeLinhas: string[] = [];
    if (clinica.telefone) rodapeLinhas.push(`Contato: ${clinica.telefone}`);
    if (clinica.endereco) rodapeLinhas.push(clinica.endereco);
    if (cidadeCep) rodapeLinhas.push(cidadeCep);

    rodapeLinhas.forEach((linha, i) => {
        doc.text(linha, PAGE_W - MARGIN, ASSIN_Y + 5 + i * 5.5, { align: "right" });
    });

    const nomeArquivo = `receita_${pacienteNome.replace(/\s+/g, "_").toLowerCase()}_${dataConsulta.replace(/\//g, "-")}.pdf`;
    doc.save(nomeArquivo);
}

// ─── AnamneseForm ─────────────────────────────
// FIX PRINCIPAL: TA é definido FORA do componente AnamneseForm e recebe
// value + onChange diretamente como props — sem recreação a cada render.
// O estado é gerenciado no pai via formRef (ref) para evitar re-render
// enquanto o usuário digita, mas também setamos estado ao salvar.

interface TAProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}
function TextAreaField({ label, value, onChange }: TAProps) {
    return (
        <div>
            <Label className="text-muted-foreground text-xs">{label}</Label>
            <textarea
                className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

// CID autocomplete busca do backend
// ─── CID Autocomplete ────────────────────────
// Busca server-side com debounce de 300ms para não sobrecarregar
// Tenta GET /cids/busca?termo= (endpoint dedicado) e cai em GET /cids?busca=
// Se o backend só tem GET /cids (todos), filtra localmente em cache após 1ª carga
function CidAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState(value);
    const [debouncedQuery, setDebouncedQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState<{ codigo: string; descricao: string }[]>([]);
    const [loading, setLoading] = useState(false);
    // Cache local — carregado uma vez se o backend não tiver endpoint de busca
    const allCidsCache = useRef<{ codigo: string; descricao: string }[] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getHeaders = () => {
        const credentials = authService.getCredentials();
        return {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(credentials ? { Authorization: `Basic ${credentials}` } : {}),
        };
    };

    // Debounce: só atualiza debouncedQuery 300ms após parar de digitar
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.length < 2) { setResults([]); return; }

        let cancelled = false;
        setLoading(true);

        (async () => {
            const base = import.meta.env.VITE_API_URL || "http://localhost:8080";
            const headers = getHeaders();

            // try {
            //     // 1ª tentativa: endpoint dedicado de busca (mais eficiente)
            //     const res = await fetch(`${base}/cids/busca?termo=${encodeURIComponent(debouncedQuery)}`, { headers });
            //     if (res.ok) {
            //         const data = await res.json();
            //         if (!cancelled) setResults((Array.isArray(data) ? data : data.content ?? []).slice(0, 10));
            //         setLoading(false);
            //         return;
            //     }
            // } catch { /* tenta próxima estratégia */ }

            // try {
            //     // 2ª tentativa: parâmetro de busca padrão
            //     const res = await fetch(`${base}/cids?busca=${encodeURIComponent(debouncedQuery)}`, { headers });
            //     if (res.ok) {
            //         const data = await res.json();
            //         const list = Array.isArray(data) ? data : data.content ?? [];
            //         if (!cancelled) {
            //             // Se retornou lista filtrada (< 100 itens), usa direto
            //             // Se retornou tudo, filtra localmente e salva em cache
            //             if (list.length < 200) {
            //                 setResults(list.slice(0, 10));
            //             } else {
            //                 allCidsCache.current = list;
            //                 const q = debouncedQuery.toLowerCase();
            //                 setResults(list.filter((c: any) =>
            //                     c.codigo?.toLowerCase().includes(q) ||
            //                     c.descricao?.toLowerCase().includes(q)
            //                 ).slice(0, 10));
            //             }
            //         }
            //         setLoading(false);
            //         return;
            //     }
            // } catch { /* tenta próxima estratégia */ }

            try {
                // 3ª tentativa: carrega todos uma vez e filtra em cache local
                if (!allCidsCache.current) {
                    const res = await fetch(`${base}/cids`, { headers });
                    if (res.ok) allCidsCache.current = await res.json();
                }
                if (allCidsCache.current && !cancelled) {
                    const q = debouncedQuery.toLowerCase();
                    setResults(allCidsCache.current.filter((c) =>
                        c.codigo?.toLowerCase().includes(q) ||
                        c.descricao?.toLowerCase().includes(q)
                    ).slice(0, 10));
                }
            } catch { /* silencia */ }

            if (!cancelled) setLoading(false);
        })();

        return () => { cancelled = true; };
    }, [debouncedQuery]);

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (c: { codigo: string; descricao: string }) => {
        setQuery(`${c.codigo} — ${c.descricao}`);
        onChange(c.codigo);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        onChange("");
        setResults([]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Label className="text-muted-foreground text-xs">Código CID</Label>
            <div className="relative mt-1">
                <Input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="Digite o código (Ex: I20) ou descrição (Ex: Angina)"
                    className="pr-8"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {open && (loading || results.length > 0) && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {loading && results.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground animate-pulse">Buscando...</div>
                    ) : (
                        results.map((c) => (
                            <button
                                key={c.codigo}
                                type="button"
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                                onMouseDown={() => handleSelect(c)}
                            >
                                <span className="font-mono font-semibold text-primary">{c.codigo}</span>
                                <span className="text-muted-foreground ml-2 text-xs">{c.descricao}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
            {open && !loading && debouncedQuery.length >= 2 && results.length === 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg px-3 py-3 text-sm text-muted-foreground">
                    Nenhum CID encontrado para "{debouncedQuery}".
                </div>
            )}
        </div>
    );
}

function AnamneseForm({ consulta, onClose }: { consulta: Consulta; onClose: () => void }) {
    const queryClient = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["anamnese", consulta.id],
        queryFn: () => anamneseApi.buscarPorConsulta(consulta.id!),
    });

    // Estado controlado — único source of truth, sem ref duplicado
    const [fields, setFields] = useState({
        queixaPrincipal: "",
        historiaMolestiaPrincipal: "",
        exameFisico: "",
        hipoteseDiagnostica: "",
        solicitacaoDeExames: "",
        encaminhamento: "",
        condutaMedica: "",
        cidCodigo: "",
    });

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && !isLoading) {
            if (existing) {
                setFields({
                    queixaPrincipal: existing.queixaPrincipal ?? "",
                    historiaMolestiaPrincipal: existing.historiaMolestiaPrincipal ?? "",
                    exameFisico: existing.exameFisico ?? "",
                    hipoteseDiagnostica: existing.hipoteseDiagnostica ?? "",
                    solicitacaoDeExames: existing.solicitacaoDeExames ?? "",
                    encaminhamento: existing.encaminhamento ?? "",
                    condutaMedica: existing.condutaMedica ?? "",
                    cidCodigo: existing.cidCodigo ?? "",
                });
            }
            setInitialized(true);
        }
    }, [existing, isLoading, initialized]);

    const set = useCallback((field: string) => (value: string) => {
        setFields(prev => ({ ...prev, [field]: value }));
    }, []);

    const mutation = useMutation({
        mutationFn: (data: typeof fields) => {
            const payload: Omit<Anamnese, "id"> = {
                consultaId: consulta.id!,
                queixaPrincipal: data.queixaPrincipal,
                historiaMolestiaPrincipal: data.historiaMolestiaPrincipal || undefined,
                exameFisico: data.exameFisico || undefined,
                hipoteseDiagnostica: data.hipoteseDiagnostica || undefined,
                solicitacaoDeExames: data.solicitacaoDeExames || undefined,
                encaminhamento: data.encaminhamento || undefined,
                condutaMedica: data.condutaMedica || undefined,
                cidCodigo: data.cidCodigo || undefined,
            };
            // Backend não tem PATCH — sempre POST (existsByConsultaId vai lançar erro se já existe)
            // Para edição precisamos recriar. O backend lança erro se já existe anamnese.
            // Se já existe, usamos atualizar (que no nosso api.ts também faz POST — mas o backend vai negar)
            // Solução: apenas permite criar uma vez. Se já existe, mostra mensagem.
            if (existing?.id) {
                toast.error("O backend não permite atualizar anamnese — já existe uma para esta consulta.");
                return Promise.reject(new Error("Já existe anamnese"));
            }
            return anamneseApi.cadastrar(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["anamnese", consulta.id] });
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Anamnese salva!");
            onClose();
        },
        onError: (err: any) => {
            if (!err.message?.includes("Já existe")) toast.error("Erro ao salvar anamnese.");
        },
    });

    if (isLoading || !initialized) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>;

    const jaExiste = !!existing?.id;

    return (
        <div className="space-y-4 py-2">
            {jaExiste && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                    Anamnese já registrada (somente leitura — o backend não suporta edição).
                </div>
            )}
            <TextAreaField label="Queixa Principal *" value={fields.queixaPrincipal} onChange={set("queixaPrincipal")} />
            <TextAreaField label="História da Moléstia Atual" value={fields.historiaMolestiaPrincipal} onChange={set("historiaMolestiaPrincipal")} />
            <TextAreaField label="Exame Físico" value={fields.exameFisico} onChange={set("exameFisico")} />
            <TextAreaField label="Hipótese Diagnóstica" value={fields.hipoteseDiagnostica} onChange={set("hipoteseDiagnostica")} />
            <TextAreaField label="Exames Solicitados" value={fields.solicitacaoDeExames} onChange={set("solicitacaoDeExames")} />
            <TextAreaField label="Encaminhamento" value={fields.encaminhamento} onChange={set("encaminhamento")} />
            <TextAreaField label="Conduta Médica" value={fields.condutaMedica} onChange={set("condutaMedica")} />
            <CidAutocomplete value={fields.cidCodigo} onChange={set("cidCodigo")} />

            {!jaExiste && (
                <div className="flex gap-3 pt-2">
                    <Button onClick={() => mutation.mutate(fields)} disabled={mutation.isPending || !fields.queixaPrincipal.trim()} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        {mutation.isPending ? "Salvando..." : "Salvar Anamnese"}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                </div>
            )}
            {jaExiste && (
                <Button variant="outline" onClick={onClose} className="w-full">Fechar</Button>
            )}
        </div>
    );
}

// ─── PrescricoesPanel ─────────────────────────
// FIX: Inputs controlados dentro do dialog de adicionar medicamento
// extraídos como componente com estado próprio para não perder foco

interface AddRxFormProps {
    onSave: (rx: typeof EMPTY_RX) => void;
    onCancel: () => void;
    loading: boolean;
}
function AddRxForm({ onSave, onCancel, loading }: AddRxFormProps) {
    const [form, setForm] = useState({ ...EMPTY_RX });
    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="space-y-3 py-2">
            <div>
                <Label>Medicamento *</Label>
                <Input className="mt-1" value={form.medicamento} onChange={set("medicamento")} placeholder="Ex: Ácido Acetilsalicílico" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>Dosagem</Label>
                    <Input className="mt-1" value={form.dosagem} onChange={set("dosagem")} placeholder="100mg" />
                </div>
                <div>
                    <Label>Via de Administração</Label>
                    <Input className="mt-1" value={form.viaAdministracao} onChange={set("viaAdministracao")} placeholder="Via oral" />
                </div>
                <div>
                    <Label>Frequência</Label>
                    <Input className="mt-1" value={form.frequencia} onChange={set("frequencia")} placeholder="1x ao dia" />
                </div>
                <div>
                    <Label>Duração</Label>
                    <Input className="mt-1" value={form.duracao} onChange={set("duracao")} placeholder="30 dias" />
                </div>
            </div>
            <div>
                <Label>Observações</Label>
                <Input className="mt-1" value={form.observacoes} onChange={set("observacoes")} placeholder="Tomar após o café..." />
            </div>
            <div>
                <Label>Tipo de Receita</Label>
                <select
                    className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.tipoReceita}
                    onChange={set("tipoReceita")}
                >
                    {TIPOS_RECEITA_LABELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>
            <div className="flex gap-3 pt-1">
                <Button className="flex-1" onClick={() => onSave(form)} disabled={loading || !form.medicamento.trim()}>
                    {loading ? "Salvando..." : "Adicionar"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    );
}

function PrescricoesPanel({ consulta, clinicaConfig }: { consulta: Consulta; clinicaConfig?: ClinicaInfo }) {
    const queryClient = useQueryClient();

    // Busca a consulta completa para ter a lista atualizada de prescrições
    const { data: consultaCompleta, isLoading } = useQuery({
        queryKey: ["consulta-completa", consulta.id],
        queryFn: () => consultasApi.buscarPorId(consulta.id!),
    });

    const [addOpen, setAddOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

    function handleBaixarPDF() {
        if (prescricoesList.length === 0) return;
        setPdfLoading(true);
        try {
            gerarPrescricaoPDF(
                clinicaConfig ?? {},
                consulta.pacienteNome ?? "Paciente",
                consulta.medicoNome ?? "Médico",
                (consulta as any).medico?.crm ?? "",
                consulta.data ?? new Date().toLocaleDateString("pt-BR"),
                prescricoesList,
            );
        } finally {
            setTimeout(() => setPdfLoading(false), 800);
        }
    }

    const prescricoesList: Prescricao[] = (() => {
        const cc = consultaCompleta as any;
        // Backend retorna prescrições diretamente na consulta (via anamnese vinculada)
        const list = cc?.prescricoes ?? cc?.anamnese?.prescricoes ?? [];
        return list.map((p: any) => ({
            id: p.id, consultaId: consulta.id,
            medicamento: p.medicamento, dosagem: p.dosagem,
            frequencia: p.frequencia, duracao: p.duracao,
            viaAdministracao: p.viaAdministracao, via: p.viaAdministracao,
            observacoes: p.observacoes, tipoReceita: p.tipoReceita,
        }));
    })();

    // Usa o endpoint dedicado POST /prescricoes/{consultaId}
    // O backend exige que a anamnese já esteja salva antes
    const addMutation = useMutation({
        mutationFn: (nova: typeof EMPTY_RX) =>
            prescricoesApi.adicionar(consulta.id!, {
                medicamento: nova.medicamento,
                dosagem: nova.dosagem,
                viaAdministracao: nova.viaAdministracao,
                frequencia: nova.frequencia,
                duracao: nova.duracao,
                observacoes: nova.observacoes || undefined,
                tipoReceita: TIPOS_RECEITA_MAP[nova.tipoReceita] ?? "COMUM",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consulta-completa", consulta.id] });
            queryClient.invalidateQueries({ queryKey: ["anamnese", consulta.id] });
            toast.success("Medicamento adicionado!");
            setAddOpen(false);
        },
        onError: (err: any) => {
            // Mensagem amigável caso a anamnese ainda não exista
            const msg = err?.message?.includes("412") || err?.message?.includes("anamnese")
                ? "Salve a anamnese antes de adicionar prescrições."
                : "Erro ao adicionar medicamento.";
            toast.error(msg);
        },
    });

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando prescrições...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">Prescrições</h3>
                <div className="flex items-center gap-2">
                    {prescricoesList.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBaixarPDF}
                            disabled={pdfLoading}
                            className="flex items-center gap-1.5"
                        >
                            <FileDown className="w-4 h-4" />
                            {pdfLoading ? "Gerando..." : "Baixar Receita PDF"}
                        </Button>
                    )}
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Adicionar Medicamento
                    </Button>
                </div>
            </div>

            {prescricoesList.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">Nenhuma prescrição adicionada.</div>
            ) : (
                <div className="space-y-3">
                    {prescricoesList.map((p, idx) => (
                        <div key={p.id ?? idx} className="bg-muted/30 rounded-xl p-4 space-y-2">
                            <div className="flex items-start justify-between">
                                <p className="font-bold text-sm">{p.medicamento}</p>
                                {p.tipoReceita && (
                                    <span className="text-xs border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                                        {TIPOS_RECEITA_LABELS.find(t => t.value === p.tipoReceita)?.label ?? p.tipoReceita}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                {p.dosagem && <p><span className="font-medium">Dosagem:</span> {p.dosagem}</p>}
                                {(p.viaAdministracao || p.via) && <p><span className="font-medium">Via:</span> {p.viaAdministracao ?? p.via}</p>}
                                {p.frequencia && <p><span className="font-medium">Frequência:</span> {p.frequencia}</p>}
                                {p.duracao && <p><span className="font-medium">Duração:</span> {p.duracao}</p>}
                                {p.observacoes && <p className="col-span-2"><span className="font-medium text-primary">Obs:</span> {p.observacoes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Adicionar Medicamento</DialogTitle></DialogHeader>
                    <AddRxForm
                        onSave={(rx) => addMutation.mutate(rx)}
                        onCancel={() => setAddOpen(false)}
                        loading={addMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── ConsultaDetail ────────────────────────────
function ConsultaDetail({ consulta, onBack, canEdit, canCancelar }: {
    consulta: Consulta; onBack: () => void; canEdit: boolean; canCancelar: boolean;
}) {
    const queryClient = useQueryClient();
    const [view, setView] = useState<"info" | "anamnese">("info");
    const [editOpen, setEditOpen] = useState(false);
    const [historicoOpen, setHistoricoOpen] = useState(false);

    const { data: config } = useQuery({
        queryKey: ["configuracao-clinica"],
        queryFn: configuracoesApi.buscar,
        staleTime: 5 * 60 * 1000,
    });

    const { data: anamnese } = useQuery({
        queryKey: ["anamnese", consulta.id],
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

    const cancelMutation = useMutation({
        mutationFn: () => consultasApi.cancelar(consulta.id!),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["consultas"] }); toast.success("Consulta cancelada!"); onBack(); },
        onError: () => toast.error("Erro ao cancelar."),
    });

    const [currentStatus, setCurrentStatus] = useState(consulta.status);

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

    const podeEditarClinico = canEdit && consultaAtiva(currentStatus);
    const statusLabel = currentStatus?.replace("_", " ") ?? "";

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            <div className="flex items-start gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1">
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
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_STYLE[currentStatus] ?? "bg-muted text-muted-foreground"}`}>{statusLabel}</span>
                    </div>
                    {consulta.tipoConsulta && <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-bold capitalize">{consulta.tipoConsulta.replace("_", " ").toLowerCase()}</p></div>}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                            {([
                                ["Queixa Principal", anamnese.queixaPrincipal],
                                ["História da Moléstia Atual", anamnese.historiaMolestiaPrincipal],
                                ["Exame Físico", anamnese.exameFisico],
                                ["Hipótese Diagnóstica", anamnese.hipoteseDiagnostica],
                                ["Exames Solicitados", anamnese.solicitacaoDeExames],
                                ["Encaminhamento", anamnese.encaminhamento],
                                ["Conduta Médica", anamnese.condutaMedica],
                                ["Código CID", anamnese.cidCodigo],
                            ] as [string, string | undefined][]).map(([label, value]) => value ? (
                                <div key={label} className={label === "Exame Físico" || label === "Conduta Médica" ? "sm:col-span-2" : ""}>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium mt-0.5">{value}</p>
                                </div>
                            ) : null)}
                        </div>
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
                    <PrescricoesPanel consulta={consulta} clinicaConfig={config} />
                </div>
            )}

            {!consultaAtiva(currentStatus) && currentStatus !== "CANCELADA" && (
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm text-muted-foreground text-center">
                    Anamnese e prescrições disponíveis apenas quando a consulta estiver <strong>Em Andamento</strong> ou <strong>Realizada</strong>.
                </div>
            )}

            {/* Botões de ação — visíveis conforme status atual */}
            {currentStatus !== "CANCELADA" && (
                <div className="flex flex-wrap gap-3">
                    {/* Iniciar atendimento — AGENDADA ou CONFIRMADA → EM_ANDAMENTO */}
                    {(currentStatus === "AGENDADA" || currentStatus === "CONFIRMADA") && canEdit && (
                        <Button
                            onClick={() => statusMutation.mutate("EM_ANDAMENTO")}
                            disabled={statusMutation.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            {statusMutation.isPending ? "Alterando..." : "▶ Iniciar Atendimento"}
                        </Button>
                    )}

                    {/* Concluir — EM_ANDAMENTO → REALIZADA */}
                    {currentStatus === "EM_ANDAMENTO" && canEdit && (
                        <Button
                            onClick={() => statusMutation.mutate("REALIZADA")}
                            disabled={statusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {statusMutation.isPending ? "Alterando..." : "✓ Concluir Consulta"}
                        </Button>
                    )}

                    {/* Confirmar — AGENDADA → CONFIRMADA */}
                    {currentStatus === "AGENDADA" && canEdit && (
                        <Button
                            variant="outline"
                            onClick={() => statusMutation.mutate("CONFIRMADA")}
                            disabled={statusMutation.isPending}
                        >
                            {statusMutation.isPending ? "Alterando..." : "Confirmar"}
                        </Button>
                    )}

                    {/* Editar dados da consulta */}
                    {currentStatus !== "REALIZADA" && canEdit && (
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar Consulta
                        </Button>
                    )}

                    {/* Cancelar */}
                    {currentStatus !== "REALIZADA" && canCancelar && (
                        <Button
                            variant="destructive"
                            onClick={() => cancelMutation.mutate()}
                            disabled={cancelMutation.isPending}
                        >
                            <X className="w-4 h-4 mr-2" /> {cancelMutation.isPending ? "Cancelando..." : "Cancelar Consulta"}
                        </Button>
                    )}
                </div>
            )}

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
                            {/* Dados vitais */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Dados Vitais</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        ["Tipo Sanguíneo", historico.tipoSanguineo],
                                        ["Peso", historico.peso ? `${historico.peso} kg` : undefined],
                                        ["Altura", historico.altura ? `${historico.altura} cm` : undefined],
                                    ].map(([label, value]) => (
                                        <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="font-bold mt-0.5">{value ?? "—"}</p>
                                        </div>
                                    ))}
                                    {/* IMC com classificação */}
                                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">IMC</p>
                                        <p className="font-bold mt-0.5">
                                            {historico.imc ? (() => {
                                                const imc = Number(historico.imc);
                                                const label =
                                                    imc < 18.5 ? "Abaixo do peso" :
                                                        imc < 25 ? "Peso normal" :
                                                            imc < 30 ? "Sobrepeso" :
                                                                imc < 35 ? "Obesidade I" :
                                                                    imc < 40 ? "Obesidade II" :
                                                                        "Obesidade III";
                                                return `${historico.imc} — ${label}`;
                                            })() : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Antecedentes clínicos */}
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
                                            <p className="text-sm font-medium mt-0.5">{value || <span className="text-muted-foreground italic">Não informado</span>}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hábitos */}
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

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta initialData={consulta} onSuccess={() => { setEditOpen(false); queryClient.invalidateQueries({ queryKey: ["consultas"] }); }} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Main calendar ────────────────────────────
export default function Consultas() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [newOpen, setNewOpen] = useState(false);
    const [prefillDate, setPrefillDate] = useState("");
    const [prefillHour, setPrefillHour] = useState("");
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { canAddConsulta, canCancelarConsulta } = usePermissions();

    const { data: consultas = [], isLoading } = useQuery({ queryKey: ["consultas"], queryFn: consultasApi.listar });
    const { data: config } = useQuery({ queryKey: ["configuracao-clinica"], queryFn: configuracoesApi.buscar, staleTime: 5 * 60 * 1000 });

    const horaAbertura = config?.horarioAbertura ? parseInt(config.horarioAbertura.split(":")[0], 10) : 8;
    const horaFechamento = config?.horarioFechamento ? parseInt(config.horarioFechamento.split(":")[0], 10) : 18;
    const HOURS = Array.from({ length: horaFechamento - horaAbertura }, (_, i) => i + horaAbertura);

    const filtered = consultas.filter((c) => {
        const role = String(user?.role ?? "").toUpperCase();
        // ADMIN e SECRETARIA veem tudo
        // MEDICO: o backend já filtra por médico logado, mas se medicoId vier populado filtra também no front
        if (role === "ADMIN" || role === "SECRETARIA") return true;
        if (role === "MEDICO") {
            // Se medicoId vier preenchido, filtra; caso contrário confia no backend
            if (c.medicoId && String(c.medicoId) !== "") {
                return String(c.medicoId) === String(user?.medico?.id ?? "");
            }
            return true;
        }
        return true;
    });

    const weekDays = getWeekDays(selectedDate);
    const bySlot = (day: Date, hour: number) => filtered.filter((c) => {
        const [h] = (c.horario ?? "").split(":").map(Number);
        return c.data === formatKey(day) && h === hour;
    });

    const goBack = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); };
    const goNext = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); };

    if (selectedConsulta) {
        return <ConsultaDetail consulta={selectedConsulta} onBack={() => setSelectedConsulta(null)} canEdit={canAddConsulta} canCancelar={canCancelarConsulta} />;
    }

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Consultas</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Agenda semanal{config && ` · ${config.horarioAbertura?.slice(0, 5) ?? "--"} às ${config.horarioFechamento?.slice(0, 5) ?? "--"}`}
                    </p>
                </div>
                {canAddConsulta && (
                    <Button onClick={() => { setPrefillDate(""); setPrefillHour(""); setNewOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Consulta
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goBack}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium">
                        {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} — {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))} />
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid border-b border-border sticky top-0 bg-card z-10" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
                    <div className="border-r border-border" />
                    {weekDays.map((day, i) => (
                        <div key={i} className={`py-3 text-center border-r border-border last:border-0 ${isToday(day) ? "bg-primary/5" : ""}`}>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{DAYS_PT[day.getDay()]}</p>
                            <p className={`text-lg font-bold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                {day.getDate()}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="overflow-y-auto max-h-[580px]">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando agenda...</div>
                    ) : (
                        HOURS.map((hour) => (
                            <div key={hour} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: "72px" }}>
                                <div className="border-r border-border text-xs text-muted-foreground text-right pr-2 pt-2">{String(hour).padStart(2, "0")}:00</div>
                                {weekDays.map((day, di) => {
                                    const items = bySlot(day, hour);
                                    return (
                                        <div key={di}
                                            className={`border-r border-border last:border-0 p-1 cursor-pointer group ${isToday(day) ? "bg-primary/[0.03]" : "hover:bg-muted/20"} transition-colors`}
                                            onClick={() => { if (canAddConsulta) { setPrefillDate(day.toISOString().split("T")[0]); setPrefillHour(`${String(hour).padStart(2, "0")}:00`); setNewOpen(true); } }}
                                        >
                                            {items.length === 0 && canAddConsulta && (
                                                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-4 h-4 text-muted-foreground/40" />
                                                </div>
                                            )}
                                            {items.map((c) => (
                                                <button key={c.id} onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c); }}
                                                    className={`w-full text-left text-[11px] px-2 py-1.5 rounded-lg border-l-2 mb-1 transition-opacity hover:opacity-80 ${STATUS_STYLE[c.status] ?? "bg-muted border-border"}`}>
                                                    <p className="font-semibold truncate leading-tight">{c.pacienteNome}</p>
                                                    <p className="opacity-70 truncate">{c.horario?.slice(0, 5)} · {c.medicoNome?.split(" ")[0]}</p>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                {[["AGENDADA", "bg-primary/15 border-primary"], ["CONFIRMADA", "bg-blue-500/10 border-blue-500"], ["REALIZADA", "bg-green-500/15 border-green-500"], ["EM ANDAMENTO", "bg-amber-400/20 border-amber-500"], ["CANCELADA", "bg-destructive/10 border-destructive"]].map(([label, cls]) => (
                    <div key={label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-sm border-l-2 ${cls}`} />{label}</div>
                ))}
            </div>

            <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nova Consulta</DialogTitle></DialogHeader>
                    <FormCadastroConsulta prefillData={prefillDate} prefillHorario={prefillHour}
                        onSuccess={() => { setNewOpen(false); queryClient.invalidateQueries({ queryKey: ["consultas"] }); }} />
                </DialogContent>
            </Dialog>
        </div>
    );
}