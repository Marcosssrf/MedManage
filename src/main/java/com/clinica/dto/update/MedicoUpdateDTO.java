package com.clinica.dto.update;

public record MedicoUpdateDTO(
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
