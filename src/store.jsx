import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { request } from './api';
const Context = createContext();
export const useApp = () => useContext(Context);
export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const lock = useRef(false);
  async function refresh() {
    const version = ++generation.current;
    setLoading(true);
    setError('');
    setLoadFailed(false);
    try {
      const result = await request('/session');
      if (version === generation.current) setSession(result);
    } catch (e) {
      if (version === generation.current) {
        setSession(null);
        if (e.status !== 401) {
          setError(e.message);
          setLoadFailed(true);
        }
      }
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    return () => {
      generation.current++;
    };
  }, []);
  async function authenticate(mode, credentials) {
    const result = await request(`/auth/${mode}`, 'POST', credentials);
    generation.current++;
    setSession(result);
    setError('');
  }
  async function logout() {
    await request('/auth/logout', 'POST', {});
    generation.current++;
    setSession(null);
  }
  async function mutate(kind, value, id, remove = false, requestId) {
    if (lock.current) throw new Error('Please wait for the current change to finish.');
    lock.current = true;
    setBusy(true);
    const version = generation.current;
    try {
      const result = await request(
        `/data/${kind}${id ? `/${encodeURIComponent(id)}` : ''}`,
        remove ? 'DELETE' : id || kind === 'profile' ? 'PUT' : 'POST',
        remove ? {} : value,
        session.user.id,
        requestId,
      );
      if (version === generation.current)
        setSession((old) => (old ? { ...old, data: result.data } : old));
    } catch (e) {
      if (e.status === 401) {
        generation.current++;
        setSession(null);
        setError(e.message);
      }
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        user: session?.user,
        data: session?.data,
        loading,
        loadFailed,
        error,
        busy,
        refresh,
        authenticate,
        logout,
        mutate,
      }}
    >
      {children}
    </Context.Provider>
  );
}
