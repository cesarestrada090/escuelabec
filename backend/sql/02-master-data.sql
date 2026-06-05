-- ════════════════════════════════════════════════════════════════
-- CRM Escuela BEC - Master Data
-- ════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ────────────────────────────────────────────────────────────────
-- Etapas del funnel (exactamente las 6 del diagrama)
-- ────────────────────────────────────────────────────────────────
INSERT INTO funnel_stages (stage_id, name, description, position, color, active) VALUES
(1, 'Atracción',             'Generar visibilidad y atraer tráfico calificado',         1, '#9B59B6', 1),
(2, 'Captura de Leads',      'Convertir visitantes en contactos',                        2, '#3498DB', 1),
(3, 'Nutrición',             'Educar, informar y generar confianza',                     3, '#1ABC9C', 1),
(4, 'Interés / Consideración','Incrementar el interés y resolver objeciones',            4, '#F39C12', 1),
(5, 'Conversión',            'Lograr la inscripción o compra del curso',                 5, '#E74C3C', 1),
(6, 'Preparado para CRM',    'Lead calificado listo para gestión en CRM',                6, '#27AE60', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ────────────────────────────────────────────────────────────────
-- Usuario superadmin
-- password: Admin123* => BCrypt hash
-- ────────────────────────────────────────────────────────────────
INSERT INTO users (email, password, first_name, last_name, role, active) VALUES
('admin@escuelabec.com',
 '$2a$10$DPXJA71FeAqPZNWFGnNq0e9jl2qi5HpfzEmblS7OF/E4/wBLZUAQm',
 'Admin', 'BEC', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE email=email;

-- ────────────────────────────────────────────────────────────────
-- Fuentes de leads (catálogo inicial)
-- ────────────────────────────────────────────────────────────────
INSERT INTO lead_sources (name, active, position) VALUES
('Web',          1,  1),
('Facebook',     1,  2),
('Instagram',    1,  3),
('TikTok',       1,  4),
('Google Ads',   1,  5),
('WhatsApp',     1,  6),
('Referido',     1,  7),
('Landing Page', 1,  8),
('Email',        1,  9),
('YouTube',      1, 10),
('Organic',      1, 11),
('Otro',         1, 12)
ON DUPLICATE KEY UPDATE name=VALUES(name);
