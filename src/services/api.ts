const BASE_URL = "http://localhost:8080";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("admin:123"),
            ...options?.headers
        },
        ...options,
    });
    if (!res.ok) {
        const error = await res.text().catch(() => "Erro desconhecido");
        throw new Error(error);
    }
    return res.json();
}

export interface Paciente {
    id?: string | number;
    nome: string;
    nascimento: string;
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
};

export interface Medico {
    id?: string | number;
    nome: string;
    nascimento: string;
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
        })

};