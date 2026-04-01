import { useState } from "react";
import { pacientesApi, type Paciente } from "../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FormData {
  nome: string;
  dataNascimento: string;
  idade?: string;
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
}

type FormErrors = Partial<Record<keyof FormData, string>>;

interface CampoProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

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

const fieldsetStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 10,
  padding: "1.25rem 1.5rem",
  marginBottom: "1.25rem",
};

const legendStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#888",
  padding: "0 8px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const btnSecStyle: React.CSSProperties = {
  height: 36,
  border: "1px solid #ddd",
  borderRadius: 6,
  background: "transparent",
  fontSize: 13,
  cursor: "pointer",
  padding: "0 12px",
  fontFamily: "inherit",
};

const btnPrimaryStyle: React.CSSProperties = {
  height: 40,
  padding: "0 28px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "transparent",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

// ── Props agora aceita initialData para modo edição ──────────────────────────
interface Props {
  onSuccess?: () => void;
  initialData?: Paciente;
}

const Campo = ({ id, label, required, error, children }: CampoProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label htmlFor={id} style={{ fontSize: 13, color: "#666" }}>
      {label} {required && <span style={{ color: "red", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <span style={{ color: "red", fontSize: 12 }}>{error}</span>}
  </div>
);

export const FormCadastroPaciente = ({ onSuccess, initialData }: Props) => {
  const isEditing = !!initialData;

  // Pré-preenche o form com os dados do paciente quando em modo edição
  const [form, setForm] = useState<FormData>(() =>
    initialData
      ? {
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
      }
      : initialForm
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? pacientesApi.atualizar(initialData!.id!, data)
        : pacientesApi.cadastrar(data),
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
    setForm((prev => ({ ...prev, [campo]: valor })));
    setErrors(prev => ({ ...prev, [campo]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    if (name === "cpf") return set("cpf", maskCPF(value));
    if (name === "telefone") return set("telefone", maskPhone(value));
    if (name === "cep") return set("cep", maskCEP(value));
    set(name as keyof FormData, value);
  };

  const buscarCep = async (): Promise<void> => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
      return;
    }
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
      } else {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? "",
          bairro: data.bairro ?? "",
          cidade: data.localidade ?? "",
          uf: data.uf ?? "",
        }));
        setErrors((prev) => ({ ...prev, cep: undefined }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, cep: "Erro ao buscar CEP" }));
    }
    setBuscandoCep(false);
  };

  const validate = (): FormErrors => {
    const erros: FormErrors = {};
    if (!form.nome.trim()) erros.nome = "Campo obrigatório";
    if (!form.dataNascimento) erros.dataNascimento = "Campo obrigatório";
    if (!form.sexo) erros.sexo = "Campo obrigatório";
    if (!form.estadoCivil) erros.estadoCivil = "Campo obrigatório";
    if (!form.cpf || form.cpf.replace(/\D/g, "").length !== 11)
      erros.cpf = "CPF inválido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      erros.email = "E-mail inválido";
    return erros;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const erros = validate();
    if (Object.keys(erros).length > 0) {
      setErrors(erros);
      return;
    }
    mutation.mutate(form);
  };

  const inputStyle = (campo: keyof FormData): React.CSSProperties => ({
    height: 36,
    padding: "0 10px",
    border: `1px solid ${errors[campo] ? "red" : "#ddd"}`,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "inherit",
  });

  const selectStyle = (campo: keyof FormData): React.CSSProperties => ({
    ...inputStyle(campo),
    background: "white",
  });

  return (
    <div style={{ maxWidth: 680, fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} noValidate>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Dados Pessoais</legend>
          <div style={grid2}>
            <div style={{ gridColumn: "span 2" }}>
              <Campo id="nome" label="Nome Completo" required error={errors.nome}>
                <input
                  id="nome" name="nome" type="text" value={form.nome} onChange={handleChange}
                  style={inputStyle("nome")} placeholder="Ex: João da Silva" autoComplete="name"
                />
              </Campo>
            </div>

            <Campo id="dataNascimento" label="Data de Nascimento" required error={errors.dataNascimento}>
              <input
                id="dataNascimento" name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange}
                style={inputStyle("dataNascimento")}
              />
            </Campo>

            <Campo id="sexo" label="Sexo biológico" required error={errors.sexo}>
              <select id="sexo" name="sexo" value={form.sexo} onChange={handleChange} style={selectStyle("sexo")}>
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="nao_informado">Prefiro não informar</option>
              </select>
            </Campo>

            <Campo id="estadoCivil" label="Estado civil" required error={errors.estadoCivil}>
              <select id="estadoCivil" name="estadoCivil" value={form.estadoCivil} onChange={handleChange} style={selectStyle("estadoCivil")}>
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União estável</option>
              </select>
            </Campo>

            <Campo id="cpf" label="CPF" required error={errors.cpf}>
              <input
                id="cpf" name="cpf" type="text"
                value={form.cpf} onChange={handleChange}
                style={{ ...inputStyle("cpf"), ...(isEditing ? { background: "#f5f5f5", color: "#999", cursor: "not-allowed" } : {}) }}
                inputMode="numeric" maxLength={14}
                placeholder="000.000.000-00"
                disabled={isEditing}
              />
            </Campo>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Contato</legend>
          <div style={grid2}>
            <Campo id="email" label="E-mail" required error={errors.email}>
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                style={inputStyle("email")} placeholder="exemplo@email.com"
                inputMode="email" autoComplete="email"
              />
            </Campo>

            <Campo id="telefone" label="Telefone / celular" required error={errors.telefone}>
              <input
                id="telefone" name="telefone" type="text"
                value={form.telefone} onChange={handleChange}
                style={inputStyle("telefone")}
                inputMode="numeric" maxLength={15}
                placeholder="(00) 00000-0000"
              />
            </Campo>
          </div>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Endereço</legend>
          <div style={{ display: "grid", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "end" }}>
              <Campo id="cep" label="CEP" error={errors.cep}>
                <input
                  id="cep" name="cep" type="text"
                  value={form.cep} onChange={handleChange}
                  style={inputStyle("cep")}
                  inputMode="numeric" maxLength={9}
                  placeholder="00000-000"
                />
              </Campo>
              <button type="button" onClick={buscarCep} disabled={buscandoCep} style={btnSecStyle}>
                {buscandoCep ? "Buscando..." : "Buscar endereço"}
              </button>
            </div>

            <Campo id="logradouro" label="Logradouro" error={errors.logradouro}>
              <input
                id="logradouro" name="logradouro" type="text"
                value={form.logradouro} onChange={handleChange}
                style={inputStyle("logradouro")}
                autoComplete="street-address"
              />
            </Campo>

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
              <Campo id="numero" label="Número" error={errors.numero}>
                <input
                  id="numero" name="numero" type="text"
                  value={form.numero} onChange={handleChange}
                  style={inputStyle("numero")}
                  inputMode="numeric" maxLength={10}
                />
              </Campo>
              <Campo id="complemento" label="Complemento" error={errors.complemento}>
                <input
                  id="complemento" name="complemento" type="text"
                  value={form.complemento} onChange={handleChange}
                  style={inputStyle("complemento")}
                  placeholder="Apto, bloco, sala..."
                />
              </Campo>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12 }}>
              <Campo id="bairro" label="Bairro" error={errors.bairro}>
                <input id="bairro" name="bairro" type="text" value={form.bairro} onChange={handleChange} style={inputStyle("bairro")} />
              </Campo>
              <Campo id="cidade" label="Cidade" error={errors.cidade}>
                <input id="cidade" name="cidade" type="text" value={form.cidade} onChange={handleChange} style={inputStyle("cidade")} />
              </Campo>
              <Campo id="uf" label="UF" error={errors.uf}>
                <select id="uf" name="uf" value={form.uf} onChange={handleChange} style={selectStyle("uf")}>
                  <option value="">—</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </Campo>
            </div>
          </div>
        </fieldset>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            type="submit"
            style={{ ...btnPrimaryStyle, opacity: mutation.isPending ? 0.6 : 1, cursor: mutation.isPending ? "not-allowed" : "pointer" }}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? (isEditing ? "Salvando..." : "Cadastrando...")
              : (isEditing ? "Salvar alterações" : "Cadastrar paciente")
            }
          </button>
        </div>

      </form>
    </div>
  );
};