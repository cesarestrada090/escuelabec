-- ════════════════════════════════════════════════════════════════
-- Migración: distribuir leads en los últimos 6 meses con datos
-- realistas para dashboards y reportes
-- ════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- ── 1. Agregar vendedores de prueba ──────────────────────────────
INSERT INTO users (email, password, first_name, last_name, role, active) VALUES
('carlos.vega@escuelabec.com',   '$2a$10$DPXJA71FeAqPZNWFGnNq0e9jl2qi5HpfzEmblS7OF/E4/wBLZUAQm', 'Carlos',   'Vega',     'SALES', 1),
('lucia.torres@escuelabec.com',  '$2a$10$DPXJA71FeAqPZNWFGnNq0e9jl2qi5HpfzEmblS7OF/E4/wBLZUAQm', 'Lucia',    'Torres',   'SALES', 1),
('marco.silva@escuelabec.com',   '$2a$10$DPXJA71FeAqPZNWFGnNq0e9jl2qi5HpfzEmblS7OF/E4/wBLZUAQm', 'Marco',    'Silva',    'SALES', 1),
('ana.flores@escuelabec.com',    '$2a$10$DPXJA71FeAqPZNWFGnNq0e9jl2qi5HpfzEmblS7OF/E4/wBLZUAQm', 'Ana',      'Flores',   'SALES', 1)
ON DUPLICATE KEY UPDATE email=email;

-- ── 2. Distribuir created_at / updated_at en Ene–Jun 2026 ───────
-- Lote Jan (leads 1–30): ~30 leads
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*43200),  '2026-01-02 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*72),     created_at)
WHERE lead_id BETWEEN 1 AND 30;

-- Lote Feb (leads 31–65): ~35 leads
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*40320),  '2026-02-01 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*72),     created_at)
WHERE lead_id BETWEEN 31 AND 65;

-- Lote Mar (leads 66–110): ~45 leads
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*44640),  '2026-03-01 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*72),     created_at)
WHERE lead_id BETWEEN 66 AND 110;

-- Lote Apr (leads 111–155): ~45 leads
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*43200),  '2026-04-01 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*72),     created_at)
WHERE lead_id BETWEEN 111 AND 155;

-- Lote May (leads 156–200): ~45 leads
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*44640),  '2026-05-01 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*72),     created_at)
WHERE lead_id BETWEEN 156 AND 200;

-- Lote Jun (leads 201–241): ~35 leads — mes actual
UPDATE leads SET
  created_at = TIMESTAMPADD(MINUTE, FLOOR(RAND(lead_id*7+1)*720),    '2026-06-01 08:00:00'),
  updated_at = TIMESTAMPADD(HOUR,   FLOOR(RAND(lead_id*3+2)*12),     created_at)
WHERE lead_id BETWEEN 201 AND 241;

-- ── 3. Variar status según etapa del funnel ──────────────────────
UPDATE leads SET status = 'NEW'       WHERE funnel_stage_id IN (1,2);
UPDATE leads SET status = 'CONTACTED' WHERE funnel_stage_id = 3;
UPDATE leads SET status = 'QUALIFIED' WHERE funnel_stage_id = 4;
UPDATE leads SET status = 'CONVERTED' WHERE funnel_stage_id = 5;
UPDATE leads SET status = 'CONVERTED' WHERE funnel_stage_id = 6;
-- Algunos perdidos en etapas tempranas (usando lead_id par/impar para variedad)
UPDATE leads SET status = 'LOST' WHERE funnel_stage_id IN (1,2,3) AND MOD(lead_id, 11) = 0;

-- ── 4. Asignar vendedores rotativamente ─────────────────────────
-- Obtener IDs dinámicamente con subconsulta
UPDATE leads l
JOIN (
  SELECT user_id, ROW_NUMBER() OVER (ORDER BY user_id) as rn FROM users WHERE role='SALES' AND active=1
) v ON v.rn = (MOD(l.lead_id, (SELECT COUNT(*) FROM users WHERE role='SALES' AND active=1)) + 1)
SET l.assigned_to = v.user_id
WHERE l.lead_id IS NOT NULL;

-- ── 5. Seed lead_stage_history ───────────────────────────────────
-- Entrada inicial para todos los leads (creación en etapa actual o etapas previas)
-- Primero limpiar history existente (solo test data)
DELETE FROM lead_stage_history WHERE id > 0;

-- Entrada de creación: todos los leads entran en etapa 1
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, NULL, 1, assigned_to,
       TIMESTAMPADD(MINUTE, 5, created_at)
FROM leads;

-- Leads en etapa 2+: movimiento de 1 → 2
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, 1, 2, assigned_to,
       TIMESTAMPADD(DAY, 1 + FLOOR(RAND(lead_id)*3), created_at)
FROM leads WHERE funnel_stage_id >= 2;

-- Leads en etapa 3+: movimiento de 2 → 3
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, 2, 3, assigned_to,
       TIMESTAMPADD(DAY, 4 + FLOOR(RAND(lead_id)*4), created_at)
FROM leads WHERE funnel_stage_id >= 3;

-- Leads en etapa 4+: movimiento de 3 → 4
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, 3, 4, assigned_to,
       TIMESTAMPADD(DAY, 8 + FLOOR(RAND(lead_id)*5), created_at)
FROM leads WHERE funnel_stage_id >= 4;

-- Leads en etapa 5+: movimiento de 4 → 5
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, 4, 5, assigned_to,
       TIMESTAMPADD(DAY, 13 + FLOOR(RAND(lead_id)*7), created_at)
FROM leads WHERE funnel_stage_id >= 5;

-- Leads en etapa 6: movimiento de 5 → 6
INSERT INTO lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by, changed_at)
SELECT lead_id, 5, 6, assigned_to,
       TIMESTAMPADD(DAY, 20 + FLOOR(RAND(lead_id)*7), created_at)
FROM leads WHERE funnel_stage_id = 6;
