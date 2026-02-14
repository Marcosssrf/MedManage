package com.clinica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record PacienteDTO(

        @NotBlank
        String nome,
        @Email(message = "Email inválido")
        @Pattern(
                regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                message = "Email deve conter domínio válido (.com, .br, etc)"
        )
        @NotBlank
        String email,
        @CPF(message = "CPF inválido")
        String cpf,
        @Past(message = "Não pode ser uma data futura")
        LocalDate dataNascimento,
        String telefone,
        Boolean ativo
) {
}
