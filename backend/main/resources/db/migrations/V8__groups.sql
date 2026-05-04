-- Enable pgcrypto for BCrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Seed users ────────────────────────────────────────────────────────────
INSERT INTO users (first_name, last_name, username, email, password, role, created_at)
VALUES
    ('Kliment',    'Stavreski', 'kliment.stavreski',
     'kliment.stavreski@students.finki.ukim.mk',
     crypt('kliment123',    gen_salt('bf', 10)), 'ROLE_ADMIN', now()),

    ('Aleksandar', 'Koloski',  'aleksandar.koloski',
     'aleksandar.koloski@students.finki.ukim.mk',
     crypt('aleksandar123', gen_salt('bf', 10)), 'ROLE_ADMIN', now()),

    ('Ana',        'Markoska', 'ana.markoska',
     'ana.markoska@students.finki.ukim.mk',
     crypt('ana123',        gen_salt('bf', 10)), 'ROLE_ADMIN', now()),

    ('Kliment',    'Stavreski', 'kliment_user',
     'kliment.user@students.finki.ukim.mk',
     crypt('kliment123',    gen_salt('bf', 10)), 'ROLE_USER',  now()),

    ('Aleksandar', 'Koloski',  'aleksandar_user',
     'aleksandar.user@students.finki.ukim.mk',
     crypt('aleksandar123', gen_salt('bf', 10)), 'ROLE_USER',  now()),

    ('Ana',        'Markoska', 'ana_user',
     'ana.user@students.finki.ukim.mk',
     crypt('ana123',        gen_salt('bf', 10)), 'ROLE_USER',  now())
ON CONFLICT (username) DO NOTHING;

-- ── Groups tables ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS huddle_group (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_contact (
    group_id   BIGINT NOT NULL REFERENCES huddle_group(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES contact(id)      ON DELETE CASCADE,
    PRIMARY KEY (group_id, contact_id)
);

-- ── Team member contacts ──────────────────────────────────────────────────
INSERT INTO contact (first_name, last_name, email, phone, status, created_at) VALUES
    ('Kliment',    'Stavreski', 'kliment.stavreski@finki.ukim.mk',    NULL, 'ONLINE',  now()),
    ('Aleksandar', 'Koloski',   'aleksandar.koloski@finki.ukim.mk',   NULL, 'ONLINE',  now()),
    ('Ana',        'Markoska',  'ana.markoska@finki.ukim.mk',         NULL, 'ONLINE',  now()),
    ('Kliment',    'Stavreski', 'kliment.user@finki.ukim.mk',         NULL, 'OFFLINE', now()),
    ('Aleksandar', 'Koloski',   'aleksandar.user@finki.ukim.mk',      NULL, 'OFFLINE', now()),
    ('Ana',        'Markoska',  'ana.user@finki.ukim.mk',             NULL, 'OFFLINE', now());

-- ── Two seed groups ───────────────────────────────────────────────────────
INSERT INTO huddle_group (name, created_by, created_at) VALUES
    ('Dev Team',    'admin', now()),
    ('Study Group', 'admin', now());

-- All 6 team contacts in both groups
INSERT INTO group_contact (group_id, contact_id)
SELECT g.id, c.id
FROM huddle_group g
CROSS JOIN contact c
WHERE g.name IN ('Dev Team', 'Study Group')
  AND c.email IN (
      'kliment.stavreski@finki.ukim.mk',
      'aleksandar.koloski@finki.ukim.mk',
      'ana.markoska@finki.ukim.mk',
      'kliment.user@finki.ukim.mk',
      'aleksandar.user@finki.ukim.mk',
      'ana.user@finki.ukim.mk'
  );
