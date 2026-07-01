-- AI Career Coach — MySQL schema
-- Run manually or via migration tool before starting the application (ddl-auto: validate)

CREATE DATABASE IF NOT EXISTS ai_career_coach
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ai_career_coach;

-- ---------------------------------------------------------------------------
-- Auth module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT       NOT NULL AUTO_INCREMENT,
    name VARCHAR(50)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    email      VARCHAR(150) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    enabled    TINYINT(1)   NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Resume module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS resumes (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(200) NOT NULL,
    summary    TEXT,
    file_url   VARCHAR(500),
    skills     TEXT,
    is_primary TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_resumes_user_id (user_id),
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Analysis module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS resume_analyses (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    resume_id   BIGINT        NOT NULL,
    user_id     BIGINT        NOT NULL,
    score       DECIMAL(5, 2) NOT NULL,
    feedback    TEXT,
    strengths   TEXT,
    weaknesses  TEXT,
    target_role VARCHAR(200),
    ai_model    VARCHAR(100),
    analyzed_at TIMESTAMP(6)  NOT NULL,
    created_at  TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_analyses_user_id (user_id),
    KEY idx_analyses_resume_id (resume_id),
    CONSTRAINT fk_analyses_resume FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE,
    CONSTRAINT fk_analyses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Application module (job applications)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS job_applications (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      BIGINT       NOT NULL,
    resume_id    BIGINT,
    company_name VARCHAR(200) NOT NULL,
    job_title    VARCHAR(200) NOT NULL,
    status       VARCHAR(30)  NOT NULL,
    applied_date DATE,
    job_url      VARCHAR(500),
    notes        TEXT,
    created_at   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_job_applications_user_id (user_id),
    KEY idx_job_applications_status (status),
    CONSTRAINT fk_job_applications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_job_applications_resume FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Interview module
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS interviews (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    user_id             BIGINT        NOT NULL,
    job_application_id  BIGINT,
    title               VARCHAR(200)  NOT NULL,
    type                VARCHAR(30)   NOT NULL,
    status              VARCHAR(30)   NOT NULL,
    scheduled_at        TIMESTAMP(6),
    duration_minutes    INT,
    questions           TEXT,
    feedback            TEXT,
    performance_score   DECIMAL(5, 2),
    created_at          TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_interviews_user_id (user_id),
    KEY idx_interviews_status (status),
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_interviews_job_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default roles
INSERT IGNORE INTO roles (name) VALUES ('USER'), ('ADMIN');
