import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle2, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050818]">
      {/* ── Navbar ── */}
      <header className="flex items-center justify-between border-b border-violet-500/10 bg-[#0d1117] px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet">
            <CheckCircle2 size={18} color="#fff" />
          </div>
          <span className="text-gradient text-lg font-extrabold">TaskManager</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User size={15} />
            <span>{user?.name}</span>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-400 transition hover:bg-violet-500/20 hover:text-violet-300"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main content placeholder ── */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-lg">
          <CheckCircle2 size={40} color="#fff" />
        </div>

        <h1 className="text-3xl font-extrabold text-gradient">
          Welcome, {user?.name?.split(' ')[0]}! 🎉
        </h1>
        <p className="text-base text-slate-400">
          Your task board is coming soon. Authentication is fully working!
        </p>
      </main>
    </div>
  );
}
