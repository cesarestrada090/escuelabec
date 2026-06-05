package com.escuelabec.crm.lead.application;

import com.escuelabec.crm.funnel.domain.repository.FunnelStageRepository;
import com.escuelabec.crm.lead.application.dto.ReportDto;
import com.escuelabec.crm.lead.domain.model.Lead;
import com.escuelabec.crm.lead.domain.repository.LeadRepository;
import com.escuelabec.crm.shared.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final LeadRepository leadRepository;
    private final FunnelStageRepository funnelStageRepository;
    private final UserRepository userRepository;

    private static long toLong(Object o) {
        return o == null ? 0L : ((Number) o).longValue();
    }

    public ReportDto.DashboardSummary getDashboardSummary(String month) {
        if (month != null && !month.isBlank()) {
            return getSummaryForMonth(month);
        }
        return getSummaryAllTime();
    }

    private ReportDto.DashboardSummary getSummaryForMonth(String month) {
        YearMonth ym = YearMonth.parse(month);
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to   = ym.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime prevFrom = ym.minusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime prevTo   = ym.atDay(1).atStartOfDay();

        long total     = leadRepository.countByCreatedAtBetween(from, to);
        long prevMonth = leadRepository.countByCreatedAtBetween(prevFrom, prevTo);

        List<Object[]> statusRows = leadRepository.countGroupByStatusInRange(from, to);
        Map<String, Long> byStatus = statusRows.stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> toLong(r[1])));

        long converted = byStatus.getOrDefault("CONVERTED", 0L);
        long lost      = byStatus.getOrDefault("LOST", 0L);

        double growth  = prevMonth == 0 ? 100.0
                : Math.round(((double)(total - prevMonth) / prevMonth) * 1000.0) / 10.0;
        double convRate = total == 0 ? 0
                : Math.round(((double) converted / total) * 1000.0) / 10.0;

        Map<String, Long> byStage = leadRepository.countGroupByStageByMonth(month).stream()
                .collect(Collectors.toMap(r -> String.valueOf(r[0]), r -> toLong(r[1])));

        return new ReportDto.DashboardSummary(
                total, total, prevMonth, growth,
                converted, convRate, lost, 0L,
                byStage, byStatus);
    }

    private ReportDto.DashboardSummary getSummaryAllTime() {
        YearMonth now = YearMonth.now();
        LocalDateTime thisMonthStart = now.atDay(1).atStartOfDay();
        LocalDateTime lastMonthStart = now.minusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime lastMonthEnd   = now.atDay(1).atStartOfDay();

        long total     = leadRepository.count();
        long thisMonth = leadRepository.countByCreatedAtBetween(thisMonthStart, LocalDateTime.now());
        long lastMonth = leadRepository.countByCreatedAtBetween(lastMonthStart, lastMonthEnd);
        long converted = leadRepository.countByStatus(Lead.LeadStatus.CONVERTED);
        long lost      = leadRepository.countByStatus(Lead.LeadStatus.LOST);
        long assigned  = leadRepository.countByAssignedToIsNotNull();

        double growth  = lastMonth == 0 ? 100.0
                : Math.round(((double)(thisMonth - lastMonth) / lastMonth) * 1000.0) / 10.0;
        double convRate = total == 0 ? 0
                : Math.round(((double) converted / total) * 1000.0) / 10.0;

        Map<String, Long> byStage  = leadRepository.countGroupByStage().stream()
                .collect(Collectors.toMap(r -> String.valueOf(r[0]), r -> toLong(r[1])));
        Map<String, Long> byStatus = leadRepository.countGroupByStatus().stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> toLong(r[1])));

        return new ReportDto.DashboardSummary(
                total, thisMonth, lastMonth, growth,
                converted, convRate, lost, assigned,
                byStage, byStatus);
    }

    public List<ReportDto.MonthlyCount> getLeadsByMonth(int months) {
        LocalDateTime from = YearMonth.now().minusMonths(months - 1).atDay(1).atStartOfDay();
        List<Object[]> rows = leadRepository.countByMonth(from);
        return rows.stream().map(r -> new ReportDto.MonthlyCount(
                (String) r[0], toLong(r[1]), toLong(r[2])
        )).collect(Collectors.toList());
    }

    public List<ReportDto.SourceCount> getLeadsBySource(String month) {
        List<Object[]> rows = month != null && !month.isBlank()
                ? leadRepository.countGroupBySourceByMonth(month)
                : leadRepository.countGroupBySource();
        long total = rows.stream().mapToLong(r -> toLong(r[1])).sum();
        return rows.stream().map(r -> {
            long cnt = toLong(r[1]);
            double pct = total == 0 ? 0 : Math.round(((double) cnt / total) * 1000.0) / 10.0;
            return new ReportDto.SourceCount(r[0] == null ? "Sin fuente" : (String) r[0], cnt, pct);
        }).collect(Collectors.toList());
    }

    public List<ReportDto.FunnelStep> getFunnelSteps(String month) {
        Map<Integer, Long> byStage;
        long total;
        if (month != null && !month.isBlank()) {
            List<Object[]> rows = leadRepository.countGroupByStageByMonth(month);
            byStage = rows.stream()
                    .collect(Collectors.toMap(r -> ((Number) r[0]).intValue(), r -> toLong(r[1])));
            total = byStage.values().stream().mapToLong(Long::longValue).sum();
        } else {
            byStage = leadRepository.countGroupByStage().stream()
                    .collect(Collectors.toMap(r -> ((Number) r[0]).intValue(), r -> toLong(r[1])));
            total = leadRepository.count();
        }
        return funnelStageRepository.findAll().stream()
                .sorted(Comparator.comparingInt(s -> s.getPosition()))
                .map(s -> {
                    long cnt = byStage.getOrDefault(s.getStageId(), 0L);
                    double pct = total == 0 ? 0 : Math.round(((double) cnt / total) * 1000.0) / 10.0;
                    return new ReportDto.FunnelStep(s.getStageId(), s.getName(), s.getColor(), cnt, pct);
                }).collect(Collectors.toList());
    }

    public List<ReportDto.VendorPerformance> getVendorPerformance(String month) {
        List<Object[]> rows = month != null && !month.isBlank()
                ? leadRepository.countByVendorByMonth(month)
                : leadRepository.countByVendor();
        return rows.stream().map(r -> {
            String name = r[0] == null ? "Sin asignar" : (String) r[0];
            long tot  = toLong(r[1]);
            long conv = toLong(r[2]);
            double rate = tot == 0 ? 0 : Math.round(((double) conv / tot) * 1000.0) / 10.0;
            return new ReportDto.VendorPerformance(name, tot, conv, rate);
        }).collect(Collectors.toList());
    }
}
