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
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error || body?.message || `Erro ${res.status}`;
        throw new Error(msg);
    }
    return res.json();
}

const formatDateToBr = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.includes("/")) return dateString;
    return dateString.split("-").reverse().join("/");
}

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
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    ativo?: boolean;
    convenio?: { id?: string | number; nome: string; };
    numeroCarteirinha?: string;
    dataVencimentoCarteirinha?: string;
}

export const pacientesApi = {
    listar: async (incluirInativos = false) => {
        const url = incluirInativos ? "/pacientes?incluirInativos=true" : "/pacientes";
        const res = await request<Paciente[]>(url);
        return res as Paciente[];
    },
    buscarPorId: async (id: string | number) => {
        const p = await request<any>(`/pacientes/${id}`);
        return {
            ...p,
            dataNascimento: p.dataNascimento ? formatDateToBr(p.dataNascimento) : "",
            dataVencimentoCarteirinha: p.dataVencimentoCarteirinha ? formatDateToBr(p.dataVencimentoCarteirinha) : "",
        } as Paciente;
    },
    cadastrar: (data: Omit<Paciente, "id">) =>
        request<Paciente>("/pacientes", { method: "POST", body: JSON.stringify(data) }),
    atualizar: (id: string | number, dados: Partial<Paciente>) =>
        request<Paciente>(`/pacientes/${id}`, { method: "PATCH", body: JSON.stringify(dados) }),
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
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    ativo?: boolean;
}

export const medicosApi = {
    listar: async (incluirInativos = false) => {
        const url = incluirInativos ? "/medicos?incluirInativos=true" : "/medicos";
        const res = await request<Medico[]>(url);
        return res.map(m => ({ ...m, dataNascimento: formatDateToBr(m.dataNascimento) }));
    },
    buscarPorId: async (id: string | number) => {
        const m = await request<any>(`/medicos/${id}`);
        return { ...m, dataNascimento: m.dataNascimento ? formatDateToBr(m.dataNascimento) : "" } as Medico;
    },
    cadastrar: (data: Omit<Medico, "id">) =>
        request<Medico>("/medicos", { method: "POST", body: JSON.stringify(data) }),
    atualizar: (id: string | number, dados: Partial<Medico>) =>
        request<Medico>(`/medicos/${id}`, { method: "PATCH", body: JSON.stringify(dados) }),
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
                medicoId: c.medicoId ?? "",
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
    buscarPorId: async (id: string | number) => {
        const c = await request<any>(`/consultas/${id}`);
        const [data, horario] = (c.dataHora || "").split("T");
        const dataBr = data ? data.split("-").reverse().join("/") : "";
        return {
            id: c.id,
            pacienteId: c.paciente?.id ?? "",
            medicoId: c.medico?.id ?? "",
            pacienteNome: c.paciente?.nome,
            medicoNome: c.medico?.nome,
            medicoEspecialidade: c.medico?.especialidade,
            tipoConsulta: c.tipoConsulta,
            data: dataBr,
            horario: horario,
            status: c.status,
            observacoes: c.observacoes,
            anamnese: c.anamnese ?? null,
            prescricoes: c.prescricoes ?? [],
            historicoClinico: c.paciente?.historicoClinico ?? null,
        };
    },
    agendar: async (data: Omit<Consulta, "id" | "status" | "pacienteNome" | "medicoNome">) => {
        const dataIso = data.data.includes("/") ? data.data.split("/").reverse().join("-") : data.data;
        const body = {
            pacienteId: data.pacienteId,
            medicoId: data.medicoId,
            dataHora: `${dataIso}T${data.horario}`,
            tipoConsulta: data.tipoConsulta,
            observacoes: data.observacoes,
        };
        return request<Consulta>("/consultas", { method: "POST", body: JSON.stringify(body) });
    },
    cancelar: (id: string | number) =>
        request(`/consultas/${id}/cancelar`, { method: "PUT" }),

    mudarStatus: async (id: string | number, status: "EM_ANDAMENTO" | "REALIZADA" | "CONFIRMADA" | "AGENDADA") => {
        // Busca os dados completos da consulta para obter pacienteId e medicoId reais
        const completa = await request<any>(`/consultas/${id}`);
        const pacienteId = completa.paciente?.id;
        const medicoId = completa.medico?.id;
        const dataHora = completa.dataHora; // já está em ISO no backend
        if (!pacienteId || !medicoId) throw new Error("IDs de paciente/médico não encontrados");
        return request(`/consultas/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                pacienteId,
                medicoId,
                dataHora,
                observacoes: completa.observacoes ?? null,
                statusConsulta: status,
            }),
        });
    },
    atualizar: (id: string | number, dados: { data: string; horario: string; observacoes?: string; tipoConsulta?: string }) => {
        const dataIso = dados.data.includes("/") ? dados.data.split("/").reverse().join("-") : dados.data;
        return request(`/consultas/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ dataHora: `${dataIso}T${dados.horario}`, observacoes: dados.observacoes, tipoConsulta: dados.tipoConsulta }),
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
        return request<Pagamento>("/pagamentos", { method: "POST", body: JSON.stringify(body) });
    },
    confirmar: (id: string | number) =>
        request(`/pagamentos/${id}/confirmar`, { method: "PATCH" }),
};

