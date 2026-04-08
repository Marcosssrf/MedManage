import { authService } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const credentials = authService.getCredentials();
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(credentials ? { Authorization: `Basic ${credentials}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
}

const formatDateToBr = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.includes("/")) return dateString;
    return dateString.split("-").reverse().join("/");
}

const formatDateToIso = (dateString?: string) => {
    if (!dateString) return undefined;
    if (dateString.includes("-")) return dateString; // Já está no formato ISO
    return dateString.split("/").reverse().join("-");
};

export interface Paciente {
    id?: string | number;
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
    convenio?: {
        nome: string;
    };
    numeroCarteirinha?: string;
    dataVencimentoCarteirinha?: string;
}

export const pacientesApi = {
    // Retorna apenas: id, nome, cpf, telefone, email
    listar: async () => {
        const res = await request<Paciente[]>("/pacientes");
        return res as Paciente[];
    },

    // Busca todos os dados completos do paciente
    buscarPorId: async (id: string | number) => {
        const p = await request<any>(`/pacientes/${id}`);
        return {
            ...p,
            dataNascimento: p.dataNascimento ? formatDateToBr(p.dataNascimento) : "",
            dataVencimentoCarteirinha: p.dataVencimentoCarteirinha ? formatDateToBr(p.dataVencimentoCarteirinha) : "",
        } as Paciente;
    },

    cadastrar: (data: Omit<Paciente, "id">) =>
        request<Paciente>("/pacientes", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    atualizar: (id: string | number, dados: Partial<Paciente>) =>
        request<Paciente>(`/pacientes/${id}`, {
            method: "PATCH",
            body: JSON.stringify(dados),
        }),
};

export interface Medico {
    id?: string | number;
    nome: string;
    dataNascimento: string;
    idade?: string;
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
}

export const medicosApi = {
    listar: async () => {
        const res = await request<Medico[]>("/medicos");
        return res.map(m => ({
            ...m,
            dataNascimento: formatDateToBr(m.dataNascimento)
        }));
    },

    cadastrar: (data: Omit<Medico, "id">) =>
        request<Medico>("/medicos", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    atualizar: (id: string | number, dados: Partial<Medico>) =>
        request<Medico>(`/medicos/${id}`, {
            method: "PATCH",
            body: JSON.stringify(dados),
        })

};

export interface Consulta {
    id?: string | number;
    pacienteId: string | number;
    medicoId: string | number;
    pacienteNome?: string;
    medicoNome?: string;
    medicoEspecialidade?: string;
    tipoConsulta: string;
    data: string;
    horario: string;
    status: string;
    observacoes?: string;
}

export const consultasApi = {
    listar: async () => {
        const res = await request<any[]>("/consultas");

        return res.map((c) => {
            const [data, horario] = (c.dataHora || "").split("T");
            const dataBr = data ? data.split("-").reverse().join("/") : "";

            return {
                id: c.id,
                pacienteId: c.pacienteId ?? "",
                medicoId: c.medicoId ?? c.medico?.id ?? "",
                pacienteNome: c.nomePaciente,
                medicoNome: c.nomeMedico,
                medicoEspecialidade: c.especialidadeMedico,
                tipoConsulta: c.tipoConsulta,
                data: dataBr,
                horario: horario,
                status: c.status,
                observacoes: c.observacoes,
            } as Consulta;
        });
    },

    agendar: async (
        data: Omit<Consulta, "id" | "status" | "pacienteNome" | "medicoNome">,
    ) => {
        const dataIso = data.data.includes("/")
            ? data.data.split("/").reverse().join("-")
            : data.data;

        const dataHora = `${dataIso}T${data.horario}`;

        const body = {
            pacienteId: data.pacienteId,
            medicoId: data.medicoId,
            dataHora: dataHora,
            tipoConsulta: data.tipoConsulta,
            observacoes: data.observacoes,
        };

        return request<Consulta>("/consultas", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    cancelar: (id: string | number) =>
        request(`/consultas/${id}/cancelar`, {
            method: "PUT",
        }),

    atualizar: (id: string | number, dados: { data: string; horario: string; observacoes?: string; tipoConsulta?: string }) => {
        const dataIso = dados.data.includes("/")
            ? dados.data.split("/").reverse().join("-")
            : dados.data;

        return request(`/consultas/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                dataHora: `${dataIso}T${dados.horario}`,
                observacoes: dados.observacoes,
                tipoConsulta: dados.tipoConsulta,
            }),
        });
    },
};


export interface Pagamento {
    id?: string | number;
    consultaId: string | number;
    pacienteNome?: string;
    medicoNome?: string;
    valor: number;
    convenio?: string;
    formaPagamento: string;
    tipoPagamento: string;
    status: string;
    data: string;
}


