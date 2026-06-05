package com.escuelabec.crm.lead.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class ReportDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DashboardSummary {
        private long totalLeads;
        private long leadsThisMonth;
        private long leadsLastMonth;
        private double growthRate;           // % vs last month
        private long converted;
        private double conversionRate;       // converted / total %
        private long lost;
        private long assigned;
        private Map<String, Long> byStage;
        private Map<String, Long> byStatus;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyCount {
        private String month;   // "2026-01"
        private long count;
        private long converted;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SourceCount {
        private String source;
        private long count;
        private double pct;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VendorPerformance {
        private String vendorName;
        private long total;
        private long converted;
        private double conversionRate;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class FunnelStep {
        private Integer stageId;
        private String stageName;
        private String color;
        private long count;
        private double pct;
    }
}
