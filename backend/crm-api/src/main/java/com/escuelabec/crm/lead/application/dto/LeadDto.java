package com.escuelabec.crm.lead.application.dto;

import com.escuelabec.crm.lead.domain.model.Lead;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class LeadDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank @Email
        private String email;
        private String phone;
        private String source;
        private Integer funnelStageId;
        private String notes;
        private Long assignedTo;
    }

    @Data
    public static class UpdateRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String source;
        private Integer funnelStageId;
        private String status;
        private String notes;
        private Long assignedTo;
    }

    @Data
    public static class MoveStageRequest {
        @NotNull
        private Integer funnelStageId;
    }

    @Data
    public static class Response {
        private Long leadId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String source;
        private Lead.LeadStatus status;
        private Integer funnelStageId;
        private String stageName;
        private String stageColor;
        private String notes;
        private Long assignedTo;
        private String assignedToName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class HistoryResponse {
        private Long id;
        private Integer fromStageId;
        private String fromStageName;
        private String fromStageColor;
        private Integer toStageId;
        private String toStageName;
        private String toStageColor;
        private String changedByName;
        private LocalDateTime changedAt;
    }
}
