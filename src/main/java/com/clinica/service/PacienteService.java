package com.clinica.service;

import com.clinica.model.Paciente;
import com.clinica.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PacienteService {

	@Autowired
	PacienteRepository pacienteRepository;

	public List<Paciente> findAll() { return pacienteRepository.findAll();}

	public Paciente findById(Integer id) {
		return pacienteRepository.findById(id).get();
	}

	public Paciente insert(Paciente paciente) {
		return pacienteRepository.save(paciente);
	}

	public Paciente update(Integer id, Paciente paciente) {
		Paciente entity = pacienteRepository.getReferenceById(id);
		entity.setNome(paciente.getNome());
		return pacienteRepository.save(entity);
	}

	public void delete(Integer id) {
		pacienteRepository.deleteById(id);
	}

}
