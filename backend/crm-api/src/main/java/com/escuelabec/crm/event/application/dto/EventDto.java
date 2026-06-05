package com.escuelabec.crm.event.application.dto;

import com.escuelabec.crm.event.domain.model.Event;
import lombok.Data;

import java.time.LocalDateTime;

public class EventDto {

    @Data
    public static class CreateRequest {
        private Long leadId;
        private String eventType;
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String status;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String status;
    }

    @Data
    public static class Response {
        private Long eventId;
        private Long leadId;
        private String leadName;
        private String eventType;
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String status;
        private Long createdBy;
        private String createdByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
