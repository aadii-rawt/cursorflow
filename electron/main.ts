import { app, BrowserWindow, ipcMain, desktopCapturer, screen, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

let ffmpegPath: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ffmpegPath = require('ffmpeg-static');
} catch (e) {
  console.warn('ffmpeg-static not found or failed to load', e);
}

let mainWindow: BrowserWindow | null = null;

// Cursor tracking state
let cursorTrackingInterval: NodeJS.Timeout | null = null;
let cursorEvents: Array<{
  timestamp: number;
  x: number;
  y: number;
  type: 'move' | 'click' | 'idle';
}> = [];
let trackingStartTime = 0;
let lastCursorPos = { x: -1, y: -1 };
let lastMoveTime = 0;
let targetDisplayBounds = { x: 0, y: 0, width: 1920, height: 1080 };

function getRecordingsDir(): string {
  const dir = path.join(app.getPath('userData'), 'recordings');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getExportsDir(): string {
  const dir = path.join(app.getPath('videos'), 'CursorfulStudio');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 1080,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#101114',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // allow loading local recorded video files
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window controls
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

// Desktop Capturer Sources
ipcMain.handle('desktop:get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 480, height: 270 },
      fetchWindowIcons: true
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
      appIcon: source.appIcon ? source.appIcon.toDataURL() : undefined,
      display_id: source.display_id,
      isScreen: source.id.startsWith('screen:')
    }));
  } catch (error) {
    console.error('Failed to get desktop sources:', error);
    return [];
  }
});

// Cursor Tracking
ipcMain.handle('cursor:start-tracking', (_event, sourceBounds) => {
  cursorEvents = [];
  trackingStartTime = Date.now();
  lastMoveTime = trackingStartTime;

  // Determine target display bounds accurately matching DIPs of getCursorScreenPoint
  const allDisplays = screen.getAllDisplays();
  let matchedDisplay = screen.getPrimaryDisplay();

  if (sourceBounds?.displayId) {
    const found = allDisplays.find((d) => d.id.toString() === sourceBounds.displayId.toString());
    if (found) matchedDisplay = found;
  } else if (sourceBounds?.x !== undefined && sourceBounds?.y !== undefined) {
    matchedDisplay = screen.getDisplayNearestPoint({ x: sourceBounds.x, y: sourceBounds.y });
  }

  // Use the matching display bounds in logical units
  targetDisplayBounds = {
    x: matchedDisplay.bounds.x,
    y: matchedDisplay.bounds.y,
    width: matchedDisplay.bounds.width || 1920,
    height: matchedDisplay.bounds.height || 1080
  };

  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval);
  }

  // Sample cursor position at 50Hz (every 20ms) for high precision tracking
  cursorTrackingInterval = setInterval(() => {
    const screenPoint = screen.getCursorScreenPoint();
    const now = Date.now();
    const elapsed = now - trackingStartTime;

    // Normalize coordinates relative to target display bounds
    const relX = (screenPoint.x - targetDisplayBounds.x) / targetDisplayBounds.width;
    const relY = (screenPoint.y - targetDisplayBounds.y) / targetDisplayBounds.height;
    const clampedX = Math.max(0, Math.min(1, relX));
    const clampedY = Math.max(0, Math.min(1, relY));

    const dx = Math.abs(screenPoint.x - lastCursorPos.x);
    const dy = Math.abs(screenPoint.y - lastCursorPos.y);

    if (dx > 1 || dy > 1) {
      // Mouse moved
      cursorEvents.push({
        timestamp: elapsed,
        x: clampedX,
        y: clampedY,
        type: 'move'
      });
      lastCursorPos = screenPoint;
      lastMoveTime = now;
    } else {
      // Dwell / idle
      if (now - lastMoveTime > 350 && (cursorEvents.length === 0 || cursorEvents[cursorEvents.length - 1].type !== 'idle')) {
        cursorEvents.push({
          timestamp: elapsed,
          x: clampedX,
          y: clampedY,
          type: 'idle'
        });
      }
    }
  }, 20);

  return { started: true };
});

ipcMain.handle('cursor:stop-tracking', () => {
  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval);
    cursorTrackingInterval = null;
  }
  return cursorEvents;
});

