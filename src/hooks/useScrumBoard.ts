import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SCRUM_DATA, migrateTodosToScrum } from "../data/scrumDefaults";
import {
  ScrumBoardData,
  ScrumSprint,
  ScrumStatus,
  ScrumTask,
  TodoItem,
} from "../types";
import { loadScrumData, saveScrumData } from "../services/scrumStorage";

const cloneDefaults = (): ScrumBoardData =>
  JSON.parse(JSON.stringify(DEFAULT_SCRUM_DATA));
const nowIso = () => new Date().toISOString();
const historyEntry = (action: string, detail: string) => ({
  id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  action,
  detail,
  timestamp: nowIso(),
});

export function useScrumBoard(legacyTodos: TodoItem[]) {
  const [data, setData] = useState<ScrumBoardData>(() => cloneDefaults());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let current = true;
    loadScrumData().then((saved) => {
      if (!current) return;
      if (saved) {
        setData(saved);
      } else {
        const initial = cloneDefaults();
        const migrated = migrateTodosToScrum(legacyTodos);
        if (migrated.length) {
          initial.tasks = [...initial.tasks, ...migrated];
          initial.nextTaskNumber = Math.max(
            initial.nextTaskNumber,
            200 + migrated.length,
          );
        }
        setData(initial);
      }
      setLoaded(true);
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveScrumData(data);
  }, [data, loaded]);

  const activeSprint = useMemo(
    () =>
      data.sprints.find((sprint) => sprint.id === data.activeSprintId) ?? null,
    [data.activeSprintId, data.sprints],
  );

  const createTask = (input: Partial<ScrumTask> & Pick<ScrumTask, "title">) => {
    setData((current) => {
      const timestamp = nowIso();
      const taskNumber = current.nextTaskNumber;
      const status =
        input.status ?? (current.activeSprintId ? "todo" : "backlog");
      const task: ScrumTask = {
        id: `task-${Date.now()}`,
        key: `TASK-${String(taskNumber).padStart(3, "0")}`,
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        type: input.type ?? "task",
        status,
        priority: input.priority ?? current.settings.defaultPriority,
        sprintId:
          status === "backlog"
            ? null
            : (input.sprintId ?? current.activeSprintId),
        eta: input.eta || null,
        estimatedMinutes: input.estimatedMinutes ?? null,
        labels: input.labels ?? [],
        checklist: input.checklist ?? [],
        comments: input.comments ?? [],
        history: [
          historyEntry("CREATED", `Created in ${status.replace("-", " ")}`),
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: status === "done" ? timestamp : null,
      };
      return {
        ...current,
        tasks: [...current.tasks, task],
        nextTaskNumber: taskNumber + 1,
      };
    });
  };

  const updateTask = (
    taskId: string,
    changes: Partial<ScrumTask>,
    detail = "Task details updated",
  ) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...changes,
              updatedAt: nowIso(),
              history: [...task.history, historyEntry("UPDATED", detail)],
            }
          : task,
      ),
    }));
  };

  const moveTask = (taskId: string, status: ScrumStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId || task.status === status) return task;
        const timestamp = nowIso();
        return {
          ...task,
          status,
          sprintId:
            status === "backlog"
              ? null
              : (task.sprintId ?? current.activeSprintId),
          completedAt: status === "done" ? timestamp : null,
          updatedAt: timestamp,
          history: [
            ...task.history,
            historyEntry(
              "STATUS_CHANGED",
              `Moved from ${task.status} to ${status}`,
            ),
          ],
        };
      }),
    }));
  };

  const deleteTask = (taskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const createSprint = (
    input: Pick<ScrumSprint, "name" | "goal" | "startDate" | "endDate">,
  ) => {
    setData((current) => {
      const sprint: ScrumSprint = {
        ...input,
        id: `sprint-${Date.now()}`,
        status: current.activeSprintId ? "planned" : "active",
        createdAt: nowIso(),
      };
      return {
        ...current,
        sprints: [...current.sprints, sprint],
        activeSprintId: current.activeSprintId ?? sprint.id,
      };
    });
  };

  const startSprint = (sprintId: string) => {
    setData((current) => ({
      ...current,
      activeSprintId: sprintId,
      sprints: current.sprints.map((sprint) => ({
        ...sprint,
        status:
          sprint.id === sprintId
            ? "active"
            : sprint.status === "active"
              ? "planned"
              : sprint.status,
      })),
    }));
  };

  const completeSprint = (sprintId: string, moveToSprintId?: string) => {
    setData((current) => ({
      ...current,
      activeSprintId:
        current.activeSprintId === sprintId
          ? (moveToSprintId ?? null)
          : current.activeSprintId,
      sprints: current.sprints.map((sprint) =>
        sprint.id === sprintId
          ? { ...sprint, status: "completed" }
          : sprint.id === moveToSprintId
            ? { ...sprint, status: "active" }
            : sprint,
      ),
      tasks: current.tasks.map((task) => {
        if (task.sprintId !== sprintId || task.status === "done") return task;
        const nextSprint = moveToSprintId ?? null;
        return {
          ...task,
          sprintId: nextSprint,
          status: nextSprint ? "todo" : "backlog",
          updatedAt: nowIso(),
          history: [
            ...task.history,
            historyEntry(
              "SPRINT_COMPLETED",
              nextSprint ? "Moved to the next sprint" : "Returned to backlog",
            ),
          ],
        };
      }),
    }));
  };

  const setActiveSprintId = (activeSprintId: string | null) => {
    setData((current) => ({ ...current, activeSprintId }));
  };

  const replaceData = (replacement: ScrumBoardData) => setData(replacement);
  const resetData = () => setData(cloneDefaults());

  return {
    data,
    loaded,
    activeSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    createSprint,
    startSprint,
    completeSprint,
    setActiveSprintId,
    replaceData,
    resetData,
    updateSettings: (settings: Partial<ScrumBoardData["settings"]>) =>
      setData((current) => ({
        ...current,
        settings: { ...current.settings, ...settings },
      })),
  };
}
