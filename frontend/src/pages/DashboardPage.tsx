import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, CheckCircle2, User, Plus,
  AlertTriangle, ClipboardList, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import type { TaskStatus } from '../types/task';

/* ── Filter tabs config ──────────────────────────────────────────────────────── */
const FILTERS: { value: TaskStatus | ''; label: string; dot?: string }[] = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'Todo', dot: 'bg-slate-400' },
  { value: 'in-progress', label: 'In Progress', dot: 'bg-amber-400' },
  { value: 'done', label: 'Done', dot: 'bg-emerald-400' },
];

/* ── Stat card ───────────────────────────────────────────────────────────────── */
function StatCard({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] px-4 py-3">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <div>
        <p className="text-lg font-bold text-slate-100">{count}</p>
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const {
    tasks, loading, error,
    statusFilter, setStatusFilter,
    fetchTasks, createTask, updateTask, deleteTask,
  } = useTasks();

  /* ── Computed counts for stats ── */
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  /* ── Handlers ── */
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050818]">

      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-violet-500/10 bg-[#0d1117]/90 px-6 py-4 backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet">
            <CheckCircle2 size={18} color="#fff" />
          </div>
          <span className="text-gradient text-lg font-extrabold">TaskManager</span>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <User size={14} />
            <span>{user?.name}</span>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-400 transition hover:bg-violet-500/20 hover:text-violet-300"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      {/* ════════════════════ MAIN ════════════════════ */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">

        {/* ── Page heading + CTA ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">
              My Tasks
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} {statusFilter ? `· ${FILTERS.find(f => f.value === statusFilter)?.label}` : 'total'}
            </p>
          </div>
          <button
            id="new-task-btn"
            onClick={() => setShowModal(true)}
            className="flex cursor-pointer items-center gap-2 self-start rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-violet transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-violet-lg sm:self-auto"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* ── Stat bar ── */}
        {!loading && !error && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatCard label="Todo" count={todoCount} dot="bg-slate-400" />
            <StatCard label="In Progress" count={inProgressCount} dot="bg-amber-400" />
            <StatCard label="Done" count={doneCount} dot="bg-emerald-400" />
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-xl border border-slate-800 bg-[#111827] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value as TaskStatus | '')}
              className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${statusFilter === f.value
                  ? 'bg-violet-600 text-white shadow-violet'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              {f.dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${f.dot}`} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* ════ LOADING STATE ════ */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
            <div className="h-10 w-10 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin-fast" />
            <p className="text-sm">Loading tasks...</p>
          </div>
        )}

        {/* ════ ERROR STATE ════ */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 py-16 text-center">
            <AlertTriangle size={36} className="text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Failed to load tasks</p>
              <p className="mt-1 text-sm text-slate-400">{error}</p>
            </div>
            <button
              onClick={() => fetchTasks()}
              className="flex items-center gap-2 rounded-xl border border-red-400/25 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* ════ EMPTY STATE ════ */}
        {!loading && !error && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <ClipboardList size={36} className="text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-slate-200">
                {statusFilter ? `No "${FILTERS.find(f => f.value === statusFilter)?.label}" tasks` : 'No tasks yet'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {statusFilter
                  ? 'Try a different filter or create a new task.'
                  : 'Click "New Task" to add your first one.'}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600/20 px-4 py-2 text-sm font-semibold text-violet-400 ring-1 ring-violet-500/25 transition hover:bg-violet-600/30"
            >
              <Plus size={14} /> Create a task
            </button>
          </div>
        )}

        {/* ════ TASK GRID ════ */}
        {!loading && !error && tasks.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* ════ CREATE MODAL ════ */}
      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreate={async (payload) => {
            await createTask(payload);
          }}
        />
      )}
    </div>
  );
}
