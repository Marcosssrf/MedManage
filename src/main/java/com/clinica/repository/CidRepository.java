package com.clinica.repository;

import com.clinica.model.Cid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CidRepository extends JpaRepository<Cid, String> {
    Optional<Cid> findByCodigo(String codigoCid);
}
