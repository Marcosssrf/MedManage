package com.clinica.model.enums;

public enum StatusAutorizacaoTISS {
    PENDENTE,    // Aguardando autorização da operadora
    AUTORIZADO,  // Autorizado pela operadora
    NEGADO,      // Negado pela operadora
    FATURADO,    // Já incluído na guia de faturamento
    CANCELADO    // Procedimento cancelado
}