package com.clinica.model;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(
        name = "horario_trabalho_medico",
        uniqueConstraints = @UniqueConstraint(columnNames = {"medico_id", "dia_semana"})
)
public class HorarioTrabalhoMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(name = "duracao_padrao", nullable = false)
    private Integer duracaoPadrao;

    public HorarioTrabalhoMedico() {}

    public HorarioTrabalhoMedico(Medico medico, DayOfWeek diaSemana,
                                 LocalTime horaInicio, LocalTime horaFim,
                                 Integer duracaoPadrao) {
        this.medico = medico;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.duracaoPadrao = duracaoPadrao;
    }

    public UUID getId() { return id; }
    public Medico getMedico() { return medico; }
    public void setMedico(Medico medico) { this.medico = medico; }
    public DayOfWeek getDiaSemana() { return diaSemana; }
    public void setDiaSemana(DayOfWeek diaSemana) { this.diaSemana = diaSemana; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }
    public Integer getDuracaoPadrao() { return duracaoPadrao; }
    public void setDuracaoPadrao(Integer duracaoPadrao) { this.duracaoPadrao = duracaoPadrao; }
}