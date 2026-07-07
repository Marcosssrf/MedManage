package com.clinica.dto.update;

public record MeuPerfilUpdateDTO(
        String username,
        String senhaAtual,
        String novaSenha
) {}