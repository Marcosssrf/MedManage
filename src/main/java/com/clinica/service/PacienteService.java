package com.clinica.service;

import com.clinica.dto.PacienteDTO;
import com.clinica.dto.update.PacienteUpdateDTO;
import com.clinica.model.Convenio;
import com.clinica.model.Paciente;
import com.clinica.model.User;
import com.clinica.repository.ConvenioRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PacienteService {

	@Autowired
	PacienteRepository pacienteRepository;

	@Autowired
	SecurityService securityService;
    @Autowired
    private ConvenioRepository convenioRepository;

	public List<Paciente> findAll() { return pacienteRepository.findAll();}

	public Paciente findById(UUID id) {
		return pacienteRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Paciente não encontrada"));
	}

	public Paciente insert(PacienteDTO dto) {

		Paciente paciente = new Paciente();

		paciente.setNome(dto.nome());
		paciente.setEmail(dto.email());
		paciente.setCpf(dto.cpf());
		paciente.setDataNascimento(dto.dataNascimento());
		paciente.setTelefone(dto.telefone());
		paciente.setSexo(dto.sexo());
		paciente.setEstadoCivil(dto.estadoCivil());
		paciente.setCep(dto.cep());
		paciente.setLogradouro(dto.logradouro());
		paciente.setNumero(dto.numero());
		paciente.setComplemento(dto.complemento());
		paciente.setBairro(dto.bairro());
		paciente.setCidade(dto.cidade());
		paciente.setUf(dto.uf());
		paciente.setAtivo(true);

		User user = securityService.obterUsuarioLogado();
		paciente.setUsuario(user);

		if(dto.convenio() != null && !dto.convenio().isBlank()){
			Convenio convenio = convenioRepository.findByNome(dto.convenio())
					.orElseThrow(() -> new RuntimeException("Convênio não encontrado: " + dto.convenio()));
			paciente.setConvenio(convenio);
			paciente.setNumeroCarteirinha(dto.numeroCarteirinha());
			paciente.setDataVencimentoCarteirinha(dto.dataVencimentoCarteirinha());
		}

		return pacienteRepository.save(paciente);
	}

	public Paciente patch(UUID id, PacienteUpdateDTO dto) {
		Paciente paciente = pacienteRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Paciente não encontrado!"));

		if (dto.nome() != null) {
			paciente.setNome(dto.nome());
		}

		if (dto.email() != null) {
			paciente.setEmail(dto.email());
		}

		if (dto.telefone() != null) {
			paciente.setTelefone(dto.telefone());
		}

		if (dto.estadoCivil() != null) {
			paciente.setEstadoCivil(dto.estadoCivil());
		}

		if (dto.cep() != null) {
			paciente.setCep(dto.cep());
		}

		if (dto.logradouro() != null) {
			paciente.setLogradouro(dto.logradouro());
		}

		if (dto.numero() != null) {
			paciente.setNumero(dto.numero());
		}

		if (dto.complemento() != null) {
			paciente.setComplemento(dto.complemento());
		}

		if (dto.bairro() != null) {
			paciente.setBairro(dto.bairro());
		}

		if (dto.cidade() != null) {
			paciente.setCidade(dto.cidade());
		}

		if (dto.uf() != null) {
			paciente.setUf(dto.uf());
		}

		if (dto.ativo() != null) {
			paciente.setAtivo(dto.ativo());
		}

		if (dto.convenio() != null && !dto.convenio().isBlank()) {
			Convenio convenio = convenioRepository.findByNome(dto.convenio())
					.orElseThrow(() -> new RuntimeException("Convênio não encontrado: " + dto.convenio()));
			paciente.setConvenio(convenio);
			paciente.setNumeroCarteirinha(dto.numeroCarteirinha());
			paciente.setDataVencimentoCarteirinha(dto.dataVencimentoCarteirinha());
		}

		return pacienteRepository.save(paciente);
	}

//	public Paciente update(UUID id, PacienteDTO dto) {
//		Paciente paciente = pacienteRepository.getReferenceById(id);
//
//		paciente.setNome(dto.nome());
//		paciente.setEmail(dto.email());
//		paciente.setTelefone(dto.telefone());
//		paciente.setAtivo(dto.ativo());
//
//		return pacienteRepository.save(paciente);
//	}
//
//	public void delete(UUID id) {
//		pacienteRepository.deleteById(id);
//	}
}
