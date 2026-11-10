import { RecordingMetadata } from '../types/recording.types';
import { CursorEvent } from '../types/cursor.types';

export const storageService = {
  async saveRecording(
    buffer: Uint8Array,
    metadata: {
      title: string;
      duration: number;
      sourceName: string;
      resolution: { width: number; height: number };
      thumbnailDataUrl?: string;
    },
    cursorEvents: CursorEvent[]
  ): Promise<{ success: boolean; filePath?: string; id?: string }> {
    if (window.electronAPI?.saveRecording) {
      return await window.electronAPI.saveRecording({
        buffer,
        metadata,
        cursorEvents
      });
    }

    // Fallback for browser preview: Save in localStorage & IndexedDB
    const id = `rec_${Date.now()}`;
    const blob = new Blob([buffer], { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);

    const recording: RecordingMetadata = {
      id,
      title: metadata.title,
      createdAt: Date.now(),
      duration: metadata.duration,
      sourceName: metadata.sourceName,
      resolution: metadata.resolution,
      videoPath: videoUrl,
      thumbnailPath: metadata.thumbnailDataUrl || '',
      cursorEventsPath: '',
      fileSize: buffer.byteLength
    };

    const existingStr = localStorage.getItem('cursorful_recordings');
    const existing: RecordingMetadata[] = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem('cursorful_recordings', JSON.stringify([recording, ...existing]));

    return { success: true, filePath: videoUrl, id };
  },

  async loadRecordings(): Promise<RecordingMetadata[]> {
    if (window.electronAPI?.loadRecordings) {
      return await window.electronAPI.loadRecordings();
    }

    const existingStr = localStorage.getItem('cursorful_recordings');
    return existingStr ? JSON.parse(existingStr) : [];
  },

  async deleteRecording(id: string): Promise<boolean> {
    if (window.electronAPI?.deleteRecording) {
      return await window.electronAPI.deleteRecording(id);
    }

    const existingStr = localStorage.getItem('cursorful_recordings');
    if (existingStr) {
      const existing: RecordingMetadata[] = JSON.parse(existingStr);
      const filtered = existing.filter((r) => r.id !== id);
      localStorage.setItem('cursorful_recordings', JSON.stringify(filtered));
      return true;
    }
    return false;
  },

  async openInFolder(filePath: string): Promise<void> {
    if (window.electronAPI?.openInFolder) {
      await window.electronAPI.openInFolder(filePath);
    }
  }
};
