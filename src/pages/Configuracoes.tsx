import {useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type ConfiguracaoClinica, configuracoesApi} from "../services/api";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Bell, Clock, Mail, MessageSquare, Save} from "lucide-react";
import {toast} from "sonner";

// ─── Notificações (configuração local, salva no localStorage) ───
const NOTIF_KEY = "medmanage-notif-config";

interface NotifConfig {
    emailAtivo: boolean;
    whatsappAtivo: boolean;
    antecedenciaHoras: number;
    emailRemetente: string;
}

const NOTIF_DEFAULT: NotifConfig = {
    emailAtivo: false,
    whatsappAtivo: false,
    antecedenciaHoras: 24,
    emailRemetente: "",
};

function NotificacoesSection() {
    const [cfg, setCfg] = useState<NotifConfig>(() => {
        try {
            const stored = localStorage.getItem(NOTIF_KEY);
            return stored ? { ...NOTIF_DEFAULT, ...JSON.parse(stored) } : NOTIF_DEFAULT;
        } catch { return NOTIF_DEFAULT; }
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(cfg));
        setSaved(true);
        toast.success("Configurações de notificação salvas!");
        setTimeout(() => setSaved(false), 2000);
    };

    const toggle = (key: keyof NotifConfig) =>
        setCfg((c) => ({ ...c, [key]: !c[key] }));

    const inputCls = "mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    const switchCls = (on: boolean) =>
        `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${on ? "bg-primary" : "bg-muted"}`;

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base">Lembretes de Consulta</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">
                Configure lembretes automáticos para reduzir faltas. As integrações de envio (email/WhatsApp) precisam ser configuradas no backend.
            </p>

            {/* Canal email */}
            <div className="flex items-start justify-between gap-4 py-4 border-b border-border">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Lembrete por Email</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Envia um email ao paciente com os dados da consulta</p>
                    </div>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={cfg.emailAtivo}
                    onClick={() => toggle("emailAtivo")}
                    className={switchCls(cfg.emailAtivo)}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transform ring-0 transition-transform ${cfg.emailAtivo ? "translate-x-5" : "translate-x-0"}`} />
                </button>
            </div>

            {cfg.emailAtivo && (
                <div className="space-y-1.5">
                    <Label>Email remetente</Label>
                    <input
                        type="email"
                        className={inputCls}
                        placeholder="noreply@suaclinica.com"
                        value={cfg.emailRemetente}
                        onChange={(e) => setCfg((c) => ({ ...c, emailRemetente: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Configure o SMTP no backend para que os emails sejam enviados.</p>
                </div>
            )}

            {/* Canal WhatsApp */}
            <div className="flex items-start justify-between gap-4 py-4 border-b border-border">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Lembrete por WhatsApp</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Envia mensagem via API do WhatsApp Business</p>
                    </div>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={cfg.whatsappAtivo}
                    onClick={() => toggle("whatsappAtivo")}
                    className={switchCls(cfg.whatsappAtivo)}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transform ring-0 transition-transform ${cfg.whatsappAtivo ? "translate-x-5" : "translate-x-0"}`} />
                </button>
            </div>

            {cfg.whatsappAtivo && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                    Integração com WhatsApp Business API necessária no backend. Configure o token e número no arquivo de ambiente do servidor.
                </div>
            )}

            {/* Antecedência */}
            <div className="flex items-start gap-3 py-2">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-medium">Antecedência do lembrete</p>
                    <select
                        className="w-full h-10 px-3 border border-border rounded-lg bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        value={cfg.antecedenciaHoras}
                        onChange={(e) => setCfg((c) => ({ ...c, antecedenciaHoras: Number(e.target.value) }))}
                        disabled={!cfg.emailAtivo && !cfg.whatsappAtivo}
                    >
                        <option value={1}>1 hora antes</option>
                        <option value={2}>2 horas antes</option>
                        <option value={6}>6 horas antes</option>
                        <option value={12}>12 horas antes</option>
                        <option value={24}>24 horas antes (1 dia)</option>
                        <option value={48}>48 horas antes (2 dias)</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
                    <Save className="w-4 h-4" />
                    {saved ? "Salvo!" : "Salvar notificações"}
                </Button>
            </div>
        </div>
    );
}

