import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListTodo,
} from 'lucide-react';
import { TodoItem } from '../types';

interface TodoListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClearCompleted: () => void;
}

export const TodoListDrawer: React.FC<TodoListDrawerProps> = ({
  isOpen,
  onClose,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onClearCompleted,
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo(newTodoText.trim());
    setNewTodoText('');
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="todoContainer"
        className="w-full max-w-sm h-full bg-[var(--md-sys-color-surface-container-high)] border-r border-[var(--md-sys-color-outline)] shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-250"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--md-sys-color-outline)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)]">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="todoListHeading"
                className="text-lg font-black text-[var(--md-sys-color-on-surface)]"
              >
                To Do List
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {activeCount} remaining {activeCount === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] placeholder-[var(--md-sys-color-on-surface-variant)]/60"
          />
          <button
            id="todoAdd"
            type="submit"
            title="Add task"
            className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 select-none">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo Items List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 custom-scrollbar">
          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--md-sys-color-primary)]/40 mb-2" />
              <p>No tasks in this view</p>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]/60 mt-1">
                Enjoy your day!
              </span>
            </div>
          ) : (
            filteredTodos.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 hover:border-[var(--md-sys-color-primary)]/40 transition-all shadow-xs"
              >
                <div
                  onClick={() => onToggleTodo(item.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    className="text-[var(--md-sys-color-primary)] shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-[var(--md-sys-color-primary-container)]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-sm break-words transition-all ${
                      item.completed
                        ? 'line-through text-[var(--md-sys-color-on-surface-variant)]/60 italic'
                        : 'text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteTodo(item.id)}
                  title="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {todos.some((t) => t.completed) && (
          <div className="pt-3 border-t border-[var(--md-sys-color-outline)]/40 flex justify-end">
            <button
              onClick={onClearCompleted}
              className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
            >
              Clear completed tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
