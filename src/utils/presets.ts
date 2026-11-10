import { BackgroundSettings } from '../types/editor.types';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'gradient' | 'solid' | 'abstract' | 'minimal';
  settings: BackgroundSettings;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'purple-nebula',
    name: 'Purple Nebula',
    category: 'gradient',
    settings: {
      type: 'gradient',
      color: '#1e1035',
      gradient: {
        start: '#7928CA',
        end: '#FF0080',
        angle: 135,
        preset: 'purple-nebula'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Horizon',
    category: 'gradient',
    settings: {
      type: 'gradient',
      color: '#081d33',
      gradient: {
        start: '#0EA5E9',
        end: '#6366F1',
        angle: 120,
        preset: 'cyber-cyan'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    category: 'gradient',
    settings: {
      type: 'gradient',
      color: '#34111d',
      gradient: {
        start: '#F43F5E',
        end: '#FB923C',
        angle: 110,
        preset: 'sunset-glow'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian',
    category: 'gradient',
    settings: {
      type: 'gradient',
      color: '#090a0f',
      gradient: {
        start: '#181A20',
        end: '#0B0C10',
        angle: 145,
        preset: 'dark-obsidian'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    category: 'gradient',
    settings: {
      type: 'gradient',
      color: '#06201b',
      gradient: {
        start: '#10B981',
        end: '#0284C7',
        angle: 130,
        preset: 'emerald-aurora'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'professional-gray',
    name: 'Pro Charcoal',
    category: 'solid',
    settings: {
      type: 'solid',
      color: '#1E222B',
      gradient: {
        start: '#252A36',
        end: '#181B22',
        angle: 180,
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'minimal-cream',
    name: 'Minimal Light',
    category: 'minimal',
    settings: {
      type: 'gradient',
      color: '#F1F5F9',
      gradient: {
        start: '#FFFFFF',
        end: '#E2E8F0',
        angle: 180,
        preset: 'minimal-cream'
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'abstract-mesh',
    name: 'Cosmic Mesh',
    category: 'abstract',
    settings: {
      type: 'gradient',
      color: '#13111C',
      gradient: {
        start: '#8B5CF6',
        end: '#EC4899',
        angle: 45,
        preset: 'abstract-mesh'
      },
      blurAmount: 20,
      opacity: 0.9,
      padding: 48
    }
  }
];
