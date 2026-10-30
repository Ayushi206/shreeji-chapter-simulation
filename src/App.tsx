import { lazy, Suspense, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

const Deck = lazy(() => import('./deck/Deck'));
const Practice = lazy(() => import('./pages/Practice'));
const Progress = lazy(() => import('./pages/Progress'));

function Loading() {
  return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
}

const page = (el: ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* The lesson: full screen, tap right → next, tap left → previous */}
        <Route index element={<Navigate to="/play" replace />} />
        <Route path="play/:n?" element={page(<Deck />)} />

        {/* Practice quiz and progress dashboard, opened from the lesson's Contents */}
        <Route element={<Layout />}>
          <Route path="practice" element={page(<Practice />)} />
          <Route path="progress" element={page(<Progress />)} />
        </Route>
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </HashRouter>
  );
}
