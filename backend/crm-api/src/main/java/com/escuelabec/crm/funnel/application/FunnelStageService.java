package com.escuelabec.crm.funnel.application;

import com.escuelabec.crm.funnel.domain.model.FunnelStage;
import com.escuelabec.crm.funnel.domain.repository.FunnelStageRepository;
import com.escuelabec.crm.shared.domain.model.ErrorCode;
import com.escuelabec.crm.shared.domain.model.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FunnelStageService {

    private final FunnelStageRepository funnelStageRepository;

    public List<FunnelStage> findAll() {
        return funnelStageRepository.findByActiveTrueOrderByPosition();
    }

    public FunnelStage findById(Integer id) {
        return funnelStageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.FUNNEL_STAGE_NOT_FOUND));
    }
}
