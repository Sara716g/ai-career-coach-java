-- Milestone 1: migrate legacy ROLE_* values to USER / ADMIN
UPDATE roles SET name = 'USER' WHERE name = 'ROLE_USER';
UPDATE roles SET name = 'ADMIN' WHERE name = 'ROLE_ADMIN';

INSERT IGNORE INTO roles (name) VALUES ('USER'), ('ADMIN');
