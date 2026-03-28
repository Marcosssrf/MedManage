import { FormCadastroMedico } from "../components/Form-Medico";
import { useQuery } from "@tanstack/react-query";
import { medicosApi } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "radix-ui";
import { Button } from "radix-ui"
import PageHeader from "../components/PageHeader";

export default function Medicos() {
    const { data: medicos, isLoading, error } = useQuery({
        queryKey: ["medicos"],
        queryFn: medicosApi.listar,
    });
    const filtered = medicos?.filter((m) =>
        m.nome.toLowerCase().includes(m.nome.toLowerCase())
    ).sort((a, b) => a.nome.localeCompare(b.nome));
    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Pacientes"
                description="Gerencie os pacientes da clínica"
                action={
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" />Novo Paciente</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cadastrar Paciente</DialogTitle>
                            </DialogHeader>
                            <FormCadastroMedico />
                        </DialogContent>
                    </Dialog>
                }
            />

            <div className="space-y-6">

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 text-center text-muted-foreground">Carregando...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-muted-foreground">Conecte seu backend para ver os dados</div>
                    ) : !filtered?.length ? (
                        <div className="p-6 text-center text-muted-foreground">Nenhum medico encontrado</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Crm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((m) => (
                                        <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                            <td className="py-3 px-4 font-medium">{m.nome}</td>
                                            <td className="py-3 px-4 font-mono text-xs">{m.crm}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}