FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY ai-career-coach/ ai-career-coach/
RUN cd ai-career-coach && mvn clean install -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/ai-career-coach/bootstrap/target/bootstrap-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
