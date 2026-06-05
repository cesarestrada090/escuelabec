package com.escuelabec.crm.event.application.controller;

import com.escuelabec.crm.event.application.EventService;
import com.escuelabec.crm.event.application.dto.EventDto;
import com.escuelabec.crm.shared.application.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventDto.Response>> create(
            @RequestBody EventDto.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Actividad creada", eventService.create(request)));
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<EventDto.Response>>> findByLead(
            @PathVariable Long leadId) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.findByLeadId(leadId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventDto.Response>>> findAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String type,
            @RequestParam(required = false)    String status) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.findAll(page, size, type, status)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDto.Response>> update(
            @PathVariable Long id,
            @RequestBody EventDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Actividad actualizada", eventService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Actividad eliminada", null));
    }
}
