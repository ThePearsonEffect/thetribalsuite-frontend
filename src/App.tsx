import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccounts } from '@/hooks/useAccounts';
import SocialLoginPage from '@/components/SocialLoginPage';

// ---------- API base ----------
export const BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'https://thetribalsuite-backend.onrender.com';

// ---------- API base ----------

// ---------- Theme Toggle ----------
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('tts_theme') as 'light' | 'dark') || 'dark'
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

// ---------- Auth Callback (handles OAuth response) ----------
function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useAccounts();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          setStatus('error');
          setMessage(errorDescription || error || 'Authorization failed');
          return;
        }

        const code = params.get('code');
        const state = params.get('state');
        
        if (code && state) {
          setStatus('success');
          setMessage('Account connected successfully!');
          await refresh();
          setTimeout(() => {
            navigate('/accounts', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid OAuth response');
        }
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Callback handling failed');
      }
    })();
  }, [params, refresh, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <h2 className="mb-2 text-xl font-semibold">Completing Authorization</h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we connect your account...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-green-600">Success!</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-2 text-sm text-gray-500">Redirecting to accounts...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-red-600">Connection Failed</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{message}</p>
              <button
                onClick={() => navigate('/accounts')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Back to Accounts
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Pages ----------
function DashboardPage() {
  const { accounts } = useAccounts();
  const navigate = useNavigate();

  const stats = {
    connectedAccounts: accounts.length,
    contentCreated: 0,
    scheduledPosts: 0,
    publishedPosts: 0
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your social media overview.</p>
        </div>
        <button
          onClick={() => navigate('/posts')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create New Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.connectedAccounts}</p>
              <p className="text-xs text-gray-500">Across all platforms</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <span className="text-green-600 text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Content Created</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.contentCreated}</p>
              <p className="text-xs text-gray-500">Total posts created</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduledPosts}</p>
              <p className="text-xs text-gray-500">Ready to publish</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedPosts}</p>
              <p className="text-xs text-gray-500">Successfully published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connected Accounts</h2>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-gray-400 text-2xl">🔗</span>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No accounts connected</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">Connect your social media accounts to get started</p>
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Connect Account
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account: any) => (
                <div key={account.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      {account.avatar ? (
                        <img src={account.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-gray-600 text-sm">📱</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{account.displayName || account.handle}</p>
                      <p className="text-sm text-gray-500">{account.platform}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Content Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Content</h2>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <span className="text-gray-400 text-2xl">📝</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No content yet</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Create your first post to get started</p>
            <button
              onClick={() => navigate('/posts')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountsPage() {
  const { accounts, loading, error } = useAccounts();
  const navigate = useNavigate();

  const platformStats = {
    total: accounts.length,
    active: accounts.filter((a: any) => a.status === 'connected').length,
    followers: 0, // This would come from API
    platforms: new Set(accounts.map((a: any) => a.platform)).size
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Connected Accounts</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your social media accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{platformStats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{platformStats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{platformStats.followers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
              <span className="text-orange-600 text-xl">⚙️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platforms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{platformStats.platforms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connect New Account Section */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Connect New Account</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Instagram */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-white text-2xl">📷</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Instagram</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Connect your Instagram Business account</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                + Connect
              </button>
            </div>
          </div>

          {/* Facebook */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <span className="text-white text-2xl">📘</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Facebook</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Connect your Facebook Page</p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-700">
                <span className="text-white text-2xl">💼</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">LinkedIn</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Connect your LinkedIn Company Page</p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>
          </div>

          {/* YouTube */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
                <span className="text-white text-2xl">📺</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">YouTube</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Connect your YouTube Channel</p>
              <div className="text-sm text-gray-500">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts List */}
      {accounts.length > 0 && (
        <div>
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Your Connected Accounts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account: any) => (
              <div key={account.id} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    {account.avatar ? (
                      <img src={account.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-600 text-lg">📱</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{account.displayName || account.handle}</p>
                    <p className="text-sm text-gray-500">{account.platform}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      account.status === 'connected' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <span className="text-gray-400 text-2xl">🔗</span>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No accounts connected yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Connect your first social media account to get started</p>
        </div>
      )}

      {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}
    </div>
  );
}

function PostsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Create Content</h1>
      <p className="text-gray-600 dark:text-gray-400">Create and schedule your social media posts.</p>
    </div>
  );
}

function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
      <p className="text-gray-600 dark:text-gray-400">See your scheduled queue at a glance.</p>
    </div>
  );
}

// ---------- Layout ----------
function Shell() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm dark:bg-gray-800">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">TribalSuite</h1>
              <p className="text-xs text-gray-500">Social Media Hub</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 py-6">
          <div className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>📊</span>
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink
              to="/posts"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>📝</span>
              <span>Create Content</span>
            </NavLink>
            
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>📅</span>
              <span>Scheduled Posts</span>
            </NavLink>
            
            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>👥</span>
              <span>Accounts</span>
            </NavLink>
            
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>📈</span>
              <span>Analytics</span>
            </NavLink>
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <span>⚙️</span>
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Pro Features */}
        <div className="mx-4 mt-8 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <h3 className="mb-2 text-sm font-semibold text-purple-900 dark:text-purple-200">Pro Features</h3>
          <p className="mb-3 text-xs text-purple-700 dark:text-purple-300">
            Unlock advanced analytics and automation features
          </p>
          <button className="w-full rounded-md bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700">
            Upgrade Now
          </button>
        </div>

        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          Version 1.0.0
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search content, accounts..."
                  className="w-64 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                + Create Post
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Art By Tovias</p>
                  <p className="text-gray-500">tribelcoaching@gmail.com</p>
                </div>
              </div>
              
              <div className="relative">
                <button className="relative rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">🔔</span>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
                </button>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/login" element={<SocialLoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </main>
      </div>
    </div>
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