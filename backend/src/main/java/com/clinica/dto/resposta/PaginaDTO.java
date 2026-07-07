package com.clinica.dto.resposta;

import org.springframework.data.domain.Page;

import java.util.List;

public record PaginaDTO<T>(
        List<T> conteudo,
        int paginaAtual,
        int totalPaginas,
        long totalElementos,
        int tamanhoPagina,
        boolean primeira,
        boolean ultima
) {
    public static <T> PaginaDTO<T> de(Page<T> page) {
        return new PaginaDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }
}