ipcMain.handle('cursor:get-pos', () => {
  const screenPoint = screen.getCursorScreenPoint();
  const relX = (screenPoint.x - targetDisplayBounds.x) / targetDisplayBounds.width;
  const relY = (screenPoint.y - targetDisplayBounds.y) / targetDisplayBounds.height;
  return {
    x: Math.max(0, Math.min(1, relX)),
    y: Math.max(0, Math.min(1, relY))
  };
});

// Storage: Save Recording
ipcMain.handle('storage:save-recording', async (_event, data) => {
  try {
    const recordingsDir = getRecordingsDir();
    const id = `rec_${Date.now()}`;
    const videoFileName = `${id}.webm`;
    const videoPath = path.join(recordingsDir, videoFileName);
    const thumbnailFileName = `${id}_thumb.png`;
    const thumbnailPath = path.join(recordingsDir, thumbnailFileName);
    const eventsFileName = `${id}_cursor.json`;
    const cursorEventsPath = path.join(recordingsDir, eventsFileName);
    const metaFileName = `${id}_meta.json`;
    const metaPath = path.join(recordingsDir, metaFileName);

    // Save video buffer
    fs.writeFileSync(videoPath, Buffer.from(data.buffer));

    // Save thumbnail
    if (data.metadata?.thumbnailDataUrl) {
      const base64Data = data.metadata.thumbnailDataUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(thumbnailPath, Buffer.from(base64Data, 'base64'));
    }

    // Save cursor events
    fs.writeFileSync(cursorEventsPath, JSON.stringify(data.cursorEvents || [], null, 2));

    const metadata = {
      id,
      title: data.metadata?.title || `Screen Recording ${new Date().toLocaleTimeString()}`,
      createdAt: Date.now(),
      duration: data.metadata?.duration || 0,
      sourceName: data.metadata?.sourceName || 'Screen',
      resolution: data.metadata?.resolution || { width: 1920, height: 1080 },
      videoPath: `file://${videoPath.replace(/\\/g, '/')}`,
      thumbnailPath: fs.existsSync(thumbnailPath) ? `file://${thumbnailPath.replace(/\\/g, '/')}` : '',
      cursorEventsPath,
      fileSize: data.buffer.byteLength
    };

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    return { success: true, filePath: videoPath, id };
  } catch (error: any) {
    console.error('Error saving recording:', error);
    return { success: false, error: error.message };
  }
});

// Storage: Load Recordings
ipcMain.handle('storage:load-recordings', async () => {
  try {
    const recordingsDir = getRecordingsDir();
    const files = fs.readdirSync(recordingsDir);
    const metaFiles = files.filter((f) => f.endsWith('_meta.json'));

    const recordings = [];
    for (const metaFile of metaFiles) {
      try {
        const content = fs.readFileSync(path.join(recordingsDir, metaFile), 'utf-8');
        const parsed = JSON.parse(content);
        recordings.push(parsed);
      } catch (err) {
        console.warn('Failed to parse metadata file', metaFile, err);
      }
    }

    // Sort newest first
    recordings.sort((a, b) => b.createdAt - a.createdAt);
    return recordings;
  } catch (error) {
    console.error('Error loading recordings:', error);
    return [];
  }
});

