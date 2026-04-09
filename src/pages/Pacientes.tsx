import { FormCadastroPaciente } from "../components/Form-Paciente";
import { pacientesApi, historicoClinicoApi } from "../services/api";
import type { Paciente, HistoricoClinico } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
    Plus, Search, Users, ArrowLeft, Pencil, Activity,
    Droplets, Weight, Ruler, HeartPulse
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import { toast } from "sonner";


const Field = ({ label, value }: { label: string; value?: string }) => (
    <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
    </div>
);

// ── Toggle Ativo Button
function ToggleAtivoButton({ ativo, onToggle }: { ativo: boolean; onToggle: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onToggle}
            className={`flex items-center gap-2 ${ativo ? "text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5" : "text-primary hover:text-primary border-primary/30 hover:bg-primary/5"}`}
        >
            {ativo ? "Desativar Paciente" : "Reativar Paciente"}
        </Button>
    );
}

// ── Detail view component
function PacienteDetail({
    paciente,
    onBack,
    canEdit,
}: {
    paciente: Paciente;
    onBack: () => void;
    canEdit: boolean;
}) {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<"dados" | "historico">("dados");
    const [editOpen, setEditOpen] = useState(false);
    const [editDadosOpen, setEditDadosOpen] = useState(false);
    const [form, setForm] = useState<HistoricoClinico>({} as HistoricoClinico);

    const { data: historico, isLoading: loadingHistorico } = useQuery({
        queryKey: ["historico", paciente.id],
        queryFn: () => historicoClinicoApi.buscarPorPaciente(String(paciente.id!)),
    });

    useEffect(() => {
        if (historico) setForm({
            ...historico,
            tabagismo: historico.tabagismo ?? false,
            etilismo: historico.etilismo ?? false,
            atividadeFisica: historico.atividadeFisica ?? false,
            usoDrogas: historico.usoDrogas ?? false,
        });
    }, [historico]);

    const mutation = useMutation({
        mutationFn: (dados: Omit<HistoricoClinico, "id" | "pacienteId" | "imc">) =>
            historico?.id
                ? historicoClinicoApi.atualizar(historico.id, dados)
                : historicoClinicoApi.cadastrar({ ...dados, pacienteId: paciente.id! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["historico", paciente.id] });
            setEditOpen(false);
            toast.success("Histórico clínico atualizado!");
        },
        onError: () => toast.error("Erro ao salvar histórico."),
    });

    const handleSaveHistorico = () => {
        mutation.mutate({
            ...form,
            tabagismo: form.tabagismo ?? false,
            etilismo: form.etilismo ?? false,
            atividadeFisica: form.atividadeFisica ?? false,
            usoDrogas: form.usoDrogas ?? false,
        });
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl">
            {/* Back */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </button>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{paciente.nome}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${paciente.ativo !== false ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground line-through"}`}>
                    {paciente.ativo !== false ? "Ativo" : "Inativo"}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
                <button
                    onClick={() => setTab("dados")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "dados"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Dados Cadastrais
                </button>
                <button
                    onClick={() => setTab("historico")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "historico"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Histórico Clínico
                </button>
            </div>

            {/* Tab: Dados Cadastrais */}
            {tab === "dados" && (
                <>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                            <Field label="CPF" value={paciente.cpf} />
                            <Field label="Data Nasc." value={paciente.dataNascimento} />
                            <Field label="Idade" value={paciente.idade} />
                            <Field label="Sexo" value={paciente.sexo} />
                            <Field label="Estado Civil" value={paciente.estadoCivil} />
                            <Field label="Telefone" value={paciente.telefone} />
                            <Field label="Email" value={paciente.email} />
                            <Field label="CEP" value={paciente.cep} />
                            <Field
                                label="Endereço"
                                value={[paciente.logradouro, paciente.numero, paciente.complemento].filter(Boolean).join(", ")}
                            />
                            <Field label="Bairro" value={paciente.bairro} />
                            <Field
                                label="Cidade/UF"
                                value={paciente.cidade && paciente.uf ? `${paciente.cidade}/${paciente.uf}` : paciente.cidade || paciente.uf}
                            />
                            <Field label="Convênio" value={paciente.convenio?.nome || "Não informado"} />
                            <Field label="Carteirinha" value={paciente?.numeroCarteirinha || "Não informado"} />
                            <Field label="Data Vencimento da Carteirinha" value={paciente.dataVencimentoCarteirinha || "Não informado"} />
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setEditDadosOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" />
                                Editar
                            </Button>
                            <ToggleAtivoButton
                                ativo={paciente.ativo !== false}
                                onToggle={() => {
                                    pacientesApi.atualizar(paciente.id!, { ativo: !(paciente.ativo !== false) })
                                        .then(() => { queryClient.invalidateQueries({ queryKey: ["paciente", paciente.id] }); queryClient.invalidateQueries({ queryKey: ["pacientes"] }); toast.success(paciente.ativo !== false ? "Paciente inativado." : "Paciente reativado."); })
                                        .catch(() => toast.error("Erro ao alterar status."));
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Tab: Histórico Clínico */}
            {tab === "historico" && (
                <>
                    {loadingHistorico ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">
                            Carregando histórico clínico...
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            {/* Title */}
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-foreground" />
                                <h2 className="text-xl font-bold">Histórico Clínico</h2>
                            </div>

                            {/* Vitals */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-border">
                                {[
                                    { icon: <Droplets className="w-4 h-4 text-red-500" />, label: "Tipo Sanguíneo", value: historico?.tipoSanguineo || "—" },
                                    { icon: <Weight className="w-4 h-4 text-muted-foreground" />, label: "Peso", value: historico?.peso ? `${historico.peso} kg` : "—" },
                                    { icon: <Ruler className="w-4 h-4 text-primary" />, label: "Altura", value: historico?.altura ? `${historico.altura} m` : "—" },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="bg-muted/30 rounded-xl p-3 flex items-center gap-2">
                                        <div className="shrink-0">{icon}</div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-base font-bold leading-tight">{value}</p>
                                        </div>
                                    </div>
                                ))}
                                {/* IMC com classificação */}
                                <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">IMC</p>
                                        <p className="text-base font-bold leading-tight">
                                            {historico?.imc ? (() => {
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

                            {/* Clinical fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Alergias</p>
                                    <p className="text-sm font-medium">{historico?.alergias || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Doenças Preexistentes</p>
                                    <p className="text-sm font-medium">{historico?.doencasPreexistentes || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Cirurgias Prévias</p>
                                    <p className="text-sm font-medium">{historico?.cirurgiasPrevias || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Histórico Familiar</p>
                                    <p className="text-sm font-medium">{historico?.historicoFamiliar || "—"}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-0.5">Medicamentos de Uso Contínuo</p>
                                    <p className="text-sm font-medium">{historico?.medicamentosUso || "—"}</p>
                                </div>
                            </div>

                            {/* Lifestyle badges */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {[
                                    { label: "Tabagismo", value: historico?.tabagismo },
                                    { label: "Etilismo", value: historico?.etilismo },
                                    { label: "Atividade Física", value: historico?.atividadeFisica },
                                    { label: "Uso de Drogas", value: historico?.usoDrogas },
                                ].map(({ label, value }) => (
                                    <span
                                        key={label}
                                        className={`text-xs px-3 py-1 rounded-full font-medium border ${value
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted text-muted-foreground border-border"
                                            }`}
                                    >
                                        {label}: {value ? "Sim" : "Não"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {canEdit && !loadingHistorico && (
                        <Button
                            variant="outline"
                            onClick={() => { setForm(historico ?? {} as HistoricoClinico); setEditOpen(true); }}
                            className="flex items-center gap-2"
                        >
                            <Pencil className="w-4 h-4" />
                            Editar Histórico Clínico
                        </Button>
                    )}
                </>
            )}

            {/* Edit Dados Dialog */}
            <Dialog open={editDadosOpen} onOpenChange={setEditDadosOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                    </DialogHeader>
                    <FormCadastroPaciente
                        initialData={paciente}
                        onSuccess={() => setEditDadosOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Histórico Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Histórico Clínico</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Tipo sanguíneo */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Tipo Sanguíneo</label>
                            <Input
                                value={form.tipoSanguineo ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, tipoSanguineo: e.target.value }))}
                                placeholder="Ex: A+"
                            />
                        </div>
                        {/* Peso / Altura */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium block mb-1">Peso (kg)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={form.peso ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, peso: parseFloat(e.target.value) || undefined }))}
                                    placeholder="78.5"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Altura (m)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.altura ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, altura: parseFloat(e.target.value) || undefined }))}
                                    placeholder="1.75"
                                />
                            </div>
                        </div>
                        {/* Alergias */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Alergias</label>
                            <textarea
                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.alergias ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, alergias: e.target.value }))}
                                placeholder="Liste as alergias..."
                            />
                        </div>
                        {/* Doenças */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Doenças Preexistentes</label>
                            <textarea
                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.doencasPreexistentes ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, doencasPreexistentes: e.target.value }))}
                                placeholder="Ex: Diabetes tipo 2..."
                            />
                        </div>
                        {/* Cirurgias */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Cirurgias Prévias</label>
                            <textarea
                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.cirurgiasPrevias ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, cirurgiasPrevias: e.target.value }))}
                                placeholder="Ex: Apendicectomia em 2015..."
                            />
                        </div>
                        {/* Histórico familiar */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Histórico Familiar</label>
                            <textarea
                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.historicoFamiliar ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, historicoFamiliar: e.target.value }))}
                                placeholder="Ex: Pai com infarto..."
                            />
                        </div>
                        {/* Medicamentos */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Medicamentos de Uso Contínuo</label>
                            <textarea
                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-y min-h-[72px] focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.medicamentosUso ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, medicamentosUso: e.target.value }))}
                                placeholder="Ex: Metformina 850mg..."
                            />
                        </div>
                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            {(
                                [
                                    { key: "atividadeFisica", label: "Atividade Física" },
                                    { key: "tabagismo", label: "Tabagismo" },
                                    { key: "etilismo", label: "Etilismo" },
                                    { key: "usoDrogas", label: "Uso de Drogas" },
                                ] as { key: keyof HistoricoClinico; label: string }[]
                            ).map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={!!form[key]}
                                        onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${form[key] ? "bg-primary" : "bg-muted"}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-6" : "translate-x-1"}`}
                                        />
                                    </button>
                                    <span className="text-sm">{label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleSaveHistorico}
                                disabled={mutation.isPending}
                                className="flex-1"
                            >
                                {mutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── Main Pacientes list
export default function Pacientes() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const { canAddPaciente } = usePermissions();

    // Sempre busca todos (inclusive inativos) — filtragem feita no cliente
    const { data: pacientes, isLoading, error } = useQuery({
        queryKey: ["pacientes"],
        queryFn: () => pacientesApi.listar(true),
    });

    // Busca detalhes completos do paciente selecionado
    const { data: selectedPaciente, isLoading: loadingDetalhe } = useQuery({
        queryKey: ["paciente", selectedId],
        queryFn: () => pacientesApi.buscarPorId(selectedId!),
        enabled: !!selectedId,
    });

    const filtered = pacientes
        ?.filter((p) => {
            // Filtro de ativo/inativo — se o campo não existe, trata como ativo
            const estaAtivo = p.ativo !== false;
            // toggle OFF → só ativos; toggle ON → só inativos
            if (!showInactive && !estaAtivo) return false;
            if (showInactive && estaAtivo) return false;
            // Filtro de busca
            return (
                p.nome.toLowerCase().includes(search.toLowerCase()) ||
                p.cpf?.includes(search) ||
                p.email?.toLowerCase().includes(search.toLowerCase()) ||
                p.telefone?.includes(search)
            );
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const { paginated, page, totalPages, next, prev, goTo } = usePagination(filtered ?? [], 10);

    // Mostra skeleton enquanto carrega os detalhes
    if (selectedId && loadingDetalhe) {
        return (
            <div className="animate-fade-in space-y-6 max-w-4xl">
                <button
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    Carregando dados do paciente...
                </div>
            </div>
        );
    }

    if (selectedId && selectedPaciente) {
        return (
            <PacienteDetail
                paciente={selectedPaciente}
                onBack={() => setSelectedId(null)}
                canEdit={canAddPaciente}
            />
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Pacientes</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie os pacientes da clínica</p>
                </div>
                {canAddPaciente && (
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Paciente
                    </Button>
                )}
            </div>

            {/* Summary card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total de pacientes</p>
                        <p className="text-2xl font-semibold">{pacientes?.length ?? 0}</p>
                    </div>
                </div>
            </div>

            {/* Search + toggle inativos */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar paciente por nome, CPF, email ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none whitespace-nowrap">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={showInactive}
                        onClick={() => setShowInactive(v => !v)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${showInactive ? "bg-primary" : "bg-muted"}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${showInactive ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                    <span className="text-muted-foreground">Mostrar inativos</span>
                </label>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="animate-pulse">Carregando pacientes...</div>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Erro ao carregar pacientes. Verifique o backend.
                    </div>
                ) : !filtered?.length ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{search ? "Nenhum paciente encontrado para a busca." : "Nenhum paciente cadastrado."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">CPF</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedId(p.id!)}
                                    >
                                        <td className="py-3 px-4 text-muted-foreground">{(page - 1) * 10 + i + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                                    {p.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{p.nome}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{p.cpf}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.ativo !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                {p.ativo !== false ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
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
                            {filtered.length} paciente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}
            </div>

            {/* New patient dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Paciente</DialogTitle>
                    </DialogHeader>
                    <FormCadastroPaciente onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}