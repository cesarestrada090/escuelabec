package com.escuelabec.crm.lead.application.controller;

import com.escuelabec.crm.lead.application.ReportService;
import com.escuelabec.crm.lead.application.dto.ReportDto;
import com.escuelabec.crm.shared.application.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<ReportDto.DashboardSummary>> getDashboard(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardSummary(month)));
    }

    @GetMapping("/leads-by-month")
    public ResponseEntity<ApiResponse<List<ReportDto.MonthlyCount>>> getByMonth(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getLeadsByMonth(months)));
    }

    @GetMapping("/leads-by-source")
    public ResponseEntity<ApiResponse<List<ReportDto.SourceCount>>> getBySource(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getLeadsBySource(month)));
    }

    @GetMapping("/funnel")
    public ResponseEntity<ApiResponse<List<ReportDto.FunnelStep>>> getFunnel(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getFunnelSteps(month)));
    }

    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<ReportDto.VendorPerformance>>> getVendors(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getVendorPerformance(month)));
    }
}
