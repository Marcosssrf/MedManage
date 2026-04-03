package com.clinica.service;

import com.clinica.dto.ConsultaDTO;
import com.clinica.dto.resposta.ConsultaResponseDTO;
import com.clinica.dto.resposta.MedicoConsultaDTO;
import com.clinica.dto.resposta.PacienteConsultaDTO;
import com.clinica.dto.update.ConsultaUpdateDTO;
import com.clinica.model.Consulta;
import com.clinica.model.Medico;
import com.clinica.model.Paciente;
import com.clinica.model.User;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.security.SecurityService;
import jakarta.persistence.criteria.JoinType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static com.clinica.repository.specs.ConsultaSpecs.*;

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
    @Autowired
	SecurityService securityService;



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

	public ConsultaResponseDTO insert(ConsultaDTO dto){

		LocalDateTime dataHoje = LocalDateTime.now();

		Paciente paciente = pacienteRepository.findById(dto.pacienteId()).orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
		Medico medico = medicoRepository.findById(dto.medicoId()).orElseThrow(() -> new RuntimeException("Medico não encontrado"));

		LocalTime horario = dto.dataHora().toLocalTime();

		boolean isHorarioAtendimento = !horario.isBefore(inicio) && !horario.isAfter(fim);

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
		consulta.setObservacoes(dto.observacoes());
		consulta.setDataHora(dto.dataHora());
		consulta.setTipoConsulta(dto.tipoConsulta());

		boolean conflito = consultaRepository.existsByMedicoIdAndDataHora(medico.getId(), dto.dataHora());

		if(conflito){
			throw new RuntimeException("Já existe uma consulta para esse médico nesse horário");
		}

		User user = securityService.obterUsuarioLogado();
		consulta.setUsuario(user);

		Consulta consultaSalva = consultaRepository.save(consulta);
		return toDTO(consultaSalva);
	}

	public void atualizarStatus(Consulta consulta) {

		if (consulta.getStatus() == StatusConsulta.CANCELADA || consulta.getStatus() == StatusConsulta.REALIZADA) {
			return;
		}

		LocalDateTime agora = LocalDateTime.now();

		if (consulta.getDataHora().isBefore(agora)) {
			consulta.setStatus(StatusConsulta.REALIZADA);
		}
		else if (consulta.getDataHora().isBefore(agora.plusHours(24))) {
			consulta.setStatus(StatusConsulta.CONFIRMADA);
		}

		consultaRepository.save(consulta);
	}

		public Consulta patch(UUID id, ConsultaUpdateDTO dto) {
		Consulta consulta = consultaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Consulta não encontrada!"));

		if(dto.dataHora() != null){
			consulta.setDataHora(dto.dataHora());
		}
		if(dto.observacoes() != null){
			consulta.setObservacoes(dto.observacoes());
		}

		return consultaRepository.save(consulta);
	}

	public ConsultaResponseDTO cancelar(UUID id){
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
		Consulta consultaAtualizada = consultaRepository.save(consulta);
		return toDTO(consultaAtualizada);
	}

	public ConsultaResponseDTO findById(UUID id) {
		Consulta consulta = consultaRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
		atualizarStatus(consulta);
		return toDTO(consulta);
	}

	public List<Consulta> findByParams(LocalDateTime dataHora, String paciente, String medico) {

		Specification<Consulta> specs = Specification.where((root, query, cb) -> {
			if (Long.class != query.getResultType() && long.class != query.getResultType()) {
				root.fetch("paciente", JoinType.LEFT);
				root.fetch("medico", JoinType.LEFT);
			}
			return cb.conjunction();
		});

		if (dataHora != null) {
			specs = specs.and(dataHorarioEqual(dataHora));
		}

		if (paciente != null) {
			specs = specs.and(pacienteLike(paciente));
		}

		if (medico != null) {
			specs = specs.and(medicoLike(medico));
		}

		List<Consulta> resultado = consultaRepository.findAll(specs);

		resultado.forEach(this::atualizarStatus);

		return resultado;
	}

	public ConsultaResponseDTO toDTO(Consulta consulta){
		return new ConsultaResponseDTO(
				consulta.getId(),
				consulta.getDataHora(),
				consulta.getTipoConsulta().toString(),
				consulta.getObservacoes(),
				consulta.getStatus(),
				new PacienteConsultaDTO(
						consulta.getPaciente().getNome(),
						consulta.getPaciente().getDataNascimento()
				),
				new MedicoConsultaDTO(
						consulta.getMedico().getId(),
						consulta.getMedico().getNome(),
						consulta.getMedico().getCrm(),
						consulta.getMedico().getEspecialidade()
				)
		);
	}
}


//	public void delete(UUID id) {
//		consultaRepository.deleteById(id);
//	}


//	public List<Consulta> findByPaciente(String nome){
//		List<Consulta> consultas = consultaRepository.findByPacienteNomeContainingIgnoreCase(nome);
//		consultas.forEach(this::atualizarStatus);
//		return consultaRepository.saveAll(consultas);
//	}
//
//	public List<Consulta> findByMedico(String nome){
//		List<Consulta> consultas = consultaRepository.findByMedicoNomeContainingIgnoreCase(nome);
//		consultas.forEach(this::atualizarStatus);
//		return consultaRepository.saveAll(consultas);
//	}

//	public List<ConsultaResponseDTO> findAll() {
//		List<Consulta> consultas = consultaRepository.findAll();
//		consultas.forEach(this::atualizarStatus);
//		return consultas.stream().map(this::toDTO).toList();
//	}
