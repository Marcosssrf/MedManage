package com.clinica.service;

import com.clinica.dto.ConsultaDTO;
import com.clinica.dto.resposta.*;
import com.clinica.dto.update.ConsultaUpdateDTO;
import com.clinica.exception.EntidadeNaoEncontradaException;
import com.clinica.exception.RegraDeNegocioException;
import com.clinica.model.*;
import com.clinica.model.enums.StatusConsulta;
import com.clinica.repository.ConsultaRepository;
import com.clinica.repository.HorarioTrabalhoMedicoRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.security.SecurityService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
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

	@Autowired
	ConfiguracaoClinicaService configuracaoClinicaService;

    @Autowired
	SecurityService securityService;

	@Autowired
	HorarioTrabalhoMedicoRepository horarioTrabalhoMedicoRepository;

	private Integer getDuracaoMedico(UUID medicoId, LocalDateTime dataHora){
		DayOfWeek diaSemana = dataHora.getDayOfWeek();
		return horarioTrabalhoMedicoRepository
				.findByMedicoIdAndDiaSemana(medicoId, diaSemana)
				.map(HorarioTrabalhoMedico::getDuracaoPadrao)
				.orElse(null);

	}

	private Integer getDuracaoConsulta(UUID medicoId, LocalDateTime dataHora){
		Integer duracaoMedico = getDuracaoMedico(medicoId, dataHora);

		if(duracaoMedico != null){
			return duracaoMedico;
		}
		Integer duracaoClinica = configuracaoClinicaService.getClinica().getDuracaoPadraoConsultas();
		return duracaoClinica != null ? duracaoClinica : 60;
	}


	private LocalTime getInicio() {
		LocalTime horarioAbertura = configuracaoClinicaService.getClinica().getHorarioAbertura();
		return horarioAbertura != null ? horarioAbertura : LocalTime.of(8, 0);
	}

	private LocalTime getFim() {
		LocalTime horarioFechamento = configuracaoClinicaService.getClinica().getHorarioFechamento();
		return horarioFechamento != null ? horarioFechamento : LocalTime.of(18, 0);
	}

	public ConsultaResponseDTO insert(ConsultaDTO dto){

		LocalDateTime dataHoje = LocalDateTime.now();

		Paciente paciente = pacienteRepository.findById(dto.pacienteId())
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Paciente não encontrado"));
		Medico medico = medicoRepository.findById(dto.medicoId())
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));

		LocalTime horario = dto.dataHora().toLocalTime();

		boolean isHorarioAtendimento = !horario.isBefore(getInicio()) && !horario.isAfter(getFim());

		if (paciente.getAtivo() == false){
			throw new RegraDeNegocioException("Paciente inativo");
		}

		if(medico.getAtivo() == false){
			throw new RegraDeNegocioException("Médico inativo");
		}

		if(!isHorarioAtendimento){
			throw new RegraDeNegocioException("Fora do horário de atendimento");
		}

		if(!dto.dataHora().isAfter(dataHoje)){
			throw new RegraDeNegocioException("Data de atendimento deve ser futura");
		}

		if (paciente.getDataVencimentoCarteirinha() != null &&
				paciente.getDataVencimentoCarteirinha().isBefore(dataHoje.toLocalDate())) {
			throw new RegraDeNegocioException("Carteirinha do paciente vencida");
		}

		Consulta consulta = new Consulta();
		consulta.setPaciente(paciente);
		consulta.setMedico(medico);
		consulta.setStatus(StatusConsulta.AGENDADA);
		consulta.setObservacoes(dto.observacoes());
		consulta.setDataHora(dto.dataHora());
		consulta.setTipoConsulta(dto.tipoConsulta());

		Integer duracao = getDuracaoConsulta(medico.getId(), dto.dataHora());
		consulta.setDuracaoPrevistaMinutos(duracao);

		LocalDateTime fimNovaConsulta = dto.dataHora().plusMinutes(duracao);


		boolean conflitoMedico = consultaRepository.existsConflitoMedico(medico.getId(), dto.dataHora(), fimNovaConsulta);

		boolean conflitoPaciente = consultaRepository.existsConflitoPaciente(paciente.getId(), dto.dataHora(), fimNovaConsulta);

		if(conflitoMedico){
			throw new RegraDeNegocioException("Já existe uma consulta para esse médico nesse horário");
		}

		if(conflitoPaciente){
			throw new RegraDeNegocioException("Já existe uma consulta para esse paciente nesse horário");
		}

		User user = securityService.obterUsuarioLogado();
		consulta.setUsuario(user);

		Consulta consultaSalva = consultaRepository.save(consulta);
		return toDTO(consultaSalva);
	}

	public Consulta patch(UUID id, ConsultaUpdateDTO dto) {
		Consulta consulta = consultaRepository.findById(id)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

		boolean apenasStatus = dto.statusConsulta() != null
				&& dto.dataHora() == null
				&& dto.medicoId() == null
				&& dto.pacienteId() == null;

		if (apenasStatus) {
			consulta.setStatus(dto.statusConsulta());
			if (dto.observacoes() != null) consulta.setObservacoes(dto.observacoes());
			return consultaRepository.save(consulta);
		}

		UUID medicoId = dto.medicoId() != null ? dto.medicoId() : consulta.getMedico().getId();
		UUID pacienteId = dto.pacienteId() != null ? dto.pacienteId() : consulta.getPaciente().getId();
		LocalDateTime novaDataHora = dto.dataHora() != null ? dto.dataHora() : consulta.getDataHora();

		Medico medico = medicoRepository.findById(medicoId)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Médico não encontrado"));
		Paciente paciente = pacienteRepository.findById(pacienteId)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Paciente não encontrado"));

		LocalTime horario = novaDataHora.toLocalTime();
		LocalDateTime dataHoje = LocalDateTime.now();

		if (horario.isBefore(getInicio()) || horario.isAfter(getFim()))
			throw new RegraDeNegocioException("Fora do horário de atendimento");

		if (!novaDataHora.isAfter(dataHoje))
			throw new RegraDeNegocioException("Data de atendimento deve ser futura");

		if (paciente.getDataVencimentoCarteirinha() != null &&
				paciente.getDataVencimentoCarteirinha().isBefore(dataHoje.toLocalDate()))
			throw new RegraDeNegocioException("Carteirinha do paciente vencida");

		if (consultaRepository.existsByMedicoIdAndDataHoraAndIdNot(medico.getId(), novaDataHora, id))
			throw new RegraDeNegocioException("Já existe uma consulta para esse médico nesse horário");
		if (consultaRepository.existsByPacienteIdAndDataHoraAndIdNot(paciente.getId(), novaDataHora, id))
			throw new RegraDeNegocioException("Já existe uma consulta para esse paciente nesse horário");

		consulta.setMedico(medico);
		consulta.setPaciente(paciente);
		consulta.setDataHora(novaDataHora);
		if (dto.observacoes() != null) consulta.setObservacoes(dto.observacoes());
		if (dto.statusConsulta() != null) consulta.setStatus(dto.statusConsulta());

		return consultaRepository.save(consulta);
	}

	public ConsultaResponseDTO cancelar(UUID id){
		Consulta consulta = consultaRepository.findById(id)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));

		LocalDateTime agora = LocalDateTime.now();

		if (consulta.getStatus() == StatusConsulta.REALIZADA ||
				consulta.getStatus() == StatusConsulta.CANCELADA) {
			throw new RegraDeNegocioException("Consulta não pode ser cancelada");
		}

		if (consulta.getDataHora().isBefore(agora.plusHours(24))) {
			throw new RegraDeNegocioException("Consulta só pode ser cancelada com 24h de antecedência");
		}

		consulta.setStatus(StatusConsulta.CANCELADA);
		Consulta consultaAtualizada = consultaRepository.save(consulta);
		return toDTO(consultaAtualizada);
	}

	public ConsultaResponseDTO findById(UUID id) {
		Consulta consulta = consultaRepository.findById(id)
				.orElseThrow(() -> new EntidadeNaoEncontradaException("Consulta não encontrada"));
		return toDTO(consulta);
	}

	@Transactional
	public List<ConsultaResponseGetAll> findByParams(LocalDateTime dataInicio, LocalDateTime dataFim, String paciente, String medico) {

		String pacienteFiltro = paciente != null ? "%" + paciente.toLowerCase() + "%" : null;
		String medicoFiltro = medico != null ? "%" + medico.toLowerCase() + "%" : null;

		return consultaRepository.findByFiltrosAvancados(dataInicio, dataFim, pacienteFiltro, medicoFiltro);
	}

	public ConsultaResponseDTO toDTO(Consulta consulta) {
		return new ConsultaResponseDTO(
				consulta.getId(),
				consulta.getDataHora(),

				consulta.getTipoConsulta() != null ? consulta.getTipoConsulta().toString() : null,

				consulta.getObservacoes(),

				consulta.getStatus() != null ? consulta.getStatus().toString() : null,

				consulta.getPaciente() != null
						? PacienteResponseDTO.from(consulta.getPaciente())
						: null,

				consulta.getMedico() != null
						? new MedicoConsultaDTO(
						consulta.getMedico().getId(),
						consulta.getMedico().getNome(),
						consulta.getMedico().getCrm(),
						consulta.getMedico().getEspecialidade()
				)
						: null,

				consulta.getAnamnese() != null ? new AnamneseResponseDTO(consulta.getAnamnese()) : null,

				consulta.getAnamnese() != null && consulta.getAnamnese().getPrescricoes() != null
						? consulta.getAnamnese().getPrescricoes().stream().map(PrescricaoResponseDTO::new).toList()
						: new java.util.ArrayList<>()
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
