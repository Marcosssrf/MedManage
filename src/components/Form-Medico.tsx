import { useState } from "react";
import { medicosApi, type Medico } from "../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface FormData {
    nome: string;
    dataNascimento: string;
    sexo: string;
    estadoCivil: string;
    cpf: string;
    crm: string;
    crmEstado: string;
    especialidade: string;
    email: string;
    telefone: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    ativo: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

interface ViaCepResponse {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
}

const ESTADOS_BR: string[] = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const ESPECIALIDADES: string[] = [
    "Acupuntura", "Alergia e Imunologia", "Anestesiologia", "Angiologia", "Cardiologia",
    "Cirurgia Cardiovascular", "Cirurgia da Mão", "Cirurgia de Cabeça e Pescoço",
    "Cirurgia do Aparelho Digestivo", "Cirurgia Geral", "Cirurgia Oncológica",
    "Cirurgia Pediátrica", "Cirurgia Plástica", "Cirurgia Torácica", "Cirurgia Vascular",
    "Clínica Médica", "Coloproctologia", "Dermatologia", "Endocrinologia e Metabologia",
    "Endoscopia", "Gastroenterologia", "Genética Médica", "Geriatria",
    "Ginecologia e Obstetrícia", "Hematologia e Hemoterapia", "Homeopatia", "Infectologia",
    "Mastologia", "Medicina de Emergência", "Medicina de Família e Comunidade",
    "Medicina do Trabalho", "Medicina Esportiva", "Medicina Física e Reabilitação",
    "Medicina Intensiva", "Medicina Legal e Perícia Médica", "Medicina Nuclear",
    "Medicina Preventiva e Social", "Nefrologia", "Neurocirurgia", "Neurologia",
    "Nutrologia", "Oftalmologia", "Oncologia Clínica", "Ortopedia e Traumatologia",
    "Otorrinolaringologia", "Patologia", "Patologia Clínica / Medicina Laboratorial",
    "Pediatria", "Pneumologia", "Psiquiatria", "Radiologia e Diagnóstico por Imagem",
    "Radioterapia", "Reumatologia", "Urologia",
];

const initialForm: FormData = {
    nome: "", dataNascimento: "", sexo: "", estadoCivil: "",
    cpf: "", crm: "", crmEstado: "", especialidade: "",
    email: "", telefone: "",
    cep: "", logradouro: "", numero: "", complemento: "",
    bairro: "", cidade: "", uf: "", ativo: true,
};

const maskCPF = (v: string): string =>
    v.replace(/\D/g, "").slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const maskPhone = (v: string): string => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 10) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    return digits.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
};

const maskCEP = (v: string): string =>
    v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

// ── Shared field wrapper ───────────────────────────────────────────────────
interface CampoProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

