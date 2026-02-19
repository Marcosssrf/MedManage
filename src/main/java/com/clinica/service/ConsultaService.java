package com.clinica.service;

import com.clinica.dto.ConsultaDTO;
import com.clinica.dto.update.ConsultaUpdateDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Medico;
import com.clinica.model.Paciente;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class ConsultaService {

	@Autowired
	ConsultaRepository consultaRepository;

	@Autowired
	MedicoRepository medicoRepository;

	@Autowired
	PacienteRepository pacienteRepository;

	LocalTime inicio = LocalTime.of(8, 0);
	LocalTime fim = LocalTime.of(18, 0);



	/*
	✓ implementar busca por nome do paciente ou medico
	✓ data nao pode ser < que a atual										* prioridade
	✓ nao pode existir 2 consultas com o mesmo medico no mesmo horario
	✓ toda consulta comeca com agendada
	✓ consulta so pode ser cancelada ate 24 horas antes
	✓ paciente inativo nao pode agendar uma consulta
	✓ medico tem que ter uma especialidade
	✓ adicionar status no medico para poder inativar ele
	✓ medico inativo nao pode ter uma consulta
	✓ horario de atendimento (ex 08:00 as 18:00)
	✓ uma consulta so pode ter UM pagamento, nao pode ter mais de um		* prioridade
	✓ nao pode pagar uma consulta inexistente
	✓ pagamento so com consulta realizda
	✓ fluxo de status (agendada -> confirmada -> realizada)				* prioridade
	relatorios (faturamento por mes, medico mais atendido)
	*/

	public Consulta insert(ConsultaDTO dto){

		LocalDateTime dataHoje = LocalDateTime.now();

		Paciente paciente = pacienteRepository.findById(dto.pacienteId()).orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
		Medico medico = medicoRepository.findById(dto.medicoId()).orElseThrow(() -> new RuntimeException("Medico não encontrado"));

		LocalTime horario = dto.dataHora().toLocalTime();

		boolean isHorarioAtendimento = (horario.isAfter(inicio) && horario.isBefore(fim));

		if (paciente.getAtivo() == false){
			throw new RuntimeException("Paciente inativo");
		}

		if(medico.getAtivo() == false){
			throw new RuntimeException("Medico nao ativo");
		}

		if(!isHorarioAtendimento){
			throw new RuntimeException("Fora do horario de atendimento!");
		}

		if(!dto.dataHora().isAfter(dataHoje)){
			throw new RuntimeException("Data de atendimento deve ser futura!");
		}

		Consulta consulta = new Consulta();
		consulta.setPaciente(paciente);
		consulta.setMedico(medico);
		consulta.setStatus(StatusConsulta.AGENDADA);
		consulta.setDataHora(dto.dataHora());

		boolean conflito = consultaRepository.existsByMedicoIdAndDataHora(medico.getId(), dto.dataHora());

		if(conflito){
			throw new RuntimeException("Já existe uma consulta para esse médico nesse horário");
		}

		return consultaRepository.save(consulta);
	}

	public void atualizarStatus(Consulta consulta){
		LocalDateTime agora = LocalDateTime.now();

		if (consulta.getStatus() == StatusConsulta.REALIZADA) {
			return;
		}
		if (consulta.getDataHora().isBefore(agora)) {
			consulta.setStatus(StatusConsulta.REALIZADA);
		}
		else if (consulta.getDataHora().isBefore(agora.plusHours(24))) {
			consulta.setStatus(StatusConsulta.CONFIRMADA);
		}
	}

	public Consulta cancelar(UUID id){
		Consulta consulta = consultaRepository.findById(id).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

		LocalDateTime agora = LocalDateTime.now();

		if (consulta.getStatus() == StatusConsulta.REALIZADA ||
				consulta.getStatus() == StatusConsulta.CANCELADA) {
			throw new RuntimeException("Consulta não pode ser cancelada");
		}

		if (consulta.getDataHora().isBefore(agora.plusHours(24))) {
			throw new RuntimeException("Consulta só pode ser cancelada com 24h de antecedência");
		}

		consulta.setStatus(StatusConsulta.CANCELADA);
		return consultaRepository.save(consulta);
	}

	public List<Consulta> findAll() {
		List<Consulta> consultas = consultaRepository.findAll();
		consultas.forEach(this::atualizarStatus);
		return consultaRepository.saveAll(consultas);
	}

	public Consulta findById(UUID id) {
		Consulta consulta = consultaRepository.findById(id).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
		atualizarStatus(consulta);
		return consultaRepository.save(consulta);
	}

	public List<Consulta> findByPaciente(String nome){
		List<Consulta> consultas = consultaRepository.findByPacienteNomeContainingIgnoreCase(nome);
		consultas.forEach(this::atualizarStatus);
		return consultaRepository.saveAll(consultas);
	}

	public List<Consulta> findByMedico(String nome){
		List<Consulta> consultas = consultaRepository.findByMedicoNomeContainingIgnoreCase(nome);
		consultas.forEach(this::atualizarStatus);
		return consultaRepository.saveAll(consultas);
	}

//	public Consulta update(UUID id, ConsultaUpdateDTO dto) {
//		Consulta consulta = consultaRepository.getReferenceById(id);
//
//		consulta.setDataHora(dto.dataHora());
//
//		return consultaRepository.save(consulta);
//	}

//	public void delete(UUID id) {
//		consultaRepository.deleteById(id);
//	}

}
