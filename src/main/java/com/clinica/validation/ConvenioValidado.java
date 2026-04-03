package com.clinica.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ConvenioValidadoValidator.class)
public @interface ConvenioValidado {
    String message() default "Número da carteirinha e data de vencimento são obrigatórios quando o convênio é informado";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}