const DEFAULT: ConfiguracaoClinica = {
    nomeClinica: "",
    cnpj: "",
    telefone: "",
    horarioAbertura: "08:00",
    horarioFechamento: "18:00",
    duracaoPadraoConsulta: 30,
};

function maskCNPJ(v: string) {
    return v.replace(/\D/g, "").slice(0, 14)
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    return d.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
}

export default function Configuracoes() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ConfiguracaoClinica>(DEFAULT);
    const [isNew, setIsNew] = useState(false);

    const { data: config, isLoading } = useQuery({
        queryKey: ["configuracao-clinica"],
        queryFn: configuracoesApi.buscar,
    });

    useEffect(() => {
        if (config) {
            setForm({ ...DEFAULT, ...config });
            setIsNew(false);
        } else if (!isLoading) {
            // Não existe configuração ainda — vai criar
            setIsNew(true);
        }
    }, [config, isLoading]);

    const mutation = useMutation({
        mutationFn: (dados: Partial<ConfiguracaoClinica>) => {
            if (isNew) {
                // POST para criar
                return fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/configuracaoClinica`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados),
                }).then(r => { if (!r.ok) throw new Error("Erro " + r.status); return r.json(); });
            }
            return configuracoesApi.salvar(dados);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["configuracao-clinica"] });
            toast.success("Configurações salvas!");
            setIsNew(false);
        },
        onError: () => toast.error("Erro ao salvar configurações."),
    });

    const handleSave = () => {
        if (!form.nomeClinica?.trim()) { toast.error("Nome da clínica é obrigatório."); return; }
        mutation.mutate(form);
    };

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando configurações...</div>;
    }

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-semibold">Configurações da Clínica</h1>
                <p className="text-muted-foreground text-sm mt-1">Gerencie as configurações gerais</p>
            </div>

            {/* Informações da Clínica */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-bold text-base">Informações da Clínica</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Label>Nome da Clínica *</Label>
                        <Input
                            className="mt-1"
                            value={form.nomeClinica ?? ""}
                            onChange={(e) => setForm(f => ({ ...f, nomeClinica: e.target.value }))}
                            placeholder="Ex: MedManage Clínica Médica"
                        />
                    </div>
                    <div>
                        <Label>CNPJ</Label>
                        <Input
                            className="mt-1"
                            value={form.cnpj ?? ""}
                            onChange={(e) => setForm(f => ({ ...f, cnpj: maskCNPJ(e.target.value) }))}
                            placeholder="00.000.000/0000-00"
                        />
                    </div>
                    <div>
                        <Label>Telefone</Label>
                        <Input
                            className="mt-1"
                            value={form.telefone ?? ""}
                            onChange={(e) => setForm(f => ({ ...f, telefone: maskPhone(e.target.value) }))}
                            placeholder="(11) 3456-7890"
                        />
                    </div>
                </div>
            </div>

            {/* Horário de Funcionamento */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-bold text-base">Horário de Funcionamento</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <Label>Horário de Abertura *</Label>
                        <Input
                            className="mt-1"
                            type="time"
                            value={form.horarioAbertura ?? "08:00"}
                            onChange={(e) => setForm(f => ({ ...f, horarioAbertura: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label>Horário de Fechamento *</Label>
                        <Input
                            className="mt-1"
                            type="time"
                            value={form.horarioFechamento ?? "18:00"}
                            onChange={(e) => setForm(f => ({ ...f, horarioFechamento: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label>Duração Padrão (minutos) *</Label>
                        <Input
                            className="mt-1"
                            type="number"
                            min={5}
                            step={5}
                            value={form.duracaoPadraoConsulta ?? 30}
                            onChange={(e) => setForm(f => ({ ...f, duracaoPadraoConsulta: Number(e.target.value) }))}
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    O calendário de consultas exibirá apenas os horários entre {form.horarioAbertura?.slice(0, 5) ?? "08:00"} e {form.horarioFechamento?.slice(0, 5) ?? "18:00"}.
                </p>
            </div>

            {/* Notificações */}
            <NotificacoesSection />

            {/* Save button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={mutation.isPending} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {mutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
            </div>
        </div>
    );
}