import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Download,
  Filter,
  Flag,
  FolderKanban,
  Import,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useScrumBoard } from "../../hooks/useScrumBoard";
import {
  exportScrumData,
  validateScrumImport,
} from "../../services/scrumStorage";
import {
  ScrumFilters,
  ScrumPriority,
  ScrumSprint,
  ScrumStatus,
  ScrumTask,
  TodoItem,
} from "../../types";
import { TaskModal } from "./TaskModal";

const FALLBACK_STATUSES = [
  { id: "todo", name: "To do", color: "#579dff", isDone: false },
  { id: "in-progress", name: "In progress", color: "#f5cd47", isDone: false },
  { id: "done", name: "Done", color: "#4bce97", isDone: true },
];

interface ScrumWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  legacyTodos: TodoItem[];
  onOpenTaskCountChange?: (count: number) => void;
}

type View = "board" | "backlog" | "reports";
const PRIORITIES: { id: ScrumPriority; label: string; color: string }[] = [
  { id: "highest", label: "Highest", color: "#c9372c" },
  { id: "high", label: "High", color: "#e56910" },
  { id: "medium", label: "Medium", color: "#e2b203" },
  { id: "low", label: "Low", color: "#0c66e4" },
  { id: "lowest", label: "Lowest", color: "#8590a2" },
];
const PRIORITY_ORDER: Record<ScrumPriority, number> = {
  highest: 0,
  high: 1,
  medium: 2,
  low: 3,
  lowest: 4,
};
const EMPTY_FILTERS: ScrumFilters = {
  query: "",
  priorities: [],
  statuses: [],
  eta: "all",
  label: "",
};

function getEtaState(task: ScrumTask) {
  if (task.completedAt) return "completed";
  if (!task.eta) return "none";
  const remaining = new Date(task.eta).getTime() - Date.now();
  if (remaining < 0) return "overdue";
  if (remaining <= 24 * 3600000) return "due-soon";
  return "upcoming";
}

