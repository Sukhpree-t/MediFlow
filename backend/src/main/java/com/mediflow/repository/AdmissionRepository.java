package com.mediflow.repository;

import com.mediflow.domain.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {

    @Query("SELECT a FROM Admission a WHERE a.bed.id = :bedId AND a.dischargedAt IS NULL")
    Optional<Admission> findActiveByBedId(Long bedId);

    @Query("SELECT a FROM Admission a WHERE a.patient.id = :patientId AND a.dischargedAt IS NULL")
    Optional<Admission> findActiveByPatientId(Long patientId);
}
