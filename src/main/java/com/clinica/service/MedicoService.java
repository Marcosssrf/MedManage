package com.clinica.service;

import com.clinica.model.Medico;
import com.clinica.model.Paciente;
import com.clinica.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicoService {

	@Autowired
	MedicoRepository medicoRepository;

	public List<Medico> findAll() { return medicoRepository.findAll();}

	public Medico findById(Integer id) { return medicoRepository.findById(id).get();}

	public Medico insert(Medico medico){ return medicoRepository.save(medico);}

	public Medico update(Integer id, Medico medico) {
		Medico entity = medicoRepository.getReferenceById(id);
		entity.setNome(medico.getNome());
		return medicoRepository.save(entity);
	}

	public void delete(Integer id) {
		medicoRepository.deleteById(id);
	}


}
