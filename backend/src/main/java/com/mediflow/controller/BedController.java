package com.mediflow.controller;

import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.WardType;
import com.mediflow.dto.BedDTO;
import com.mediflow.dto.BedStatusUpdateDTO;
import com.mediflow.service.BedService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping
    public ResponseEntity<List<BedDTO>> getBeds(
            @RequestParam(required = false) WardType wardType,
            @RequestParam(required = false) BedStatus status) {
        return ResponseEntity.ok(bedService.getAllBeds(wardType, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BedDTO> updateBedStatus(
            @PathVariable Long id,
            @Valid @RequestBody BedStatusUpdateDTO updateDTO,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STAFF");
        return ResponseEntity.ok(bedService.updateBedStatus(id, updateDTO, role));
    }
}
