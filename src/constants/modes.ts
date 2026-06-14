import type { CaptureMode } from '@/src/types';

export interface CaptureModeConfig {
  mode: CaptureMode;
  title: string;
  subtitle: string;
  instructions: string;
  tip: string;
  icon: 'phone-portrait-outline' | 'hardware-chip-outline' | 'battery-charging-outline';
}

export const CAPTURE_MODES: Record<CaptureMode, CaptureModeConfig> = {
  back: {
    mode: 'back',
    title: 'Back of Phone',
    subtitle: 'Capture or upload the rear panel',
    instructions:
      'Frame the whole back panel and make sure the fine-print regulatory text (model number, certification marks) is sharp and readable.',
    tip: 'Tip: Angle the phone to avoid glare, and make sure the model code line is in focus.',
    icon: 'phone-portrait-outline',
  },
  board: {
    mode: 'board',
    title: 'Motherboard',
    subtitle: 'Supplementary signal: silkscreen + chip markings',
    instructions:
      'Photograph the board silkscreen text and the printed markings on the main chips. This helps confirm the model when the back panel is unclear.',
    tip: 'Tip: Use a bright, even light and get close enough that chip text is legible.',
    icon: 'hardware-chip-outline',
  },
  battery: {
    mode: 'battery',
    title: 'Battery Label',
    subtitle: 'Most reliable identification source',
    instructions:
      'Capture the full battery label, including the model/part number and barcode area. Battery labels are the most reliable source for exact model matching.',
    tip: 'Tip: Flatten the label, avoid shadows, and make sure the printed code is in focus.',
    icon: 'battery-charging-outline',
  },
};

export const CAPTURE_MODE_ORDER: CaptureMode[] = ['back', 'board', 'battery'];
