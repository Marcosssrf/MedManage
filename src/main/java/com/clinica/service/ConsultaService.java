package com.clinica.service;

import com.clinica.dto.ConsultaDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Medico;
import com.clinica.model.Paciente;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsultaService {

	@Autowired
	ConsultaRepository consultaRepository;

	@Autowired
	MedicoRepository medicoRepository;

	@Autowired
	PacienteRepository pacienteRepository;

	//implementar busca por nome do paciente ou medico

	public Consulta insert(ConsultaDTO dto){

		Paciente paciente = pacienteRepository.findById(dto.getPacienteId()).orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
		Medico medico = medicoRepository.findById(dto.getMedicoId()).orElseThrow(() -> new RuntimeException("Medico não encontrado"));

		Consulta consulta = new Consulta();
		consulta.setDataHora(dto.getDataHora());
		consulta.setPaciente(paciente);
		consulta.setMedico(medico);
		consulta.setStatus(dto.getStatus());

		return consultaRepository.save(consulta);
	}

	public List<Consulta> findAll(){
		return consultaRepository.findAll();
	}

	public Consulta findById(Integer id) {
		return consultaRepository.findById(id).get();
	}

	public Consulta update(Integer id, Consulta consulta) {
		Consulta entity = consultaRepository.getReferenceById(id);
		entity.setDataHora(consulta.getDataHora());
		return consultaRepository.save(entity);
	}

	public void delete(Integer id) {
		consultaRepository.deleteById(id);
	}


}
