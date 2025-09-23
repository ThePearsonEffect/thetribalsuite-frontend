// src/App.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccounts } from '@/hooks/useAccounts';

// ---------- API base ----------
export const BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');

// Small helper for POST
async function postJSON<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const txt = await res.text();
  let json: any = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  if (!res.ok) throw new Error((json && (json.error || json.message)) || res.statusText);
  return json as T;
}

// ---------- Theme Toggle ----------
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('tts_theme') as 'light' | 'dark') || 'light'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tts_theme', theme);
  }, [theme]);

  return (
    <button
      className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}

// ---------- Connect Modal (creates pending + starts OAuth) ----------
type ConnectModalProps = {
  onClose: () => void;
};
function ConnectModal({ onClose }: ConnectModalProps) {
  const [platform, setPlatform] = useState<'Instagram' | 'Facebook' | 'LinkedIn' | 'TikTok' | 'YouTube'>('Instagram');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const provider = useMemo(() => {
    switch (platform) {
      case 'Instagram': return 'meta';     // we use 'meta' for FB/IG OAuth
      case 'Facebook':  return 'meta';
      case 'LinkedIn':  return 'linkedin';
      case 'TikTok':    return 'tiktok';
      case 'YouTube':   return 'google';
      default:          return 'unknown';
    }
  }, [platform]);

  async function onConnect() {
    setSubmitting(true);
    try {
      if (!username.trim()) throw new Error('Please enter a username/handle');

      // 1) create a pending account on backend
      const created = await postJSON<{ id: string }>('/api/accounts', {
        platform: platform.toLowerCase(), // backend expects lowercase platform name
        username,
        displayName: displayName || username,
      });

      if (provider === 'unknown') throw new Error('Unsupported provider');

      // 2) start OAuth with provider; backend will redirect back to /auth/callback
      window.location.href = `${BASE}/auth/${provider}/start?accountId=${created.id}`;
    } catch (err: any) {
      alert(err.message || 'Failed to connect');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 dark:text-white">
        <h2 className="mb-4 text-xl font-semibold">Connect a social account</h2>

        <label className="mb-2 block text-sm">Platform</label>
        <select
          className="mb-3 w-full rounded-md border bg-background p-2"
          value={platform}
          onChange={e => setPlatform(e.target.value as any)}
        >
          <option>Instagram</option>
          <option>Facebook</option>
          <option>LinkedIn</option>
          <option>TikTok</option>
          <option>YouTube</option>
        </select>

        <label className="mb-2 block text-sm">Username / Handle</label>
        <input
          className="mb-3 w-full rounded-md border bg-background p-2"
          placeholder="@yourhandle or page name"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label className="mb-2 block text-sm">Display Name (optional)</label>
        <input
          className="mb-4 w-full rounded-md border bg-background p-2"
          placeholder="Shown in the dashboard"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-3 py-2">Cancel</button>
          <button
            onClick={onConnect}
            disabled={submitting}
            className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black"
          >
            {submitting ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Auth Callback (refreshes and routes back) ----------
function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAccounts();

  useEffect(() => {
    (async () => {
      // optional: show status to user with a toast system if you have one
      const status = params.get('status'); // 'ok'|'error' (if backend adds it)
      const error = params.get('error');

      try {
        // In our backend, we already finalize the token on callback and then redirect to FE.
        // Here we just refresh the accounts to show the new "connected" account.
        await refresh();
        if (status === 'error') alert(error || 'Authorization failed');
      } catch (e: any) {
        alert(e.message || 'Callback handling failed');
      } finally {
        navigate('/accounts', { replace: true });
      }
    })();
  }, [params, refresh, navigate]);

  return (
    <div className="p-6 text-center">
      <p>Completing authorization…</p>
    </div>
  );
}

// ---------- Pages ----------
function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of your automation performance.</p>
    </div>
  );
}

function AccountsPage() {
  const { accounts, loading, error, refresh } = useAccounts();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => refresh()}>
            Refresh
          </button>
          <button
            className="rounded-md bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
            onClick={() => setShowModal(true)}
          >
            + Connect
          </button>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a: any) => (
          <div key={a.id} className="rounded-xl border p-4 dark:border-neutral-700">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                {a.avatar ? (
                  <img src={a.avatar} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="font-medium">{a.displayName || a.handle}</div>
                <div className="text-xs text-muted-foreground">
                  {a.platform} • {a.status || 'connected'}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={`${BASE}/api/accounts/${a.id}/token-status`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
              >
                Token status
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && <ConnectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function PostsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Posts</h1>
      <p className="text-sm text-muted-foreground">Schedule and manage your content.</p>
    </div>
  );
}

function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Calendar</h1>
      <p className="text-sm text-muted-foreground">See your scheduled queue at a glance.</p>
    </div>
  );
}

// ---------- Layout ----------
function Shell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="mx-auto flex max-w-6xl items-center gap-4 p-4">
          <div className="text-lg font-semibold">The Tribal Suite</div>
          <nav className="ml-6 flex gap-2 text-sm">
            <Tab to="/">Dashboard</Tab>
            <Tab to="/accounts">Accounts</Tab>
            <Tab to="/posts">Posts</Tab>
            <Tab to="/calendar">Calendar</Tab>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground dark:border-neutral-800">
        © {new Date().getFullYear()} The Tribal Suite
      </footer>
    </div>
  );
}

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-1 hover:bg-accent ${isActive ? 'bg-accent font-medium' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
