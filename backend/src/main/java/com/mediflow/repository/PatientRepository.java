package com.mediflow.repository;

import com.mediflow.domain.Patient;
import com.mediflow.domain.enums.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientCode(String patientCode);

    List<Patient> findByStatusOrderByAcuityLevelAscArrivalTimeAsc(PatientStatus status);

    long countByStatus(PatientStatus status);
}
