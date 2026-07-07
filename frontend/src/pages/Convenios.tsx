import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type Convenio, conveniosApi} from "../services/api";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../components/ui/dialog";
import {Pencil, Plus, ShieldAlert} from "lucide-react";
import {toast} from "sonner";

const EMPTY: Omit<Convenio, "id"> = {
    nome: "", registroANS: "", cnpj: "", telefone: "", diasParaFaturamento: 30, ativo: true,
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

export default function Convenios() {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Convenio | null>(null);
    const [form, setForm] = useState<Omit<Convenio, "id">>(EMPTY);

    const { data: convenios = [], isLoading } = useQuery({
        queryKey: ["convenios"],
        queryFn: conveniosApi.listar,
    });

    const saveMutation = useMutation({
        mutationFn: (data: { id?: string | number; payload: Omit<Convenio, "id"> }) =>
            data.id ? conveniosApi.atualizar(data.id, data.payload) : conveniosApi.cadastrar(data.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["convenios"] });
            toast.success(editing ? "Convênio atualizado!" : "Convênio criado!");
            setModalOpen(false);
        },
        onError: (e: Error) => toast.error(e?.message || "Erro ao salvar convênio."),
    });

    const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
    const openEdit = (c: Convenio) => {
        setEditing(c);
        setForm({
            nome: c.nome,
            registroANS: c.registroANS ?? "",
            cnpj: c.cnpj ?? "",
            telefone: c.telefone ?? "",
            diasParaFaturamento: c.diasParaFaturamento ?? 30,
            ativo: c.ativo ?? true,
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
        if (!form.cnpj?.trim()) { toast.error("CNPJ é obrigatório."); return; }
        if (!form.registroANS?.trim()) { toast.error("Registro ANS é obrigatório."); return; }
        saveMutation.mutate({ id: editing?.id, payload: form });
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Convênios</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie os convênios médicos</p>
                </div>
                <Button onClick={openNew} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Convênio
                </Button>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando...</div>
            ) : convenios.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Nenhum convênio cadastrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {convenios.map((c) => (
                        <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                            {/* Card header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <ShieldAlert className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">{c.nome}</p>
                                        {c.registroANS && <p className="text-xs text-muted-foreground">ANS: {c.registroANS}</p>}
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.ativo !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                    {c.ativo !== false ? "Ativo" : "Inativo"}
                                </span>
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">CNPJ</p>
                                    <p className="text-sm font-medium">{c.cnpj || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Telefone</p>
                                    <p className="text-sm font-medium">{c.telefone || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Registro ANS</p>
                                    <p className="text-sm font-medium">{c.registroANS || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Dias para Faturamento</p>
                                    <p className="text-sm font-medium">{c.diasParaFaturamento ? `${c.diasParaFaturamento} dias` : "—"}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-1">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => openEdit(c)}>
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    Editar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Convênio" : "Novo Convênio"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nome *</Label>
                            <Input className="mt-1" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Unimed" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Registro ANS * <span className="text-xs text-muted-foreground">(6 dígitos)</span></Label>
                                <Input
                                    className="mt-1"
                                    value={form.registroANS ?? ""}
                                    onChange={(e) => setForm(f => ({ ...f, registroANS: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                                    placeholder="123456"
                                    maxLength={6}
                                    disabled={!!editing}
                                />
                                {editing && <p className="text-xs text-muted-foreground mt-1">ANS não pode ser alterado após criação.</p>}
                            </div>
                            <div>
                                <Label>CNPJ *</Label>
                                <Input
                                    className="mt-1"
                                    value={form.cnpj ?? ""}
                                    onChange={(e) => setForm(f => ({ ...f, cnpj: maskCNPJ(e.target.value) }))}
                                    placeholder="00.000.000/0000-00"
                                    disabled={!!editing}
                                />
                                {editing && <p className="text-xs text-muted-foreground mt-1">CNPJ não pode ser alterado após criação.</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Telefone</Label>
                                <Input
                                    className="mt-1"
                                    value={form.telefone ?? ""}
                                    onChange={(e) => setForm(f => ({ ...f, telefone: maskPhone(e.target.value) }))}
                                    placeholder="(11) 4000-1234"
                                />
                            </div>
                            <div>
                                <Label>Dias para Faturamento</Label>
                                <Input
                                    className="mt-1"
                                    type="number"
                                    value={form.diasParaFaturamento ?? ""}
                                    onChange={(e) => setForm(f => ({ ...f, diasParaFaturamento: Number(e.target.value) }))}
                                    placeholder="30"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={!!form.ativo}
                                onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.ativo ? "bg-primary" : "bg-muted"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.ativo ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                            <span className="text-sm font-medium">{form.ativo ? "Ativo" : "Inativo"}</span>
                        </label>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}