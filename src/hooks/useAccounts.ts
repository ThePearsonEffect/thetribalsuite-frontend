import { useCallback, useEffect, useState } from 'react';

export type Account = {
  id: string;
  platform: 'instagram'|'facebook'|'linkedin'|'tiktok'|'youtube'|string;
  handle: string;
  displayName?: string;
  status: 'connected'|'pending'|'disconnected';
  avatar?: string;
  created_at?: string;
};

// Simple API utility for now - will be replaced with proper API client
const BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string| null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Account[]>('/api/accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e:any) {
      setError(e.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { accounts, loading, error, refresh: load, setAccounts };
}
