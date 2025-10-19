
import React, { useState, createContext, useCallback, useMemo, useEffect } from 'react';
import type { Sketch, Settings } from './types';
import { INITIAL_SETTINGS, INITIAL_SKETCHES } from './constants';
import PublicPage from './components/PublicPage';
import AdminPage from './components/AdminPage';

interface AppContextType {
  sketches: Sketch[];
  addSketch: (sketch: Sketch) => void;
  deleteSketch: (id: string) => void;
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  setView: (view: 'public' | 'admin') => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const SKETCHES_STORAGE_KEY = 'skitzeria_sketches';

const App: React.FC = () => {
  const [sketches, setSketches] = useState<Sketch[]>(() => {
    try {
      const storedSketches = window.localStorage.getItem(SKETCHES_STORAGE_KEY);
      if (storedSketches) {
        return JSON.parse(storedSketches);
      }
    } catch (error) {
      console.error("Failed to parse sketches from localStorage", error);
    }
    return INITIAL_SKETCHES;
  });

  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [view, setView] = useState<'public' | 'admin'>('public');

  useEffect(() => {
    try {
      window.localStorage.setItem(SKETCHES_STORAGE_KEY, JSON.stringify(sketches));
    } catch (error) {
      console.error("Failed to save sketches to localStorage", error);
    }
  }, [sketches]);

  const addSketch = useCallback((sketch: Sketch) => {
    setSketches(prev => [...prev, sketch]);
  }, []);

  const deleteSketch = useCallback((id: string) => {
    setSketches(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  const contextValue = useMemo(() => ({
    sketches,
    addSketch,
    deleteSketch,
    settings,
    updateSettings,
    setView,
  }), [sketches, addSketch, deleteSketch, settings, updateSettings]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="w-screen h-screen bg-black">
        {view === 'public' ? <PublicPage /> : <AdminPage />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
