import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configuracoesApi, type ConfiguracaoClinica } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

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