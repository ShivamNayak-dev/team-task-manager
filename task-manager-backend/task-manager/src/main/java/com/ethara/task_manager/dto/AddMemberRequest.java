package com.ethara.task_manager.dto;

import com.ethara.task_manager.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddMemberRequest {

    @NotBlank
    @Email
    private String email;

    private Role role = Role.MEMBER;
}