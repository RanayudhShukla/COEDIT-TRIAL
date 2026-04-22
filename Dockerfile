# Use Maven cache image for building
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Copy pom.xml and dependency list to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy full source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime Environment
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the generated JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose standard Spring Boot port
EXPOSE 8080

# Launch
ENTRYPOINT ["java", "-jar", "app.jar"]
