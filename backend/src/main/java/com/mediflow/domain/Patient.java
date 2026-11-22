package com.mediflow.domain;

import com.mediflow.domain.enums.Gender;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.domain.enums.WardType;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "patients", schema = "app")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_code", nullable = false, unique = true, length = 30)
    private String patientCode;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "vitals_summary", columnDefinition = "TEXT")
    private String vitalsSummary;

    @Column(name = "acuity_level", nullable = false)
    private Integer acuityLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_ward", length = 20)
    private WardType recommendedWard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatientStatus status = PatientStatus.WAITING;

    @Column(name = "arrival_time", nullable = false)
    private OffsetDateTime arrivalTime;

    public Patient() {}

    @PrePersist
    public void prePersist() {
        if (arrivalTime == null) {
            arrivalTime = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }

    public Integer getAcuityLevel() { return acuityLevel; }
    public void setAcuityLevel(Integer acuityLevel) { this.acuityLevel = acuityLevel; }

    public WardType getRecommendedWard() { return recommendedWard; }
    public void setRecommendedWard(WardType recommendedWard) { this.recommendedWard = recommendedWard; }

    public PatientStatus getStatus() { return status; }
    public void setStatus(PatientStatus status) { this.status = status; }

    public OffsetDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(OffsetDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Patient p)) return false;
        return Objects.equals(id, p.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
