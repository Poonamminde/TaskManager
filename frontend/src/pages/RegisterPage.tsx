import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HeroPanel } from './LoginPage';
import axios from 'axios';

/* ── Password strength ────────────────────────────────────────────────────────── */
type Strength = 'weak' | 'medium' | 'strong' | '';

function getStrength(pwd: string): { level: Strength; score: number } {
  if (!pwd) return { level: '', score: 0 };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { level: 'weak',   score: 1 };
  if (score <= 3) return { level: 'medium', score: 2 };
  return { level: 'strong', score: 3 };
}

const strengthMeta: Record<Strength, { label: string; color: string }> = {
  '':      { label: '',                color: 'bg-slate-700' },
  weak:    { label: 'Weak password',   color: 'bg-red-400' },
  medium:  { label: 'Medium strength', color: 'bg-orange-400' },
  strong:  { label: 'Strong password', color: 'bg-emerald-400' },
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(form.password);
  const confirmMismatch = Boolean(form.confirm && form.confirm !== form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: { msg: string }[] };
        setError(data?.errors?.[0]?.msg ?? data?.message ?? 'Registration failed. Please try again.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <HeroPanel />

      <div className="flex flex-1 items-center justify-center bg-[#0d1117] px-6 py-10">
        <div className="w-full max-w-sm animate-fade-up">

          {/* Logo */}
          <div className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet">
              <CheckCircle2 size={22} color="#fff" />
            </div>
            <span className="text-gradient text-2xl font-extrabold">TaskManager</span>
          </div>

          <h1 className="mb-1 text-center text-3xl font-extrabold text-slate-50">Create account</h1>
          <p className="mb-6 text-center text-sm text-slate-400">Start managing your tasks for free</p>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/8 px-4 py-3 text-sm text-red-300" role="alert">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="reg-name">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  maxLength={50}
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-violet-500/15 bg-[#1a2235] py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="reg-email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="reg-email"
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
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
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

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strengthMeta[strength.level].color
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">{strengthMeta[strength.level].label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400" htmlFor="reg-confirm">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#1a2235] py-3 pl-10 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 ${
                    confirmMismatch
                      ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/15'
                      : 'border-violet-500/15 focus:border-violet-500/60 focus:ring-violet-500/15'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmMismatch && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                  <AlertCircle size={11} /> Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-violet transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-violet-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
                : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
