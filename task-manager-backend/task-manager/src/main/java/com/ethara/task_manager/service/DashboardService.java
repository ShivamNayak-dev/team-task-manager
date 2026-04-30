package com.ethara.task_manager.service;

import com.ethara.task_manager.dto.DashboardResponse;
import com.ethara.task_manager.dto.ProjectResponse;
import com.ethara.task_manager.dto.TaskResponse;
import com.ethara.task_manager.entity.Task;
import com.ethara.task_manager.entity.User;
import com.ethara.task_manager.enums.TaskStatus;
import com.ethara.task_manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;
    private final TaskService taskService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public DashboardResponse getDashboard() {
        User currentUser = getCurrentUser();

        long totalProjects = projectMemberRepository.findByUser(currentUser).size();
        long totalTasks = taskRepository.findByAssignedTo(currentUser).size();
        long todoTasks = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.TODO);
        long inProgressTasks = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.COMPLETED);

        long overdueTasks = taskRepository.findByAssignedTo(currentUser).stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.COMPLETED)
                .count();

        List<TaskResponse> myRecentTasks = taskRepository.findByAssignedTo(currentUser)
                .stream()
                .limit(5)
                .map((Task t) -> taskService.mapToResponse(t))
                .collect(Collectors.toList());

        List<ProjectResponse> myProjects = projectMemberRepository.findByUser(currentUser)
                .stream()
                .map(m -> projectService.mapToResponse(m.getProject()))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .todoTasks(todoTasks)
                .inProgressTasks(inProgressTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .myRecentTasks(myRecentTasks)
                .myProjects(myProjects)
                .build();
    }
}