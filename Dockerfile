FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY ai-career-coach/ ai-career-coach/
RUN cd ai-career-coach && mvn clean install -DskipTests -U

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/ai-career-coach/bootstrap/target/bootstrap-*.jar app.jar
RUN echo "Built at $(date)" > /build-info.txt
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
