package com.clinica.validation;

import com.clinica.dto.PacienteDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ConvenioValidadoValidator implements ConstraintValidator<ConvenioValidado, PacienteDTO> {

    @Override
    public boolean isValid(PacienteDTO dto, ConstraintValidatorContext context) {
        if (dto.convenio() == null || dto.convenio().isBlank()) {
            return true; // sem convênio tudo ok
        }

        boolean carteirinhaValida = dto.numeroCarteirinha() != null && !dto.numeroCarteirinha().isBlank();
        boolean vencimentoValido = dto.dataVencimentoCarteirinha() != null;

        return carteirinhaValida && vencimentoValido;
    }
}