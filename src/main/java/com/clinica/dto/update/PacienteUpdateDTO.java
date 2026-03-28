package com.clinica.dto.update;

public record PacienteUpdateDTO(
        String estadoCivil,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String nome,
        String email,
        String telefone,
        Boolean ativo
) {
}
