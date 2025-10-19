import React, { useState, useContext, useMemo } from 'react';
import type { DisplayMode } from '../types';
import { AppContext } from '../App';
import Canvas from './Canvas';
import { SettingsIcon } from './icons';

const ViewModeSelector: React.FC<{
    selectedMode: DisplayMode;
    onSelect: (mode: DisplayMode) => void;
}> = ({ selectedMode, onSelect }) => {
    const modes: DisplayMode[] = ['bw', 'color', 'disco'];

    return (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-1 rounded-full flex items-center space-x-1 shadow-lg z-10">
            {modes.map(mode => (
                <button
                    key={mode}
                    onClick={() => onSelect(mode)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 focus:outline-none ${
                        selectedMode === mode
                            ? 'bg-white text-black'
                            : 'text-white hover:bg-white/20'
                    }`}
                >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
            ))}
        </div>
    );
};

const PublicPage: React.FC = () => {
    const context = useContext(AppContext);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('bw');

    const images = useMemo(() => {
        return context?.sketches.map(s => {
            const img = new Image();
            img.src = s.url;
            return { id: s.id, img, width: s.width, height: s.height };
        }) || [];
    }, [context?.sketches]);

    if (!context) return null;
    const { sketches, settings, setView } = context;

    return (
        <div className="w-full h-full relative">
            <Canvas
                images={images}
                settings={settings}
                displayMode={displayMode}
            />
            <ViewModeSelector selectedMode={displayMode} onSelect={setDisplayMode} />
             <button
                onClick={() => setView('admin')}
                className="absolute bottom-4 left-4 bg-black/50 p-3 rounded-full hover:bg-white/20 transition-colors duration-300 z-10"
                aria-label="Admin Panel"
            >
                <SettingsIcon className="w-6 h-6 text-white" />
            </button>
        </div>
    );
};

export default PublicPage;
