package com.aicareercoach.auth.config;

import com.aicareercoach.auth.entity.Role;
import com.aicareercoach.auth.entity.RoleType;
import com.aicareercoach.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;

    @Bean
    CommandLineRunner seedRoles() {
        return args -> {
            for (RoleType roleType : RoleType.values()) {
                roleRepository.findByName(roleType).orElseGet(() -> {
                    Role role = Role.builder().name(roleType).build();
                    log.info("Seeding role: {}", roleType);
                    return roleRepository.save(role);
                });
            }
        };
    }
}
