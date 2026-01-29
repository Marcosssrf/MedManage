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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ConsultaService {

	@Autowired
	ConsultaRepository consultaRepository;

	@Autowired
	MedicoRepository medicoRepository;

	@Autowired
	PacienteRepository pacienteRepository;

	LocalDateTime dataHoje = LocalDateTime.now();
	LocalTime inicio = LocalTime.of(8, 0);
	LocalTime fim = LocalTime.of(18, 0);



	/*
	✓ implementar busca por nome do paciente ou medico
	✓ data nao pode ser < que a atual			 							* prioridade
	nao pode existir 2 consultas com o mesmo medico no mesmo horario
	✓ toda consulta comeca com agendada
	consulta so pode ser cancelada ate 24 horas antes
	paciente inativo nao pode agendar uma consulta
	✓ medico tem que ter uma especialidade
	✓ adicionar status no medico para poder inativar ele
	✓ medico inativo nao pode ter uma consulta
	✓ horario de atendimento (ex 08:00 as 18:00)
	uma consulta so pode ter UM pagamento, nao pode ter mais de um		* prioridade
	nao pode pagar uma consulta inexistente
	pagamento so com consulta realizda
	fluxo de status (agendada -> confirmada -> realizada)				* prioridade
	relatorios (faturamento por mes, medico mais atendido)
	*/

	public Consulta insert(ConsultaDTO dto){

		Paciente paciente = pacienteRepository.findById(dto.getPacienteId()).orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
		Medico medico = medicoRepository.findById(dto.getMedicoId()).orElseThrow(() -> new RuntimeException("Medico não encontrado"));

		LocalTime horario = dto.getDataHora().toLocalTime();

		boolean isBetween = (horario.isAfter(inicio) && horario.isBefore(fim));

		Consulta consulta = new Consulta();
		consulta.setPaciente(paciente);
		consulta.setMedico(medico);
		consulta.setStatus(StatusConsulta.AGENDADA);

		if(medico.getAtivo() == false){
			throw new RuntimeException("Medico nao ativo");
		}

		if(isBetween){
			if(dto.getDataHora().isAfter(dataHoje)){
				consulta.setDataHora(dto.getDataHora());
				return consultaRepository.save(consulta);
			}else{
				throw new RuntimeException("Data anterior a hoje");
			}
		}else{
			throw new RuntimeException("Fora de horario de atendimento");
		}
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

	public List<Consulta> findByPaciente(String nome){
		return consultaRepository.findByPacienteNomeContainingIgnoreCase(nome);
	}

	public List<Consulta> findByMedico(String nome){
		return consultaRepository.findByMedicoNomeContainingIgnoreCase(nome);
	}

}
