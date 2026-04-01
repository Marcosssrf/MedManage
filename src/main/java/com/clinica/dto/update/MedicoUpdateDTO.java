package com.clinica.dto.update;

import java.util.UUID;

public record MedicoUpdateDTO(
        UUID id,
        String estadoCivil,
        String telefone,
        String email,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String especialidade,
        Boolean ativo
) {
}
