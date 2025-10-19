export interface Sketch {
  id: string;
  url: string;
  width: number;
  height: number;
}

export type DisplayMode = 'bw' | 'color' | 'disco';

export interface BackgroundAnimation {
  type: string;
  colors: string[];
  speed: number;
}

export interface ColorPalette {
  name: string;
  background: string;
  foreground: string;
  accent: string;
  description: string;
  // For 'color' mode
  sketchColors?: string[];
  // For 'disco' mode
  gradientPresets?: Record<string, BackgroundAnimation>;
  activeGradientPreset?: string;
}

export interface AnimationSetting {
  enabled: boolean;
  effect?: string;
  speed?: number;
  intensity?: number;
  backgroundMotion?: boolean;
}

export interface Settings {
  colorPalettes: Record<DisplayMode, ColorPalette>;
  animationSettings: Record<DisplayMode, AnimationSetting>;
}
