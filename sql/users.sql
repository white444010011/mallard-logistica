-- Seed users for Mallard Logistica
INSERT INTO users (id, name, email, password_hash, role, work_location, whatsapp, created_at)
VALUES 
('725d4bb2-f37a-42a2-ba56-0b515a79a206', 'Jose', 'cd@mallard.com', '$2a$12$1IsTO8VWoGy/viyy42D5leGQigBTttsqtmIzemf0uZiq.dVhqKWY.', 'CD', 'Centro de Distribuição', null, '2026-03-15 23:47:09.550625'),
('c22d890c-0f03-47df-a423-7a2027a388f1', 'Carlos Eduardo', 'carloseduardo@mallard.com', '$2a$12$1IsTO8VWoGy/viyy42D5leGQigBTttsqtmIzemf0uZiq.dVhqKWY.', 'USER', 'Casa de Degustação', null, '2026-03-16 00:09:18.355792')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  work_location = EXCLUDED.work_location;
