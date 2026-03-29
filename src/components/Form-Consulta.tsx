import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { consultasApi, pacientesApi, medicosApi } from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";

interface Props {
    onSuccess?: () => void;
}

interface ItemSelecionado {
    id: string | number;
    nome: string;
    detalhe?: string;
}

interface AutocompleteProps {
    label: string;
    placeholder: string;
    selecionado: ItemSelecionado | null;
    onSelect: (item: ItemSelecionado) => void;
    onClear: () => void;
    suggestions: ItemSelecionado[];
    search: string;
    onSearchChange: (v: string) => void;
    disabled?: boolean;
    disabledValue?: string;
}

function Autocomplete({
    label, placeholder, selecionado, onSelect, onClear,
    suggestions, search, onSearchChange, disabled, disabledValue
}: AutocompleteProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium">{label} <span className="text-destructive">*</span></label>
            {disabled ? (
                <Input value={disabledValue ?? ""} disabled className="bg-muted" />
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder={placeholder}
                        value={selecionado ? `${selecionado.nome}${selecionado.detalhe ? ` — ${selecionado.detalhe}` : ""}` : search}
                        onChange={(e) => {
                            if (selecionado) return;
                            onSearchChange(e.target.value);
                            setShow(true);
                        }}
                        onFocus={() => setShow(true)}
                        onBlur={() => setTimeout(() => setShow(false), 150)}
                        autoComplete="off"
                    />
                    {selecionado && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-lg leading-none"
                            onClick={onClear}
                        >×</button>
                    )}
                    {show && !selecionado && suggestions.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3"
                                    onMouseDown={() => {
                                        onSelect(item);
                                        setShow(false);
                                    }}
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                                        {item.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.nome}</p>
                                        {item.detalhe && (
                                            <p className="text-xs text-muted-foreground">{item.detalhe}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function FormCadastroConsulta({ onSuccess }: Props) {
    const queryClient = useQueryClient();
    const { isAdmin, isSecretaria } = usePermissions();
    const { user } = useAuth();

    const [pacienteSearch, setPacienteSearch] = useState("");
    const [pacienteSelecionado, setPacienteSelecionado] = useState<ItemSelecionado | null>(null);

    const [medicoSearch, setMedicoSearch] = useState("");
    const [medicoSelecionado, setMedicoSelecionado] = useState<ItemSelecionado | null>(() => {
        if (user?.role === "MEDICO" && user.medico?.id) {
            return { id: user.medico.id, nome: user.medico.nome, detalhe: user.medico.especialidade };
        }
        return null;
    });

    const [data, setData] = useState("");
    const [horario, setHorario] = useState("");
    const [observacoes, setObservacoes] = useState("");

    const { data: pacientes = [] } = useQuery({
        queryKey: ["pacientes"],
        queryFn: pacientesApi.listar,
    });

    const { data: medicos = [] } = useQuery({
        queryKey: ["medicos"],
        queryFn: medicosApi.listar,
        enabled: isAdmin || isSecretaria,
    });

    const pacienteSuggestions = pacientes
        .filter((p) => p.nome.toLowerCase().includes(pacienteSearch.toLowerCase()) && pacienteSearch.length > 0)
        .slice(0, 6)
        .map((p) => ({ id: p.id!, nome: p.nome, detalhe: p.cpf }));

    const medicoSuggestions = medicos
        .filter((m) => m.nome.toLowerCase().includes(medicoSearch.toLowerCase()) && medicoSearch.length > 0)
        .slice(0, 6)
        .map((m) => ({ id: m.id!, nome: m.nome, detalhe: m.especialidade }));

    const mutation = useMutation({
        mutationFn: consultasApi.agendar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Consulta agendada com sucesso!");
            onSuccess?.();
        },
        onError: () => toast.error("Erro ao agendar consulta."),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pacienteSelecionado) return toast.error("Selecione um paciente.");
        if (!medicoSelecionado) return toast.error("Selecione um médico.");
        if (!data || !horario) return toast.error("Informe data e horário.");

        mutation.mutate({
            pacienteId: pacienteSelecionado.id,
            medicoId: medicoSelecionado.id,
            data,
            horario: `${horario}:00`,
            observacoes,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">

            <Autocomplete
                label="Paciente"
                placeholder="Buscar paciente por nome..."
                selecionado={pacienteSelecionado}
                onSelect={setPacienteSelecionado}
                onClear={() => { setPacienteSelecionado(null); setPacienteSearch(""); }}
                suggestions={pacienteSuggestions}
                search={pacienteSearch}
                onSearchChange={setPacienteSearch}
            />

            <Autocomplete
                label="Médico"
                placeholder="Buscar médico por nome..."
                selecionado={medicoSelecionado}
                onSelect={setMedicoSelecionado}
                onClear={() => { setMedicoSelecionado(null); setMedicoSearch(""); }}
                suggestions={medicoSuggestions}
                search={medicoSearch}
                onSearchChange={setMedicoSearch}
                disabled={user?.role === "MEDICO"}
                disabledValue={user?.medico ? `${user.medico.nome} — ${user.medico.especialidade}` : ""}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Data <span className="text-destructive">*</span></label>
                    <Input
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Horário <span className="text-destructive">*</span></label>
                    <Input
                        type="time"
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                    className="w-full min-h-[80px] px-3 py-2 border border-border rounded-lg bg-card text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Informações adicionais sobre a consulta..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Agendando..." : "Agendar consulta"}
                </Button>
            </div>
        </form>
    );
}