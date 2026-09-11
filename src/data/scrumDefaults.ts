import { ScrumBoardData, ScrumTask, TodoItem } from "../types";

const now = Date.now();
const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();

export const DEFAULT_SCRUM_DATA: ScrumBoardData = {
  version: 1,
  activeSprintId: "sprint-01",
  nextTaskNumber: 107,
  settings: {
    notificationsEnabled: true,
    etaReminders: true,
    overdueReminders: true,
    sprintReminders: true,
    reminderMinutes: 30,
    defaultPriority: "medium",
    defaultSort: "manual",
    incompleteSprintAction: "backlog",
  },
  sprints: [
    {
      id: "sprint-01",
      name: "Sprint 01",
      goal: "Build a focused personal productivity workflow",
      startDate: iso(-2 * 86400000).slice(0, 10),
      endDate: iso(5 * 86400000).slice(0, 10),
      status: "active",
      createdAt: iso(-3 * 86400000),
    },
  ],
  tasks: [
    {
      id: "task-101",
      key: "TASK-101",
      title: "Shape the sprint backlog",
      description:
        "Review incoming work and move the most valuable items into the active sprint.",
      type: "story",
      status: "todo",
      priority: "high",
      sprintId: "sprint-01",
      eta: iso(36 * 3600000),
      estimatedMinutes: 90,
      labels: ["planning"],
      checklist: [],
      comments: [],
      history: [
        {
          id: "h-101",
          action: "CREATED",
          detail: "Task created",
          timestamp: iso(-86400000),
        },
      ],
      createdAt: iso(-86400000),
      updatedAt: iso(-86400000),
      completedAt: null,
    },
    {
      id: "task-102",
      key: "TASK-102",
      title: "Configure ETA reminders",
      description: "Choose reminder timing and verify browser notifications.",
      type: "task",
      status: "in-progress",
      priority: "highest",
      sprintId: "sprint-01",
      eta: iso(2 * 3600000),
      estimatedMinutes: 120,
      labels: ["extension", "notifications"],
      checklist: [
        {
          id: "check-1",
          text: "Enable extension notifications",
          completed: false,
        },
      ],
      comments: [],
      history: [
        {
          id: "h-102",
          action: "STATUS_CHANGED",
          detail: "Moved to In Progress",
          timestamp: iso(-3600000),
        },
      ],
      createdAt: iso(-2 * 86400000),
      updatedAt: iso(-3600000),
      completedAt: null,
    },
    {
      id: "task-103",
      key: "TASK-103",
      title: "Create weekly review report",
      description: "Review progress, overdue work, and completion rate.",
      type: "task",
      status: "done",
      priority: "medium",
      sprintId: "sprint-01",
      eta: iso(-3600000),
      estimatedMinutes: 45,
      labels: ["reporting"],
      checklist: [],
      comments: [],
      history: [
        {
          id: "h-103",
          action: "COMPLETED",
          detail: "Marked completed",
          timestamp: iso(-1800000),
        },
      ],
      createdAt: iso(-3 * 86400000),
      updatedAt: iso(-1800000),
      completedAt: iso(-1800000),
    },
    {
      id: "task-104",
      key: "TASK-104",
      title: "Capture ideas from the new tab",
      description:
        "Use the backlog as an inbox for tasks that are not ready for a sprint.",
      type: "task",
      status: "backlog",
      priority: "low",
      sprintId: null,
      eta: null,
      estimatedMinutes: 30,
      labels: ["inbox"],
      checklist: [],
      comments: [],
      history: [
        {
          id: "h-104",
          action: "CREATED",
          detail: "Added to backlog",
          timestamp: iso(-7200000),
        },
      ],
      createdAt: iso(-7200000),
      updatedAt: iso(-7200000),
      completedAt: null,
    },
  ],
};

export function migrateTodosToScrum(todos: TodoItem[]): ScrumTask[] {
  return todos.map((todo, index) => {
    const number = 200 + index;
    const createdAt = new Date(todo.createdAt).toISOString();
    return {
      id: `task-legacy-${todo.id}`,
      key: `TASK-${number}`,
      title: todo.text,
      description: "Imported from the original To Do List.",
      type: "task",
      status: todo.completed ? "done" : "backlog",
      priority: "medium",
      sprintId: null,
      eta: null,
      estimatedMinutes: null,
      labels: ["imported"],
      checklist: [],
      comments: [],
      history: [
        {
          id: `history-${todo.id}`,
          action: "IMPORTED",
          detail: "Imported from To Do List",
          timestamp: createdAt,
        },
      ],
      createdAt,
      updatedAt: createdAt,
      completedAt: todo.completed ? createdAt : null,
    };
  });
}
