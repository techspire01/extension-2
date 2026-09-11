import React, { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckSquare2,
  Clock3,
  MessageSquareText,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  ScrumChecklistItem,
  ScrumComment,
  ScrumIssueType,
  ScrumPriority,
  ScrumSprint,
  ScrumStatus,
  ScrumStatusDefinition,
  ScrumTask,
} from "../../types";

interface TaskModalProps {
  task: ScrumTask | null;
  sprints: ScrumSprint[];
  statuses: ScrumStatusDefinition[];
  defaultPriority: ScrumPriority;
  defaultSprintId: string | null;
  initialStatus?: ScrumStatus;
  onClose: () => void;
  onCreate: (task: Partial<ScrumTask> & Pick<ScrumTask, "title">) => void;
  onUpdate: (id: string, changes: Partial<ScrumTask>, detail?: string) => void;
  onDelete: (id: string) => void;
}

interface TaskDraft {
  title: string;
  description: string;
  type: ScrumIssueType;
  status: ScrumStatus;
  priority: ScrumPriority;
  sprintId: string | null;
  eta: string;
  estimatedMinutes: string;
  labels: string;
}

const emptyTask = (
  priority: ScrumPriority,
  sprintId: string | null,
  status: ScrumStatus,
): TaskDraft => ({
  title: "",
  description: "",
  type: "task" as ScrumIssueType,
  status,
  priority,
  sprintId,
  eta: "",
  estimatedMinutes: "",
  labels: "",
});

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  sprints,
  statuses,
  defaultPriority,
  defaultSprintId,
  initialStatus: initialStatusProp,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const initialStatus: ScrumStatus = initialStatusProp ?? "todo";
  const [draft, setDraft] = useState(() =>
    emptyTask(defaultPriority, defaultSprintId, initialStatus),
  );
  const [checklist, setChecklist] = useState<ScrumChecklistItem[]>([]);
  const [comments, setComments] = useState<ScrumComment[]>([]);
  const [newChecklist, setNewChecklist] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (task) {
      setDraft({
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId,
        eta: task.eta ? task.eta.slice(0, 16) : "",
        estimatedMinutes: task.estimatedMinutes?.toString() ?? "",
        labels: task.labels.join(", "),
      });
      setChecklist(task.checklist);
      setComments(task.comments);
    } else {
      setDraft(emptyTask(defaultPriority, defaultSprintId, initialStatus));
      setChecklist([]);
      setComments([]);
    }
  }, [task, defaultPriority, defaultSprintId, initialStatus]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const values: Partial<ScrumTask> & Pick<ScrumTask, "title"> = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      type: draft.type,
      status: draft.status,
      priority: draft.priority,
      sprintId: draft.status === "backlog" ? null : draft.sprintId,
      eta: draft.eta ? new Date(draft.eta).toISOString() : null,
      estimatedMinutes: draft.estimatedMinutes
        ? Number(draft.estimatedMinutes)
        : null,
      labels: draft.labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
      checklist,
      comments,
    };
    if (task) onUpdate(task.id, values, "Task details edited");
    else onCreate(values);
    onClose();
  };

  const addChecklist = () => {
    if (!newChecklist.trim()) return;
    setChecklist((items) => [
      ...items,
      {
        id: `check-${Date.now()}`,
        text: newChecklist.trim(),
        completed: false,
      },
    ]);
    setNewChecklist("");
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((items) => [
      ...items,
      {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewComment("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/55 flex items-center justify-center p-3 sm:p-6"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={task ? `Edit ${task.key}` : "Create task"}
        className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-[#ffffff] text-[#172b4d] border border-[#dfe1e6] shadow-2xl flex flex-col"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-[#dfe1e6]">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#6b778c]">
              {task?.key ?? "New issue"}
            </div>
            <h2 className="text-lg font-bold">
              {task ? "Edit issue" : "Create issue"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#ebecf0]"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <form
          onSubmit={save}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-5 space-y-5 border-r border-[#dfe1e6]">
              <label className="block">
                <span className="scrum-label">Summary</span>
                <input
                  autoFocus
                  required
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  className="scrum-input text-base font-semibold"
                  placeholder="What needs to be done?"
                />
              </label>
              <label className="block">
                <span className="scrum-label">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  className="scrum-input min-h-28 resize-y"
                  placeholder="Add context, acceptance criteria, or notes..."
                />
              </label>

              <section>
                <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
                  <CheckSquare2 className="w-4 h-4 text-[#0c66e4]" /> Checklist
                </h3>
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 group"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          setChecklist((items) =>
                            items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, completed: !entry.completed }
                                : entry,
                            ),
                          )
                        }
                      />
                      <span
                        className={`flex-1 text-sm ${item.completed ? "line-through text-[#6b778c]" : ""}`}
                      >
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setChecklist((items) =>
                            items.filter((entry) => entry.id !== item.id),
                          )
                        }
                        className="p-1 text-[#6b778c] opacity-0 group-hover:opacity-100 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={newChecklist}
                      onChange={(e) => setNewChecklist(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addChecklist();
                        }
                      }}
                      className="scrum-input py-1.5"
                      placeholder="Add checklist item"
                    />
                    <button
                      type="button"
                      onClick={addChecklist}
                      className="scrum-icon-btn"
                      title="Add checklist item"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
                  <MessageSquareText className="w-4 h-4 text-[#0c66e4]" />{" "}
                  Comments & notes
                </h3>
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-[#f7f8f9] border border-[#dfe1e6] text-sm"
                    >
                      <p>{comment.text}</p>
                      <time className="text-[10px] text-[#6b778c]">
                        {new Date(comment.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addComment();
                        }
                      }}
                      className="scrum-input"
                      placeholder="Add a note..."
                    />
                    <button
                      type="button"
                      onClick={addComment}
                      className="px-3 bg-[#ebecf0] hover:bg-[#dfe1e6] text-sm font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </section>

              {task && task.history.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
                    <Activity className="w-4 h-4 text-[#0c66e4]" /> Activity
                  </h3>
                  <div className="border-l-2 border-[#dfe1e6] pl-4 space-y-3">
                    {[...task.history].reverse().map((entry) => (
                      <div key={entry.id} className="relative text-xs">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0c66e4] border-2 border-white" />
                        <div className="font-semibold">{entry.detail}</div>
                        <time className="text-[#6b778c]">
                          {new Date(entry.timestamp).toLocaleString()}
                        </time>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="p-5 bg-[#f7f8f9] space-y-4">
              <label className="block">
                <span className="scrum-label">Issue type</span>
                <select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      type: e.target.value as ScrumIssueType,
                    })
                  }
                  className="scrum-input"
                >
                  <option value="task">Task</option>
                  <option value="story">Story</option>
                  <option value="bug">Bug</option>
                </select>
              </label>
              <label className="block">
                <span className="scrum-label">Status</span>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as ScrumStatus,
                    })
                  }
                  className="scrum-input"
                >
                  <option value="backlog">Backlog</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="scrum-label">Priority</span>
                <select
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      priority: e.target.value as ScrumPriority,
                    })
                  }
                  className="scrum-input"
                >
                  <option value="highest">Highest</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="lowest">Lowest</option>
                </select>
              </label>
              <label className="block">
                <span className="scrum-label">Sprint</span>
                <select
                  value={draft.sprintId ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, sprintId: e.target.value || null })
                  }
                  className="scrum-input"
                >
                  <option value="">Backlog</option>
                  {sprints
                    .filter((sprint) => sprint.status !== "completed")
                    .map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block">
                <span className="scrum-label">
                  <CalendarClock className="inline w-3.5 h-3.5 mr-1" /> ETA
                </span>
                <input
                  type="datetime-local"
                  value={draft.eta}
                  onChange={(e) => setDraft({ ...draft, eta: e.target.value })}
                  className="scrum-input"
                />
              </label>
              <label className="block">
                <span className="scrum-label">
                  <Clock3 className="inline w-3.5 h-3.5 mr-1" /> Estimate
                  (minutes)
                </span>
                <input
                  type="number"
                  min="0"
                  value={draft.estimatedMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, estimatedMinutes: e.target.value })
                  }
                  className="scrum-input"
                  placeholder="120"
                />
              </label>
              <label className="block">
                <span className="scrum-label">
                  <Tag className="inline w-3.5 h-3.5 mr-1" /> Labels
                </span>
                <input
                  value={draft.labels}
                  onChange={(e) =>
                    setDraft({ ...draft, labels: e.target.value })
                  }
                  className="scrum-input"
                  placeholder="frontend, urgent"
                />
                <span className="text-[10px] text-[#6b778c]">
                  Separate labels with commas
                </span>
              </label>
            </aside>
          </div>

          <footer className="sticky bottom-0 flex items-center justify-between px-5 py-3 bg-white border-t border-[#dfe1e6]">
            {task ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${task.key}?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold hover:bg-[#ebecf0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#0c66e4] text-white text-sm font-bold hover:bg-[#0055cc]"
              >
                <Save className="w-4 h-4" />{" "}
                {task ? "Save changes" : "Create issue"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};
