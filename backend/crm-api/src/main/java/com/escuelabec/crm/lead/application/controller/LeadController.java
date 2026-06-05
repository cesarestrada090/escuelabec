package com.escuelabec.crm.lead.application.controller;

import com.escuelabec.crm.lead.application.LeadService;
import com.escuelabec.crm.lead.application.dto.LeadDto;
import com.escuelabec.crm.shared.application.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeadDto.Response>> create(
            @Valid @RequestBody LeadDto.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Lead creado exitosamente", leadService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeadDto.Response>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(leadService.search(q, pageable)));
    }

    @GetMapping("/stage/{stageId}")
    public ResponseEntity<ApiResponse<Page<LeadDto.Response>>> findByStage(
            @PathVariable Integer stageId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(leadService.findByStage(stageId, q, source, pageable)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<LeadDto.HistoryResponse>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getHistory(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDto.Response>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDto.Response>> update(
            @PathVariable Long id,
            @RequestBody LeadDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Lead actualizado", leadService.update(id, request)));
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<LeadDto.Response>> moveStage(
            @PathVariable Long id,
            @Valid @RequestBody LeadDto.MoveStageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Lead movido a nueva etapa", leadService.moveStage(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        leadService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead eliminado", null));
    }

    @GetMapping("/stats/by-stage")
    public ResponseEntity<ApiResponse<Map<Integer, Long>>> countByStage() {
        return ResponseEntity.ok(ApiResponse.ok(leadService.countByStage()));
    }
}
