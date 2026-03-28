import { FormCadastroPaciente } from "../components/Form-Paciente";
import { pacientesApi } from "../services/api";
import { useQuery } from "@tanstack/react-query";

export default function Pacientes() {
    const { data: pacientes, isLoading, error } = useQuery({
        queryKey: ["pacientes"],
        queryFn: pacientesApi.listar,
    });
    const filtered = pacientes?.filter((p) =>
        p.nome.toLowerCase().includes(p.nome.toLowerCase())
    ).sort((a, b) => a.nome.localeCompare(b.nome));
    return (
        <div className="space-y-6">
            <FormCadastroPaciente />
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-muted-foreground">Carregando...</div>
                ) : error ? (
                    <div className="p-6 text-center text-muted-foreground">Conecte seu backend para ver os dados</div>
                ) : !filtered?.length ? (
                    <div className="p-6 text-center text-muted-foreground">Nenhum paciente encontrado</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">CPF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                        <td className="py-3 px-4 font-medium">{p.nome}</td>
                                        <td className="py-3 px-4 font-mono text-xs">{p.cpf}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}