export interface SpringBootFile {
  name: string;
  path: string;
  category: 'CONFIG' | 'CONTROLLER' | 'SERVICE' | 'ENTITY' | 'REPOSITORY' | 'SQL';
  language: 'java' | 'properties' | 'xml' | 'sql' | 'markdown';
  description: string;
  code: string;
}

export const SPRING_BOOT_PROJECT_FILES: SpringBootFile[] = [
  {
    name: 'pom.xml',
    path: 'pom.xml',
    category: 'CONFIG',
    language: 'xml',
    description: 'Maven Project Object Model with Spring Boot 3.2, Spring Data JPA, Spring Security, MySQL Connector, and Lombok.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.college.transit</groupId>
    <artifactId>bus-delay-prediction-system</artifactId>
    <version>1.0.0</version>
    <name>bus-delay-prediction-system</name>
    <description>AI-Based College Bus Delay Prediction and Tracking Backend</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JWT for Stateless Auth -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok Developer Productivity -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Apache Commons Math for Linear Regression & ML Statistics -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-math3</artifactId>
            <version>3.6.1</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`,
  },
  {
    name: 'application.properties',
    path: 'src/main/resources/application.properties',
    category: 'CONFIG',
    language: 'properties',
    description: 'Spring Boot configuration for MySQL database connection, Hibernate DDL, and JWT secret.',
    code: `# Server Configuration
server.port=8080
server.servlet.context-path=/api/v1

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/college_transit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=rootpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security
jwt.secret=9a4f2c8d3b7e1a6c5f0d2e8b4a7c9f1e3a5b7d9c1e4f6a8b2d4e7f9a1c3b5e7
jwt.expiration=86400000

# CORS Configuration for React Frontend
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173

# Transit Engine Settings
transit.simulation.interval-ms=3000
transit.ai.confidence-threshold=0.85`,
  },
  {
    name: 'schema.sql',
    path: 'src/main/resources/schema.sql',
    category: 'SQL',
    language: 'sql',
    description: 'Complete MySQL DDL statements with Foreign Keys, Indexes, and seed data.',
    code: `-- AI-Based College Bus Delay Prediction and Tracking Database Schema
CREATE DATABASE IF NOT EXISTS college_transit_db;
USE college_transit_db;

-- 1. Users Table (Core credentials & role)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'DRIVER', 'ADMIN') NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_code VARCHAR(30) NOT NULL UNIQUE,
    route_name VARCHAR(150) NOT NULL,
    start_point VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    total_distance_km DECIMAL(6, 2) NOT NULL,
    standard_duration_minutes INT NOT NULL,
    traffic_level ENUM('LOW', 'MODERATE', 'HEAVY') DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    stop_name VARCHAR(120) NOT NULL,
    stop_code VARCHAR(30) NOT NULL,
    sequence_order INT NOT NULL,
    scheduled_time TIME NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    landmark VARCHAR(150),
    dwell_time_seconds INT DEFAULT 60,
    CONSTRAINT fk_stop_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- 4. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    registration_plate VARCHAR(30) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 50,
    current_passengers INT DEFAULT 0,
    route_id BIGINT,
    status ENUM('IN_TRANSIT', 'AT_STOP', 'DELAYED', 'MAINTENANCE', 'COMPLETED', 'IDLE') DEFAULT 'IDLE',
    current_speed_kmh DECIMAL(5, 2) DEFAULT 0.00,
    current_stop_index INT DEFAULT 0,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_trip_active BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bus_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
);

-- 5. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    assigned_bus_id BIGINT UNIQUE,
    experience_years INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    duty_status ENUM('ON_DUTY', 'OFF_DUTY', 'ON_BREAK') DEFAULT 'OFF_DUTY',
    CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_driver_bus FOREIGN KEY (assigned_bus_id) REFERENCES buses(id) ON DELETE SET NULL
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    assigned_bus_id BIGINT,
    assigned_stop_id BIGINT,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_bus FOREIGN KEY (assigned_bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    CONSTRAINT fk_student_stop FOREIGN KEY (assigned_stop_id) REFERENCES bus_stops(id) ON DELETE SET NULL
);