export const relatoriosApi = {
    faturamentoPorMes: (ano: number) =>
        request<Record<string, number>>(`/relatorios/faturamento?ano=${ano}`),
    medicoMaisAtendido: () =>
        request<{ nome: string; totalConsultas: number }>("/relatorios/medico-mais-atendido"),
    resumo: () =>
        request<{ totalPacientes: number; totalMedicos: number; consultasHoje: number; faturamentoMensal: number; }>("/dashboard/resumo"),
};

export interface Usuario {
    id: string;
    username: string;
    role: string;
    ativo: boolean;
    senha?: string;
    medico?: { id: string; nome?: string; } | null;
}

export const usuariosApi = {
    listar: async () => {
        const res = await request<any[]>("/usuarios");
        return res.map((u) => ({
            id: u.id, username: u.username, role: u.role, ativo: u.ativo, medico: u.medico || null,
        } as Usuario));
    },
    cadastrar: (data: Omit<Usuario, "id" | "ativo">) =>
        request<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(data) }),
    atualizar: (id: string | number, dados: Partial<Usuario>) =>
        request<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(dados) }),
    deletar: (id: string | number) =>
        request(`/usuarios/${id}`, { method: "DELETE" }),
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
    listar: () => request<HistoricoClinico[]>("/historicosClinicos"),
    buscarPorId: (id: string) => request<HistoricoClinico>(`/historicosClinicos/${id}`),
    buscarPorPaciente: async (pacienteId: string) => {
        const res = await request<any[]>(`/historicosClinicos/paciente/${pacienteId}`);
        const h = Array.isArray(res) ? res[0] : res;
        if (!h) return null;
        return {
            id: h.id, pacienteId,
            tipoSanguineo: h.tipoSanguineo, peso: h.peso, altura: h.altura, imc: h.imc,
            alergias: h.alergias, doencasPreexistentes: h.doencasPreexistentes,
            cirurgiasPrevias: h.cirurgiasPrevias, historicoFamiliar: h.historicoFamiliar,
            medicamentosUso: h.medicamentosUsoContinuo,
            tabagismo: h.tabagismo, etilismo: h.etilismo,
            atividadeFisica: h.praticaAtividadeFisica, usoDrogas: h.usaDrogas,
        } as HistoricoClinico;
    },
    cadastrar: (dados: Omit<HistoricoClinico, "id">) => {
        const body = {
            pacienteId: dados.pacienteId, tipoSanguineo: dados.tipoSanguineo, peso: dados.peso, altura: dados.altura,
            alergias: dados.alergias, doencasPreexistentes: dados.doencasPreexistentes,
            cirurgiasPrevias: dados.cirurgiasPrevias, historicoFamiliar: dados.historicoFamiliar,
            medicamentosUsoContinuo: dados.medicamentosUso,
            tabagismo: dados.tabagismo, etilismo: dados.etilismo,
            praticaAtividadeFisica: dados.atividadeFisica, usaDrogas: dados.usoDrogas,
        };
        return request<HistoricoClinico>("/historicosClinicos", { method: "POST", body: JSON.stringify(body) });
    },
    atualizar: (id: string, dados: Partial<HistoricoClinico>) => {
        const body = {
            tipoSanguineo: dados.tipoSanguineo, peso: dados.peso, altura: dados.altura,
            alergias: dados.alergias, doencasPreexistentes: dados.doencasPreexistentes,
            cirurgiasPrevias: dados.cirurgiasPrevias, historicoFamiliar: dados.historicoFamiliar,
            medicamentosUsoContinuo: dados.medicamentosUso,
            tabagismo: dados.tabagismo, etilismo: dados.etilismo,
            praticaAtividadeFisica: dados.atividadeFisica, usaDrogas: dados.usoDrogas,
        };
        return request<HistoricoClinico>(`/historicosClinicos/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    },
};

// ─────────────────────────────────────────────
// CONVÊNIOS — campos alinhados com backend
// ─────────────────────────────────────────────
export interface Convenio {
    id?: string | number;
    nome: string;
    registroANS?: string;       // backend: registroANS (ConvenioDTO)
    cnpj?: string;
    telefone?: string;
    diasParaFaturamento?: number; // backend: diasParaFaturamento
    ativo?: boolean;
}

export const conveniosApi = {
    listar: () => request<Convenio[]>("/convenios"),
    buscarPorId: (id: string | number) => request<Convenio>(`/convenios/${id}`),
    cadastrar: (dados: Omit<Convenio, "id">) =>
        request<Convenio>("/convenios", {
            method: "POST",
            body: JSON.stringify({
                nome: dados.nome,
                cnpj: dados.cnpj,
                registroANS: dados.registroANS,
                telefone: dados.telefone,
                diasParaFaturamento: dados.diasParaFaturamento,
                ativo: dados.ativo,
            }),
        }),
    atualizar: (id: string | number, dados: Partial<Convenio>) =>
        request<Convenio>(`/convenios/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                nome: dados.nome,
                telefone: dados.telefone,
                diasParaFaturamento: dados.diasParaFaturamento,
                ativo: dados.ativo,
            }),
        }),
};

