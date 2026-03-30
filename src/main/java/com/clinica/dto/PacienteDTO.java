package com.clinica.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
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
        @NotNull
        LocalDate dataNascimento,
        @NotBlank
        @Pattern(
                regexp = "[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579]",
                message = "Telefone Invalido"
        )
        String telefone,
        @NotBlank
        String sexo,
        @NotBlank
        String estadoCivil,
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
