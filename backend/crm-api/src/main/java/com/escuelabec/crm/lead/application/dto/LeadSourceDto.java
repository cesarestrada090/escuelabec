package com.escuelabec.crm.lead.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

public class LeadSourceDto {

    @Data
    public static class Request {
        @NotBlank
        private String name;
        private Boolean active = true;
        private Integer position = 0;
    }

    @Data
    public static class Response {
        private Integer sourceId;
        private String name;
        private Boolean active;
        private Integer position;
    }
}
