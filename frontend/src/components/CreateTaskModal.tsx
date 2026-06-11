import { useState, useRef, useEffect, type FormEvent } from 'react';
import { X, Plus, Calendar, AlignLeft, Tag } from 'lucide-react';
import type { TaskStatus, CreateTaskPayload } from '../types/task';

interface Props {
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function CreateTaskModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on open
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        dueDate: dueDate || null,
      });
      onClose();
    } catch {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-violet-500/15 bg-[#0d1117] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-violet-400" />
            <h2 className="font-bold text-slate-100">New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <p className="rounded-lg border border-red-400/25 bg-red-400/8 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Tag size={11} /> Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              maxLength={120}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => { setError(''); setTitle(e.target.value); }}
              className="w-full rounded-xl border border-violet-500/15 bg-[#1a2235] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <AlignLeft size={11} /> Description
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full resize-none rounded-xl border border-violet-500/15 bg-[#1a2235] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
            />
          </div>

          {/* Status + Due Date row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Tag size={11} /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full cursor-pointer rounded-xl border border-violet-500/15 bg-[#1a2235] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Calendar size={11} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-violet-500/15 bg-[#1a2235] px-3 py-2.5 text-sm text-slate-100 outline-none transition [color-scheme:dark] focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-violet transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
                : <><Plus size={14} /> Create Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