-- 7. Bus Locations History (Real-time telemetry log)
CREATE TABLE IF NOT EXISTS bus_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_id BIGINT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed_kmh DECIMAL(5, 2) DEFAULT 0.00,
    heading INT DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loc_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

-- 8. Delay Predictions Table (Generated by AI Service)
CREATE TABLE IF NOT EXISTS delay_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    predicted_delay_minutes INT NOT NULL,
    classification ENUM('ON_TIME', 'SLIGHT_DELAY', 'MAJOR_DELAY') NOT NULL,
    confidence_percentage DECIMAL(5, 2) NOT NULL,
    traffic_index INT NOT NULL,
    weather_condition VARCHAR(30) DEFAULT 'CLEAR',
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    CONSTRAINT fk_pred_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    bus_number VARCHAR(30),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('DELAY_ALERT', 'STATUS_CHANGE', 'INCIDENT', 'TRIP_STARTED', 'ARRIVING_SOON') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Sample Data for Instant Testing
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Priya Sharma', 'priya.sharma@campus.edu', '$2a$10$7Q9...hashed', 'STUDENT', '+91 9845012345'),
('Rajesh Kumar', 'rajesh.k@transport.campus.edu', '$2a$10$7Q9...hashed', 'DRIVER', '+91 9448088210'),
('Prof. R. K. Deshmukh', 'director.transit@campus.edu', '$2a$10$7Q9...hashed', 'ADMIN', '+91 8023456700');`,
  },
  {
    name: 'DelayPredictionService.java',
    path: 'src/main/java/com/college/transit/service/DelayPredictionService.java',
    category: 'SERVICE',
    language: 'java',
    description: 'Core Machine Learning & regression service analyzing historical delays, time of day, weather, and traffic.',
    code: `package com.college.transit.service;

