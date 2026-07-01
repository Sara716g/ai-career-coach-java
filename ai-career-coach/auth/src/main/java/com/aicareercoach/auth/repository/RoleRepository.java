package com.aicareercoach.auth.repository;

import com.aicareercoach.auth.entity.Role;
import com.aicareercoach.auth.entity.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType name);
}
