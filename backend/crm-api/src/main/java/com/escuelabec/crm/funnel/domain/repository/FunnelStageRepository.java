package com.escuelabec.crm.funnel.domain.repository;

import com.escuelabec.crm.funnel.domain.model.FunnelStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FunnelStageRepository extends JpaRepository<FunnelStage, Integer> {
    List<FunnelStage> findByActiveTrueOrderByPosition();
}
