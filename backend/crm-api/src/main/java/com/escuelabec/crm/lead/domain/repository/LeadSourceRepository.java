package com.escuelabec.crm.lead.domain.repository;

import com.escuelabec.crm.lead.domain.model.LeadSource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeadSourceRepository extends JpaRepository<LeadSource, Integer> {
    List<LeadSource> findByActiveTrueOrderByPositionAsc();
    boolean existsByNameIgnoreCase(String name);
}
