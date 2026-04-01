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

export interface Paciente {
    id?: string | number;
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
}

export const pacientesApi = {
    listar: () => request<Paciente[]>("/pacientes"),

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
    listar: () => request<Medico[]>("/medicos"),

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
                pacienteNome: c.paciente?.nome,
                medicoNome: c.medico?.nome,
                medicoEspecialidade: c.medico?.especialidade,
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

    atualizar: (id: string | number, dados: { data: string; horario: string; observacoes?: string }) => {
        const dataIso = dados.data.includes("/")
            ? dados.data.split("/").reverse().join("-")
            : dados.data;

        return request(`/consultas/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                dataHora: `${dataIso}T${dados.horario}`,
                observacoes: dados.observacoes,
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
            formaPagamento: p.formaPagamento,
            tipoPagamento: p.tipoPagamento,
            status: p.statusPagamento,
            data: p.dataPagamento,
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
    id?: string | number;
    username: string;
    role: string;
    ativo: boolean;
    senha?: string;
}

export const usuariosApi = {
    listar: async () => {
        const res = await request<any[]>("/usuarios");

        return res.map((u) => ({
            id: u.id,
            username: u.username,
            role: u.role ?? u.role,
            ativo: u.ativo,
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
