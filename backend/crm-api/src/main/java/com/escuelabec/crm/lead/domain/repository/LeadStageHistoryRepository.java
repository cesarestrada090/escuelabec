package com.escuelabec.crm.lead.domain.repository;

import com.escuelabec.crm.lead.domain.model.LeadStageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeadStageHistoryRepository extends JpaRepository<LeadStageHistory, Long> {
    List<LeadStageHistory> findByLeadIdOrderByChangedAtDesc(Long leadId);
}
