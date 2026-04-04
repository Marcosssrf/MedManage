package com.clinica.model;

import jakarta.persistence.*;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "horario_trabalho_medico")
public class HorarioTrabalhoMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ElementCollection
    @CollectionTable(name = "horario_dias_semana", joinColumns = @JoinColumn(name = "horario_id"))
    @Column(name = "dia_semana")
    private List<Integer> diasSemana;

    private LocalTime horaInicio;
    private LocalTime horaFim;
    private Integer duracaoPadrao;

    public HorarioTrabalhoMedico() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }

    public List<Integer> getDiasSemana() {
        return diasSemana;
    }

    public void setDiasSemana(List<Integer> diasSemana) {
        this.diasSemana = diasSemana;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public Integer getDuracaoPadrao() {
        return duracaoPadrao;
    }

    public void setDuracaoPadrao(Integer duracaoPadrao) {
        this.duracaoPadrao = duracaoPadrao;
    }
}
