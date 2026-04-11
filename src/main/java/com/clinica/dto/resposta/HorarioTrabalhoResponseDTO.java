package com.clinica.dto.resposta;

import java.util.List;
import java.util.UUID;

public record HorarioTrabalhoResponseDTO(
        UUID medicoId,
        List<DiaHorarioResponseDTO> horarios
) {
}
