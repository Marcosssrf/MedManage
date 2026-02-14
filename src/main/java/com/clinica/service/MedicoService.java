package com.clinica.service;

import com.clinica.dto.MedicoDTO;
import com.clinica.dto.update.MedicoUpdateDTO;
import com.clinica.model.Medico;
import com.clinica.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MedicoService {

	@Autowired
	MedicoRepository medicoRepository;

	public List<Medico> findAll() { return medicoRepository.findAll();}

	public Medico findById(UUID id) { return medicoRepository.findById(id).get();}

	public Medico insert(MedicoDTO dto){

		Medico medico = new Medico();

		medico.setNome(dto.nome());
		medico.setCrm(dto.crm());
		medico.setEspecialidade(dto.especialidade());
		medico.setAtivo(true);

		return medicoRepository.save(medico);
	}

	public Medico update(UUID id, MedicoDTO dto) {
		Medico medico = medicoRepository.getReferenceById(id);

		medico.setNome(dto.nome());
		medico.setEspecialidade(dto.especialidade());
		medico.setAtivo(dto.ativo());

		return medicoRepository.save(medico);
	}

	public void delete(UUID id) {
		medicoRepository.deleteById(id);
	}

	public Medico patch(UUID id, MedicoUpdateDTO dto){
		Medico medico = medicoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Medico não encontrado!"));
		if (dto.especialidade() != null){
			medico.setEspecialidade(dto.especialidade());
		}

		if(dto.ativo() != null){
			medico.setAtivo(dto.ativo());
		}

		return medicoRepository.save(medico);
	}

}
