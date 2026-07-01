# Multi-stage build for Java backend
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY ai-career-coach/pom.xml ai-career-coach/pom.xml
COPY ai-career-coach/common/pom.xml ai-career-coach/common/
COPY ai-career-coach/auth/pom.xml ai-career-coach/auth/
COPY ai-career-coach/resume/pom.xml ai-career-coach/resume/
COPY ai-career-coach/analysis/pom.xml ai-career-coach/analysis/
COPY ai-career-coach/application/pom.xml ai-career-coach/application/
COPY ai-career-coach/interview/pom.xml ai-career-coach/interview/
COPY ai-career-coach/bootstrap/pom.xml ai-career-coach/bootstrap/
RUN cd ai-career-coach && mvn dependency:go-offline -B
COPY ai-career-coach/ ai-career-coach/
RUN cd ai-career-coach && mvn clean install -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/ai-career-coach/bootstrap/target/bootstrap-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
