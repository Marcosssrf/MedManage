import React, { useEffect, useState } from "react";
import { Medico, usuariosApi, medicosApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Pencil, Trash2, User, ShieldCheck, Stethoscope, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface UserRecord {
    id: string;
    username: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    ativo?: boolean;
    medico?: { id: string; nome?: string; } | null;
}

interface UserForm {
    username: string;
    senha: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    medicoId?: string;
    ativo: boolean;
}

const EMPTY_FORM: UserForm = { username: "", senha: "", role: "SECRETARIA", medicoId: "", ativo: true };

function roleBadge(role: string) {
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        ADMIN: { label: "Administrador", className: "bg-purple-100 text-purple-700", icon: <ShieldCheck className="w-3 h-3" /> },
        MEDICO: { label: "Médico", className: "bg-blue-100 text-blue-700", icon: <Stethoscope className="w-3 h-3" /> },
        SECRETARIA: { label: "Recepcionista", className: "bg-green-100 text-green-700", icon: <Briefcase className="w-3 h-3" /> },
    };
    const r = map[role] ?? { label: role, className: "bg-muted text-muted-foreground", icon: <User className="w-3 h-3" /> };
    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${r.className}`}>
            {r.icon}{r.label}
        </span>
    );
}

export default function Usuarios() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [form, setForm] = useState<UserForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, medicosData] = await Promise.all([usuariosApi.listar(), medicosApi.listar()]);
            setUsers(usersData as unknown as UserRecord[]);
            setMedicos(medicosData);
        } catch { toast.error("Não foi possível carregar os dados."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = users.filter((u) =>
        (showInactive ? true : u.ativo !== false)
    );

    const handleNew = () => { setEditingUser(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const handleEdit = (u: UserRecord) => {
        setEditingUser(u);
        setForm({ username: u.username, senha: "", role: u.role, medicoId: u.medico?.id || "", ativo: u.ativo !== false });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.username.trim()) { toast.error("Nome de usuário é obrigatório."); return; }
        if (!editingUser && !form.senha.trim()) { toast.error("Senha é obrigatória para novos usuários."); return; }
        if (form.role === "MEDICO" && !form.medicoId) { toast.error("Selecione um médico para vincular."); return; }
        setSaving(true);
        try {
            const payload: any = { username: form.username.trim(), role: form.role, ativo: form.ativo };
            if (form.senha.trim()) payload.senha = form.senha.trim();
            if (form.role === "MEDICO" && form.medicoId) {
                // Tenta enviar como número (API Java espera Long), fallback para string
                const idNum = Number(form.medicoId);
                payload.medicoId = !isNaN(idNum) ? idNum : form.medicoId;
                payload.medico = { id: !isNaN(idNum) ? idNum : form.medicoId };
            } else {
                payload.medico = null;
                payload.medicoId = null;
            }
            if (editingUser) {
                await usuariosApi.atualizar(editingUser.id, payload);
                toast.success("Usuário atualizado!");
            } else {
                await usuariosApi.cadastrar(payload);
                toast.success("Usuário criado!");
            }
            setModalOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Erro ao salvar usuário.");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await usuariosApi.deletar(deleteTarget.id);
            toast.success("Usuário removido.");
            setDeleteTarget(null);
            fetchData();
        } catch { toast.error("Não foi possível remover."); }
        finally { setDeleting(false); }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie os usuários do sistema</p>
                </div>
                <Button onClick={handleNew} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                </Button>
            </div>

            {/* Toggle inativos */}
            <div className="flex justify-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
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

            {/* User cards grid */}
            {loading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">Carregando...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Nenhum usuário encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((u) => (
                        <div key={u.id} className={`bg-card border border-border rounded-xl p-5 space-y-3 ${u.ativo === false ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-base truncate">{u.username}</p>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        {roleBadge(u.role)}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.ativo !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                            {u.ativo !== false ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(u)}>
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/30"
                                    onClick={() => setDeleteTarget(u)}
                                    disabled={u.id === currentUser?.id}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
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
                        <DialogTitle>{editingUser ? "Editar usuário" : "Novo usuário"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nome de usuário</Label>
                            <Input className="mt-1" placeholder="ex: joao.silva" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Senha {editingUser && <span className="text-muted-foreground font-normal">(deixe em branco para manter)</span>}</Label>
                            <Input className="mt-1" type="password" placeholder={editingUser ? "Nova senha (opcional)" : "Senha"} value={form.senha} onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Função</Label>
                            <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v as any, medicoId: v === "MEDICO" ? f.medicoId : "" }))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="MEDICO">Médico</SelectItem>
                                    <SelectItem value="SECRETARIA">Recepcionista</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {form.role === "MEDICO" && (
                            <div>
                                <Label>Vincular ao médico</Label>
                                <Select value={form.medicoId} onValueChange={(v) => setForm(f => ({ ...f, medicoId: v }))}>
                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um médico..." /></SelectTrigger>
                                    <SelectContent>
                                        {medicos.map((m) => (
                                            <SelectItem key={String(m.id)} value={String(m.id)}>Dr(a). {m.nome} — {m.crm}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {/* Ativo/Inativo */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.ativo}
                                onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.ativo ? "bg-primary" : "bg-muted"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.ativo ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                            <span className="text-sm font-medium">{form.ativo ? "Ativo" : "Inativo"}</span>
                        </label>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : editingUser ? "Salvar" : "Criar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{deleteTarget?.username}</strong>? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Removendo..." : "Remover"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}