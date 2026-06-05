package com.escuelabec.crm.shared.application.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class UserDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
        private String role = "SALES";
    }

    @Data
    public static class UpdateRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String role;
        private Boolean active;
    }

    @Data
    public static class Response {
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private Boolean active;
        private LocalDateTime createdAt;
    }
}
