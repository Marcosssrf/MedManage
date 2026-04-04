package com.clinica.dto.update;

import com.clinica.dto.AnamneseDTO;
import com.clinica.model.enums.StatusConsulta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConsultaUpdateDTO(
        UUID pacienteId,
        UUID medicoId,
        @Future
        LocalDateTime dataHora,
        String observacoes,
        @Valid
        AnamneseDTO anamnese,
        StatusConsulta statusConsulta
) {
}
