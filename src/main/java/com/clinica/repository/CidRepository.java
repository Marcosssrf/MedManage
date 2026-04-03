package com.clinica.repository;

import com.clinica.model.Cid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CidRepository extends JpaRepository<Cid, String> {
}
