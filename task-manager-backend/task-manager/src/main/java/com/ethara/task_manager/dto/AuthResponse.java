package com.ethara.task_manager.dto;

import com.ethara.task_manager.enums.Role;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private Long userId;
}