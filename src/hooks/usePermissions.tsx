import {useAuth} from "../context/AuthContext";

export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role;

    return {
        // Médicos
        canAddMedico: role === "ADMIN",
        canViewMedicos: true,

        // Pacientes
        canAddPaciente: role === "ADMIN" || role === "SECRETARIA",
        canViewPacientes: true,

        // Consultas
        canAddConsulta: role === "ADMIN" || role === "SECRETARIA",
        canCancelarConsulta: role === "ADMIN" || role === "SECRETARIA",
        canViewConsultas: true,

        // Geral
        isAdmin: role === "ADMIN",
        isMedico: role === "MEDICO",
        isSecretaria: role === "SECRETARIA",
    };
}