// ─────────────────────────────────────────────
// CONFIGURAÇÕES DA CLÍNICA
// ─────────────────────────────────────────────
export interface ConfiguracaoClinica {
    id?: string | number;
    nomeClinica: string;
    cnpj?: string;
    telefone?: string;
    horarioAbertura?: string;
    horarioFechamento?: string;
    duracaoPadraoConsulta?: number;
}

function parseLocalTime(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === "string") return value.slice(0, 5);
    if (Array.isArray(value)) return `${String(value[0]).padStart(2, "0")}:${String(value[1]).padStart(2, "0")}`;
    return undefined;
}

export const configuracoesApi = {
    buscar: async (): Promise<ConfiguracaoClinica | null> => {
        try {
            const data = await request<any>("/configuracaoClinica");
            return {
                id: data.id,
                nomeClinica: data.nomeClinica,
                cnpj: data.cnpj,
                telefone: data.telefone,
                horarioAbertura: parseLocalTime(data.horarioAbertura),
                horarioFechamento: parseLocalTime(data.horarioFechamento),
                duracaoPadraoConsulta: data.duracaoPadraoConsultas ?? data.duracaoPadraoConsulta,
            };
        } catch {
            return null;
        }
    },
    salvar: (dados: Partial<ConfiguracaoClinica>) =>
        request<ConfiguracaoClinica>("/configuracaoClinica", {
            method: "PATCH",
            body: JSON.stringify({
                nomeClinica: dados.nomeClinica,
                cnpj: dados.cnpj,
                telefone: dados.telefone,
                horarioAbertura: dados.horarioAbertura,
                horarioFechamento: dados.horarioFechamento,
                duracaoPadraoConsulta: dados.duracaoPadraoConsulta,
            }),
        }),
};

// ─────────────────────────────────────────────
// ANAMNESE — alinhado com backend
// AnamneseController: POST /anamneses, GET /anamneses/{id}
// Anamnese vem embutida em GET /consultas/{id}
// ─────────────────────────────────────────────
export interface Anamnese {
    id?: string;
    consultaId: string | number;
    queixaPrincipal?: string;
    historiaMolestiaPrincipal?: string;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    solicitacaoDeExames?: string;
    encaminhamento?: string;
    condutaMedica?: string;
    cidCodigo?: string;
}

