package com.escuelabec.crm.lead.application;

import com.escuelabec.crm.lead.domain.model.Lead;
import com.escuelabec.crm.lead.domain.model.LeadStageHistory;
import com.escuelabec.crm.lead.domain.repository.LeadRepository;
import com.escuelabec.crm.lead.domain.repository.LeadStageHistoryRepository;
import com.escuelabec.crm.lead.application.dto.LeadDto;
import com.escuelabec.crm.funnel.domain.repository.FunnelStageRepository;
import com.escuelabec.crm.shared.domain.model.*;
import com.escuelabec.crm.shared.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadStageHistoryRepository historyRepository;
    private final FunnelStageRepository funnelStageRepository;
    private final UserRepository userRepository;

    @Transactional
    public LeadDto.Response create(LeadDto.CreateRequest request) {
        if (leadRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.LEAD_ALREADY_EXISTS);
        }
        int stageId = request.getFunnelStageId() != null ? request.getFunnelStageId() : 1;
        Lead lead = Lead.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .source(request.getSource())
                .funnelStageId(stageId)
                .notes(request.getNotes())
                .assignedTo(request.getAssignedTo())
                .build();
        Lead saved = leadRepository.save(lead);
        recordHistory(saved.getLeadId(), null, stageId, null);
        return toResponse(saved);
    }

    public Page<LeadDto.Response> search(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return leadRepository.findAll(pageable).map(this::toResponse);
        }
        return leadRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                q, q, q, pageable).map(this::toResponse);
    }

    public List<LeadDto.Response> findByStage(Integer stageId) {
        return leadRepository.findByFunnelStageIdOrderByCreatedAtDesc(stageId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<LeadDto.Response> findByStage(Integer stageId, String q, String source, Pageable pageable) {
        boolean hasQ = q != null && !q.isBlank();
        boolean hasSrc = source != null && !source.isBlank();
        if (hasQ && hasSrc) {
            return leadRepository.findByStageAndSourceAndQuery(stageId, source, q, pageable).map(this::toResponse);
        } else if (hasSrc) {
            return leadRepository.findByStageAndSource(stageId, source, pageable).map(this::toResponse);
        } else if (hasQ) {
            return leadRepository.findByStageAndQuery(stageId, q, pageable).map(this::toResponse);
        }
        return leadRepository.findByFunnelStageIdOrderByCreatedAtDesc(stageId, pageable).map(this::toResponse);
    }

    public LeadDto.Response findById(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND));
        return toResponse(lead);
    }

    @Transactional
    public LeadDto.Response update(Long id, LeadDto.UpdateRequest request) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND));

        Integer oldStageId = lead.getFunnelStageId();

        if (request.getFirstName()   != null) lead.setFirstName(request.getFirstName());
        if (request.getLastName()    != null) lead.setLastName(request.getLastName());
        if (request.getPhone()       != null) lead.setPhone(request.getPhone());
        if (request.getSource()      != null) lead.setSource(request.getSource());
        if (request.getNotes()       != null) lead.setNotes(request.getNotes());
        if (request.getAssignedTo()  != null) lead.setAssignedTo(request.getAssignedTo());
        if (request.getStatus()      != null) {
            lead.setStatus(Lead.LeadStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getFunnelStageId() != null) {
            if (!request.getFunnelStageId().equals(oldStageId)) {
                recordHistory(lead.getLeadId(), oldStageId, request.getFunnelStageId(), null);
            }
            lead.setFunnelStageId(request.getFunnelStageId());
        }

        return toResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadDto.Response moveStage(Long id, LeadDto.MoveStageRequest request) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND));
        funnelStageRepository.findById(request.getFunnelStageId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.FUNNEL_STAGE_NOT_FOUND));

        Integer oldStageId = lead.getFunnelStageId();
        lead.setFunnelStageId(request.getFunnelStageId());
        Lead saved = leadRepository.save(lead);
        recordHistory(saved.getLeadId(), oldStageId, request.getFunnelStageId(), null);
        return toResponse(saved);
    }

    public List<LeadDto.HistoryResponse> getHistory(Long leadId) {
        return historyRepository.findByLeadIdOrderByChangedAtDesc(leadId)
                .stream().map(this::toHistoryResponse).collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND);
        }
        leadRepository.deleteById(id);
    }

    public Map<Integer, Long> countByStage() {
        return leadRepository.countGroupByStage().stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));
    }

    private void recordHistory(Long leadId, Integer fromStageId, Integer toStageId, Long changedBy) {
        historyRepository.save(LeadStageHistory.builder()
                .leadId(leadId)
                .fromStageId(fromStageId)
                .toStageId(toStageId)
                .changedBy(changedBy)
                .build());
    }

    private LeadDto.HistoryResponse toHistoryResponse(LeadStageHistory h) {
        LeadDto.HistoryResponse r = new LeadDto.HistoryResponse();
        r.setId(h.getId());
        r.setFromStageId(h.getFromStageId());
        r.setToStageId(h.getToStageId());
        r.setChangedAt(h.getChangedAt());

        if (h.getFromStageId() != null) {
            funnelStageRepository.findById(h.getFromStageId())
                    .ifPresent(s -> { r.setFromStageName(s.getName()); r.setFromStageColor(s.getColor()); });
        }
        funnelStageRepository.findById(h.getToStageId())
                .ifPresent(s -> { r.setToStageName(s.getName()); r.setToStageColor(s.getColor()); });

        if (h.getChangedBy() != null) {
            userRepository.findById(h.getChangedBy())
                    .ifPresent(u -> r.setChangedByName(u.getFullName()));
        }
        return r;
    }

    private LeadDto.Response toResponse(Lead lead) {
        LeadDto.Response dto = new LeadDto.Response();
        dto.setLeadId(lead.getLeadId());
        dto.setFirstName(lead.getFirstName());
        dto.setLastName(lead.getLastName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setSource(lead.getSource());
        dto.setStatus(lead.getStatus());
        dto.setFunnelStageId(lead.getFunnelStageId());
        dto.setNotes(lead.getNotes());
        dto.setAssignedTo(lead.getAssignedTo());
        dto.setCreatedAt(lead.getCreatedAt());
        dto.setUpdatedAt(lead.getUpdatedAt());

        funnelStageRepository.findById(lead.getFunnelStageId()).ifPresent(stage -> {
            dto.setStageName(stage.getName());
            dto.setStageColor(stage.getColor());
        });

        if (lead.getAssignedTo() != null) {
            userRepository.findById(lead.getAssignedTo())
                    .ifPresent(user -> dto.setAssignedToName(user.getFullName()));
        }

        return dto;
    }
}
