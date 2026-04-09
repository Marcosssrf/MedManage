package com.clinica.validation;

import com.clinica.dto.DadosConvenio;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ConvenioValidadoValidator implements ConstraintValidator<ConvenioValidado, DadosConvenio> {

    @Override
    public boolean isValid(DadosConvenio dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true;
        }

        if (dto.convenio() == null || dto.convenio().isBlank()) {
            return true;
        }

        boolean carteirinhaValida = dto.numeroCarteirinha() != null && !dto.numeroCarteirinha().isBlank();
        boolean vencimentoValido = dto.dataVencimentoCarteirinha() != null;

        return carteirinhaValida && vencimentoValido;
    }
}