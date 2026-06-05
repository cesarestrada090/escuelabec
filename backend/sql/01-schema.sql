-- ════════════════════════════════════════════════════════════════
-- CRM Escuela BEC - Schema
-- ════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ────────────────────────────────────────────────────────────────
-- Usuarios del sistema
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    role        ENUM('ADMIN','SALES','MARKETING','VIEWER') NOT NULL DEFAULT 'SALES',
    active      TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Etapas del funnel (las 6 del diagrama)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS funnel_stages (
    stage_id    INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    position    INT NOT NULL,
    color       VARCHAR(20) NOT NULL DEFAULT '#3498DB',
    active      TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Leads
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    lead_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(50),
    source          VARCHAR(100),
    status          ENUM('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST') NOT NULL DEFAULT 'NEW',
    funnel_stage_id INT NOT NULL DEFAULT 1,
    notes           TEXT,
    assigned_to     BIGINT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lead_stage FOREIGN KEY (funnel_stage_id) REFERENCES funnel_stages(stage_id),
    CONSTRAINT fk_lead_user  FOREIGN KEY (assigned_to)     REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_lead_stage (funnel_stage_id),
    INDEX idx_lead_status (status),
    INDEX idx_lead_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Fuentes de leads (tabla maestra)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_sources (
    source_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    active      TINYINT(1) NOT NULL DEFAULT 1,
    position    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Historial de movimientos de leads entre etapas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_stage_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id         BIGINT NOT NULL,
    from_stage_id   INT,
    to_stage_id     INT NOT NULL,
    changed_by      BIGINT,
    changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_lead       FOREIGN KEY (lead_id)       REFERENCES leads(lead_id)        ON DELETE CASCADE,
    CONSTRAINT fk_history_from_stage FOREIGN KEY (from_stage_id) REFERENCES funnel_stages(stage_id),
    CONSTRAINT fk_history_to_stage   FOREIGN KEY (to_stage_id)   REFERENCES funnel_stages(stage_id),
    CONSTRAINT fk_history_user       FOREIGN KEY (changed_by)    REFERENCES users(user_id)         ON DELETE SET NULL,
    INDEX idx_history_lead (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────
-- Actividades / Eventos por lead
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    event_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id      BIGINT NOT NULL,
    event_type   ENUM('CALL','EMAIL','MEETING','NOTE','TASK') NOT NULL DEFAULT 'NOTE',
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    event_date   DATETIME,
    status       ENUM('PENDING','DONE','CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_by   BIGINT,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_lead FOREIGN KEY (lead_id)    REFERENCES leads(lead_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_user FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_event_lead   (lead_id),
    INDEX idx_event_date   (event_date),
    INDEX idx_event_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
