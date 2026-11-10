import { BackgroundSettings } from '../types/editor.types';
import { MACBOOK_WALLPAPERS } from './wallpapers';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'wallpaper' | 'gradient' | 'solid' | 'abstract' | 'minimal';
  thumbnailUrl?: string;
  settings: BackgroundSettings;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // --- PREDEFINED MACBOOK / MACOS WALLPAPERS ---
  {
    id: 'mac-sonoma',
    name: 'macOS Sonoma Horizon',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.sonomaHorizon,
    settings: {
      type: 'image',
      color: '#14061F',
      gradient: { start: '#9A3412', end: '#FCD34D', angle: 135, preset: 'mac-sonoma' },
      imageUrl: MACBOOK_WALLPAPERS.sonomaHorizon,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-ventura',
    name: 'macOS Ventura Bloom',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.venturaBloom,
    settings: {
      type: 'image',
      color: '#020617',
      gradient: { start: '#F97316', end: '#EF4444', angle: 135, preset: 'mac-ventura' },
      imageUrl: MACBOOK_WALLPAPERS.venturaBloom,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-monterey',
    name: 'macOS Monterey Waves',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.montereyWaves,
    settings: {
      type: 'image',
      color: '#090514',
      gradient: { start: '#8B5CF6', end: '#3B82F6', angle: 135, preset: 'mac-monterey' },
      imageUrl: MACBOOK_WALLPAPERS.montereyWaves,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-bigsur',
    name: 'macOS Big Sur Peaks',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.bigSurSpectrum,
    settings: {
      type: 'image',
      color: '#1E3A8A',
      gradient: { start: '#3B82F6', end: '#FBBF24', angle: 135, preset: 'mac-bigsur' },
      imageUrl: MACBOOK_WALLPAPERS.bigSurSpectrum,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-mojave',
    name: 'macOS Mojave Night',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.mojaveNight,
    settings: {
      type: 'image',
      color: '#020617',
      gradient: { start: '#0B1329', end: '#172554', angle: 180, preset: 'mac-mojave' },
      imageUrl: MACBOOK_WALLPAPERS.mojaveNight,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-studio',
    name: 'Apple Studio Graphite',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.studioGraphite,
    settings: {
      type: 'image',
      color: '#1A1C22',
      gradient: { start: '#2D3139', end: '#0D0E12', angle: 180, preset: 'mac-studio' },
      imageUrl: MACBOOK_WALLPAPERS.studioGraphite,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },
  {
    id: 'mac-cupertino',
    name: 'Cupertino Clean Glass',
    category: 'wallpaper',
    thumbnailUrl: MACBOOK_WALLPAPERS.cupertinoGlass,
    settings: {
      type: 'image',
      color: '#E2E8F0',
      gradient: { start: '#FFFFFF', end: '#CBD5E1', angle: 180, preset: 'mac-cupertino' },
      imageUrl: MACBOOK_WALLPAPERS.cupertinoGlass,
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  },

  // --- MODERN ABSTRACT & GRADIENTS ---
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
        angle: 180
      },
      blurAmount: 0,
      opacity: 1,
      padding: 48
    }
  }
];
