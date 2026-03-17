-- Seed users for Mallard Logistica
INSERT INTO users (id, name, email, password_hash, role, work_location, whatsapp, created_at)
VALUES 
('725d4bb2-f37a-42a2-ba56-0b515a79a206', 'Jose', 'cd@mallard.com', '$2b$10$V/Zr68U/gL96goCbjR6CtuMug0OEPCz03OsuTPN.QhD2slr24y8m2', 'CD', 'Centro de Distribuição', null, '2026-03-15 23:47:09.550625'),
('cf99d5b0-19df-405d-a50a-1ec23297a968', 'Jose', 'sainbot@mallard.com', '$2b$10$/b82k.vgMeFIsmEqb.7Dxe94f6YL6SYwO/W2JMBqBxaBRFyaTDiEC', 'ADMIN', 'Casa de Degustação', null, '2026-03-15 23:52:23.151767'),
('6c304e61-278f-484a-81b0-d2f3a02a8b01', 'Jose', 'caasantos@gmail', '$2b$10$JPPOAmdYymDWerlHjgVO8.UoIosD11ZltgHTRTYgRNUzWSHlsmh5y', 'USER', 'Casa de Degustação', null, '2026-03-16 00:03:56.621471'),
('43e1c1cb-53f0-4677-a7af-c2e70fdfcb0d', 'Carlos Eduardo', 'carlos@mallard.com', '$2b$10$vck4aWrMlSr6eQE0bIHgP.Ox6yZE.lYXESo3IVnm4nmI.8hPB1wVW', 'USER', 'Casa de Degustação', null, '2026-03-16 00:07:41.15827'),
('c22d890c-0f03-47df-a423-7a2027a388f1', 'Carlos Eduardo', 'carloseduardo@mallard.com', '$2b$10$z7DRkAWi.SXEJ11LOOanrORvpTOf/hseOceIdIwGX0DverHX3yxQa', 'USER', 'Casa de Degustação', null, '2026-03-16 00:09:18.355792')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  work_location = EXCLUDED.work_location;
