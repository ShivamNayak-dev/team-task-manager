package com.ethara.task_manager.service;

import com.ethara.task_manager.dto.*;
import com.ethara.task_manager.entity.*;
import com.ethara.task_manager.enums.Role;
import com.ethara.task_manager.enums.TaskStatus;
import com.ethara.task_manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = getCurrentUser();

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build();

        project = projectRepository.save(project);

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role(Role.ADMIN)
                .build();
        projectMemberRepository.save(member);

        return mapToResponse(project);
    }

    public List<ProjectResponse> getMyProjects() {
        User currentUser = getCurrentUser();
        List<ProjectMember> memberships = projectMemberRepository.findByUser(currentUser);
        return memberships.stream()
                .map(m -> mapToResponse(m.getProject()))
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return mapToResponse(project);
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User currentUser = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only project creator can update the project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return mapToResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User currentUser = getCurrentUser();
        if (!project.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only project creator can delete the project");
        }

        projectRepository.delete(project);
    }

    public String addMember(Long projectId, AddMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User userToAdd = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        if (projectMemberRepository.existsByProjectAndUser(project, userToAdd)) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(userToAdd)
                .role(request.getRole())
                .build();

        projectMemberRepository.save(member);
        return "Member added successfully";
    }

    public String removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, userToRemove)
                .orElseThrow(() -> new RuntimeException("User is not a member of this project"));

        projectMemberRepository.delete(member);
        return "Member removed successfully";
    }

    public ProjectResponse mapToResponse(Project project) {
        List<ProjectMember> members = projectMemberRepository.findByProject(project);

        long completed = project.getTasks() == null ? 0 :
                project.getTasks().stream()
                        .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                        .count();

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdByName(project.getCreatedBy().getName())
                .createdByEmail(project.getCreatedBy().getEmail())
                .createdAt(project.getCreatedAt())
                .totalTasks(project.getTasks() == null ? 0 : project.getTasks().size())
                .completedTasks((int) completed)
                .members(members.stream().map(m -> ProjectResponse.MemberInfo.builder()
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole().name())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}