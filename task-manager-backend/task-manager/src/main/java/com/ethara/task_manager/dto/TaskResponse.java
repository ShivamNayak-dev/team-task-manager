package com.ethara.task_manager.dto;

import com.ethara.task_manager.enums.TaskPriority;
import com.ethara.task_manager.enums.TaskStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private boolean overdue;
    private Long projectId;
    private String projectName;
    private String assignedToName;
    private String assignedToEmail;
    private String createdByName;
    private LocalDateTime createdAt;
}