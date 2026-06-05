package com.escuelabec.crm.lead.application;

import com.escuelabec.crm.lead.application.dto.LeadSourceDto;
import com.escuelabec.crm.lead.domain.model.LeadSource;
import com.escuelabec.crm.lead.domain.repository.LeadSourceRepository;
import com.escuelabec.crm.shared.domain.model.BusinessException;
import com.escuelabec.crm.shared.domain.model.ErrorCode;
import com.escuelabec.crm.shared.domain.model.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadSourceService {

    private final LeadSourceRepository leadSourceRepository;

    public List<LeadSourceDto.Response> findAll() {
        return leadSourceRepository.findByActiveTrueOrderByPositionAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public LeadSourceDto.Response create(LeadSourceDto.Request request) {
        if (leadSourceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        LeadSource source = LeadSource.builder()
                .name(request.getName())
                .active(request.getActive() != null ? request.getActive() : true)
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .build();
        return toResponse(leadSourceRepository.save(source));
    }

    @Transactional
    public LeadSourceDto.Response update(Integer id, LeadSourceDto.Request request) {
        LeadSource source = leadSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND));
        source.setName(request.getName());
        if (request.getActive() != null) source.setActive(request.getActive());
        if (request.getPosition() != null) source.setPosition(request.getPosition());
        return toResponse(leadSourceRepository.save(source));
    }

    @Transactional
    public void delete(Integer id) {
        LeadSource source = leadSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND));
        source.setActive(false);
        leadSourceRepository.save(source);
    }

    private LeadSourceDto.Response toResponse(LeadSource s) {
        LeadSourceDto.Response r = new LeadSourceDto.Response();
        r.setSourceId(s.getSourceId());
        r.setName(s.getName());
        r.setActive(s.getActive());
        r.setPosition(s.getPosition());
        return r;
    }
}
