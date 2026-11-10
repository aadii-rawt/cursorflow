import { contextBridge, ipcRenderer } from 'electron';

export interface ExportProgressPayload {
  progress: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  timeRemaining: string;
}

const api = {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Desktop Sources
  getDesktopSources: () => ipcRenderer.invoke('desktop:get-sources'),

  // Cursor Tracking
  startCursorTracking: (sourceBounds?: { x: number; y: number; width: number; height: number; displayId?: string }) =>
    ipcRenderer.invoke('cursor:start-tracking', sourceBounds),
  stopCursorTracking: () => ipcRenderer.invoke('cursor:stop-tracking'),
  getCurrentCursorPos: () => ipcRenderer.invoke('cursor:get-pos'),

  // Storage
  saveRecording: (data: { buffer: Uint8Array; metadata: any; cursorEvents: any[] }) =>
    ipcRenderer.invoke('storage:save-recording', data),
  loadRecordings: () => ipcRenderer.invoke('storage:load-recordings'),
  deleteRecording: (id: string) => ipcRenderer.invoke('storage:delete-recording', id),
  openInFolder: (filePath: string) => ipcRenderer.invoke('storage:open-in-folder', filePath),

  // Export
  exportVideo: (options: any) => ipcRenderer.invoke('export:render-video', options),
  saveExportBuffer: (data: { buffer: Uint8Array; format: string; fileName: string }) =>
    ipcRenderer.invoke('export:save-buffer', data),
  onExportProgress: (callback: (data: ExportProgressPayload) => void) => {
    const handler = (_event: any, data: ExportProgressPayload) => callback(data);
    ipcRenderer.on('export:progress', handler);
    return () => {
      ipcRenderer.removeListener('export:progress', handler);
    };
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
