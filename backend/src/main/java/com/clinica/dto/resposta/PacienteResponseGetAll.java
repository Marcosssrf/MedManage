package com.clinica.dto.resposta;

import com.clinica.model.Paciente;
import java.util.UUID;

public record PacienteResponseGetAll(
        UUID id,
        String nome,
        String cpf,
        String telefone,
        String email,
        Boolean ativo
) {

    public PacienteResponseGetAll(Paciente paciente) {
        this(
                paciente.getId(),
                paciente.getNome(),
                paciente.getCpf(),
                paciente.getTelefone(),
                paciente.getEmail(),
                paciente.getAtivo()
        );
    }
}