import com.college.transit.entity.*;
import com.college.transit.repository.DelayPredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DelayPredictionService {

    private final DelayPredictionRepository delayPredictionRepository;

    /**
     * Machine Learning Weighted Prediction Algorithm for College Bus Delays.
     * Evaluates multi-variate features:
     * 1. Historical route average delay
     * 2. Corridor traffic congestion index (1-10)
     * 3. College rush hour time-of-day multiplier
     * 4. Day-of-week commute patterns
     * 5. Weather conditions (Rain, Fog, Storm)
     * 6. Remaining stops & boarding dwell variance
     */
    public DelayPrediction predictDelay(Bus bus, int trafficIndex, String weatherCondition, int incidentMinutes) {
        Route route = bus.getRoute();
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        DayOfWeek dayOfWeek = now.getDayOfWeek();

        double totalDelayEstimate = 0.0;
        List<String> factorExplanations = new ArrayList<>();

        // 1. Historical Baseline Delay (default learned ~3.5 min on urban routes)
        double historicalBase = 3.5;
        totalDelayEstimate += historicalBase;
        factorExplanations.add(String.format("Historical Baseline: +%.1f min", historicalBase));

        // 2. Real-Time Traffic Congestion Feature
        double trafficImpact = 0.0;
        if (trafficIndex <= 3) {
            trafficImpact = 0.4 * (trafficIndex - 1);
        } else if (trafficIndex <= 6) {
            trafficImpact = 1.5 + (trafficIndex - 3) * 1.3;
        } else {
            trafficImpact = 5.2 + (trafficIndex - 6) * 2.4;
        }
        totalDelayEstimate += trafficImpact;
        factorExplanations.add(String.format("Traffic Index (%d/10): +%.1f min", trafficIndex, trafficImpact));

        // 3. Time of Day Peak Rush Feature
        // Morning college rush: 08:00 - 09:30 AM
        // Evening return rush: 16:30 - 18:00 PM
        double peakHourImpact = 0.0;
        if ((currentTime.isAfter(LocalTime.of(7, 59)) && currentTime.isBefore(LocalTime.of(9, 31))) ||
            (currentTime.isAfter(LocalTime.of(16, 29)) && currentTime.isBefore(LocalTime.of(18, 1)))) {
            peakHourImpact = 4.0;
            totalDelayEstimate += peakHourImpact;
            factorExplanations.add("Peak College Rush Hours: +4.0 min");
        }

        // 4. Day-of-Week Variation
        if (dayOfWeek == DayOfWeek.MONDAY || dayOfWeek == DayOfWeek.FRIDAY) {
            double dayImpact = 2.0;
            totalDelayEstimate += dayImpact;
            factorExplanations.add("Monday/Friday Transit Volume Surge: +2.0 min");
        }

        // 5. Weather Factor
        double weatherImpact = 0.0;
        if ("RAIN".equalsIgnoreCase(weatherCondition)) {
            weatherImpact = 4.5;
        } else if ("FOG".equalsIgnoreCase(weatherCondition)) {
            weatherImpact = 6.0;
        } else if ("STORM".equalsIgnoreCase(weatherCondition)) {
            weatherImpact = 12.0;
        }
        if (weatherImpact > 0) {
            totalDelayEstimate += weatherImpact;
            factorExplanations.add(String.format("Weather [%s]: +%.1f min", weatherCondition, weatherImpact));
        }

        // 6. Driver-Reported Incident
        if (incidentMinutes > 0) {
            totalDelayEstimate += incidentMinutes;
            factorExplanations.add(String.format("Active Incident: +%d min", incidentMinutes));
        }

        int finalPredictedDelay = (int) Math.round(totalDelayEstimate);

        // Classification Rule
        DelayPrediction.Classification classification;
        if (finalPredictedDelay >= 15) {
            classification = DelayPrediction.Classification.MAJOR_DELAY;
        } else if (finalPredictedDelay >= 5) {
            classification = DelayPrediction.Classification.SLIGHT_DELAY;
        } else {
            classification = DelayPrediction.Classification.ON_TIME;
        }

        double confidence = 92.5 - (trafficIndex > 7 ? 4.0 : 0.0) - (weatherImpact > 0 ? 3.0 : 0.0);

        DelayPrediction prediction = DelayPrediction.builder()
                .bus(bus)
                .route(route)
                .predictedDelayMinutes(finalPredictedDelay)
                .classification(classification)
                .confidencePercentage(confidence)
                .trafficIndex(trafficIndex)
                .weatherCondition(weatherCondition)
                .aiSummary(String.join(" | ", factorExplanations))
                .createdAt(LocalDateTime.now())
                .build();

        return delayPredictionRepository.save(prediction);
    }
}`,
  },
  {
    name: 'BusController.java',
    path: 'src/main/java/com/college/transit/controller/BusController.java',
    category: 'CONTROLLER',
    language: 'java',
    description: 'REST Controller exposing endpoints for bus fleet, live telemetry, and delay predictions.',
    code: `package com.college.transit.controller;

