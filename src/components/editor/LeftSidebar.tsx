import React, { useRef } from 'react';
import {
  Palette,
  Laptop,
  MousePointer,
  Sparkles,
  Layers,
  Sliders,
  Volume2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { BACKGROUND_PRESETS } from '../../utils/presets';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import clsx from 'clsx';

export const LeftSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    background,
    setBackground,
    applyBackgroundPreset,
    frame,
    setFrame,
    cursorSettings,
    setCursorSettings,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setBackground({
          type: 'image',
          imageUrl: dataUrl,
          gradient: { ...background.gradient, preset: undefined }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'background', label: 'Background', icon: Palette },
    { id: 'frame', label: 'Frame', icon: Laptop },
    { id: 'cursor', label: 'Cursor & Zoom', icon: MousePointer },
    { id: 'audio', label: 'Audio', icon: Volume2 }
  ] as const;

  const macbookWallpapers = BACKGROUND_PRESETS.filter((p) => p.category === 'wallpaper');
  const otherPresets = BACKGROUND_PRESETS.filter((p) => p.category !== 'wallpaper');

  return (
    <aside className="w-80 border-r border-card-border/80 bg-card/60 backdrop-blur-md flex flex-col h-full select-none">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-card-border/60 p-2 gap-1 bg-secondary/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-medium transition-all gap-1',
                isActive
                  ? 'bg-card text-white shadow-sm border border-card-border text-accent-purple'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary'
              )}
            >
              <Icon className={clsx('w-4 h-4', isActive ? 'text-accent-purple' : 'text-text-subtle')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: BACKGROUND */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            {/* 1. Predefined MacBook Wallpapers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-accent-sky" />
                  <span>MacBook Wallpapers</span>
                </label>
                <span className="text-[10px] text-accent-sky font-medium">Apple Themes</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {macbookWallpapers.map((p) => {
                  const isSelected = background.gradient.preset === p.id || background.imageUrl === p.settings.imageUrl;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyBackgroundPreset(p.id)}
                      className={clsx(
                        'flex flex-col rounded-xl border text-left overflow-hidden transition-all group',
                        isSelected
                          ? 'border-accent-purple ring-2 ring-accent-purple bg-secondary shadow-md'
                          : 'border-card-border hover:border-card-border/80 hover:bg-secondary/60'
                      )}
                    >
                      <div className="w-full aspect-video bg-black/40 overflow-hidden relative">
                        {p.thumbnailUrl && (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-1.5 bg-secondary/80">
                        <span className="text-[10px] font-medium text-text-primary line-clamp-1">
                          {p.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Upload Custom Image Wallpaper */}
            <div className="pt-2 border-t border-card-border/60">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-card-border hover:border-accent-purple hover:bg-secondary/70 flex items-center justify-center gap-2 text-xs font-medium text-text-primary transition-all"
              >
                <Upload className="w-4 h-4 text-accent-purple" />
                <span>Upload Custom Wallpaper</span>
              </button>
            </div>

            {/* 3. Gradient Presets */}
            <div className="pt-2 border-t border-card-border/60">
              <label className="text-xs font-semibold text-text-primary block mb-2">Designer Gradients</label>
              <div className="grid grid-cols-2 gap-2">
                {otherPresets.map((p) => {
                  const isSelected = background.gradient.preset === p.id && background.type !== 'image';
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyBackgroundPreset(p.id)}
                      className={clsx(
                        'flex items-center gap-2 p-2 rounded-xl border text-left transition-all',
                        isSelected
                          ? 'border-accent-purple ring-1 ring-accent-purple bg-secondary'
                          : 'border-card-border hover:border-card-border/80 hover:bg-secondary/60'
                      )}
                    >
                      <div
                        className="w-5 h-5 rounded-lg shrink-0 shadow-sm"
                        style={{
                          background:
                            p.settings.type === 'gradient'
                              ? `linear-gradient(${p.settings.gradient.angle}deg, ${p.settings.gradient.start}, ${p.settings.gradient.end})`
                              : p.settings.color
                        }}
                      />
                      <span className="text-[11px] font-medium text-text-primary truncate">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Gradient Colors */}
            <div className="space-y-3 pt-3 border-t border-card-border/60">
              <label className="text-xs font-semibold text-text-primary block">Custom Gradient</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-secondary p-2 rounded-xl border border-card-border">
                  <input
                    type="color"
                    value={background.gradient.start}
                    onChange={(e) =>
                      setBackground({
                        type: 'gradient',
                        gradient: { ...background.gradient, start: e.target.value }
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[11px] font-mono text-text-muted uppercase">
                    {background.gradient.start}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-secondary p-2 rounded-xl border border-card-border">
                  <input
                    type="color"
                    value={background.gradient.end}
                    onChange={(e) =>
                      setBackground({
                        type: 'gradient',
                        gradient: { ...background.gradient, end: e.target.value }
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[11px] font-mono text-text-muted uppercase">
                    {background.gradient.end}
                  </span>
                </div>
              </div>

              <Slider
                label="Gradient Angle"
                min={0}
                max={360}
                step={5}
                unit="°"
                value={background.gradient.angle || 135}
                onChange={(val) =>
                  setBackground({
                    gradient: { ...background.gradient, angle: val }
                  })
                }
              />
            </div>

            {/* Background Padding & Blur */}
            <div className="space-y-4 pt-3 border-t border-card-border/60">
              <Slider
                label="Frame Padding"
                min={16}
                max={96}
                step={4}
                unit="px"
                value={background.padding}
                onChange={(val) => setBackground({ padding: val })}
              />

              <Slider
                label="Background Blur"
                min={0}
                max={40}
                step={2}
                unit="px"
                value={background.blurAmount}
                onChange={(val) => setBackground({ blurAmount: val })}
              />
            </div>
          </div>
        )}

        {/* TAB 2: FRAME */}
        {activeTab === 'frame' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-2">Screen Frame Style</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'none', label: 'Clean Screen (No Header)', desc: 'Pure recorded screen with smooth rounded corners' },
                  { id: 'minimal', label: 'Minimal Glass Border', desc: 'Subtle translucent frame border' },
                  { id: 'browser', label: 'Browser Window Header', desc: 'Modern browser URL address bar and tabs' },
                  { id: 'macbook', label: 'MacBook Bar', desc: 'Classic macOS window header with traffic lights' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFrame({ mockup: item.id as any })}
                    className={clsx(
                      'p-2.5 rounded-xl border text-xs font-medium transition-all text-left',
                      frame.mockup === item.id
                        ? 'border-accent-purple bg-accent-purple/10 text-text-primary ring-1 ring-accent-purple/50'
                        : 'border-card-border hover:bg-secondary text-text-muted'
                    )}
                  >
                    <div className="text-xs font-semibold text-text-primary">{item.label}</div>
                    <div className="text-[10px] text-text-subtle">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-card-border/60">
              <Slider
                label="Corner Radius"
                min={0}
                max={32}
                step={2}
                unit="px"
                value={frame.cornerRadius}
                onChange={(val) => setFrame({ cornerRadius: val })}
              />

              <Slider
                label="Drop Shadow"
                min={0}
                max={100}
                step={5}
                unit="%"
                value={frame.shadowIntensity}
                onChange={(val) => setFrame({ shadowIntensity: val })}
              />

              <Slider
                label="Recording Scale"
                min={50}
                max={100}
                step={5}
                unit="%"
                value={Math.round(frame.scale * 100)}
                onChange={(val) => setFrame({ scale: val / 100 })}
              />
            </div>

            {/* Aspect Ratio */}
            <div className="pt-3 border-t border-card-border/60">
              <label className="text-xs font-semibold text-text-primary block mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['16:9', '9:16', '1:1', '4:3'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setFrame({ aspectRatio: ratio })}
                    className={clsx(
                      'py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-all',
                      frame.aspectRatio === ratio
                        ? 'border-accent-purple bg-accent-purple/15 text-white'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURSOR & ZOOM */}
        {activeTab === 'cursor' && (
          <div className="space-y-5">
            {/* Cursor Pointer Mode Selector */}
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Cursor Pointer Display
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'captured',
                    label: 'Captured Screen Cursor',
                    desc: 'No duplicate — uses natural cursor with zoom & spotlight'
                  },
                  {
                    id: 'vector',
                    label: 'Custom Vector Pointer',
                    desc: 'Smooth crisp macOS-style arrow overlay'
                  },
                  {
                    id: 'hidden',
                    label: 'Hide Pointer Overlay',
                    desc: 'Only apply camera zoom & effects without pointer'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCursorSettings({ cursorPointerMode: item.id as any })}
                    className={clsx(
                      'w-full p-2.5 rounded-xl border text-left transition-all',
                      (cursorSettings.cursorPointerMode || 'captured') === item.id
                        ? 'border-accent-purple bg-accent-purple/15 text-white ring-1 ring-accent-purple/50'
                        : 'border-card-border hover:bg-secondary text-text-muted'
                    )}
                  >
                    <div className="text-xs font-medium text-text-primary">{item.label}</div>
                    <div className="text-[10px] text-text-subtle">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Switch
              label="Enable Cursor Effects"
              description="Renders custom pointer, spotlight and ripple animations"
              checked={cursorSettings.enabled}
              onChange={(checked) => setCursorSettings({ enabled: checked })}
            />

            <Switch
              label="Auto Cursor Zoom"
              description="Dynamically zooms into mouse focus and clicks"
              checked={cursorSettings.autoZoom}
              onChange={(checked) => setCursorSettings({ autoZoom: checked })}
            />

            <div className="space-y-4 pt-3 border-t border-card-border/60">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-2">Default Zoom Level</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1.25, 1.5, 1.75, 2.0, 2.5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCursorSettings({ defaultZoomLevel: level })}
                      className={clsx(
                        'py-1.5 rounded-lg text-xs font-mono border text-center transition-all',
                        cursorSettings.defaultZoomLevel === level
                          ? 'border-accent-purple bg-accent-purple text-white shadow-sm'
                          : 'border-card-border text-text-muted hover:bg-secondary'
                      )}
                    >
                      {level}x
                    </button>
                  ))}
                </div>
              </div>

              <Slider
                label="Zoom Transition Duration"
                min={200}
                max={900}
                step={50}
                unit="ms"
                value={cursorSettings.zoomTransitionDuration}
                onChange={(val) => setCursorSettings({ zoomTransitionDuration: val })}
              />

              <Slider
                label="Cursor Size"
                min={80}
                max={200}
                step={10}
                unit="%"
                value={Math.round(cursorSettings.cursorSize * 100)}
                onChange={(val) => setCursorSettings({ cursorSize: val / 100 })}
              />
            </div>

            {/* Spotlight & Click Effects */}
            <div className="space-y-3 pt-3 border-t border-card-border/60">
              <Switch
                label="Spotlight Focus Effect"
                description="Dims the background during zoom to highlight cursor area"
                checked={cursorSettings.spotlightEnabled}
                onChange={(checked) => setCursorSettings({ spotlightEnabled: checked })}
              />

              <Switch
                label="Mouse Click Rings"
                description="Shows expanding ripple waves on left & right clicks"
                checked={cursorSettings.clickAnimationEnabled}
                onChange={(checked) => setCursorSettings({ clickAnimationEnabled: checked })}
              />

              <Switch
                label="Cursor Highlight Ring"
                description="Subtle glowing ring around mouse pointer"
                checked={cursorSettings.highlightRingEnabled}
                onChange={(checked) => setCursorSettings({ highlightRingEnabled: checked })}
              />
            </div>

            {/* Fine Calibration Offset */}
            <div className="space-y-3 pt-3 border-t border-card-border/60">
              <label className="text-xs font-semibold text-text-primary block">Fine Alignment Offset</label>
              <Slider
                label="X Calibration"
                min={-15}
                max={15}
                step={1}
                unit="%"
                value={Math.round((cursorSettings.offsetX || 0) * 100)}
                onChange={(val) => setCursorSettings({ offsetX: val / 100 })}
              />
              <Slider
                label="Y Calibration"
                min={-15}
                max={15}
                step={1}
                unit="%"
                value={Math.round((cursorSettings.offsetY || 0) * 100)}
                onChange={(val) => setCursorSettings({ offsetY: val / 100 })}
              />
            </div>

            {/* Pointer Style */}
            <div className="pt-3 border-t border-card-border/60">
              <label className="text-xs font-semibold text-white block mb-2">Cursor Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'macos-black', label: 'Dark Arrow' },
                  { id: 'macos-white', label: 'Light Arrow' },
                  { id: 'circle', label: 'Dot Pulse' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCursorSettings({ cursorStyle: item.id as any })}
                    className={clsx(
                      'py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all',
                      cursorSettings.cursorStyle === item.id
                        ? 'border-accent-purple bg-accent-purple/15 text-white'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIO */}
        {activeTab === 'audio' && (
          <div className="space-y-5">
            <Switch
              label="Mute Audio"
              checked={isMuted}
              onChange={(checked) => setIsMuted(checked)}
            />

            <Slider
              label="Volume Level"
              min={0}
              max={100}
              step={5}
              unit="%"
              value={Math.round(volume * 100)}
              onChange={(val) => setVolume(val / 100)}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
