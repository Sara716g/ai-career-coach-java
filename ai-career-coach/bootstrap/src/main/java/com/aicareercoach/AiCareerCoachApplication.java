package com.aicareercoach;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.aicareercoach")
@EntityScan(basePackages = "com.aicareercoach")
@EnableJpaRepositories(basePackages = "com.aicareercoach")
@EnableJpaAuditing
public class AiCareerCoachApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiCareerCoachApplication.class, args);
    }
}
