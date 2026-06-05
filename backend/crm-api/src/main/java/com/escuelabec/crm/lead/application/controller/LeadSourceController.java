package com.escuelabec.crm.lead.application.controller;

import com.escuelabec.crm.lead.application.LeadSourceService;
import com.escuelabec.crm.lead.application.dto.LeadSourceDto;
import com.escuelabec.crm.shared.application.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lead-sources")
@RequiredArgsConstructor
public class LeadSourceController {

    private final LeadSourceService leadSourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeadSourceDto.Response>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(leadSourceService.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeadSourceDto.Response>> create(
            @Valid @RequestBody LeadSourceDto.Request request) {
        return ResponseEntity.ok(ApiResponse.ok("Fuente creada", leadSourceService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeadSourceDto.Response>> update(
            @PathVariable Integer id,
            @Valid @RequestBody LeadSourceDto.Request request) {
        return ResponseEntity.ok(ApiResponse.ok("Fuente actualizada", leadSourceService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        leadSourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Fuente desactivada", null));
    }
}
