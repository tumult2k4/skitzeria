import React, { useContext } from 'react';
import { AppContext } from '../App';
import type { Settings, DisplayMode } from '../types';
import { TrashIcon } from './icons';

const SettingsEditor: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) return null;
    const { settings, updateSettings } = context;
    const modes: DisplayMode[] = ['bw', 'color', 'disco'];

    const handleSettingChange = (mode: DisplayMode, path: string, value: any) => {
        // A bit of a hack to do deep updates immutably
        const newSettings = JSON.parse(JSON.stringify(settings));
        
        let current = newSettings;
        const keys = path.split('.');
        
        // This part navigates the path, e.g., "colorPalettes.color"
        for (let i = 0; i < keys.length - 1; i++) {
             if (current[keys[i]] === undefined) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        // This sets the final value, e.g., "background" = "#fff"
        current[keys[keys.length - 1]] = value;
        
        updateSettings(newSettings);
    };

    const handleSketchColorChange = (index: number, newColor: string) => {
        const newColors = [...(settings.colorPalettes.color.sketchColors || [])];
        newColors[index] = newColor;
        handleSettingChange('color', `colorPalettes.color.sketchColors`, newColors);
    };

    const addSketchColor = () => {
        const newColors = [...(settings.colorPalettes.color.sketchColors || []), '#ffffff'];
        handleSettingChange('color', `colorPalettes.color.sketchColors`, newColors);
    };

    const removeSketchColor = (index: number) => {
        const newColors = (settings.colorPalettes.color.sketchColors || []).filter((_, i) => i !== index);
        handleSettingChange('color', `colorPalettes.color.sketchColors`, newColors);
    };


    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Display Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modes.map(mode => (
                    <div key={mode} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-semibold text-indigo-400 capitalize mb-4">{settings.colorPalettes[mode].name}</h3>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-300">Color Palette</h4>
                            <ColorInput
                                label="Background"
                                value={settings.colorPalettes[mode].background}
                                onChange={(e) => handleSettingChange(mode, `colorPalettes.${mode}.background`, e.target.value)}
                            />
                            {mode !== 'color' && <ColorInput
                                label="Foreground"
                                value={settings.colorPalettes[mode].foreground}
                                onChange={(e) => handleSettingChange(mode, `colorPalettes.${mode}.foreground`, e.target.value)}
                            />}

                            {mode === 'color' && (
                                <>
                                    <h4 className="font-medium text-gray-300 pt-4">Sketch Colors</h4>
                                    <div className="space-y-2">
                                    {(settings.colorPalettes.color.sketchColors || []).map((color, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <ColorInput label={`Color ${index + 1}`} value={color} onChange={(e) => handleSketchColorChange(index, e.target.value)} />
                                            <button onClick={() => removeSketchColor(index)} className="p-2 text-gray-400 hover:text-red-500">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                    <button onClick={addSketchColor} className="text-sm text-indigo-400 hover:text-indigo-300 pt-2">+ Add Color</button>
                                </>
                            )}

                            {mode === 'disco' && settings.colorPalettes.disco.gradientPresets && (
                                 <>
                                    <h4 className="font-medium text-gray-300 pt-4">Background Gradient</h4>
                                     <SelectInput
                                        label="Preset"
                                        value={settings.colorPalettes.disco.activeGradientPreset || ''}
                                        onChange={(e) => handleSettingChange('disco', 'colorPalettes.disco.activeGradientPreset', e.target.value)}
                                     >
                                        {Object.keys(settings.colorPalettes.disco.gradientPresets).map(presetName => (
                                            <option key={presetName} value={presetName}>{presetName}</option>
                                        ))}
                                     </SelectInput>
                                 </>
                            )}

                            <h4 className="font-medium text-gray-300 mt-6">Animation</h4>
                            <CheckboxInput
                                label="Enabled"
                                checked={settings.animationSettings[mode].enabled}
                                onChange={(e) => handleSettingChange(mode, `animationSettings.${mode}.enabled`, e.target.checked)}
                            />
                            {settings.animationSettings[mode].enabled && (
                                <>
                                    <RangeInput
                                        label="Speed"
                                        value={settings.animationSettings[mode].speed ?? 1}
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        onChange={(e) => handleSettingChange(mode, `animationSettings.${mode}.speed`, parseFloat(e.target.value))}
                                    />
                                    <RangeInput
                                        label="Intensity"
                                        value={settings.animationSettings[mode].intensity ?? 1}
                                        min={0.1}
                                        max={2}
                                        step={0.1}
                                        onChange={(e) => handleSettingChange(mode, `animationSettings.${mode}.intensity`, parseFloat(e.target.value))}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Helper components for inputs
const ColorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">{label}</label>
        <div className="flex items-center gap-2">
            <input type="text" className="w-24 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded" value={props.value} onChange={props.onChange}/>
            <input type="color" {...props} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
        </div>
    </div>
);

const CheckboxInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
     <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...props} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

const RangeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, value, ...props }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">{label}</label>
        <div className="flex items-center gap-4">
             <input type="range" {...props} value={value} className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
             <span className="text-sm text-gray-300 w-8 text-right">{value}</span>
        </div>
    </div>
);

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">{label}</label>
        <select {...props} className="px-2 py-1 text-sm text-white bg-gray-700 border border-gray-600 rounded">
            {children}
        </select>
    </div>
);


export default SettingsEditor;
