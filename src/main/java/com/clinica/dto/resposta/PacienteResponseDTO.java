package com.clinica.dto.resposta;

import com.clinica.model.HistoricoClinico;
import com.clinica.model.Paciente;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PacienteResponseDTO(
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String idade,
        String telefone,
        String email,
        String sexo,
        String estadoCivil,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        ConvenioResumoDTO convenio,
        String numeroCarteirinha,
        LocalDate dataVencimentoCarteirinha,
        Boolean ativo,
        HistoricoClinico historicoClinico,
        LocalDateTime dataCadastro,
        LocalDateTime dataAtualizacao,
        String createdBy
) {
    public record ConvenioResumoDTO(UUID id, String nome, String registroANS) {}

    public static PacienteResponseDTO from(Paciente p) {
        ConvenioResumoDTO convenioResumo = p.getConvenio() != null
                ? new ConvenioResumoDTO(
                p.getConvenio().getId(),
                p.getConvenio().getNome(),
                p.getConvenio().getRegistroANS())
                : null;

        return new PacienteResponseDTO(
                p.getId(),
                p.getNome(),
                p.getCpf(),
                p.getDataNascimento(),
                p.getIdade(),
                p.getTelefone(),
                p.getEmail(),
                p.getSexo(),
                p.getEstadoCivil(),
                p.getCep(),
                p.getLogradouro(),
                p.getNumero(),
                p.getComplemento(),
                p.getBairro(),
                p.getCidade(),
                p.getUf(),
                convenioResumo,
                p.getNumeroCarteirinha(),
                p.getDataVencimentoCarteirinha(),
                p.getAtivo(),
                p.getHistoricoClinico(),
                p.getDataCadastro(),
                p.getDataAtualizacao(),
                p.getCreatedBy()
        );
    }
}