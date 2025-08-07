import React, { createContext, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

export type GlobalFilters = {
  project: string;
  category: string;
  level: string; // can be 'critical-high' or a single level
  status: string;
  search: string;
};

type GlobalFilterContextType = {
  filters: GlobalFilters;
  setFilter: (key: keyof GlobalFilters, value: string) => void;
  setFilters: (updates: Partial<GlobalFilters>) => void;
  clearFilters: (options?: { preserve?: (keyof GlobalFilters)[] }) => void;
  buildSearchString: (overrides?: Partial<GlobalFilters>) => string;
};

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const parseFilters = (): GlobalFilters => ({
    project: searchParams.get('project') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  });

  const filters = parseFilters();

  const setFilter = (key: keyof GlobalFilters, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      // special case: combined critical-high
      if (key === 'level' && value === 'critical-high') {
        next.set('level', 'Crítico,Alto');
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  const setFilters = (updates: Partial<GlobalFilters>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      const key = k as keyof GlobalFilters;
      const value = v as string | undefined;
      if (!value || value === 'all') {
        next.delete(key);
      } else {
        if (key === 'level' && value === 'critical-high') {
          next.set('level', 'Crítico,Alto');
        } else {
          next.set(key, value);
        }
      }
    });
    setSearchParams(next);
  };

  const clearFilters = (options?: { preserve?: (keyof GlobalFilters)[] }) => {
    const preserve = new Set(options?.preserve || []);
    const next = new URLSearchParams(searchParams);
    (['project', 'category', 'level', 'status', 'search'] as (keyof GlobalFilters)[]).forEach((key) => {
      if (!preserve.has(key)) next.delete(key);
    });
    setSearchParams(next);
  };

  const buildSearchString = (overrides?: Partial<GlobalFilters>) => {
    const next = new URLSearchParams(searchParams);
    if (overrides) {
      Object.entries(overrides).forEach(([k, v]) => {
        const key = k as keyof GlobalFilters;
        const value = v as string | undefined;
        if (!value || value === 'all') next.delete(key);
        else {
          if (key === 'level' && value === 'critical-high') next.set('level', 'Crítico,Alto');
          else next.set(key, value);
        }
      });
    }
    return next.toString();
  };

  return (
    <GlobalFilterContext.Provider value={{ filters, setFilter, setFilters, clearFilters, buildSearchString }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilters = () => {
  const ctx = useContext(GlobalFilterContext);
  // Provide a safe fallback tied to URL if provider is missing
  const [searchParams, setSearchParams] = useSearchParams();
  if (ctx) return ctx;

  const parseFilters = (): GlobalFilters => ({
    project: searchParams.get('project') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  });

  const setFilter = (key: keyof GlobalFilters, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else if (key === 'level' && value === 'critical-high') next.set('level', 'Crítico,Alto');
    else next.set(key, value);
    setSearchParams(next);
  };

  const setFilters = (updates: Partial<GlobalFilters>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      const key = k as keyof GlobalFilters;
      const value = v as string | undefined;
      if (!value || value === 'all') next.delete(key);
      else if (key === 'level' && value === 'critical-high') next.set('level', 'Crítico,Alto');
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const clearFilters = (options?: { preserve?: (keyof GlobalFilters)[] }) => {
    const preserve = new Set(options?.preserve || []);
    const next = new URLSearchParams(searchParams);
    (['project', 'category', 'level', 'status', 'search'] as (keyof GlobalFilters)[]).forEach((key) => {
      if (!preserve.has(key)) next.delete(key);
    });
    setSearchParams(next);
  };

  const buildSearchString = (overrides?: Partial<GlobalFilters>) => {
    const next = new URLSearchParams(searchParams);
    if (overrides) {
      Object.entries(overrides).forEach(([k, v]) => {
        const key = k as keyof GlobalFilters;
        const value = v as string | undefined;
        if (!value || value === 'all') next.delete(key);
        else if (key === 'level' && value === 'critical-high') next.set('level', 'Crítico,Alto');
        else next.set(key, value);
      });
    }
    return next.toString();
  };

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('useGlobalFilters used without provider; falling back to URL-based filters');
  }

  return {
    filters: parseFilters(),
    setFilter,
    setFilters,
    clearFilters,
    buildSearchString,
  };
};
