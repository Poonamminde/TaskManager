import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string })?.message ??
          'Login failed. Please try again.';
        setError(msg);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left hero panel ── */}
      <HeroPanel />

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-[#0d1117] px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">

          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet">
              <CheckCircle2 size={24} color="#fff" />
            </div>
            <span className="text-gradient text-2xl font-extrabold">TaskManager</span>
          </div>

          <h1 className="mb-1 text-center text-3xl font-extrabold text-slate-50">Welcome back</h1>
          <p className="mb-7 text-center text-sm text-slate-400">Sign in to manage your tasks</p>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/8 px-4 py-3 text-sm text-red-300" role="alert">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="login-email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-violet-500/15 bg-[#1a2235] py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-violet-500/15 bg-[#1a2235] py-3 pl-10 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-violet transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-violet-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
                : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Hero panel (shared across Login & Register) ─────────────────────────────── */
export function HeroPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[55%] flex-col items-center justify-center p-12 bg-gradient-to-br from-[#1e0a3c] via-[#2d1b69] to-[#1a103a]">
      {/* Radial glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-60 w-60 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      {/* Content */}
      <div className="relative z-10 max-w-sm text-center">
        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-300">
          <CheckCircle2 size={12} />
          Task Management, Simplified
        </div>

        <h2 className="mb-4 text-4xl font-extrabold leading-tight text-gradient">
          Stay on top of every task
        </h2>
        <p className="mb-10 text-slate-400 leading-relaxed">
          Organize work, track progress, and hit deadlines — all in one beautifully simple app.
        </p>

        {/* Mini kanban board */}
        <div className="flex justify-center gap-3">
          {/* Todo */}
          <div className="w-[120px] rounded-xl border border-white/8 bg-white/5 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
              Todo
            </div>
            <div className="mb-1.5 animate-float rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">Design new UI</div>
            <div className="animate-float-2 rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">Write tests</div>
          </div>
          {/* In Progress */}
          <div className="w-[120px] rounded-xl border border-white/8 bg-white/5 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-400">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
              In Progress
            </div>
            <div className="mb-1.5 animate-float-2 rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">Build APIs</div>
            <div className="animate-float-3 rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">Review PRs</div>
          </div>
          {/* Done */}
          <div className="w-[120px] rounded-xl border border-white/8 bg-white/5 p-3 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Done
            </div>
            <div className="mb-1.5 animate-float rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">Auth flow ✓</div>
            <div className="animate-float-2 rounded-lg border border-white/5 bg-white/6 px-2 py-1.5 text-[10px] text-slate-400">DB schema ✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}
