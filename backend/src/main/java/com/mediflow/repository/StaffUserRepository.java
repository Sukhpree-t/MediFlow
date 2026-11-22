package com.mediflow.repository;

import com.mediflow.domain.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {

    Optional<StaffUser> findByEmail(String email);

    Optional<StaffUser> findByEmployeeId(String employeeId);
}
