'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const WorkspaceContext = createContext({
  workspaces: [],
  activeWorkspaceId: null,
  activeWorkspace: null,
  loading: true,
  error: null,
  setActiveWorkspaceId: () => {},
  refreshWorkspaces: () => {},
  createWorkspace: () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export default function WorkspaceProvider({ children }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Falha ao carregar workspaces');
      const data = await res.json();
      setWorkspaces(data);

      // Restore or select first workspace
      const saved = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
      const found = data.find(w => w.id === saved);
      if (found) {
        setActiveWorkspaceIdState(found.id);
      } else if (data.length > 0) {
        setActiveWorkspaceIdState(data[0].id);
        localStorage.setItem('activeWorkspaceId', data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkspaces();
    } else if (status === 'unauthenticated') {
      setWorkspaces([]);
      setActiveWorkspaceIdState(null);
      setLoading(false);
    }
  }, [status, fetchWorkspaces]);

  const setActiveWorkspaceId = useCallback((id) => {
    setActiveWorkspaceIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWorkspaceId', id);
    }
  }, []);

  const createWorkspace = useCallback(async (name) => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao criar workspace');
    }
    const ws = await res.json();
    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    return ws;
  }, [setActiveWorkspaceId]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      loading,
      error,
      setActiveWorkspaceId,
      refreshWorkspaces: fetchWorkspaces,
      createWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
