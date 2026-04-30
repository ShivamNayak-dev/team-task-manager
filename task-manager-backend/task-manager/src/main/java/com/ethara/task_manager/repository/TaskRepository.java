package com.ethara.task_manager.repository;

import com.ethara.task_manager.entity.Task;
import com.ethara.task_manager.entity.User;
import com.ethara.task_manager.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo(User user);
    List<Task> findByProject_Id(Long projectId);
    List<Task> findByAssignedToAndStatus(User user, TaskStatus status);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByStatus(TaskStatus status);
    long countByAssignedToAndStatus(User user, TaskStatus status);
}