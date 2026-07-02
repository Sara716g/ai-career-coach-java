-- H2 compatible schema for AI Career Coach

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(150) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    enabled    BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    title      VARCHAR(200) NOT NULL,
    summary    CLOB,
    file_url   VARCHAR(500),
    skills     CLOB,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resume_analyses (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id   BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    score       DECIMAL(5,2) NOT NULL,
    feedback    CLOB,
    strengths   CLOB,
    weaknesses  CLOB,
    target_role VARCHAR(200),
    ai_model    VARCHAR(100),
    analyzed_at TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_applications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    resume_id    BIGINT,
    company_name VARCHAR(200) NOT NULL,
    job_title    VARCHAR(200) NOT NULL,
    status       VARCHAR(30) NOT NULL,
    applied_date DATE,
    job_url      VARCHAR(500),
    notes        CLOB,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS interviews (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    job_application_id  BIGINT,
    title               VARCHAR(200) NOT NULL,
    type                VARCHAR(30) NOT NULL,
    status              VARCHAR(30) NOT NULL,
    scheduled_at        TIMESTAMP,
    duration_minutes    INT,
    questions           CLOB,
    feedback            CLOB,
    performance_score   DECIMAL(5,2),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE SET NULL
);

-- Seed default roles
INSERT INTO roles (name) SELECT 'USER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'USER');
INSERT INTO roles (name) SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');