// Storage: Delete Recording
ipcMain.handle('storage:delete-recording', async (_event, id: string) => {
  try {
    const recordingsDir = getRecordingsDir();
    const prefix = `${id}`;
    const files = fs.readdirSync(recordingsDir).filter((f) => f.startsWith(prefix));

    for (const file of files) {
      try {
        fs.unlinkSync(path.join(recordingsDir, file));
      } catch (e) {
        console.warn('Failed to delete file', file, e);
      }
    }
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
});

// Open File in Folder
ipcMain.handle('storage:open-in-folder', async (_event, filePath: string) => {
  try {
    const cleanPath = filePath.replace(/^file:\/\//, '').replace(/\//g, path.sep);
    shell.showItemInFolder(cleanPath);
  } catch (error) {
    console.error('Failed to show item in folder:', error);
  }
});

// Save Export Buffer (Direct or post-composited export from renderer)
ipcMain.handle('export:save-buffer', async (_event, data) => {
  try {
    const exportsDir = getExportsDir();
    const format = data.format || 'mp4';
    const cleanFileName = (data.fileName || `video-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalName = cleanFileName.endsWith(`.${format}`) ? cleanFileName : `${cleanFileName}.${format}`;
    const outputPath = path.join(exportsDir, finalName);

    fs.writeFileSync(outputPath, Buffer.from(data.buffer));

    // If exported as webm and user wants mp4, transcode with ffmpeg if available
    if (format === 'mp4' && data.isWebmInput && ffmpegPath && fs.existsSync(ffmpegPath)) {
      const tempWebm = path.join(exportsDir, `temp_${Date.now()}.webm`);
      fs.writeFileSync(tempWebm, Buffer.from(data.buffer));

      await new Promise<void>((resolve, reject) => {
        const proc = spawn(ffmpegPath!, [
          '-y',
          '-i', tempWebm,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-preset', 'fast',
          '-crf', '20',
          '-c:a', 'aac',
          '-b:a', '192k',
          outputPath
        ]);

        proc.on('close', (code) => {
          try { fs.unlinkSync(tempWebm); } catch (e) {}
          if (code === 0) resolve();
          else reject(new Error(`FFmpeg exited with code ${code}`));
        });

        proc.on('error', (err) => {
          try { fs.unlinkSync(tempWebm); } catch (e) {}
          reject(err);
        });
      });
    }

    return { success: true, filePath: outputPath };
  } catch (error: any) {
    console.error('Failed to save export buffer:', error);
    return { success: false, error: error.message };
  }
});

// FFmpeg Video Render / Export
ipcMain.handle('export:render-video', async (event, options) => {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    return { success: false, error: 'FFmpeg executable not available.' };
  }

  try {
    const exportsDir = getExportsDir();
    const format = options.format || 'mp4';
    const resolutionMap: Record<string, string> = {
      '720p': '1280:720',
      '1080p': '1920:1080',
      '1440p': '2560:1440',
      '4k': '3840:2160'
    };
    const scale = resolutionMap[options.resolution] || '1920:1080';
    const fps = options.fps || 60;
    const outputPath = path.join(exportsDir, `export_${Date.now()}.${format}`);

    const args: string[] = ['-y'];

    // Input file
    const cleanInput = options.inputPath.replace(/^file:\/\//, '').replace(/\//g, path.sep);
    args.push('-i', cleanInput);

    // Trimming if specified
    if (typeof options.trimStart === 'number' && options.trimStart > 0) {
      args.push('-ss', options.trimStart.toString());
    }
    if (typeof options.trimEnd === 'number' && options.trimEnd > 0) {
      args.push('-to', options.trimEnd.toString());
    }

    // Video filters: scale & fps
    args.push('-vf', `scale=${scale}:force_original_aspect_ratio=decrease,pad=${scale}:(ow-iw)/2:(oh-ih)/2,fps=${fps}`);

    if (format === 'mp4') {
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k');
    } else {
      args.push('-c:v', 'libvpx-vp9', '-crf', '25', '-b:v', '0', '-c:a', 'libopus');
    }

    args.push(outputPath);

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath!, args);

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        // Parse time or progress
        const timeMatch = text.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (timeMatch) {
          const hours = parseFloat(timeMatch[1]);
          const mins = parseFloat(timeMatch[2]);
          const secs = parseFloat(timeMatch[3]);
          const currentSeconds = hours * 3600 + mins * 60 + secs;
          const totalDuration = options.duration || 10;
          const progress = Math.min(100, Math.round((currentSeconds / totalDuration) * 100));

          event.sender.send('export:progress', {
            progress,
            currentFrame: Math.round(currentSeconds * fps),
            totalFrames: Math.round(totalDuration * fps),
            fps,
            timeRemaining: `${Math.max(0, Math.round(totalDuration - currentSeconds))}s`
          });
        }
      });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });

      proc.on('error', reject);
    });

    return { success: true, outputPath };
  } catch (error: any) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
});
