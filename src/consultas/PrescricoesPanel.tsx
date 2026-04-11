import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { consultasApi, prescricoesApi } from "../services/api";
import type { Consulta, Prescricao } from "../services/api";
import { gerarPrescricaoPDF } from "../components/pdfGenerator";
import type { ClinicaInfo } from "../components/pdfGenerator";
import { TIPOS_RECEITA_LABELS, TIPOS_RECEITA_MAP, EMPTY_RX } from "./constants";

// ─── AddRxForm ─────────────────────────────────
function AddRxForm({ onSave, onCancel, loading }: {
    onSave: (rx: typeof EMPTY_RX) => void;
    onCancel: () => void;
    loading: boolean;
}) {
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

// ─── PrescricoesPanel ──────────────────────────
export function PrescricoesPanel({ consulta, clinicaConfig }: {
    consulta: Consulta;
    clinicaConfig?: ClinicaInfo;
}) {
    const queryClient = useQueryClient();
    const [addOpen, setAddOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);

    const { data: consultaCompleta, isLoading } = useQuery({
        queryKey: ["consulta-completa", consulta.id],
        queryFn: () => consultasApi.buscarPorId(consulta.id!),
    });

    const prescricoesList: Prescricao[] = (() => {
        const cc = consultaCompleta as any;
        const list = cc?.prescricoes ?? cc?.anamnese?.prescricoes ?? [];
        return list.map((p: any) => ({
            id: p.id,
            consultaId: consulta.id,
            medicamento: p.medicamento,
            dosagem: p.dosagem,
            frequencia: p.frequencia,
            duracao: p.duracao,
            viaAdministracao: p.viaAdministracao,
            via: p.viaAdministracao,
            observacoes: p.observacoes,
            tipoReceita: p.tipoReceita,
        }));
    })();

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
            const msg = err?.message?.includes("412") || err?.message?.includes("anamnese")
                ? "Salve a anamnese antes de adicionar prescrições."
                : "Erro ao adicionar medicamento.";
            toast.error(msg);
        },
    });

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

    if (isLoading)
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando prescrições...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">Prescrições</h3>
                <div className="flex items-center gap-2">
                    {prescricoesList.length > 0 && (
                        <Button size="sm" variant="outline" onClick={handleBaixarPDF} disabled={pdfLoading}>
                            <FileDown className="w-4 h-4 mr-1.5" />
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
