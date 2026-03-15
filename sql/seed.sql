-- This is a raw SQL script for initial seeding if not using Drizzle seed.
-- Ensure the tables have been generated and pushed by Drizzle first.

-- Insert Super Admin (password is placeholder, bcrypt hash for '123456' for testing)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@mallard.com', '$2a$12$R9h/cIPz0gi.URNNX3rubedAKEQC2a.lK36oNl96k./U/o.E4H.O6', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert the bot user, as per requirements
INSERT INTO users (name, email, password_hash, role)
VALUES ('Saintbot', 'saintbot@mallard.com', '$2a$12$R9h/cIPz0gi.URNNX3rubedAKEQC2a.lK36oNl96k./U/o.E4H.O6', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert CD User
INSERT INTO users (name, email, password_hash, role)
VALUES ('Equipe CD', 'cd@mallard.com', '$2a$12$R9h/cIPz0gi.URNNX3rubedAKEQC2a.lK36oNl96k./U/o.E4H.O6', 'CD')
ON CONFLICT (email) DO NOTHING;

-- Insert regular user
INSERT INTO users (name, email, password_hash, role)
VALUES ('Usuario Loja', 'loja@mallard.com', '$2a$12$R9h/cIPz0gi.URNNX3rubedAKEQC2a.lK36oNl96k./U/o.E4H.O6', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Insert initial products (inventory managed in DB)
INSERT INTO products (name, description, available_stock, image_url)
VALUES 
    ('Caixa Papelão P', 'Caixa pequena para envios menores.', 500, null),
    ('Caixa Papelão M', 'Caixa média, padrão.', 300, null),
    ('Fita Adesiva Logística', 'Rolo de 50m.', 150, null),
    ('Plástico Bolha', 'Rolo de 100m.', 50, null);