export const pagamentosApi = {
    listar: async () => {
        const res = await request<any[]>("/pagamentos");

        return res.map((p) => ({
            id: p.id,
            consultaId: p.consulta?.id ?? "",
            pacienteNome: p.consulta?.pacienteNome,
            medicoNome: p.consulta?.medicoNome,
            valor: p.valor,
            convenio: p.convenio,
            formaPagamento: p.formaPagamento,
            tipoPagamento: p.tipoPagamento,
            status: p.statusPagamento,
            data: formatDateToBr(p.dataPagamento),
        } as Pagamento));
    },

    registrar: (data: Omit<Pagamento, "id" | "status" | "pacienteNome" | "medicoNome">) => {
        const body = {
            consultaId: data.consultaId,
            valor: data.valor,
            formaPagamento: data.formaPagamento,
            tipoPagamento: data.tipoPagamento,
            dataPagamento: `${data.data}T00:00:00`,
        };

        return request<Pagamento>("/pagamentos", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    confirmar: (id: string | number) => {
        return request(`/pagamentos/${id}/confirmar`, {
            method: "PATCH",
        });
    }
};

export const relatoriosApi = {
    faturamentoPorMes: (ano: number) =>
        request<Record<string, number>>(`/relatorios/faturamento?ano=${ano}`),

    medicoMaisAtendido: () =>
        request<{ nome: string; totalConsultas: number }>("/relatorios/medico-mais-atendido"),

    resumo: () =>
        request<{
            totalPacientes: number;
            totalMedicos: number;
            consultasHoje: number;
            faturamentoMensal: number;
        }>("/dashboard/resumo"),
};

export interface Usuario {
    id: string;
    username: string;
    role: string;
    ativo: boolean;
    senha?: string;
    medico?: {
        id: string;
        nome?: string;
    } | null;
}

export const usuariosApi = {
    listar: async () => {
        const res = await request<any[]>("/usuarios");

        return res.map((u) => ({
            id: u.id,
            username: u.username,
            role: u.role ?? u.role,
            ativo: u.ativo,
            medico: u.medico || null,
        } as Usuario));
    },

    cadastrar: (data: Omit<Usuario, "id" | "ativo">) =>
        request<Usuario>("/usuarios", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    atualizar: (id: string | number, dados: Partial<Usuario>) =>
        request<Usuario>(`/usuarios/${id}`, {
            method: "PATCH",
            body: JSON.stringify(dados),
        }),

    deletar: (id: string | number) =>
        request(`/usuarios/${id}`, {
            method: "DELETE",
        }),
};


export interface HistoricoClinico {
    id?: string;
    pacienteId: string | number;
    tipoSanguineo?: string;
    peso?: number;
    altura?: number;
    imc?: number;
    alergias?: string;
    doencasPreexistentes?: string;
    cirurgiasPrevias?: string;
    historicoFamiliar?: string;
    medicamentosUso?: string;
    tabagismo?: boolean;
    etilismo?: boolean;
    atividadeFisica?: boolean;
    usoDrogas?: boolean;
}

export const historicoClinicoApi = {
    listar: () =>
        request<HistoricoClinico[]>("/historicosClinicos"),

    buscarPorId: (id: string) =>
        request<HistoricoClinico>(`/historicosClinicos/${id}`),

    buscarPorPaciente: async (pacienteId: string) => {
        const res = await request<any[]>(`/historicosClinicos/paciente/${pacienteId}`);
        const h = Array.isArray(res) ? res[0] : res;
        if (!h) return null;
        return {
            id: h.id,
            pacienteId: pacienteId,
            tipoSanguineo: h.tipoSanguineo,
            peso: h.peso,
            altura: h.altura,
            imc: h.imc,
            alergias: h.alergias,
            doencasPreexistentes: h.doencasPreexistentes,
            cirurgiasPrevias: h.cirurgiasPrevias,
            historicoFamiliar: h.historicoFamiliar,
            medicamentosUso: h.medicamentosUsoContinuo,
            tabagismo: h.tabagismo,
            etilismo: h.etilismo,
            atividadeFisica: h.praticaAtividadeFisica,
            usoDrogas: h.usaDrogas,
        } as HistoricoClinico;
    },

    cadastrar: (dados: Omit<HistoricoClinico, "id">) => {
        const body = {
            pacienteId: dados.pacienteId,
            tipoSanguineo: dados.tipoSanguineo,
            peso: dados.peso,
            altura: dados.altura,
            alergias: dados.alergias,
            doencasPreexistentes: dados.doencasPreexistentes,
            cirurgiasPrevias: dados.cirurgiasPrevias,
            historicoFamiliar: dados.historicoFamiliar,
            medicamentosUsoContinuo: dados.medicamentosUso,
            tabagismo: dados.tabagismo,
            etilismo: dados.etilismo,
            praticaAtividadeFisica: dados.atividadeFisica,
            usaDrogas: dados.usoDrogas,
        };
        return request<HistoricoClinico>("/historicosClinicos", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    atualizar: (id: string, dados: Partial<HistoricoClinico>) => {
        const body = {
            tipoSanguineo: dados.tipoSanguineo,
            peso: dados.peso,
            altura: dados.altura,
            alergias: dados.alergias,
            doencasPreexistentes: dados.doencasPreexistentes,
            cirurgiasPrevias: dados.cirurgiasPrevias,
            historicoFamiliar: dados.historicoFamiliar,
            medicamentosUsoContinuo: dados.medicamentosUso,
            tabagismo: dados.tabagismo,
            etilismo: dados.etilismo,
            praticaAtividadeFisica: dados.atividadeFisica,
            usaDrogas: dados.usoDrogas,
        };
        return request<HistoricoClinico>(`/historicosClinicos/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
    },
};