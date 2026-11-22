package com.mediflow.domain;

import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.WardType;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "beds", schema = "app")
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bed_code", nullable = false, unique = true, length = 20)
    private String bedCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "ward_type", nullable = false, length = 20)
    private WardType wardType;

    @Column(name = "floor_number", nullable = false)
    private Integer floorNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BedStatus status = BedStatus.AVAILABLE;

    @Column(name = "has_ventilator", nullable = false)
    private Boolean hasVentilator = false;

    /**
     * JPA Optimistic Locking — Hibernate auto-increments this on every UPDATE.
     * Maps to the BIGINT version column in app.beds.
     */
    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Bed() {}

    @PrePersist
    public void prePersist() {
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
        if (version == null) {
            version = 1L;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }

    public WardType getWardType() { return wardType; }
    public void setWardType(WardType wardType) { this.wardType = wardType; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public BedStatus getStatus() { return status; }
    public void setStatus(BedStatus status) { this.status = status; }

    public Boolean getHasVentilator() { return hasVentilator; }
    public void setHasVentilator(Boolean hasVentilator) { this.hasVentilator = hasVentilator; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Bed bed)) return false;
        return Objects.equals(id, bed.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Bed{id=" + id + ", bedCode='" + bedCode + "', status=" + status + ", version=" + version + "}";
    }
}