export const anamneseApi = {
    buscarPorConsulta: async (consultaId: string | number): Promise<Anamnese | null> => {
        try {
            const consulta = await request<any>(`/consultas/${consultaId}`);
            const a = consulta.anamnese;
            if (!a) return null;
            return {
                id: a.id,
                consultaId,
                queixaPrincipal: a.queixaPrincipal,
                historiaMolestiaPrincipal: a.historiaMolestiaPrincipal,
                exameFisico: a.exameFisico,
                hipoteseDiagnostica: a.hipoteseDiagnostica,
                solicitacaoDeExames: a.solicitacaoDeExames,
                encaminhamento: a.encaminhamento,
                condutaMedica: a.condutaMedica,
                cidCodigo: typeof a.cidCodigo === "object" ? a.cidCodigo?.codigo : a.cidCodigo,
            };
        } catch {
            return null;
        }
    },
    cadastrar: (dados: Omit<Anamnese, "id">) =>
        request<Anamnese>("/anamneses", {
            method: "POST",
            body: JSON.stringify({
                consultaId: dados.consultaId,
                queixaPrincipal: dados.queixaPrincipal ?? "",
                historiaMolestiaPrincipal: dados.historiaMolestiaPrincipal,
                exameFisico: dados.exameFisico,
                hipoteseDiagnostica: dados.hipoteseDiagnostica,
                solicitacaoDeExames: dados.solicitacaoDeExames,
                encaminhamento: dados.encaminhamento,
                condutaMedica: dados.condutaMedica,
                cidCodigo: dados.cidCodigo || undefined,
                prescricoes: [],
            }),
        }),
    // Não há PATCH no backend - envia novo POST (recria anamnese)
    atualizar: (id: string, dados: Partial<Anamnese>) =>
        request<Anamnese>("/anamneses", {
            method: "POST",
            body: JSON.stringify({
                consultaId: dados.consultaId,
                queixaPrincipal: dados.queixaPrincipal ?? "",
                historiaMolestiaPrincipal: dados.historiaMolestiaPrincipal,
                exameFisico: dados.exameFisico,
                hipoteseDiagnostica: dados.hipoteseDiagnostica,
                solicitacaoDeExames: dados.solicitacaoDeExames,
                encaminhamento: dados.encaminhamento,
                condutaMedica: dados.condutaMedica,
                cidCodigo: dados.cidCodigo || undefined,
                prescricoes: [],
            }),
        }),
};

// ─────────────────────────────────────────────
// PRESCRIÇÕES — endpoint dedicado POST /prescricoes/{consultaId}
// Backend: PrescricaoController.insert(@RequestBody PrescricaoDTO, @PathVariable UUID consultaId)
// ─────────────────────────────────────────────
export interface Prescricao {
    id?: string;
    consultaId?: string | number;
    medicamento: string;
    dosagem?: string;
    frequencia?: string;
    duracao?: string;
    viaAdministracao?: string;
    via?: string;
    observacoes?: string;
    tipoReceita?: string;
}

export const prescricoesApi = {
    listarPorConsulta: async (consultaId: string | number): Promise<Prescricao[]> => {
        try {
            const consulta = await request<any>(`/consultas/${consultaId}`);
            // Backend retorna prescrições vinculadas à anamnese da consulta
            const prescricoes = consulta.prescricoes ?? consulta.anamnese?.prescricoes ?? [];
            return prescricoes.map((p: any) => ({
                id: p.id,
                consultaId,
                medicamento: p.medicamento,
                dosagem: p.dosagem,
                frequencia: p.frequencia,
                duracao: p.duracao,
                viaAdministracao: p.viaAdministracao,
                via: p.viaAdministracao,
                observacoes: p.observacoes,
                tipoReceita: p.tipoReceita,
            } as Prescricao));
        } catch {
            return [];
        }
    },
    // Adiciona uma única prescrição via endpoint dedicado POST /prescricoes/{consultaId}
    // O backend exige que a anamnese da consulta já exista antes de prescrever
    adicionar: (consultaId: string | number, prescricao: Omit<Prescricao, "id" | "consultaId">) =>
        request<Prescricao>(`/prescricoes/consulta/${consultaId}`, {
            method: "POST",
            body: JSON.stringify({
                medicamento: prescricao.medicamento,
                dosagem: prescricao.dosagem ?? "",
                viaAdministracao: prescricao.viaAdministracao ?? prescricao.via ?? "",
                frequencia: prescricao.frequencia ?? "",
                duracao: prescricao.duracao ?? "",
                observacao: prescricao.observacoes,
                tipoReceita: prescricao.tipoReceita ?? "COMUM",
            }),
        }),
};