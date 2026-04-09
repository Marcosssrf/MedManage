package com.clinica.dto;

import java.time.LocalDate;

public interface DadosConvenio {
    String convenio();
    String numeroCarteirinha();
    LocalDate dataVencimentoCarteirinha();
}