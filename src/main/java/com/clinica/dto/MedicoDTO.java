package com.clinica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record MedicoDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,
        LocalDate dataNascimento,
        String sexo,
        String estadoCivil,
        @CPF(message = "CPF inválido")
        String cpf,
        String crm,
        String crmEstado,

        @NotBlank(message = "A especialidade é obrigatória")
        String especialidade,

        String telefone,
        @Email(message = "Email inválido")
        @Pattern(
                regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                message = "Email deve conter domínio válido (.com, .br, etc)"
        )
        @NotBlank
        String email,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        Boolean ativo
) {
}