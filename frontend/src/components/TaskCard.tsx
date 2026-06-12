import { useState } from 'react';
import {
  Trash2, ChevronDown, Calendar, Clock,
  CheckCircle2, Circle, Loader2, Pencil, Check, X,
} from 'lucide-react';
import type { Task, TaskStatus, UpdateTaskPayload } from '../types/task';

interface Props {
  task: Task;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  onDelete: (id: string) => Promise<void>;
}

/* ── Status config ──────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; ring: string; bg: string; text: string }> = {
  'todo': {
    label: 'Todo',
    dot: 'bg-slate-400',
    ring: 'border-slate-400/30',
    bg: 'bg-slate-400/10',
    text: 'text-slate-300',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-amber-400',
    ring: 'border-amber-400/30',
    bg: 'bg-amber-400/10',
    text: 'text-amber-300',
  },
  'done': {
    label: 'Done',
    dot: 'bg-emerald-400',
    ring: 'border-emerald-400/30',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-300',
  },
};

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'done'];

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const isPast = d < now;
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return { label, isPast };
}

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editSaving, setEditSaving] = useState(false);

  const cfg = STATUS_CONFIG[task.status];
  const due = formatDate(task.dueDate);
  const isDone = task.status === 'done';

  /* ── Change status ─────────────────────────────────────────────────────── */
  const handleStatusChange = async (next: TaskStatus) => {
    setStatusOpen(false);
    if (next === task.status) return;
    setStatusLoading(true);
    try { await onUpdate(task._id, { status: next }); }
    finally { setStatusLoading(false); }
  };

  /* ── Delete ────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(task._id); }
    finally { setDeleting(false); }
  };

  /* ── Inline title edit ─────────────────────────────────────────────────── */
  const commitEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === task.title) { cancelEdit(); return; }
    setEditSaving(true);
    try { await onUpdate(task._id, { title: trimmed }); setEditing(false); }
    finally { setEditSaving(false); }
  };

  const cancelEdit = () => { setEditTitle(task.title); setEditing(false); };

  return (
    <div className={`group relative rounded-2xl border bg-[#111827] p-5 transition-all duration-200 hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-500/5 ${isDone ? 'border-emerald-500/15 opacity-75' : 'border-slate-800'}`}>

      {/* ── Top row: status pill + actions ── */}
      <div className="mb-3 flex items-center justify-between gap-2">

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen((v) => !v)}
            disabled={statusLoading}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${cfg.bg} ${cfg.ring} ${cfg.text}`}
          >
            {statusLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
            {cfg.label}
            <ChevronDown size={11} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
          </button>

          {statusOpen && (
            <>
              {/* Click-away */}
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[130px] overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117] shadow-xl">
                {STATUS_OPTIONS.map((s) => {
                  const c = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-slate-800 ${s === task.status ? 'text-violet-400' : 'text-slate-300'}`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {c.label}
                      {s === task.status && <Check size={11} className="ml-auto text-violet-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Action buttons (always visible on mobile, hover on desktop) */}
        <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          {/* Edit toggle */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              title="Edit title"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-violet-400"
            >
              <Pencil size={14} />
            </button>
          )}
          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete task"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed"
          >
            {deleting
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Title (editable) ── */}
      {editing ? (
        <div className="mb-2 flex items-center gap-2">
          <input
            autoFocus
            value={editTitle}
            maxLength={120}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="flex-1 rounded-lg border border-violet-500/40 bg-[#1a2235] px-3 py-1.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            onClick={commitEdit}
            disabled={editSaving}
            className="rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-400/10 disabled:opacity-50"
          >
            {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button
            onClick={cancelEdit}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <h3
          className={`mb-2 cursor-pointer text-sm font-semibold leading-snug text-slate-100 transition hover:text-violet-300 ${isDone ? 'line-through text-slate-400' : ''}`}
          onClick={() => setEditing(true)}
          title="Click to edit title"
        >
          {task.title}
        </h3>
      )}

      {/* ── Description ── */}
      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {task.description}
        </p>
      )}

      {/* ── Footer: done check + due date ── */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5">
          {isDone
            ? <CheckCircle2 size={13} className="text-emerald-400" />
            : <Circle size={13} className="text-slate-600" />}
          <span className="text-[11px] text-slate-500">
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {due && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${due.isPast && !isDone ? 'text-red-400' : 'text-slate-500'}`}>
            <Calendar size={11} />
            {due.isPast && !isDone ? <Clock size={10} /> : null}
            {due.label}
          </div>
        )}
      </div>
    </div>
  );
}
