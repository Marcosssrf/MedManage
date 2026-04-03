package com.clinica.dto.update;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record MedicoUpdateDTO(
        UUID id,
        String estadoCivil,
        @Pattern(regexp = "^\\(\\d{2}\\) \\d{4,5}-\\d{4}$", message = "Telefone inválido. Formato: (XX) XXXXX-XXXX")
        String telefone,
        @Email(message = "Email inválido")
        @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Email deve conter domínio válido")
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
