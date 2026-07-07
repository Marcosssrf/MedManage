import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type Consulta, consultasApi, medicosApi, pacientesApi} from "../services/api";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {toast} from "sonner";
import {Search} from "lucide-react";
import {usePermissions} from "../hooks/usePermissions";
import {useAuth} from "../context/AuthContext";

interface Props {
    onSuccess?: () => void;
    initialData?: Consulta;
    prefillData?: string;
    prefillHorario?: string;
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

export function FormCadastroConsulta({ onSuccess, initialData, prefillData, prefillHorario }: Props) {
    const queryClient = useQueryClient();
    const { isAdmin, isSecretaria } = usePermissions();
    const { user } = useAuth();
    const isEditing = !!initialData;

    const [pacienteSearch, setPacienteSearch] = useState("");
    const [pacienteSelecionado, setPacienteSelecionado] = useState<ItemSelecionado | null>(
        initialData ? { id: initialData.pacienteId, nome: initialData.pacienteNome ?? "" } : null
    );

    const [medicoSearch, setMedicoSearch] = useState("");
    const [medicoSelecionado, setMedicoSelecionado] = useState<ItemSelecionado | null>(() => {
        if (initialData) return { id: initialData.medicoId, nome: initialData.medicoNome ?? "", detalhe: initialData.medicoEspecialidade };
        if (user?.role === "MEDICO" && user.medico?.id) {
            return { id: user.medico.id, nome: user.medico.nome, detalhe: user.medico.especialidade };
        }
        return null;
    });

    const toInputDate = (dataBr: string) => {
        if (!dataBr) return "";
        if (dataBr.includes("/")) return dataBr.split("/").reverse().join("-");
        return dataBr;
    };

    const [data, setData] = useState(initialData ? toInputDate(initialData.data) : (prefillData ?? ""));
    const [horario, setHorario] = useState(initialData ? (initialData.horario?.slice(0, 5) ?? "") : (prefillHorario ?? ""));
    const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? "");
    const [tipoConsulta, setTipoConsulta] = useState(initialData?.tipoConsulta ?? "PRIMEIRA_CONSULTA");

    const { data: pacientes = [] } = useQuery({
        queryKey: ["pacientes"],
        queryFn: () => pacientesApi.listar(),
    });

    const { data: medicos = [] } = useQuery({
        queryKey: ["medicos"],
        queryFn: () => medicosApi.listar(),
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
        mutationFn: (payload: any) =>
            isEditing
                ? consultasApi.atualizar(initialData!.id!, { data, horario: `${horario}:00`, observacoes, tipoConsulta })
                : consultasApi.agendar(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success(isEditing ? "Consulta atualizada com sucesso!" : "Consulta agendada com sucesso!");
            onSuccess?.();
        },
        onError: (e: Error) => toast.error(e?.message || (isEditing ? "Erro ao atualizar consulta." : "Erro ao agendar consulta.")),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSelecionado) return toast.error("Selecione um paciente.");
        if (!medicoSelecionado) return toast.error("Selecione um médico.");
        if (!data || !horario) return toast.error("Informe data e horário.");
        if (!tipoConsulta) return toast.error("Informe o tipo de consulta.");

        mutation.mutate({
            pacienteId: pacienteSelecionado.id,
            medicoId: medicoSelecionado.id,
            data,
            horario: `${horario}:00`,
            observacoes,
            tipoConsulta,
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
                disabled={isEditing}
                disabledValue={initialData?.pacienteNome}
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
                disabled={isEditing || user?.role === "MEDICO"}
                disabledValue={isEditing
                    ? `${initialData?.medicoNome} — ${initialData?.medicoEspecialidade}`
                    : user?.medico ? `${user.medico.nome} — ${user.medico.especialidade}` : ""}
            />

            {/*Tipo de Consulta */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Consulta <span className="text-destructive">*</span></label>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={tipoConsulta}
                    onChange={(e) => setTipoConsulta(e.target.value)}
                >
                    <option value="PRIMEIRA_CONSULTA">Primeira Consulta</option>
                    <option value="RETORNO">Retorno</option>
                    <option value="URGENCIA">Urgencia</option>
                    <option value="EXAME">Exame</option>
                    <option value="ROTINA">Rotina</option>
                    <option value="TELEMEDICINA">Telemedicina</option>
                    <option value="PRE_OPERATORIO">Pre Operatorio</option>
                    <option value="POS_OPERATORIO">Pos Operatorio</option>
                </select>
            </div>

            {/* Data e horário */}
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
                    {mutation.isPending
                        ? (isEditing ? "Salvando..." : "Agendando...")
                        : (isEditing ? "Salvar alterações" : "Agendar consulta")}
                </Button>
            </div>
        </form>
    );
}
