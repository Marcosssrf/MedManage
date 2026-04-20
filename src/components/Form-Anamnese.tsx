import {useCallback, useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {Button} from "./ui/button";
import type {Anamnese, Consulta} from "../services/api";
import {anamneseApi} from "../services/api";
import {CidAutocomplete, TextAreaField} from "../consultas/SharedComponents";

interface Props {
    consulta: Consulta;
    onClose: () => void;
}

const EMPTY_FIELDS = {
    queixaPrincipal: "",
    historiaMolestiaPrincipal: "",
    exameFisico: "",
    hipoteseDiagnostica: "",
    solicitacaoDeExames: "",
    encaminhamento: "",
    condutaMedica: "",
    cidCodigo: "",
};

export function AnamneseForm({ consulta, onClose }: Props) {
    const queryClient = useQueryClient();
    const [fields, setFields] = useState(EMPTY_FIELDS);
    const [initialized, setInitialized] = useState(false);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["anamnese", consulta.id],
        queryFn: () => anamneseApi.buscarPorConsulta(consulta.id!),
    });

    useEffect(() => {
        if (!initialized && !isLoading) {
            if (existing) {
                setFields({
                    queixaPrincipal: existing.queixaPrincipal ?? "",
                    historiaMolestiaPrincipal: existing.historiaMolestiaPrincipal ?? "",
                    exameFisico: existing.exameFisico ?? "",
                    hipoteseDiagnostica: existing.hipoteseDiagnostica ?? "",
                    solicitacaoDeExames: existing.solicitacaoDeExames ?? "",
                    encaminhamento: existing.encaminhamento ?? "",
                    condutaMedica: existing.condutaMedica ?? "",
                    cidCodigo: existing.cidCodigo ?? "",
                });
            }
            setInitialized(true);
        }
    }, [existing, isLoading, initialized]);

    const set = useCallback((field: string) => (value: string) => {
        setFields(prev => ({ ...prev, [field]: value }));
    }, []);

    const mutation = useMutation({
        mutationFn: (data: typeof fields) => {
            if (existing?.id) {
                toast.error("O backend não permite atualizar anamnese.");
                return Promise.reject(new Error("Já existe anamnese"));
            }
            const payload: Omit<Anamnese, "id"> = {
                consultaId: consulta.id!,
                queixaPrincipal: data.queixaPrincipal,
                historiaMolestiaPrincipal: data.historiaMolestiaPrincipal || undefined,
                exameFisico: data.exameFisico || undefined,
                hipoteseDiagnostica: data.hipoteseDiagnostica || undefined,
                solicitacaoDeExames: data.solicitacaoDeExames || undefined,
                encaminhamento: data.encaminhamento || undefined,
                condutaMedica: data.condutaMedica || undefined,
                cidCodigo: data.cidCodigo || undefined,
            };
            return anamneseApi.cadastrar(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["anamnese", consulta.id] });
            queryClient.invalidateQueries({ queryKey: ["consultas"] });
            toast.success("Anamnese salva!");
            onClose();
        },
        onError: (err: any) => {
            if (!err.message?.includes("Já existe")) toast.error("Erro ao salvar anamnese.");
        },
    });

    if (isLoading || !initialized)
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>;

    const jaExiste = !!existing?.id;

    return (
        <div className="space-y-4 py-2">
            {jaExiste && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                    Anamnese já registrada (somente leitura — o backend não suporta edição).
                </div>
            )}
            <TextAreaField label="Queixa Principal *" value={fields.queixaPrincipal} onChange={set("queixaPrincipal")} />
            <TextAreaField label="História da Moléstia Atual" value={fields.historiaMolestiaPrincipal} onChange={set("historiaMolestiaPrincipal")} />
            <TextAreaField label="Exame Físico" value={fields.exameFisico} onChange={set("exameFisico")} />
            <TextAreaField label="Hipótese Diagnóstica" value={fields.hipoteseDiagnostica} onChange={set("hipoteseDiagnostica")} />
            <TextAreaField label="Exames Solicitados" value={fields.solicitacaoDeExames} onChange={set("solicitacaoDeExames")} />
            <TextAreaField label="Encaminhamento" value={fields.encaminhamento} onChange={set("encaminhamento")} />
            <TextAreaField label="Conduta Médica" value={fields.condutaMedica} onChange={set("condutaMedica")} />
            <CidAutocomplete value={fields.cidCodigo} onChange={set("cidCodigo")} />

            {!jaExiste ? (
                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={() => mutation.mutate(fields)}
                        disabled={mutation.isPending || !fields.queixaPrincipal.trim()}
                        className="flex-1"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {mutation.isPending ? "Salvando..." : "Salvar Anamnese"}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                </div>
            ) : (
                <Button variant="outline" onClick={onClose} className="w-full">Fechar</Button>
            )}
        </div>
    );
}

// ─── Visualização de anamnese somente leitura ──
export function AnamneseView({ anamnese }: { anamnese: Anamnese }) {
    const campos: [string, string | undefined, boolean?][] = [
        ["Queixa Principal", anamnese.queixaPrincipal],
        ["História da Moléstia Atual", anamnese.historiaMolestiaPrincipal],
        ["Exame Físico", anamnese.exameFisico, true],
        ["Hipótese Diagnóstica", anamnese.hipoteseDiagnostica],
        ["Exames Solicitados", anamnese.solicitacaoDeExames],
        ["Encaminhamento", anamnese.encaminhamento],
        ["Conduta Médica", anamnese.condutaMedica, true],
        ["Código CID", anamnese.cidCodigo],
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
            {campos.map(([label, value, fullWidth]) =>
                value ? (
                    <div key={String(label)} className={fullWidth ? "sm:col-span-2" : ""}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                ) : null
            )}
        </div>
    );
}
