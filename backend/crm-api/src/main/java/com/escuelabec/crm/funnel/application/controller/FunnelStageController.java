package com.escuelabec.crm.funnel.application.controller;

import com.escuelabec.crm.funnel.application.FunnelStageService;
import com.escuelabec.crm.funnel.domain.model.FunnelStage;
import com.escuelabec.crm.shared.application.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funnel")
@RequiredArgsConstructor
public class FunnelStageController {

    private final FunnelStageService funnelStageService;

    @GetMapping("/stages")
    public ResponseEntity<ApiResponse<List<FunnelStage>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(funnelStageService.findAll()));
    }

    @GetMapping("/stages/{id}")
    public ResponseEntity<ApiResponse<FunnelStage>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(funnelStageService.findById(id)));
    }
}
