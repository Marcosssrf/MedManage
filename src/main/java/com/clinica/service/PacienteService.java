package com.clinica.service;

import com.clinica.dto.PacienteDTO;
import com.clinica.dto.update.PacienteUpdateDTO;
import com.clinica.model.Paciente;
import com.clinica.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PacienteService {

	@Autowired
	PacienteRepository pacienteRepository;

	public List<Paciente> findAll() { return pacienteRepository.findAll();}

	public Paciente findById(UUID id) {
		return pacienteRepository.findById(id).get();
	}

	public Paciente insert(PacienteDTO dto) {

		Paciente paciente = new Paciente();

		paciente.setNome(dto.nome());
		paciente.setEmail(dto.email());
		paciente.setCpf(dto.cpf());
		paciente.setDataNascimento(dto.dataNascimento());
		paciente.setTelefone(dto.telefone());
		paciente.setAtivo(true);

		return pacienteRepository.save(paciente);
	}

	public Paciente update(UUID id, PacienteDTO dto) {
		Paciente paciente = pacienteRepository.getReferenceById(id);

		paciente.setNome(dto.nome());
		paciente.setEmail(dto.email());
		paciente.setTelefone(dto.telefone());
		paciente.setAtivo(dto.ativo());

		return pacienteRepository.save(paciente);
	}

	public void delete(UUID id) {
		pacienteRepository.deleteById(id);
	}

	public Paciente patch(UUID id, PacienteUpdateDTO dto){
		Paciente paciente = pacienteRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Paciente não encontrado!"));
		if (dto.nome() != null){
			paciente.setNome(dto.nome());
		}

		if (dto.email() != null){
			paciente.setEmail(dto.email());
		}

		if (dto.telefone() != null){
			paciente.setTelefone(dto.telefone());
		}

		if(dto.ativo() != null){
			paciente.setAtivo(dto.ativo());
		}

		return pacienteRepository.save(paciente);
	}

}
