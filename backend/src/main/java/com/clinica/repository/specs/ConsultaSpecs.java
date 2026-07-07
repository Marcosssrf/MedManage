package com.clinica.repository.specs;

import com.clinica.model.Consulta;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ConsultaSpecs {

    public static Specification<Consulta> pacienteLike(String nome){
        return(root, query, cb) -> cb.like( cb.upper( root.get("paciente").get("nome")), "%" + nome.toUpperCase() + "%");
    }

    public static Specification<Consulta> medicoLike(String nome){
        return(root, query, cb) -> cb.like( cb.upper( root.get("medico").get("nome")), "%" + nome.toUpperCase() + "%");
    }

    public static Specification<Consulta> dataHorarioEqual(LocalDateTime dataHora){
        return(root, query, cb) -> cb.equal(root.get("dataHora"), dataHora);
    }

}
