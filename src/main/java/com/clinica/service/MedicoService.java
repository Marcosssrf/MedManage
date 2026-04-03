package com.clinica.service;

import com.clinica.dto.MedicoDTO;
import com.clinica.dto.update.MedicoUpdateDTO;
import com.clinica.model.Medico;
import com.clinica.model.User;
import com.clinica.repository.MedicoRepository;
import com.clinica.security.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MedicoService {

	@Autowired
	MedicoRepository medicoRepository;
	@Autowired
	SecurityService securityService;

	public List<Medico> findAll() { return medicoRepository.findAll();}

	public Medico findById(UUID id) {
		return medicoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Médico não encontrada"));
	}

	public Medico insert(MedicoDTO dto){

		Medico medico = new Medico();

		medico.setNome(dto.nome());
		medico.setDataNascimento(dto.dataNascimento());
		medico.setSexo(dto.sexo());
		medico.setEstadoCivil(dto.estadoCivil());
		medico.setCpf(dto.cpf());
		medico.setCrm(dto.crm());
		medico.setCrmEstado(dto.crmEstado());
		medico.setEspecialidade(dto.especialidade());
		medico.setTelefone(dto.telefone());
		medico.setEmail(dto.email());
		medico.setCep(dto.cep());
		medico.setLogradouro(dto.logradouro());
		medico.setNumero(dto.numero());
		medico.setComplemento(dto.complemento());
		medico.setBairro(dto.bairro());
		medico.setCidade(dto.cidade());
		medico.setUf(dto.uf());
		medico.setAtivo(true);

		User user = securityService.obterUsuarioLogado();
		medico.setUsuario(user);

		return medicoRepository.save(medico);
	}

	public Medico patch(UUID id, MedicoUpdateDTO dto) {
		Medico medico = medicoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Médico não encontrado!"));

		if (dto.estadoCivil() != null) {
			medico.setEstadoCivil(dto.estadoCivil());
		}

		if (dto.telefone() != null) {
			medico.setTelefone(dto.telefone());
		}

		if (dto.email() != null) {
			medico.setEmail(dto.email());
		}

		if (dto.cep() != null) {
			medico.setCep(dto.cep());
		}

		if (dto.logradouro() != null) {
			medico.setLogradouro(dto.logradouro());
		}

		if (dto.numero() != null) {
			medico.setNumero(dto.numero());
		}

		if (dto.complemento() != null) {
			medico.setComplemento(dto.complemento());
		}

		if (dto.bairro() != null) {
			medico.setBairro(dto.bairro());
		}

		if (dto.cidade() != null) {
			medico.setCidade(dto.cidade());
		}

		if (dto.uf() != null) {
			medico.setUf(dto.uf());
		}

		if (dto.especialidade() != null) {
			medico.setEspecialidade(dto.especialidade());
		}

		if (dto.ativo() != null) {
			medico.setAtivo(dto.ativo());
		}

		return medicoRepository.save(medico);
	}

//	public Medico update(UUID id, MedicoDTO dto) {
//		Medico medico = medicoRepository.getReferenceById(id);
//
//		medico.setNome(dto.nome());
//		medico.setEspecialidade(dto.especialidade());
//		medico.setAtivo(dto.ativo());
//
//		return medicoRepository.save(medico);
//	}
//
//	public void delete(UUID id) {
//		medicoRepository.deleteById(id);
//	}
}