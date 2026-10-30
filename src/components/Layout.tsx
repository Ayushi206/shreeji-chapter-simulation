import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

const TABS = [
  { to: '/practice', label: 'Practice quiz' },
  { to: '/progress', label: 'My progress' },
];

/** Shell for the screens outside the lesson: practice quiz and progress dashboard. */
export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <Link to="/play" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
            <Icon name="arrow-left" /> <span className="hidden sm:inline">Back to lesson</span>
            <span className="sm:hidden">Lesson</span>
          </Link>
          <nav className="ml-auto flex gap-1 rounded-xl bg-slate-100 p-1">
            {TABS.map((t) => (
              <NavLink key={t.to} to={t.to} className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
