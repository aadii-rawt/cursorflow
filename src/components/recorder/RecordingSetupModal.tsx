import React, { useState } from 'react';
import {
  Monitor,
  AppWindow,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useRecordingStore } from '../../store/recording.store';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useScreenRecording } from '../../hooks/useScreenRecording';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { DesktopSource } from '../../types/recording.types';
import clsx from 'clsx';

export const RecordingSetupModal: React.FC = () => {
  const {
    isSetupModalOpen,
    setIsSetupModalOpen,
    selectedSource,
    setSelectedSource,
    options,
    updateOptions
  } = useRecordingStore();

  const { sources, audioDevices, videoDevices, refreshDevicesAndSources } = useMediaDevices();
  const { startCountdownAndRecord } = useScreenRecording();

  const [activeTab, setActiveTab] = useState<'screens' | 'windows'>('screens');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const screens = sources.filter((s) => s.isScreen);
  const windows = sources.filter((s) => !s.isScreen);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startCountdownAndRecord();
    } finally {
      setIsStarting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDevicesAndSources();
    setIsRefreshing(false);
  };

  const handleSelectSource = (src: DesktopSource) => {
    setSelectedSource(src);
    updateOptions({
      sourceId: src.id,
      sourceName: src.name,
      isScreen: src.isScreen
    });
  };

  return (
    <Dialog
      isOpen={isSetupModalOpen}
      onClose={() => setIsSetupModalOpen(false)}
      title="Recording Studio Setup"
      description="Choose your capture source, audio inputs, and quality settings."
      maxWidth="3xl"
    >
      <div className="flex flex-col gap-6">
        {/* Source Type Selector Tabs */}
        <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
          <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl border border-card-border">
            <button
              onClick={() => setActiveTab('screens')}
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeTab === 'screens'
                  ? 'bg-card text-white shadow-sm border border-card-border'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <Monitor className="w-4 h-4 text-accent-sky" />
              <span>Screens ({screens.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('windows')}
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeTab === 'windows'
                  ? 'bg-card text-white shadow-sm border border-card-border'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <AppWindow className="w-4 h-4 text-accent-purple" />
              <span>Windows ({windows.length})</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Source Grid Cards */}
        <div className="max-h-[260px] overflow-y-auto pr-1">
          {activeTab === 'screens' ? (
            screens.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screens.map((src) => {
                  const isSelected = selectedSource?.id === src.id;
                  return (
                    <div
                      key={src.id}
                      onClick={() => handleSelectSource(src)}
                      className={clsx(
                        'relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 group bg-secondary/50',
                        isSelected
                          ? 'border-accent-purple ring-2 ring-accent-purple/30 bg-card'
                          : 'border-card-border hover:border-card-border/90 hover:bg-secondary'
                      )}
                    >
                      <div className="aspect-video bg-black/40 relative overflow-hidden">
                        {src.thumbnail ? (
                          <img
                            src={src.thumbnail}
                            alt={src.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-subtle">
                            <Monitor className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-accent-purple rounded-full p-0.5 text-white shadow">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-semibold text-text-primary truncate">
                          {src.name}
                        </div>
                        <div className="text-[10px] text-text-subtle">Entire Screen</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-text-muted">
                No screen sources detected.
              </div>
            )
          ) : windows.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {windows.map((src) => {
                const isSelected = selectedSource?.id === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => handleSelectSource(src)}
                    className={clsx(
                      'relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 group bg-secondary/50',
                      isSelected
                        ? 'border-accent-purple ring-2 ring-accent-purple/30 bg-card'
                        : 'border-card-border hover:border-card-border/90 hover:bg-secondary'
                    )}
                  >
                    <div className="aspect-video bg-black/40 relative overflow-hidden">
                      {src.thumbnail ? (
                        <img
                          src={src.thumbnail}
                          alt={src.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-subtle">
                          <AppWindow className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-accent-purple rounded-full p-0.5 text-white shadow">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {src.name}
                      </div>
                      <div className="text-[10px] text-text-subtle">App Window</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-text-muted">
              No application windows detected.
            </div>
          )}
        </div>

        {/* Audio, Camera & Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/40 p-4 rounded-2xl border border-card-border/60">
          {/* Audio Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-accent-sky" />
                <span className="text-xs font-semibold text-white">Microphone Audio</span>
              </div>
              <Switch
                checked={options.includeMic}
                onChange={(checked) => updateOptions({ includeMic: checked })}
              />
            </div>

            {options.includeMic && (
              <select
                value={options.micDeviceId}
                onChange={(e) => updateOptions({ micDeviceId: e.target.value })}
                className="w-full bg-secondary border border-card-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple"
              >
                <option value="default">Default System Microphone</option>
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-accent-emerald" />
                <span className="text-xs font-semibold text-white">System Audio</span>
              </div>
              <Switch
                checked={options.includeSystemAudio}
                onChange={(checked) => updateOptions({ includeSystemAudio: checked })}
              />
            </div>
          </div>

          {/* Camera Overlay & Quality */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent-purple" />
                <span className="text-xs font-semibold text-white">Camera Overlay</span>
              </div>
              <Switch
                checked={options.includeCamera}
                onChange={(checked) => updateOptions({ includeCamera: checked })}
              />
            </div>

            {options.includeCamera && (
              <select
                value={options.cameraDeviceId}
                onChange={(e) => updateOptions({ cameraDeviceId: e.target.value })}
                className="w-full bg-secondary border border-card-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple"
              >
                <option value="default">Default Webcam</option>
                {videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}

            {/* Quality & Framerate Selection */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Quality & FPS</span>
                <span className="text-[10px] text-text-subtle">Resolution</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={options.resolution}
                  onChange={(e) => updateOptions({ resolution: e.target.value as any })}
                  className="bg-secondary border border-card-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p (FHD)</option>
                  <option value="1440p">1440p (2K)</option>
                  <option value="4k">4K (UHD)</option>
                </select>

                <select
                  value={options.frameRate}
                  onChange={(e) => updateOptions({ frameRate: parseInt(e.target.value) as any })}
                  className="bg-secondary border border-card-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                >
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Sparkles className="w-4 h-4 text-accent-purple" />
            <span>Cursor tracking & auto-zoom will activate automatically</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsSetupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="lg"
              disabled={!selectedSource}
              isLoading={isStarting}
              onClick={handleStart}
              className="shadow-glow-purple px-6 font-semibold"
            >
              {isStarting ? 'Preparing...' : 'Start Recording'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