function formatEta(eta: string | null) {
  if (!eta) return null;
  const date = new Date(eta);
  const today = new Date();
  const prefix =
    date.toDateString() === today.toDateString()
      ? "Today"
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${prefix}, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

const priorityMeta = (priority: ScrumPriority) =>
  PRIORITIES.find((item) => item.id === priority)!;

export const ScrumWorkspace: React.FC<ScrumWorkspaceProps> = ({
  isOpen,
  onClose,
  legacyTodos,
  onOpenTaskCountChange,
}) => {
  const board = useScrumBoard(legacyTodos);
  const { data, activeSprint } = board;
  const statuses = data.statuses?.length ? data.statuses : FALLBACK_STATUSES;
  const [view, setView] = useState<View>("board");
  const [filters, setFilters] = useState<ScrumFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showStatusConfig, setShowStatusConfig] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#579dff");
  const [editingTask, setEditingTask] = useState<ScrumTask | null | undefined>(
    undefined,
  );
  const [newTaskStatus, setNewTaskStatus] = useState<ScrumStatus>("todo");
  const [dragOverStatus, setDragOverStatus] = useState<ScrumStatus | null>(
    null,
  );
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintDraft, setSprintDraft] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });
  const importRef = useRef<HTMLInputElement>(null);

  const doneStatusIds = useMemo(
    () =>
      new Set(
        statuses.filter((status) => status.isDone).map((status) => status.id),
      ),
    [statuses],
  );
  const openCount = data.tasks.filter(
    (task) => !doneStatusIds.has(task.status),
  ).length;
  useEffect(
    () => onOpenTaskCountChange?.(openCount),
    [openCount, onOpenTaskCountChange],
  );

  useEffect(() => {
    if (!isOpen) return;
    setShowSidePanel(false);
    setShowStatusConfig(false);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && editingTask === undefined) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, editingTask, onClose]);

  const allLabels = useMemo(
    () => Array.from(new Set(data.tasks.flatMap((task) => task.labels))).sort(),
    [data.tasks],
  );
  const filterTask = (task: ScrumTask) => {
    const query = filters.query.toLowerCase().trim();
    const sprintName =
      data.sprints.find((sprint) => sprint.id === task.sprintId)?.name ??
      "backlog";
    const haystack = [
      task.key,
      task.title,
      task.description,
      task.priority,
      task.status,
      sprintName,
      ...task.labels,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!filters.priorities.length ||
        filters.priorities.includes(task.priority)) &&
      (!filters.statuses.length || filters.statuses.includes(task.status)) &&
      (filters.eta === "all" || getEtaState(task) === filters.eta) &&
      (!filters.label || task.labels.includes(filters.label))
    );
  };

  const sortTasks = (tasks: ScrumTask[]) =>
    [...tasks].sort((a, b) => {
      if (data.settings.defaultSort === "priority")
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (data.settings.defaultSort === "eta")
        return (
          (a.eta ? new Date(a.eta).getTime() : Infinity) -
          (b.eta ? new Date(b.eta).getTime() : Infinity)
        );
      if (data.settings.defaultSort === "updated")
        return b.updatedAt.localeCompare(a.updatedAt);
      return a.createdAt.localeCompare(b.createdAt);
    });

  const visibleTasks = useMemo(
    () => sortTasks(data.tasks.filter(filterTask)),
    [data.tasks, data.sprints, filters, data.settings.defaultSort],
  );
  const sprintTasks = visibleTasks.filter(
    (task) =>
      task.sprintId === data.activeSprintId && task.status !== "backlog",
  );
  const backlogTasks = visibleTasks.filter(
    (task) => !task.sprintId || task.status === "backlog",
  );
  const notifications = useMemo(
    () =>
      data.tasks
        .filter((task) => ["overdue", "due-soon"].includes(getEtaState(task)))
        .sort((a, b) => (a.eta ?? "").localeCompare(b.eta ?? "")),
    [data.tasks],
  );
  const completed = sprintTasks.filter((task) =>
    doneStatusIds.has(task.status),
  ).length;
  const progress = sprintTasks.length
    ? Math.round((completed / sprintTasks.length) * 100)
    : 0;
  const defaultActiveStatus =
    statuses.find((status) => !status.isDone)?.id ??
    statuses[0]?.id ??
    "backlog";

  const openCreate = (status: ScrumStatus) => {
    setNewTaskStatus(status);
    setEditingTask(null);
  };
  const dropTask = (event: React.DragEvent, status: ScrumStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id");
    if (taskId) board.moveTask(taskId, status);
    setDragOverStatus(null);
  };

  const createSprint = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !sprintDraft.name.trim() ||
      !sprintDraft.startDate ||
      !sprintDraft.endDate
    )
      return;
    board.createSprint({
      ...sprintDraft,
      name: sprintDraft.name.trim(),
      goal: sprintDraft.goal.trim(),
    });
    setSprintDraft({ name: "", goal: "", startDate: "", endDate: "" });
    setShowSprintForm(false);
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      board.replaceData(validateScrumImport(JSON.parse(await file.text())));
      alert("Scrum board imported successfully.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to import this backup.",
      );
    } finally {
      event.target.value = "";
    }
  };

  if (!isOpen) return null;

  const TaskCard = ({ task }: { task: ScrumTask; key?: React.Key }) => {
    const priority = priorityMeta(task.priority);
    const etaState = getEtaState(task);
    const checklistDone = task.checklist.filter(
      (item) => item.completed,
    ).length;
    return (
      <article
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/task-id", task.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => setEditingTask(task)}
        className="group bg-white border border-[#dfe1e6] hover:border-[#85b8ff] shadow-[0_1px_2px_rgba(9,30,66,.15)] hover:shadow-[0_4px_10px_rgba(9,30,66,.18)] p-3 cursor-grab active:cursor-grabbing transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold tracking-wide text-[#6b778c]">
            {task.key}
          </span>
          <span className="text-[10px] uppercase font-bold text-[#6b778c]">
            {task.type}
          </span>
        </div>
        <h3 className="mt-1 text-sm font-semibold leading-5 text-[#172b4d] group-hover:text-[#0c66e4]">
          {task.title}
        </h3>
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="px-1.5 py-0.5 bg-[#dfe1e6] text-[#44546f] text-[9px] font-semibold"
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 gap-2">
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: priority.color }}
          >
            <Flag className="w-3.5 h-3.5 fill-current" />
            {priority.label}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-[#6b778c]">
            {task.checklist.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {checklistDone}/{task.checklist.length}
              </span>
            )}
            {task.comments.length > 0 && (
              <span>{task.comments.length} notes</span>
            )}
          </div>
        </div>
        {(task.eta || task.estimatedMinutes) && (
          <div
            className={`mt-2 pt-2 border-t border-[#ebecf0] flex items-center justify-between text-[10px] ${etaState === "overdue" ? "text-[#ae2a19] font-bold" : etaState === "due-soon" ? "text-[#974f0c] font-bold" : "text-[#6b778c]"}`}
          >
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {formatEta(task.eta) ?? "No ETA"}
            </span>
            {task.estimatedMinutes && (
              <span>{formatDuration(task.estimatedMinutes)}</span>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/45 flex items-center justify-center p-3 sm:p-6"
      onMouseDown={onClose}
    >
      <div
        className="scrum-theme relative w-full max-w-[1180px] h-[min(820px,calc(100vh-32px))] bg-[#f7f8f9] text-[#172b4d] flex overflow-hidden border border-[#dfe1e6] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showSidePanel && (
          <button
            aria-label="Close navigation panel"
            className="absolute inset-0 z-30 bg-black/30"
            onClick={() => setShowSidePanel(false)}
          />
        )}
        <aside
          className="absolute inset-y-0 left-0 z-40 flex w-72 bg-[#172b4d] text-white flex-col shrink-0 transition-transform duration-200"
          style={{
            transform: showSidePanel ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
            <div className="w-8 h-8 bg-[#0c66e4] flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="font-bold text-sm">Focus Sprint</div>
              <div className="text-[10px] text-[#b6c2cf]">
                Personal workspace
              </div>
            </div>
            <button
              onClick={() => setShowSidePanel(false)}
              className="ml-auto p-1.5 hover:bg-white/10"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {(
              [
                { id: "board", label: "Active board", icon: LayoutDashboard },
                { id: "backlog", label: "Backlog", icon: Archive },
                { id: "reports", label: "Reports", icon: BarChart3 },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setView(id);
                  setShowSidePanel(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold ${view === id ? "bg-[#0c66e4] text-white" : "text-[#b6c2cf] hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === "backlog" && (
                  <span className="ml-auto text-[10px] bg-white/15 px-1.5 rounded-full">
                    {
                      data.tasks.filter((task) => task.status === "backlog")
                        .length
                    }
                  </span>
                )}
              </button>
            ))}
          </nav>
          <section className="px-3 pt-3 border-t border-white/10 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setShowStatusConfig((current) => !current)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-[#b6c2cf] hover:bg-white/10 hover:text-white"
              aria-expanded={showStatusConfig}
            >
              <span className="flex items-center gap-3">
                <Settings2 className="w-4 h-4" />
                Configure statuses
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showStatusConfig ? "rotate-180" : ""}`}
              />
            </button>
            {showStatusConfig && (
              <div className="mt-2">
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      className="p-2 bg-white/8 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={status.color}
                          onChange={(e) =>
                            board.updateStatus(status.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-6 h-6 bg-transparent border-0 p-0"
                          title="Status color"
                        />
                        <input
                          value={status.name}
                          onChange={(e) =>
                            board.updateStatus(status.id, {
                              name: e.target.value,
                            })
                          }
                          className="min-w-0 flex-1 bg-white/10 border border-white/15 px-2 py-1 text-xs text-white outline-none focus:border-[#579dff]"
                          aria-label={`Rename ${status.name}`}
                        />
                        <button
                          disabled={statuses.length <= 1}
                          onClick={() => {
                            if (
                              confirm(
                                `Delete ${status.name}? Its tasks will move to another status.`,
                              )
                            )
                              board.deleteStatus(status.id);
                          }}
                          className="p-1 text-[#b6c2cf] hover:text-red-300 disabled:opacity-30"
                          title={`Delete ${status.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <label className="flex items-center justify-between text-[10px] text-[#b6c2cf]">
                        <span>Completion status</span>
                        <input
                          type="radio"
                          name="done-status"
                          checked={status.isDone}
                          onChange={() =>
                            board.updateStatus(status.id, { isDone: true })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-white/5 border border-white/10 space-y-2">
                  <input
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 px-2 py-1.5 text-xs text-white outline-none"
                    placeholder="New status name"
                  />
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newStatusColor}
                      onChange={(e) => setNewStatusColor(e.target.value)}
                      className="w-8 h-8 bg-transparent border-0 p-0"
                    />
                    <button
                      onClick={() => {
                        if (!newStatusName.trim()) return;
                        board.addStatus(newStatusName, newStatusColor);
                        setNewStatusName("");
                      }}
                      className="flex-1 bg-[#0c66e4] px-2 py-1.5 text-xs font-bold hover:bg-[#0055cc]"
                    >
                      Add status
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
          <div className="mt-auto p-4 border-t border-white/10">
            <div className="text-[10px] uppercase font-bold text-[#9fadbc] mb-2">
              Sprint progress
            </div>
            <div className="flex items-end justify-between">
              <strong className="text-2xl">{progress}%</strong>
              <span className="text-xs text-[#b6c2cf]">
                {completed}/{sprintTasks.length} done
              </span>
            </div>
            <div className="h-1.5 bg-white/15 mt-2">
              <div
                className="h-full bg-[#4bce97]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 bg-white border-b border-[#dfe1e6] flex items-center gap-3 px-3 sm:px-5 shrink-0">
            <button
              onClick={() => setShowSidePanel(true)}
              className="scrum-icon-btn"
              title="Open navigation and status settings"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="scrum-icon-btn"
              title="Close task manager"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate">
                My Scrum Board
              </h1>
              <p className="hidden sm:block text-[11px] text-[#6b778c] truncate">
                {activeSprint?.goal || "Plan focused work and ship it"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() =>
                  openCreate(
                    view === "backlog" ? "backlog" : defaultActiveStatus,
                  )
                }
                aria-label="Create issue"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0c66e4] text-white text-xs font-bold hover:bg-[#0055cc]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="scrum-icon-btn relative"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#c9372c] rounded-full border border-white" />
                  )}
                </button>
                {showNotifications && (
                  <div className="scrum-popover right-0 w-80">
                    <div className="scrum-popover-title">Notifications</div>
                    {notifications.length ? (
                      notifications.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            setEditingTask(task);
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-3 hover:bg-[#f7f8f9] border-t border-[#ebecf0]"
                        >
                          <div className="flex gap-2">
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 ${getEtaState(task) === "overdue" ? "text-[#c9372c]" : "text-[#e2b203]"}`}
                            />
                            <div>
                              <div className="text-xs font-semibold">
                                {task.title}
                              </div>
                              <div className="text-[10px] text-[#6b778c]">
                                {getEtaState(task) === "overdue"
                                  ? "Overdue"
                                  : "Due soon"}{" "}
                                · {formatEta(task.eta)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-xs text-[#6b778c]">
                        No urgent tasks.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="scrum-icon-btn"
                  title="Board settings"
                >
                  <Settings2 className="w-4.5 h-4.5" />
                </button>
                {showSettings && (
                  <div className="scrum-popover right-0 w-80 p-4 space-y-4">
                    <div className="scrum-popover-title -mx-4 -mt-4">
                      Board settings
                    </div>
                    <label className="block">
                      <span className="scrum-label">Default priority</span>
                      <select
                        className="scrum-input"
                        value={data.settings.defaultPriority}
                        onChange={(e) =>
                          board.updateSettings({
                            defaultPriority: e.target.value as ScrumPriority,
                          })
                        }
                      >
                        {PRIORITIES.map((priority) => (
                          <option key={priority.id} value={priority.id}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="scrum-label">Default sorting</span>
                      <select
                        className="scrum-input"
                        value={data.settings.defaultSort}
                        onChange={(e) =>
                          board.updateSettings({
                            defaultSort: e.target
                              .value as typeof data.settings.defaultSort,
                          })
                        }
                      >
                        <option value="manual">Created order</option>
                        <option value="priority">Priority</option>
                        <option value="eta">ETA</option>
                        <option value="updated">Recently updated</option>
                      </select>
                    </label>
                    <label className="flex justify-between text-xs font-semibold">
                      <span>Browser notifications</span>
                      <input
                        type="checkbox"
                        checked={data.settings.notificationsEnabled}
                        onChange={(e) =>
                          board.updateSettings({
                            notificationsEnabled: e.target.checked,
                          })
                        }
                      />
                    </label>
                    <div className="space-y-2 pl-2 border-l-2 border-[#dfe1e6]">
                      <label className="flex justify-between text-xs font-semibold">
                        <span>ETA reminders</span>
                        <input
                          type="checkbox"
                          checked={data.settings.etaReminders}
                          disabled={!data.settings.notificationsEnabled}
                          onChange={(e) =>
                            board.updateSettings({
                              etaReminders: e.target.checked,
                            })
                          }
                        />
                      </label>
                      <label className="flex justify-between text-xs font-semibold">
                        <span>Overdue reminders</span>
                        <input
                          type="checkbox"
                          checked={data.settings.overdueReminders}
                          disabled={!data.settings.notificationsEnabled}
                          onChange={(e) =>
                            board.updateSettings({
                              overdueReminders: e.target.checked,
                            })
                          }
                        />
                      </label>
                      <label className="flex justify-between text-xs font-semibold">
                        <span>Sprint reminders</span>
                        <input
                          type="checkbox"
                          checked={data.settings.sprintReminders}
                          disabled={!data.settings.notificationsEnabled}
                          onChange={(e) =>
                            board.updateSettings({
                              sprintReminders: e.target.checked,
                            })
                          }
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="scrum-label">Remind before ETA</span>
                      <select
                        className="scrum-input"
                        value={data.settings.reminderMinutes}
                        onChange={(e) =>
                          board.updateSettings({
                            reminderMinutes: Number(e.target.value),
                          })
                        }
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="1440">1 day</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="scrum-label">
                        When completing a sprint
                      </span>
                      <select
                        className="scrum-input"
                        value={data.settings.incompleteSprintAction}
                        onChange={(e) =>
                          board.updateSettings({
                            incompleteSprintAction: e.target
                              .value as typeof data.settings.incompleteSprintAction,
                          })
                        }
                      >
                        <option value="backlog">
                          Return incomplete tasks to backlog
                        </option>
                        <option value="next-sprint">
                          Move incomplete tasks to next sprint
                        </option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => exportScrumData(data)}
                        className="scrum-secondary-btn"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => importRef.current?.click()}
                        className="scrum-secondary-btn"
                      >
                        <Upload className="w-4 h-4" />
                        Import
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Reset the Scrum board and delete your current board data?",
                          )
                        )
                          board.resetData();
                      }}
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 p-2 hover:bg-red-50"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Reset board
                    </button>
                    <input
                      ref={importRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={importBackup}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="md:hidden flex bg-white border-b border-[#dfe1e6] px-2">
            {(
              [
                { id: "board", label: "Board" },
                { id: "backlog", label: "Backlog" },
                { id: "reports", label: "Reports" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 ${view === item.id ? "border-[#0c66e4] text-[#0c66e4]" : "border-transparent text-[#6b778c]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="bg-white border-b border-[#dfe1e6] px-3 sm:px-5 py-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`scrum-secondary-btn ${showFilters ? "bg-[#deebff] text-[#0c66e4]" : ""}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {filters.priorities.length +
                filters.statuses.length +
                (filters.eta !== "all" ? 1 : 0) +
                (filters.label ? 1 : 0) >
                0 && (
                <span className="bg-[#0c66e4] text-white rounded-full px-1.5 text-[10px]">
                  {filters.priorities.length +
                    filters.statuses.length +
                    (filters.eta !== "all" ? 1 : 0) +
                    (filters.label ? 1 : 0)}
                </span>
              )}
            </button>
            <select
              value={data.activeSprintId ?? ""}
              onChange={(e) => {
                if (e.target.value) board.startSprint(e.target.value);
                else board.setActiveSprintId(null);
              }}
              className="scrum-input w-auto min-w-36"
            >
              <option value="">No active sprint</option>
              {data.sprints
                .filter((sprint) => sprint.status !== "completed")
                .map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
            </select>
            <button
              onClick={() => setShowSprintForm(true)}
              className="scrum-secondary-btn"
            >
              <Plus className="w-4 h-4" />
              Sprint
            </button>
          </section>

          {showFilters && (
            <section className="px-5 py-3 bg-[#f7f8f9] border-b border-[#dfe1e6] flex flex-wrap gap-4 items-end">
              <div>
                <span className="scrum-label">Priority</span>
                <div className="flex flex-wrap gap-1">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority.id}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          priorities: filters.priorities.includes(priority.id)
                            ? filters.priorities.filter(
                                (id) => id !== priority.id,
                              )
                            : [...filters.priorities, priority.id],
                        })
                      }
                      className={`px-2 py-1 text-[11px] font-semibold border ${filters.priorities.includes(priority.id) ? "bg-[#deebff] border-[#0c66e4] text-[#0c66e4]" : "bg-white border-[#dfe1e6]"}`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="scrum-label">Status</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "backlog" as ScrumStatus, name: "Backlog" },
                    ...statuses,
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          statuses: filters.statuses.includes(status.id)
                            ? filters.statuses.filter((id) => id !== status.id)
                            : [...filters.statuses, status.id],
                        })
                      }
                      className={`px-2 py-1 text-[11px] font-semibold border ${filters.statuses.includes(status.id) ? "bg-[#deebff] border-[#0c66e4] text-[#0c66e4]" : "bg-white border-[#dfe1e6]"}`}
                    >
                      {status.name}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span className="scrum-label">ETA</span>
                <select
                  className="scrum-input py-1.5"
                  value={filters.eta}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      eta: e.target.value as ScrumFilters["eta"],
                    })
                  }
                >
                  <option value="all">Any ETA</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="due-soon">Due soon</option>
                  <option value="overdue">Overdue</option>
                  <option value="none">No ETA</option>
                </select>
              </label>
              <label>
                <span className="scrum-label">Label</span>
                <select
                  className="scrum-input py-1.5"
                  value={filters.label}
                  onChange={(e) =>
                    setFilters({ ...filters, label: e.target.value })
                  }
                >
                  <option value="">All labels</option>
                  {allLabels.map((label) => (
                    <option key={label}>{label}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-xs font-semibold text-[#0c66e4] py-2"
              >
                Clear all
              </button>
            </section>
          )}

          <main className="flex-1 overflow-auto custom-scrollbar p-3 sm:p-5">
            {!board.loaded ? (
              <div className="h-full grid place-items-center text-sm text-[#6b778c]">
                Loading your board...
              </div>
            ) : view === "board" ? (
              <div className="min-w-[760px] h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {activeSprint?.name ?? "No active sprint"}
                      </h2>
                      {activeSprint && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#dcfff1] text-[#216e4e]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b778c] mt-1">
                      {activeSprint
                        ? `${new Date(activeSprint.startDate).toLocaleDateString()} – ${new Date(activeSprint.endDate).toLocaleDateString()}`
                        : "Create or start a sprint to organize board work."}
                    </p>
                  </div>
                  {activeSprint && (
                    <button
                      onClick={() => {
                        const nextSprint = data.sprints.find(
                          (sprint) => sprint.status === "planned",
                        );
                        const shouldMoveToNext =
                          data.settings.incompleteSprintAction ===
                            "next-sprint" && nextSprint;
                        if (
                          confirm(
                            `Complete ${activeSprint.name}? Incomplete tasks will ${shouldMoveToNext ? `move to ${nextSprint.name}` : "return to backlog"}.`,
                          )
                        )
                          board.completeSprint(
                            activeSprint.id,
                            shouldMoveToNext ? nextSprint.id : undefined,
                          );
                      }}
                      className="scrum-secondary-btn"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete sprint
                    </button>
                  )}
                </div>
                <div
                  className="grid gap-3 flex-1 items-start"
                  style={{
                    gridTemplateColumns: `repeat(${statuses.length}, minmax(240px, 1fr))`,
                  }}
                >
                  {statuses.map((column) => {
                    const tasks = sprintTasks.filter(
                      (task) => task.status === column.id,
                    );
                    return (
                      <section
                        key={column.id}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragOverStatus(column.id);
                        }}
                        onDragLeave={() => setDragOverStatus(null)}
                        onDrop={(event) => dropTask(event, column.id)}
                        className={`bg-[#ebecf0] min-h-[420px] border-t-4 transition-colors ${dragOverStatus === column.id ? "bg-[#deebff]" : ""}`}
                        style={{ borderTopColor: column.color }}
                      >
                        <header className="h-12 flex items-center justify-between px-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wide">
                              {column.name}
                            </h3>
                            <span className="text-[10px] bg-[#dfe1e6] px-1.5 rounded-full">
                              {tasks.length}
                            </span>
                          </div>
                          <button
                            onClick={() => openCreate(column.id)}
                            className="p-1 hover:bg-[#dfe1e6]"
                            title={`Add to ${column.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </header>
                        <div className="px-2 pb-2 space-y-2">
                          {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                          {tasks.length === 0 && (
                            <button
                              onClick={() => openCreate(column.id)}
                              className="w-full p-5 border-2 border-dashed border-[#c1c7d0] text-xs text-[#6b778c] hover:border-[#0c66e4] hover:text-[#0c66e4]"
                            >
                              Drop tasks here or create one
                            </button>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            ) : view === "backlog" ? (
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Backlog</h2>
                    <p className="text-xs text-[#6b778c]">
                      Unscheduled work ready for refinement
                    </p>
                  </div>
                  <button
                    onClick={() => openCreate("backlog")}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0c66e4] text-white text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Create backlog issue
                  </button>
                </div>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStatus("backlog");
                  }}
                  onDrop={(event) => dropTask(event, "backlog")}
                  className={`border border-[#dfe1e6] bg-white ${dragOverStatus === "backlog" ? "ring-2 ring-[#0c66e4]" : ""}`}
                >
                  {backlogTasks.length ? (
                    backlogTasks.map((task) => {
                      const priority = priorityMeta(task.priority);
                      return (
                        <div
                          key={task.id}
                          draggable
                          role="button"
                          tabIndex={0}
                          onDragStart={(event) =>
                            event.dataTransfer.setData("text/task-id", task.id)
                          }
                          onClick={() => setEditingTask(task)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setEditingTask(task);
                            }
                          }}
                          className="w-full grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 px-4 py-3 text-left border-b border-[#ebecf0] hover:bg-[#f7f8f9]"
                        >
                          <span className="text-[10px] font-bold text-[#6b778c]">
                            {task.key}
                          </span>
                          <span className="text-sm font-semibold truncate">
                            {task.title}
                          </span>
                          <span
                            className="hidden sm:flex items-center gap-1 text-[11px] font-semibold"
                            style={{ color: priority.color }}
                          >
                            <Flag className="w-3.5 h-3.5 fill-current" />
                            {priority.label}
                          </span>
                          {activeSprint && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                board.updateTask(
                                  task.id,
                                  {
                                    sprintId: activeSprint.id,
                                    status: defaultActiveStatus,
                                  },
                                  `Added to ${activeSprint.name}`,
                                );
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold bg-[#deebff] text-[#0c66e4]"
                            >
                              Add to sprint
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center">
                      <Archive className="w-10 h-10 mx-auto text-[#9fadbc]" />
                      <h3 className="font-bold mt-3">Backlog is clear</h3>
                      <p className="text-xs text-[#6b778c] mt-1">
                        Capture an idea or move incomplete sprint work here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="mb-5">
                  <h2 className="text-xl font-bold">Sprint report</h2>
                  <p className="text-xs text-[#6b778c]">
                    Live statistics calculated from local board data
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                  {[
                    {
                      label: "Total tasks",
                      value: sprintTasks.length,
                      icon: ListTodo,
                      color: "#0c66e4",
                    },
                    {
                      label: "Completed",
                      value: completed,
                      icon: CheckCircle2,
                      color: "#1f845a",
                    },
                    {
                      label: "In progress",
                      value: sprintTasks.filter(
                        (task) => task.status === "in-progress",
                      ).length,
                      icon: TrendingUp,
                      color: "#b65c02",
                    },
                    {
                      label: "Overdue",
                      value: sprintTasks.filter(
                        (task) => getEtaState(task) === "overdue",
                      ).length,
                      icon: AlertTriangle,
                      color: "#c9372c",
                    },
                    {
                      label: "High priority",
                      value: sprintTasks.filter((task) =>
                        ["highest", "high"].includes(task.priority),
                      ).length,
                      icon: Flag,
                      color: "#e56910",
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <article
                      key={label}
                      className="bg-white border border-[#dfe1e6] p-4"
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                      <div className="text-2xl font-bold mt-3">{value}</div>
                      <div className="text-[11px] text-[#6b778c]">{label}</div>
                    </article>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <section className="bg-white border border-[#dfe1e6] p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">Sprint completion</h3>
                      <strong className="text-2xl text-[#0c66e4]">
                        {progress}%
                      </strong>
                    </div>
                    <div className="h-3 bg-[#ebecf0] mt-4">
                      <div
                        className="h-full bg-[#0c66e4]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {statuses.map((status) => {
                        const count = sprintTasks.filter(
                          (task) => task.status === status.id,
                        ).length;
                        return (
                          <div key={status.id}>
                            <div className="flex justify-between text-xs">
                              <span>{status.name}</span>
                              <strong>{count}</strong>
                            </div>
                            <div className="h-1.5 bg-[#ebecf0] mt-1">
                              <div
                                className="h-full"
                                style={{
                                  width: `${sprintTasks.length ? (count / sprintTasks.length) * 100 : 0}%`,
                                  backgroundColor: status.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                  <section className="bg-white border border-[#dfe1e6] p-5">
                    <h3 className="font-bold mb-4">Tasks by priority</h3>
                    <div className="space-y-3">
                      {PRIORITIES.map((priority) => {
                        const count = sprintTasks.filter(
                          (task) => task.priority === priority.id,
                        ).length;
                        return (
                          <div
                            key={priority.id}
                            className="grid grid-cols-[80px_1fr_24px] gap-3 items-center text-xs"
                          >
                            <span
                              className="font-semibold"
                              style={{ color: priority.color }}
                            >
                              {priority.label}
                            </span>
                            <div className="h-2 bg-[#ebecf0]">
                              <div
                                className="h-full"
                                style={{
                                  width: `${sprintTasks.length ? (count / sprintTasks.length) * 100 : 0}%`,
                                  backgroundColor: priority.color,
                                }}
                              />
                            </div>
                            <strong>{count}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </main>
        </div>

        {editingTask !== undefined && (
          <TaskModal
            task={editingTask}
            sprints={data.sprints}
            statuses={statuses}
            defaultPriority={data.settings.defaultPriority}
            defaultSprintId={data.activeSprintId}
            initialStatus={newTaskStatus}
            onClose={() => setEditingTask(undefined)}
            onCreate={board.createTask}
            onUpdate={board.updateTask}
            onDelete={board.deleteTask}
          />
        )}

        {showSprintForm && (
          <div
            className="fixed inset-0 z-[85] bg-black/50 grid place-items-center p-4"
            onMouseDown={() => setShowSprintForm(false)}
          >
            <form
              onSubmit={createSprint}
              onMouseDown={(event) => event.stopPropagation()}
              className="w-full max-w-md bg-white border border-[#dfe1e6] shadow-2xl p-5 space-y-4"
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#6b778c]">
                    Planning
                  </div>
                  <h2 className="text-lg font-bold">Create sprint</h2>
                </div>
                <button type="button" onClick={() => setShowSprintForm(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <label className="block">
                <span className="scrum-label">Sprint name</span>
                <input
                  autoFocus
                  required
                  className="scrum-input"
                  value={sprintDraft.name}
                  onChange={(e) =>
                    setSprintDraft({ ...sprintDraft, name: e.target.value })
                  }
                  placeholder="Sprint 02"
                />
              </label>
              <label className="block">
                <span className="scrum-label">Goal</span>
                <textarea
                  className="scrum-input min-h-20"
                  value={sprintDraft.goal}
                  onChange={(e) =>
                    setSprintDraft({ ...sprintDraft, goal: e.target.value })
                  }
                  placeholder="What outcome should this sprint deliver?"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="scrum-label">Start date</span>
                  <input
                    required
                    type="date"
                    className="scrum-input"
                    value={sprintDraft.startDate}
                    onChange={(e) =>
                      setSprintDraft({
                        ...sprintDraft,
                        startDate: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span className="scrum-label">End date</span>
                  <input
                    required
                    type="date"
                    className="scrum-input"
                    value={sprintDraft.endDate}
                    onChange={(e) =>
                      setSprintDraft({
                        ...sprintDraft,
                        endDate: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSprintForm(false)}
                  className="px-4 py-2 text-sm font-semibold hover:bg-[#ebecf0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0c66e4] text-white text-sm font-bold"
                >
                  Create sprint
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
