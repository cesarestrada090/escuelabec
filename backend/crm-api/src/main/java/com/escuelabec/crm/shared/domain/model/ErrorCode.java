package com.escuelabec.crm.shared.domain.model;

public enum ErrorCode {
    // Auth
    INVALID_CREDENTIALS("AUTH_001", "Credenciales inválidas"),
    USER_NOT_FOUND("AUTH_002", "Usuario no encontrado"),
    EMAIL_ALREADY_EXISTS("AUTH_003", "El email ya está registrado"),
    UNAUTHORIZED("AUTH_004", "No autorizado"),
    ACCESS_DENIED("AUTH_005", "Acceso denegado"),

    // Leads
    LEAD_NOT_FOUND("LEAD_001", "Lead no encontrado"),
    LEAD_ALREADY_EXISTS("LEAD_002", "El lead ya existe"),

    // Funnel
    FUNNEL_STAGE_NOT_FOUND("FUNNEL_001", "Etapa del funnel no encontrada"),

    // Events
    EVENT_NOT_FOUND("EVENT_001", "Actividad no encontrada"),

    // General
    VALIDATION_ERROR("GEN_001", "Error de validación"),
    INTERNAL_ERROR("GEN_002", "Error interno del servidor"),
    RESOURCE_NOT_FOUND("GEN_003", "Recurso no encontrado");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
}
