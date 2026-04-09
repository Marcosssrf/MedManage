package com.clinica.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@RestControllerAdvice
public class ManipuladorExcecoesGlobais {

    @ExceptionHandler(EntidadeNaoEncontradaException.class)
    public ResponseEntity<ErroResposta> tratarEntidadeNaoEncontrada(EntidadeNaoEncontradaException ex, HttpServletRequest request) {
        return montarResposta(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResposta> tratarRegraDeNegocio(RegraDeNegocioException ex, HttpServletRequest request) {
        return montarResposta(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> tratarValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String mensagem = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Dados inválidos");

        return montarResposta(HttpStatus.BAD_REQUEST, mensagem, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErroResposta> tratarConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        String mensagem = ex.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("Dados inválidos");

        return montarResposta(HttpStatus.BAD_REQUEST, mensagem, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> tratarViolacaoIntegridade(DataIntegrityViolationException ex, HttpServletRequest request) {
        String mensagem = resolverMensagemViolacaoIntegridade(ex);
        return montarResposta(HttpStatus.CONFLICT, mensagem, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> tratarErroGeral(Exception ex, HttpServletRequest request) {
        return montarResposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor", request);
    }

    private String resolverMensagemViolacaoIntegridade(DataIntegrityViolationException ex) {
        String mensagem = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        if (mensagem == null) {
            return "Violação de integridade dos dados";
        }

        String mensagemLower = mensagem.toLowerCase();

        if (mensagemLower.contains("(cpf)=")) {
            return "CPF já cadastrado";
        }
        if (mensagemLower.contains("(crm)=")) {
            return "CRM já cadastrado";
        }
        if (mensagemLower.contains("(username)=")) {
            return "Username já em uso";
        }
        if (mensagemLower.contains("(cnpj)=")) {
            return "CNPJ já cadastrado";
        }

        return "Já existe um registro com esses dados";
    }

    private ResponseEntity<ErroResposta> montarResposta(HttpStatus status, String mensagem, HttpServletRequest request) {
        ErroResposta erro = new ErroResposta(
                OffsetDateTime.now(ZoneOffset.UTC),
                status.value(),
                mensagem,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(erro);
    }
}
