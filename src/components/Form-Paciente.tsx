import { useState, useRef, useEffect } from "react";
import { pacientesApi, conveniosApi, type Paciente, type Convenio } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { X } from "lucide-react";

interface FormData {
  nome: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  convenioId: string;
  numeroCarteirinha: string;
  dataVencimentoCarteirinha: string;
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

const initialForm: FormData = {
  nome: "", dataNascimento: "", sexo: "", estadoCivil: "",
  cpf: "", email: "", telefone: "",
  cep: "", logradouro: "", numero: "", complemento: "",
  bairro: "", cidade: "", uf: "",
  convenioId: "", numeroCarteirinha: "", dataVencimentoCarteirinha: "",
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
  initialData?: Paciente;
}

export const FormCadastroPaciente = ({ onSuccess, initialData }: Props) => {
  const isEditing = !!initialData;

  const [form, setForm] = useState<FormData>(() =>
    initialData ? {
      nome: initialData.nome ?? "",
      dataNascimento: initialData.dataNascimento ?? "",
      sexo: initialData.sexo ?? "",
      estadoCivil: initialData.estadoCivil ?? "",
      cpf: initialData.cpf ?? "",
      email: initialData.email ?? "",
      telefone: initialData.telefone ?? "",
      cep: initialData.cep ?? "",
      logradouro: initialData.logradouro ?? "",
      numero: initialData.numero ?? "",
      complemento: initialData.complemento ?? "",
      bairro: initialData.bairro ?? "",
      cidade: initialData.cidade ?? "",
      uf: initialData.uf ?? "",
      convenioId: initialData.convenio?.id ? String(initialData.convenio.id) : "",
      numeroCarteirinha: initialData.numeroCarteirinha ?? "",
      dataVencimentoCarteirinha: initialData.dataVencimentoCarteirinha ?? "",
    } : initialForm
  );

  // Convênio autocomplete
  const [convenioQuery, setConvenioQuery] = useState(initialData?.convenio?.nome ?? "");
  const [convenioOpen, setConvenioOpen] = useState(false);
  const convenioRef = useRef<HTMLDivElement>(null);

  const { data: convenios = [] } = useQuery({
    queryKey: ["convenios"],
    queryFn: conveniosApi.listar,
    staleTime: 5 * 60 * 1000,
  });

  const conveniosFiltrados = convenios.filter((c) =>
    c.nome.toLowerCase().includes(convenioQuery.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (convenioRef.current && !convenioRef.current.contains(e.target as Node))
        setConvenioOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [errors, setErrors] = useState<FormErrors>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: any = { ...data };
      if (!data.convenioId) delete payload.convenioId;
      if (!data.numeroCarteirinha) delete payload.numeroCarteirinha;
      if (!data.dataVencimentoCarteirinha) delete payload.dataVencimentoCarteirinha;
      return isEditing
        ? pacientesApi.atualizar(initialData!.id!, payload)
        : pacientesApi.cadastrar(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      if (!isEditing) setForm(initialForm);
      toast.success(isEditing ? "Paciente atualizado com sucesso!" : "Paciente cadastrado com sucesso!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || (isEditing ? "Erro ao atualizar paciente" : "Erro ao cadastrar paciente"));
    },
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
              placeholder="Ex: João da Silva" autoComplete="name"
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

      {/* Convênio */}
      <Section title="Convênio">
        <Campo label="Convênio">
          <div ref={convenioRef} className="relative">
            <Input
              value={convenioQuery}
              onChange={(e) => {
                setConvenioQuery(e.target.value);
                setConvenioOpen(true);
                if (!e.target.value) set("convenioId", "");
              }}
              onFocus={() => setConvenioOpen(true)}
              placeholder="Digite para buscar convênio..."
              autoComplete="off"
              className="pr-8"
            />
            {convenioQuery && (
              <button
                type="button"
                onClick={() => { setConvenioQuery(""); set("convenioId", ""); setConvenioOpen(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {convenioOpen && conveniosFiltrados.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors border-b border-border/50"
                  onMouseDown={() => { setConvenioQuery(""); set("convenioId", ""); setConvenioOpen(false); }}
                >
                  — Sem convênio (particular)
                </button>
                {conveniosFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0
                                            ${form.convenioId === String(c.id) ? "font-medium bg-muted/50" : ""}`}
                    onMouseDown={() => {
                      setConvenioQuery(c.nome);
                      set("convenioId", String(c.id));
                      setConvenioOpen(false);
                    }}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Campo>

        {form.convenioId && (
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Número da Carteirinha">
              <Input
                name="numeroCarteirinha" value={form.numeroCarteirinha}
                onChange={handleChange} placeholder="Ex: 0012345678901"
              />
            </Campo>
            <Campo label="Vencimento da Carteirinha">
              <Input
                type="date" name="dataVencimentoCarteirinha"
                value={form.dataVencimentoCarteirinha} onChange={handleChange}
              />
            </Campo>
          </div>
        )}
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
          <Campo label="Logradouro">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? (isEditing ? "Salvando..." : "Cadastrando...")
            : (isEditing ? "Salvar alterações" : "Cadastrar paciente")}
        </Button>
      </div>
    </form>
  );
};