const Campo = ({ label, required, error, children }: CampoProps) => (
    <div className="space-y-1.5">
        <Label className={error ? "text-destructive" : ""}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

// ── Native select styled to match shadcn Input ─────────────────────────────
interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

const NativeSelect = ({ hasError, className = "", ...props }: NativeSelectProps) => (
    <select
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${hasError ? "border-destructive" : "border-input"}
            ${className}`}
        {...props}
    />
);

// ── Section card ───────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{title}</p>
        {children}
    </div>
);

interface Props {
    onSuccess?: () => void;
    initialData?: Medico;
}

export const FormCadastroMedico = ({ onSuccess, initialData }: Props) => {
    const isEditing = !!initialData;

    const [form, setForm] = useState<FormData>(() => initialData ? {
        nome: initialData.nome ?? "",
        dataNascimento: initialData.dataNascimento ?? "",
        sexo: initialData.sexo ?? "",
        estadoCivil: initialData.estadoCivil ?? "",
        cpf: initialData.cpf ?? "",
        crm: initialData.crm ?? "",
        crmEstado: initialData.crmEstado ?? "",
        especialidade: initialData.especialidade ?? "",
        email: initialData.email ?? "",
        telefone: initialData.telefone ?? "",
        cep: initialData.cep ?? "",
        logradouro: initialData.logradouro ?? "",
        numero: initialData.numero ?? "",
        complemento: initialData.complemento ?? "",
        bairro: initialData.bairro ?? "",
        cidade: initialData.cidade ?? "",
        uf: initialData.uf ?? "",
        ativo: initialData.ativo !== false,
    } : initialForm);

    const [errors, setErrors] = useState<FormErrors>({});
    const [buscandoCep, setBuscandoCep] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEditing ? medicosApi.atualizar(initialData!.id!, data) : medicosApi.cadastrar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["medicos"] });
            queryClient.invalidateQueries({ queryKey: ["medico", initialData?.id] });
            toast.success(isEditing ? "Médico atualizado com sucesso!" : "Médico cadastrado com sucesso!");
            onSuccess?.();
        },
        onError: (error: Error) => {
            toast.error(error.message || (isEditing ? "Erro ao atualizar médico" : "Erro ao cadastrar médico"));
        }
    });

    const set = (campo: keyof FormData, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        setErrors(prev => ({ ...prev, [campo]: undefined }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        if (name === "cpf") return set("cpf", maskCPF(value));
        if (name === "telefone") return set("telefone", maskPhone(value));
        if (name === "cep") return set("cep", maskCEP(value));
        set(name as keyof FormData, value);
    };

    const buscarCep = async (): Promise<void> => {
        const cep = form.cep.replace(/\D/g, "");
        if (cep.length !== 8) { setErrors(prev => ({ ...prev, cep: "CEP inválido" })); return; }
        setBuscandoCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data: ViaCepResponse = await res.json();
            if (data.erro) {
                setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
            } else {
                setForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro ?? "",
                    bairro: data.bairro ?? "",
                    cidade: data.localidade ?? "",
                    uf: data.uf ?? "",
                }));
                setErrors(prev => ({ ...prev, cep: undefined }));
            }
        } catch {
            setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }));
        }
        setBuscandoCep(false);
    };

    const validate = (): FormErrors => {
        const erros: FormErrors = {};
        if (!form.nome.trim()) erros.nome = "Campo obrigatório";
        if (!form.dataNascimento) erros.dataNascimento = "Campo obrigatório";
        if (!form.sexo) erros.sexo = "Campo obrigatório";
        if (!form.estadoCivil) erros.estadoCivil = "Campo obrigatório";
        if (!form.cpf || form.cpf.replace(/\D/g, "").length !== 11) erros.cpf = "CPF inválido";
        if (!form.crm.trim()) erros.crm = "Campo obrigatório";
        if (!form.crmEstado) erros.crmEstado = "Campo obrigatório";
        if (!form.especialidade) erros.especialidade = "Campo obrigatório";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) erros.email = "E-mail inválido";
        return erros;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const erros = validate();
        if (Object.keys(erros).length > 0) { setErrors(erros); return; }
        mutation.mutate(form);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Dados Pessoais */}
            <Section title="Dados Pessoais">
                <div className="space-y-3">
                    <Campo label="Nome Completo" required error={errors.nome}>
                        <Input
                            name="nome" value={form.nome} onChange={handleChange}
                            placeholder="Ex: Dr. João da Silva" autoComplete="name"
                            className={errors.nome ? "border-destructive" : ""}
                        />
                    </Campo>
                    <div className="grid grid-cols-2 gap-3">
                        <Campo label="Data de Nascimento" required error={errors.dataNascimento}>
                            <Input
                                type="date" name="dataNascimento" value={form.dataNascimento}
                                onChange={handleChange}
                                className={errors.dataNascimento ? "border-destructive" : ""}
                            />
                        </Campo>
                        <Campo label="Sexo biológico" required error={errors.sexo}>
                            <NativeSelect name="sexo" value={form.sexo} onChange={handleChange} hasError={!!errors.sexo}>
                                <option value="">Selecione</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="nao_informado">Prefiro não informar</option>
                            </NativeSelect>
                        </Campo>
                        <Campo label="Estado Civil" required error={errors.estadoCivil}>
                            <NativeSelect name="estadoCivil" value={form.estadoCivil} onChange={handleChange} hasError={!!errors.estadoCivil}>
                                <option value="">Selecione</option>
                                <option value="solteiro">Solteiro(a)</option>
                                <option value="casado">Casado(a)</option>
                                <option value="divorciado">Divorciado(a)</option>
                                <option value="viuvo">Viúvo(a)</option>
                                <option value="uniao_estavel">União estável</option>
                            </NativeSelect>
                        </Campo>
                        <Campo label="CPF" required error={errors.cpf}>
                            <Input
                                name="cpf" value={form.cpf} onChange={handleChange}
                                inputMode="numeric" maxLength={14} placeholder="000.000.000-00"
                                disabled={isEditing}
                                className={errors.cpf ? "border-destructive" : ""}
                            />
                        </Campo>
                    </div>
                </div>
            </Section>

            {/* Dados Profissionais */}
            <Section title="Dados Profissionais">
                <div className="grid grid-cols-2 gap-3">
                    <Campo label="CRM" required error={errors.crm}>
                        <Input
                            name="crm" value={form.crm} onChange={handleChange}
                            inputMode="numeric" maxLength={6} placeholder="000000"
                            disabled={isEditing}
                            className={errors.crm ? "border-destructive" : ""}
                        />
                    </Campo>
                    <Campo label="Estado do CRM" required error={errors.crmEstado}>
                        <NativeSelect name="crmEstado" value={form.crmEstado} onChange={handleChange} disabled={isEditing} hasError={!!errors.crmEstado}>
                            <option value="">Selecione</option>
                            {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </NativeSelect>
                    </Campo>
                    <div className="col-span-2">
                        <Campo label="Especialidade" required error={errors.especialidade}>
                            <NativeSelect name="especialidade" value={form.especialidade} onChange={handleChange} hasError={!!errors.especialidade}>
                                <option value="">Selecione</option>
                                {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                            </NativeSelect>
                        </Campo>
                    </div>
                </div>
            </Section>

            {/* Contato */}
            <Section title="Contato">
                <div className="grid grid-cols-2 gap-3">
                    <Campo label="E-mail" required error={errors.email}>
                        <Input
                            type="email" name="email" value={form.email} onChange={handleChange}
                            placeholder="exemplo@email.com" autoComplete="email"
                            className={errors.email ? "border-destructive" : ""}
                        />
                    </Campo>
                    <Campo label="Telefone / Celular" required error={errors.telefone}>
                        <Input
                            name="telefone" value={form.telefone} onChange={handleChange}
                            inputMode="numeric" maxLength={15} placeholder="(00) 00000-0000"
                            className={errors.telefone ? "border-destructive" : ""}
                        />
                    </Campo>
                </div>
            </Section>

            {/* Endereço */}
            <Section title="Endereço">
                <div className="space-y-3">
                    <div className="flex gap-3 items-end">
                        <div className="w-44">
                            <Campo label="CEP" error={errors.cep}>
                                <Input
                                    name="cep" value={form.cep} onChange={handleChange}
                                    inputMode="numeric" maxLength={9} placeholder="00000-000"
                                    className={errors.cep ? "border-destructive" : ""}
                                />
                            </Campo>
                        </div>
                        <Button type="button" variant="outline" onClick={buscarCep} disabled={buscandoCep}>
                            {buscandoCep ? "Buscando..." : "Buscar endereço"}
                        </Button>
                    </div>
                    <Campo label="Logradouro" error={errors.logradouro}>
                        <Input name="logradouro" value={form.logradouro} onChange={handleChange} autoComplete="street-address" />
                    </Campo>
                    <div className="grid grid-cols-3 gap-3">
                        <Campo label="Número">
                            <Input name="numero" value={form.numero} onChange={handleChange} inputMode="numeric" maxLength={10} />
                        </Campo>
                        <div className="col-span-2">
                            <Campo label="Complemento">
                                <Input name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto, bloco, sala..." />
                            </Campo>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Campo label="Bairro">
                            <Input name="bairro" value={form.bairro} onChange={handleChange} />
                        </Campo>
                        <Campo label="Cidade">
                            <Input name="cidade" value={form.cidade} onChange={handleChange} />
                        </Campo>
                        <Campo label="UF">
                            <NativeSelect name="uf" value={form.uf} onChange={handleChange}>
                                <option value="">—</option>
                                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </NativeSelect>
                        </Campo>
                    </div>
                </div>
            </Section>

            {/* Status */}
            {/* <Section title="Status">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={form.ativo}
                        onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                            ${form.ativo ? "bg-primary" : "bg-muted"}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                            ${form.ativo ? "translate-x-6" : "translate-x-1"}`}
                        />
                    </button>
                    <div>
                        <p className="text-sm font-medium">{form.ativo ? "Médico Ativo" : "Médico Inativo"}</p>
                        <p className="text-xs text-muted-foreground">
                            {form.ativo
                                ? "Aparece nas listagens e pode ter consultas"
                                : "Não aparece nas listagens ativas"}
                        </p>
                    </div>
                </label>
            </Section> */}

            <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending
                        ? (isEditing ? "Salvando..." : "Cadastrando...")
                        : (isEditing ? "Salvar alterações" : "Cadastrar médico")}
                </Button>
            </div>
        </form>
    );
};