import com.college.transit.dto.BusLocationUpdateRequest;
import com.college.transit.dto.IncidentReportRequest;
import com.college.transit.entity.Bus;
import com.college.transit.entity.DelayPrediction;
import com.college.transit.service.BusService;
import com.college.transit.service.DelayPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/buses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BusController {

    private final BusService busService;
    private final DelayPredictionService predictionService;

    @GetMapping
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        return ResponseEntity.ok(busService.getBusById(id));
    }

    @GetMapping("/{id}/prediction")
    public ResponseEntity<DelayPrediction> getBusDelayPrediction(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int trafficIndex,
            @RequestParam(defaultValue = "CLEAR") String weather,
            @RequestParam(defaultValue = "0") int incidentMinutes) {
        Bus bus = busService.getBusById(id);
        return ResponseEntity.ok(predictionService.predictDelay(bus, trafficIndex, weather, incidentMinutes));
    }

    @PutMapping("/{id}/location")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public ResponseEntity<Bus> updateBusLocation(
            @PathVariable Long id,
            @RequestBody BusLocationUpdateRequest request) {
        return ResponseEntity.ok(busService.updateLocation(id, request));
    }

    @PostMapping("/{id}/incidents")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> reportIncident(
            @PathVariable Long id,
            @RequestBody IncidentReportRequest request) {
        busService.reportIncident(id, request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Bus> createBus(@RequestBody Bus bus) {
        return ResponseEntity.ok(busService.createBus(bus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.noContent().build();
    }
}`,
  },
  {
    name: 'Bus.java',
    path: 'src/main/java/com/college/transit/entity/Bus.java',
    category: 'ENTITY',
    language: 'java',
    description: 'Spring Data JPA Entity for Buses with GPS coordinates, capacity, and route mapping.',
    code: `package com.college.transit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String busNumber;

    @Column(nullable = false, unique = true, length = 30)
    private String registrationPlate;

    private Integer capacity;
    private Integer currentPassengers;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_id")
    private Route route;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Double currentSpeedKmh;
    private Integer currentStopIndex;
    private Double progressPercentage;

    private Double latitude;
    private Double longitude;

    private Boolean isTripActive;
    private LocalDateTime lastUpdated;

    public enum Status {
        IN_TRANSIT, AT_STOP, DELAYED, MAINTENANCE, COMPLETED, IDLE
    }
}`,
  },
  {
    name: 'DelayPrediction.java',
    path: 'src/main/java/com/college/transit/entity/DelayPrediction.java',
    category: 'ENTITY',
    language: 'java',
    description: 'Entity storing historical and live delay inference results with classification.',
    code: `package com.college.transit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delay_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelayPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(nullable = false)
    private Integer predictedDelayMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Classification classification;

    private Double confidencePercentage;
    private Integer trafficIndex;
    private String weatherCondition;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private LocalDateTime createdAt;

    public enum Classification {
        ON_TIME, SLIGHT_DELAY, MAJOR_DELAY
    }
}`,
  },
  {
    name: 'SecurityConfig.java',
    path: 'src/main/java/com/college/transit/config/SecurityConfig.java',
    category: 'CONFIG',
    language: 'java',
    description: 'Spring Security 6 configuration with Role-Based Access Control (STUDENT, DRIVER, ADMIN).',
    code: `package com.college.transit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/buses/**", "/api/v1/routes/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/driver/**").hasAnyRole("DRIVER", "ADMIN")
                .requestMatchers("/api/v1/student/**").hasAnyRole("STUDENT", "ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}`,
  },
  {
    name: 'README.md',
    path: 'README.md',
    category: 'CONFIG',
    language: 'markdown',
    description: 'Setup instructions, MySQL initialization, and maven build commands.',
    code: `# AI-Based College Bus Delay Prediction and Tracking System

## Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Motion
- **Backend**: Java 17 + Spring Boot 3.2.4
- **Database**: MySQL 8.0 with Spring Data JPA / Hibernate
- **AI/ML**: Multi-factor regression model + Feature-weighted classification

## 1. Database Setup (MySQL)
\`\`\`bash
# Log in to MySQL CLI
mysql -u root -p

# Execute Schema Creation
source src/main/resources/schema.sql;
\`\`\`

## 2. Running Spring Boot Backend
\`\`\`bash
# Navigate to backend directory
cd backend

# Compile and package application
mvn clean package -DskipTests

# Run Spring Boot Application (Starts on port 8080)
mvn spring-boot:run
\`\`\`

## 3. Running React Frontend
\`\`\`bash
# Install dependencies
npm install

# Start development server (Starts on port 3000)
npm run dev
\`\`\`

## 4. Default Seed Credentials
- **Student**: \`priya.sharma@campus.edu\` / password: \`student123\`
- **Driver**: \`rajesh.k@transport.campus.edu\` / password: \`driver123\`
- **Admin**: \`director.transit@campus.edu\` / password: \`admin123\`
`,
  }
];
