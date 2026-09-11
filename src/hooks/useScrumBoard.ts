import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SCRUM_DATA, migrateTodosToScrum } from "../data/scrumDefaults";
import {
  ScrumBoardData,
  ScrumSprint,
  ScrumStatus,
  ScrumStatusDefinition,
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
        void saveScrumData(saved);
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
        input.status ??
        (current.activeSprintId
          ? (current.statuses.find((definition) => !definition.isDone)?.id ??
            current.statuses[0]?.id ??
            "backlog")
          : "backlog");
      const isDone = current.statuses.some(
        (definition) => definition.id === status && definition.isDone,
      );
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
        completedAt: isDone ? timestamp : null,
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
    setData((current) => {
      const timestamp = nowIso();
      return {
        ...current,
        tasks: current.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextStatus = changes.status ?? task.status;
          const isDone = current.statuses.some(
            (definition) => definition.id === nextStatus && definition.isDone,
          );
          return {
            ...task,
            ...changes,
            completedAt: isDone ? (task.completedAt ?? timestamp) : null,
            updatedAt: timestamp,
            history: [...task.history, historyEntry("UPDATED", detail)],
          };
        }),
      };
    });
  };

  const moveTask = (taskId: string, status: ScrumStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId || task.status === status) return task;
        const timestamp = nowIso();
        const isDone = current.statuses.some(
          (definition) => definition.id === status && definition.isDone,
        );
        return {
          ...task,
          status,
          sprintId:
            status === "backlog"
              ? null
              : (task.sprintId ?? current.activeSprintId),
          completedAt: isDone ? timestamp : null,
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
        const isDone = current.statuses.some(
          (definition) => definition.id === task.status && definition.isDone,
        );
        if (task.sprintId !== sprintId || isDone) return task;
        const nextSprint = moveToSprintId ?? null;
        return {
          ...task,
          sprintId: nextSprint,
          status: nextSprint
            ? (current.statuses.find((status) => !status.isDone)?.id ??
              current.statuses[0]?.id ??
              "backlog")
            : "backlog",
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

  const addStatus = (name: string, color: string) => {
    setData((current) => {
      const baseId =
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "status";
      let id = baseId;
      let suffix = 2;
      while (current.statuses.some((status) => status.id === id))
        id = `${baseId}-${suffix++}`;
      return {
        ...current,
        statuses: [
          ...current.statuses,
          { id, name: name.trim(), color, isDone: false },
        ],
      };
    });
  };

  const updateStatus = (
    statusId: string,
    changes: Partial<ScrumStatusDefinition>,
  ) => {
    setData((current) => {
      const statuses = current.statuses.map((status) => {
        if (status.id !== statusId) {
          return changes.isDone ? { ...status, isDone: false } : status;
        }
        return { ...status, ...changes, id: status.id };
      });
      const doneIds = new Set(
        statuses.filter((status) => status.isDone).map((status) => status.id),
      );
      const timestamp = nowIso();
      return {
        ...current,
        statuses,
        tasks: current.tasks.map((task) => ({
          ...task,
          completedAt: doneIds.has(task.status)
            ? (task.completedAt ?? timestamp)
            : null,
        })),
      };
    });
  };

  const deleteStatus = (statusId: string) => {
    setData((current) => {
      if (current.statuses.length <= 1) return current;
      const fallback = current.statuses.find(
        (status) => status.id !== statusId,
      )!;
      return {
        ...current,
        statuses: current.statuses.filter((status) => status.id !== statusId),
        tasks: current.tasks.map((task) =>
          task.status === statusId
            ? {
                ...task,
                status: fallback.id,
                completedAt: fallback.isDone ? nowIso() : null,
                updatedAt: nowIso(),
                history: [
                  ...task.history,
                  historyEntry("STATUS_REMOVED", `Moved to ${fallback.name}`),
                ],
              }
            : task,
        ),
      };
    });
  };

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
    addStatus,
    updateStatus,
    deleteStatus,
    updateSettings: (settings: Partial<ScrumBoardData["settings"]>) =>
      setData((current) => ({
        ...current,
        settings: { ...current.settings, ...settings },
      })),
  };
}
