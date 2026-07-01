# AI Career Coach

Production-ready **modular monolith** built with Java 25, Spring Boot 3, Maven, MySQL, JWT, and OpenAPI.

## Architecture

```
ai-career-coach/
├── common/          # Shared DTOs, exceptions, JWT utilities
├── auth/            # Registration, login, JWT authentication
├── resume/          # Resume CRUD
├── analysis/        # AI resume analysis
├── application/     # Job application tracking
├── interview/       # Interview prep & mock sessions
├── bootstrap/       # Main Spring Boot application
└── database/        # MySQL schema
```

Each domain module follows layered architecture:

`controller → service → repository → entity` with validated DTOs.

## Prerequisites

- Java 25+
- Maven 3.9+
- MySQL 8.x

## Setup

1. Create the database:

```bash
mysql -u root -p < database/schema.sql
```

2. Configure environment (optional — defaults work for local dev):

| Variable      | Default                    |
| ------------- | -------------------------- |
| `DB_HOST`     | `localhost`                |
| `DB_PORT`     | `3306`                     |
| `DB_NAME`     | `ai_career_coach`          |
| `DB_USERNAME` | `root`                     |
| `DB_PASSWORD` | `root`                     |
| `JWT_SECRET`  | Base64-encoded 256-bit key |
| `SERVER_PORT` | `8080`                     |

3. Build and run:

```bash
cd ai-career-coach
mvn clean install
mvn -pl bootstrap spring-boot:run
```

## API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## JWT Authentication Flow

1. `POST /api/v1/auth/register` — create account, receive JWT
2. `POST /api/v1/auth/login` — authenticate, receive JWT
3. Include header on protected routes: `Authorization: Bearer <token>`
4. `GET /api/v1/auth/me` — current user profile

## REST Endpoints

| Module       | Base Path              |
| ------------ | ---------------------- |
| Auth         | `/api/v1/auth`         |
| Resumes      | `/api/v1/resumes`      |
| Analysis     | `/api/v1/analyses`     |
| Applications | `/api/v1/applications` |
| Interviews   | `/api/v1/interviews`   |

## License

Apache 2.0
