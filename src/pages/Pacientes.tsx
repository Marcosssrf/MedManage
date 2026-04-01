import { FormCadastroPaciente } from "../components/Form-Paciente";
import { pacientesApi } from "../services/api";
import type { Paciente } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Search, Users, User, Phone, Mail, MapPin, Calendar, Heart, Pencil, Cake, Hourglass } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";

export default function Pacientes() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
    const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);

    const { canAddPaciente } = usePermissions();

    const { data: pacientes, isLoading, error } = useQuery({
        queryKey: ["pacientes"],
        queryFn: pacientesApi.listar,
    });

    const filtered = pacientes
        ?.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search) || p.email.toLowerCase().includes(search.toLowerCase()) || p.telefone.includes(search))
        .sort((a, b) => a.nome.localeCompare(b.nome));

    const { paginated, page, totalPages, next, prev, goTo } = usePagination(filtered ?? [], 10);

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader
                title="Pacientes"
                description="Gerencie os pacientes da clínica"
                action={canAddPaciente ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Paciente
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Cadastrar Paciente</DialogTitle>
                            </DialogHeader>
                            <FormCadastroPaciente onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>) : undefined
                }
            />

            {/* Cards de resumo */}
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

            {/* Barra de busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar paciente por nome, CPF, email ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Tabela */}
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
                                        onClick={() => setSelectedPaciente(p)}
                                    >
                                        <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
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
                                            <Badge variant="secondary" className="text-xs">Ativo</Badge>
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

            {/* Dialog de detalhes do paciente */}
            <Dialog open={!!selectedPaciente} onOpenChange={(o) => !o && setSelectedPaciente(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <DialogTitle>Dados do Paciente</DialogTitle>
                            {/* BOTÃO EDITAR */}
                            {canAddPaciente && selectedPaciente && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingPaciente(selectedPaciente);
                                        setSelectedPaciente(null);
                                    }}
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Editar
                                </Button>
                            )}
                        </div>
                    </DialogHeader>
                    {selectedPaciente && (
                        <div className="space-y-5">
                            {/* Avatar e nome */}
                            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {selectedPaciente.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{selectedPaciente.nome}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{selectedPaciente.cpf}</p>
                                </div>
                            </div>

                            {/* Dados pessoais */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dados pessoais</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nascimento</p>
                                            <p>{selectedPaciente.dataNascimento ?? "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Cake className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Idade</p>
                                            <p>{selectedPaciente.idade ?? "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Sexo</p>
                                            <p className="capitalize">{selectedPaciente.sexo ?? "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Heart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Estado civil</p>
                                            <p className="capitalize">{selectedPaciente.estadoCivil?.replace("_", " ") ?? "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contato */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contato</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span>{selectedPaciente.email ?? "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span>{selectedPaciente.telefone ?? "—"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            {selectedPaciente.logradouro && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Endereço</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <span>
                                            {selectedPaciente.logradouro}
                                            {selectedPaciente.numero ? `, ${selectedPaciente.numero}` : ""}
                                            {selectedPaciente.complemento ? ` — ${selectedPaciente.complemento}` : ""}
                                            {selectedPaciente.bairro ? `, ${selectedPaciente.bairro}` : ""}
                                            {selectedPaciente.cidade ? ` — ${selectedPaciente.cidade}` : ""}
                                            {selectedPaciente.uf ? `/${selectedPaciente.uf}` : ""}
                                            {selectedPaciente.cep ? ` — CEP: ${selectedPaciente.cep}` : ""}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ✏️ Dialog de EDIÇÃO do paciente */}
            <Dialog open={!!editingPaciente} onOpenChange={(o) => !o && setEditingPaciente(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                    </DialogHeader>
                    {editingPaciente && (
                        <FormCadastroPaciente
                            initialData={editingPaciente}
                            onSuccess={() => setEditingPaciente(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}