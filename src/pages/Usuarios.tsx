import { useEffect, useState } from "react";
import { Medico, usuariosApi, medicosApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Plus, Pencil, Trash2, Search, ShieldCheck, User, Stethoscope, Briefcase } from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UserRecord {
    id: string;
    username: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    ativo?: boolean;
    medicoId?: string | null;
}

interface UserForm {
    username: string;
    senha: string;
    role: "ADMIN" | "MEDICO" | "SECRETARIA";
    medicoId?: string;
}

const EMPTY_FORM: UserForm = {
    username: "",
    senha: "",
    role: "SECRETARIA",
    medicoId: "",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Usuarios() {
    const { user: currentUser } = useAuth();

    // if (currentUser?.role !== "ADMIN") {
    //     return <Navigate to="/" replace />;
    // }

    const [users, setUsers] = useState<UserRecord[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [form, setForm] = useState<UserForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Busca usuários ──────────────────────────────────────────────────────
    const fetchData = async () => {
        setLoading(true);
        try {
            // Busca usuários e médicos ao mesmo tempo
            const [usersData, medicosData] = await Promise.all([
                usuariosApi.listar(),
                medicosApi.listar()
            ]);
            setUsers(usersData as unknown as UserRecord[]);
            setMedicos(medicosData);
        } catch (err) {
            toast.error("Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── Filtro de busca ─────────────────────────────────────────────────────
    const filtered = users.filter((u) =>
        u.ativo !== false &&
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    // ── Abrir modal para criar ──────────────────────────────────────────────
    const handleNew = () => {
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    // ── Abrir modal para editar ─────────────────────────────────────────────
    const handleEdit = (u: UserRecord) => {
        setEditingUser(u);
        setForm({
            username: u.username,
            senha: "",
            role: u.role,
            medicoId: u.medico?.id || ""
        });
        setModalOpen(true);
    };

    // ── Salvar (criar ou editar) ────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.username.trim()) {
            toast.error("Nome de usuário é obrigatório.");
            return;
        }
        if (!editingUser && !form.senha.trim()) {
            toast.error("Senha é obrigatória para novos usuários.");
            return;
        }
        // Validação extra: se escolheu médico, tem que selecionar um médico
        if (form.role === "MEDICO" && !form.medicoId) {
            payload.medico = { id: form.medicoId };
            toast.error("Por favor, selecione qual médico deseja vincular.");
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                username: form.username.trim(),
                role: form.role,
            };

            if (form.senha && form.senha.trim() !== "") {
                payload.senha = form.senha.trim();
            }

            // O SEGREDO: Se for médico, manda o ID em formato de objeto
            if (form.role === "MEDICO" && form.medicoId) {
                payload.medico = { id: form.medicoId };
            } else {
                payload.medico = null; // Se mudar para secretária, desvincula
            }

            if (editingUser) {
                await usuariosApi.atualizar(editingUser.id, payload);
                toast.success("Usuário atualizado!");
            } else {
                await usuariosApi.cadastrar(payload);
                toast.success("Usuário criado!");
            }

            setModalOpen(false);
            fetchData(); // Recarrega a tabela
        } catch (err: any) {
            toast.error(err.message || "Erro ao salvar usuário.");
        } finally {
            setSaving(false);
        }
    };

    // ── Deletar ─────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await usuariosApi.deletar(deleteTarget.id);
            toast.success("Usuário removido.");
            setDeleteTarget(null);
            fetchData();
        } catch {
            toast.error("Não foi possível remover o usuário.");
        } finally {
            setDeleting(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <PageHeader
                title="Usuários"
                description="Gerencie os usuários do sistema"
                action={
                    <Button onClick={handleNew} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Novo usuário
                    </Button>
                }
            />

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                        Carregando...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                        <User className="w-8 h-8 opacity-30" />
                        <p className="text-sm">Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuário</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Função</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => (
                                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                                                        {u.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-foreground">{u.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <RoleBadge role={u.role} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(u)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteTarget(u)}
                                                        disabled={u.id === currentUser?.id}
                                                        title={u.id === currentUser?.id ? "Você não pode se remover" : "Remover"}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-border">
                            {filtered.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground text-sm truncate">{u.username}</p>
                                        <div className="mt-1">
                                            <RoleBadge role={u.role} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(u)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(u)}
                                            disabled={u.id === currentUser?.id}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="px-4 py-2 border-t border-border bg-muted/20">
                        <p className="text-xs text-muted-foreground">{filtered.length} usuário{filtered.length !== 1 ? "s" : ""}</p>
                    </div>
                )}
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Editar usuário" : "Novo usuário"}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="username">Nome de usuário</Label>
                            <Input
                                id="username"
                                placeholder="ex: joao.silva"
                                value={form.username}
                                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                            />
                        </div>


                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="senha">
                                Senha {editingUser && <span className="text-muted-foreground font-normal">(deixe em branco para manter)</span>}
                            </Label>
                            <Input
                                id="senha"
                                type="password"
                                placeholder={editingUser ? "Nova senha (opcional)" : "Senha"}
                                value={form.senha}
                                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                            />
                        </div>

                        {/* Seleção de Role */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Função</Label>
                            <Select
                                value={form.role}
                                onValueChange={(v) => {
                                    setForm((f) => ({
                                        ...f,
                                        role: v as "ADMIN" | "MEDICO" | "SECRETARIA",
                                        medicoId: v === "MEDICO" ? f.medicoId : "" // Limpa o médico se trocar de função
                                    }))
                                }}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MEDICO">Médico</SelectItem>
                                    <SelectItem value="SECRETARIA">Secretária</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Aparece APENAS se a função for MEDICO */}
                        {form.role === "MEDICO" && (
                            <div>
                                <Label htmlFor="medico">Vincular ao Perfil do Médico</Label>
                                <Select
                                    value={form.medicoId}
                                    onValueChange={(v) => setForm((f) => ({ ...f, medicoId: v }))}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecione um médico..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicos.map((m) => (
                                            <SelectItem key={m.id} value={m.id as string}>
                                                Dr(a). {m.nome} - CRM: {m.crm}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Salvando..." : editingUser ? "Salvar alterações" : "Criar usuário"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{deleteTarget?.username}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {deleting ? "Removendo..." : "Remover"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ── Badge de roles ajustado ───────────────────────────────────────────────────
function RoleBadge({ role }: { role: "ADMIN" | "MEDICO" | "SECRETARIA" }) {
    switch (role) {
        case "ADMIN":
            return (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                </Badge>
            );
        case "MEDICO":
            return (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
                    <Stethoscope className="w-3 h-3" />
                    Médico
                </Badge>
            );
        case "SECRETARIA":
            return (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                    <Briefcase className="w-3 h-3" />
                    Secretária
                </Badge>
            );
        default:
            return null;
    }
}