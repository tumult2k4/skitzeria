import type { Sketch, Settings } from './types';

const createSvgUrl = (svgContent: string): string => {
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

export const INITIAL_SKETCHES: Sketch[] = [
  { id: '1', url: createSvgUrl(`<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><path d="M100 100 Q 250 50 400 100 T 400 400" stroke="black" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`), width: 500, height: 500 },
  { id: '2', url: createSvgUrl(`<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="300" r="150" stroke="black" stroke-width="5" fill="none"/><line x1="200" y1="150" x2="200" y2="450" stroke="black" stroke-width="5"/></svg>`), width: 400, height: 600 },
  { id: '3', url: createSvgUrl(`<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="50" width="500" height="300" stroke="black" stroke-width="5" fill="none" rx="20"/></svg>`), width: 600, height: 400 },
  { id: '4', url: createSvgUrl(`<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><path d="M50,250 C50,100 200,100 250,250 S450,400 450,250" stroke="black" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`), width: 500, height: 500 },
  { id: '5', url: createSvgUrl(`<svg width="550" height="550" viewBox="0 0 550 550" xmlns="http://www.w3.org/2000/svg"><polygon points="275,50 450,450 100,450" stroke="black" stroke-width="5" fill="none"/></svg>`), width: 550, height: 550 },
  { id: '6', url: createSvgUrl(`<svg width="450" height="450" viewBox="0 0 450 450" xmlns="http://www.w3.org/2000/svg"><path d="M100,350 L150,100 L200,350 L250,100 L300,350 L350,100" stroke="black" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`), width: 450, height: 450 },
];

export const INITIAL_SETTINGS: Settings = {
  colorPalettes: {
    bw: {
      name: "Black & White",
      background: "#FFFFFF",
      foreground: "#000000",
      accent: "#808080",
      description: "Pure monochrome look for original sketches.",
    },
    color: {
      name: "Colorized",
      background: "#000000",
      foreground: "#222222",
      sketchColors: ['#ff0055', '#0099ff', '#ffaa00', '#00ff88', '#e52e71'],
      accent: "#ffaa00",
      description: "Soft neutral background with vibrant, random colors for each sketch.",
    },
    disco: {
      name: "Disco Mode",
      background: "#000000",
      foreground: "#FFFFFF",
      accent: "#00ffc3",
      activeGradientPreset: 'Synthwave',
      gradientPresets: {
        "Synthwave": { type: "hueCycle", colors: ["#ff0080", "#ff8a00", "#40c9ff", "#00ff8f"], speed: 10 },
        "Ocean": { type: "hueCycle", colors: ["#007adf", "#00ffc3", "#00aaff", "#0055ff"], speed: 8 },
        "Forest": { type: "hueCycle", colors: ["#00ff8f", "#8fbc8f", "#3cb371", "#2e8b57"], speed: 5 }
      },
      description: "Animated color gradients with a dancing party vibe.",
    },
  },
  animationSettings: {
    bw: { enabled: false },
    color: { enabled: false },
    disco: {
      enabled: true,
      effect: "pulseGlow",
      speed: 1.5,
      intensity: 0.8,
      backgroundMotion: true,
    },
  },
};