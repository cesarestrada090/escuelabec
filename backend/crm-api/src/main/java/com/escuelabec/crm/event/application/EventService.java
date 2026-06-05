package com.escuelabec.crm.event.application;

import com.escuelabec.crm.event.application.dto.EventDto;
import com.escuelabec.crm.event.domain.model.Event;
import com.escuelabec.crm.event.domain.repository.EventRepository;
import com.escuelabec.crm.lead.domain.repository.LeadRepository;
import com.escuelabec.crm.shared.domain.model.ErrorCode;
import com.escuelabec.crm.shared.domain.model.ResourceNotFoundException;
import com.escuelabec.crm.shared.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventDto.Response create(EventDto.CreateRequest req) {
        if (!leadRepository.existsById(req.getLeadId())) {
            throw new ResourceNotFoundException(ErrorCode.LEAD_NOT_FOUND);
        }
        Event event = Event.builder()
                .leadId(req.getLeadId())
                .eventType(req.getEventType() != null
                        ? Event.EventType.valueOf(req.getEventType().toUpperCase())
                        : Event.EventType.NOTE)
                .title(req.getTitle())
                .description(req.getDescription())
                .eventDate(req.getEventDate())
                .status(req.getStatus() != null
                        ? Event.EventStatus.valueOf(req.getStatus().toUpperCase())
                        : Event.EventStatus.PENDING)
                .build();
        return toResponse(eventRepository.save(event));
    }

    public List<EventDto.Response> findByLeadId(Long leadId) {
        return eventRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<EventDto.Response> findAll(int page, int size, String type, String status) {
        Event.EventType t = type != null && !type.isBlank()
                ? Event.EventType.valueOf(type.toUpperCase()) : null;
        Event.EventStatus s = status != null && !status.isBlank()
                ? Event.EventStatus.valueOf(status.toUpperCase()) : null;
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return eventRepository.findFiltered(t, s, pageable).map(this::toResponse);
    }

    @Transactional
    public EventDto.Response update(Long id, EventDto.UpdateRequest req) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.EVENT_NOT_FOUND));
        if (req.getTitle()       != null) event.setTitle(req.getTitle());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getEventDate()   != null) event.setEventDate(req.getEventDate());
        if (req.getStatus()      != null)
            event.setStatus(Event.EventStatus.valueOf(req.getStatus().toUpperCase()));
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public void delete(Long id) {
        if (!eventRepository.existsById(id))
            throw new ResourceNotFoundException(ErrorCode.EVENT_NOT_FOUND);
        eventRepository.deleteById(id);
    }

    private EventDto.Response toResponse(Event e) {
        EventDto.Response r = new EventDto.Response();
        r.setEventId(e.getEventId());
        r.setLeadId(e.getLeadId());
        r.setEventType(e.getEventType().name());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setEventDate(e.getEventDate());
        r.setStatus(e.getStatus().name());
        r.setCreatedBy(e.getCreatedBy());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());

        leadRepository.findById(e.getLeadId()).ifPresent(l ->
                r.setLeadName(l.getFirstName() + " " + l.getLastName()));

        if (e.getCreatedBy() != null) {
            userRepository.findById(e.getCreatedBy())
                    .ifPresent(u -> r.setCreatedByName(u.getFullName()));
        }
        return r;
    }
}
