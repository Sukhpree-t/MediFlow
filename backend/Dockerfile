# ============================================================
# MediFlow Backend — Multi-stage Dockerfile
# Stage 1: Build the JAR with Maven + Java 21
# Stage 2: Minimal runtime image
# ============================================================

# --- Build Stage ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the application (skip tests — Render runs in CI mode)
COPY src ./src
RUN mvn package -DskipTests -q

# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root user for security
RUN addgroup --system mediflow && adduser --system --ingroup mediflow mediflow
USER mediflow

# Copy the fat JAR from build stage
COPY --from=build /app/target/mediflow-backend-*.jar app.jar

# Expose Spring Boot default port
EXPOSE 8080

# Health check for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
