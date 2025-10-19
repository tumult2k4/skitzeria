
import React, { useState } from 'react';
import SketchManager from './SketchManager';
import SettingsEditor from './SettingsEditor';

type Tab = 'sketches' | 'settings';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('sketches');

    return (
        <div className="flex flex-col h-screen p-4 pt-20">
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex border-b border-gray-700">
                    <TabButton
                        label="Sketch Management"
                        isActive={activeTab === 'sketches'}
                        onClick={() => setActiveTab('sketches')}
                    />
                    <TabButton
                        label="Display Settings"
                        isActive={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </div>
            </div>

            <div className="flex-grow w-full max-w-5xl mx-auto mt-6 overflow-y-auto">
                {activeTab === 'sketches' && <SketchManager />}
                {activeTab === 'settings' && <SettingsEditor />}
            </div>
        </div>
    );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            isActive
                ? 'border-b-2 border-indigo-500 text-white'
                : 'text-gray-400 hover:text-white'
        }`}
    >
        {label}
    </button>
);

export default AdminDashboard;
