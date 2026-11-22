package com.mediflow.repository;

import com.mediflow.domain.Bed;
import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.WardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    Optional<Bed> findByBedCode(String bedCode);

    List<Bed> findByWardType(WardType wardType);

    List<Bed> findByStatus(BedStatus status);

    List<Bed> findByWardTypeAndStatus(WardType wardType, BedStatus status);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.status = :status")
    long countByStatus(BedStatus status);
}
