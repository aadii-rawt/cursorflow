import { BackgroundSettings, FrameSettings, ExportSettings, ExportProgress } from '../types/editor.types';
import { CursorSettings, CursorEvent, ZoomKeyframe } from '../types/cursor.types';
import { cursorService } from './cursor.service';

export class ExportService {
  private isCancelled = false;

  cancel(): void {
    this.isCancelled = true;
  }

  async exportVideo(
    videoElement: HTMLVideoElement,
    background: BackgroundSettings,
    frame: FrameSettings,
    cursorSettings: CursorSettings,
    cursorEvents: CursorEvent[],
    zoomKeyframes: ZoomKeyframe[],
    exportSettings: ExportSettings,
    trim: { startTime: number; endTime: number },
    onProgress: (progress: ExportProgress) => void
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    this.isCancelled = false;

    const resolutionMap = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 },
      '4k': { width: 3840, height: 2160 }
    };
    const { width, height } = resolutionMap[exportSettings.resolution] || { width: 1920, height: 1080 };
    const fps = exportSettings.frameRate || 60;
    const startTime = Math.max(0, trim.startTime);
    const endTime = Math.min(videoElement.duration || 10, trim.endTime);
    const totalDuration = Math.max(0.1, endTime - startTime);
    const totalFrames = Math.ceil(totalDuration * fps);

    // Create offscreen rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return { success: false, error: 'Could not create 2D canvas context' };
    }

    // Set up canvas stream & MediaRecorder
    const stream = canvas.captureStream(fps);

    // Attach audio track if video has audio
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(videoElement);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      if (dest.stream.getAudioTracks().length > 0) {
        stream.addTrack(dest.stream.getAudioTracks()[0]);
      }
    } catch (e) {
      // Audio capture from media element may be restricted or already connected
      console.warn('Audio capture bypass or already attached:', e);
    }

    const recordedChunks: Blob[] = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: exportSettings.quality === 'ultra' ? 30000000 : 16000000
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    recorder.start(500);

    const frameInterval = 1 / fps;
    let currentFrame = 0;
    const startRenderTime = performance.now();

    // Render loop
    for (let t = startTime; t <= endTime; t += frameInterval) {
      if (this.isCancelled) {
        recorder.stop();
        return { success: false, error: 'Export was cancelled' };
      }

      // Seek video to frame timestamp
      videoElement.currentTime = t;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener('seeked', onSeeked);
          resolve();
        };
        videoElement.addEventListener('seeked', onSeeked, { once: true });
        // Timeout fallback
        setTimeout(resolve, 60);
      });

      // Composite the frame
      this.renderFrame(ctx, videoElement, t, width, height, background, frame, cursorSettings, cursorEvents, zoomKeyframes);

      currentFrame++;
      const progressPercent = Math.min(99, Math.round((currentFrame / totalFrames) * 100));
      const elapsedSec = (performance.now() - startRenderTime) / 1000;
      const currentFps = currentFrame / Math.max(0.1, elapsedSec);
      const remainingFrames = totalFrames - currentFrame;
      const timeRemaining = `${Math.ceil(remainingFrames / Math.max(1, currentFps))}s`;

      onProgress({
        isExporting: true,
        progress: progressPercent,
        currentFrame,
        totalFrames,
        fps: Math.round(currentFps),
        timeRemaining
      });
    }

    // Finish recording
    return new Promise((resolve) => {
      recorder.onstop = async () => {
        const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const arrayBuffer = await finalBlob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        onProgress({
          isExporting: true,
          progress: 100,
          currentFrame: totalFrames,
          totalFrames,
          fps,
          timeRemaining: 'Finalizing...'
        });

        if (window.electronAPI?.saveExportBuffer) {
          const result = await window.electronAPI.saveExportBuffer({
            buffer,
            format: exportSettings.format,
            fileName: exportSettings.fileName
          });
          resolve(result);
        } else {
          // Browser download
          const url = URL.createObjectURL(finalBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportSettings.fileName}.${exportSettings.format}`;
          a.click();
          resolve({ success: true, filePath: a.download });
        }
      };

      recorder.stop();
    });
  }

  /**
   * High fidelity 2D rendering of single composited frame
   */
  private renderFrame(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    timeInSeconds: number,
    canvasW: number,
    canvasH: number,
    background: BackgroundSettings,
    frame: FrameSettings,
    cursorSettings: CursorSettings,
    cursorEvents: CursorEvent[],
    zoomKeyframes: ZoomKeyframe[]
  ) {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. Draw Background
    if (background.type === 'solid') {
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (background.type === 'gradient') {
      const angleRad = ((background.gradient.angle || 135) * Math.PI) / 180;
      const x1 = canvasW / 2 - (Math.cos(angleRad) * canvasW) / 2;
      const y1 = canvasH / 2 - (Math.sin(angleRad) * canvasH) / 2;
      const x2 = canvasW / 2 + (Math.cos(angleRad) * canvasW) / 2;
      const y2 = canvasH / 2 + (Math.sin(angleRad) * canvasH) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, background.gradient.start);
      grad.addColorStop(1, background.gradient.end);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      ctx.fillStyle = '#101114';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // 2. Compute Frame Geometry & Dimensions
    const padding = (background.padding / 100) * (canvasH * 0.25);
    const availableW = canvasW - padding * 2;
    const availableH = canvasH - padding * 2;

    const videoAspect = (video.videoWidth || 16) / (video.videoHeight || 9);
    let targetW = availableW * frame.scale;
    let targetH = targetW / videoAspect;

    if (targetH > availableH * frame.scale) {
      targetH = availableH * frame.scale;
      targetW = targetH * videoAspect;
    }

    const frameX = (canvasW - targetW) / 2;
    const frameY = (canvasH - targetH) / 2;
    const radius = frame.cornerRadius || 16;
    const mockupHeaderHeight = frame.mockup === 'macbook' ? 36 : frame.mockup === 'browser' ? 44 : 0;

    // 3. Draw Shadow
    if (frame.shadowIntensity > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${frame.shadowIntensity / 100})`;
      ctx.shadowBlur = (frame.shadowIntensity / 100) * 50;
      ctx.shadowOffsetY = (frame.shadowIntensity / 100) * 20;
      ctx.fillStyle = '#000000';
      this.roundRect(ctx, frameX, frameY, targetW, targetH + mockupHeaderHeight, radius);
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Mockup Headers (MacBook or Browser)
    if (frame.mockup === 'macbook') {
      ctx.save();
      this.roundRect(ctx, frameX, frameY, targetW, mockupHeaderHeight + radius, radius);
      ctx.fillStyle = '#1e1f26';
      ctx.fill();

      // Traffic lights
      const dots = [
        { color: '#FF5F56', x: frameX + 18 },
        { color: '#FFBD2E', x: frameX + 36 },
        { color: '#27C93F', x: frameX + 54 }
      ];
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, frameY + 18, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });
      ctx.restore();
    } else if (frame.mockup === 'browser') {
      ctx.save();
      this.roundRect(ctx, frameX, frameY, targetW, mockupHeaderHeight + radius, radius);
      ctx.fillStyle = '#1c1e24';
      ctx.fill();

      // Browser dots
      const dots = [
        { color: '#FF5F56', x: frameX + 18 },
        { color: '#FFBD2E', x: frameX + 36 },
        { color: '#27C93F', x: frameX + 54 }
      ];
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, frameY + 22, 5, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });

      // Address bar
      ctx.fillStyle = '#262933';
      const addressW = Math.min(360, targetW * 0.5);
      const addressX = frameX + (targetW - addressW) / 2;
      this.roundRect(ctx, addressX, frameY + 10, addressW, 24, 6);
      ctx.fill();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px sans-serif';
      ctx.fillText('https://cursorful.studio/recording', addressX + 16, frameY + 26);
      ctx.restore();
    }

    // 5. Video Area with Zoom Camera Transformation
    const videoY = frameY + mockupHeaderHeight;
    ctx.save();

    // Clip to the video frame area
    if (mockupHeaderHeight > 0) {
      this.roundRect(ctx, frameX, videoY, targetW, targetH, {
        tl: 0,
        tr: 0,
        bl: radius,
        br: radius
      });
    } else {
      this.roundRect(ctx, frameX, videoY, targetW, targetH, radius);
    }
    ctx.clip();

    // Get interpolated cursor and zoom state
    const cursorState = cursorService.getCursorState(
      timeInSeconds * 1000,
      cursorEvents,
      zoomKeyframes,
      cursorSettings
    );

    // Apply Camera Zoom & Pan
    const scale = cursorState.zoomScale;
    const focusX = cursorState.cameraTransform.originX / 100;
    const focusY = cursorState.cameraTransform.originY / 100;

    ctx.translate(frameX + targetW * 0.5, videoY + targetH * 0.5);
    ctx.scale(scale, scale);
    ctx.translate(-(frameX + targetW * focusX), -(videoY + targetH * focusY));

    // Draw Video Frame
    ctx.drawImage(video, frameX, videoY, targetW, targetH);

    // 6. Cursor Spotlight Effect (if enabled & active)
    if (cursorSettings.enabled && cursorSettings.spotlightEnabled && scale > 1.05) {
      const cx = frameX + targetW * cursorState.x;
      const cy = videoY + targetH * cursorState.y;
      const spotRadius = cursorSettings.spotlightRadius * scale;

      const spotGrad = ctx.createRadialGradient(cx, cy, spotRadius * 0.4, cx, cy, spotRadius);
      spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      spotGrad.addColorStop(1, `rgba(0, 0, 0, ${cursorSettings.spotlightOpacity || 0.4})`);

      ctx.fillStyle = spotGrad;
      ctx.fillRect(frameX - targetW, videoY - targetH, targetW * 3, targetH * 3);
    }

    // 7. Click Ripple Animation (if active)
    if (cursorSettings.enabled && cursorSettings.clickAnimationEnabled && cursorState.isClicking) {
      const cx = frameX + targetW * cursorState.x;
      const cy = videoY + targetH * cursorState.y;
      const progress = cursorState.clickProgress; // 0 to 1
      const rippleRadius = (20 + progress * 40) * (scale > 1.5 ? 1.2 : 1.0);
      const alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
      ctx.strokeStyle =
        cursorState.clickType === 'right'
          ? `rgba(244, 63, 94, ${alpha})`
          : `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, rippleRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.25})`;
      ctx.fill();
      ctx.restore();
    }

    // 8. Cursor Highlight Ring
    if (cursorSettings.enabled && cursorSettings.highlightRingEnabled) {
      const cx = frameX + targetW * cursorState.x;
      const cy = videoY + targetH * cursorState.y;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.strokeStyle = cursorSettings.highlightColor || '#8B5CF6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `${cursorSettings.highlightColor || '#8B5CF6'}22`;
      ctx.fill();
      ctx.restore();
    }

    // 9. Draw Custom High-Resolution Cursor Pointer (Only if vector mode enabled)
    if (cursorSettings.enabled && cursorSettings.cursorPointerMode === 'vector') {
      const cx = frameX + targetW * cursorState.x;
      const cy = videoY + targetH * cursorState.y;
      const cSize = cursorSettings.cursorSize || 1.2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(cSize, cSize);

      if (cursorSettings.cursorStyle === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#8B5CF6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      } else {
        // Crisp macOS-style black cursor arrow with clean white border
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 19);
        ctx.lineTo(4.5, 14.5);
        ctx.lineTo(9.5, 22.5);
        ctx.lineTo(12.5, 21);
        ctx.lineTo(7.5, 13);
        ctx.lineTo(14, 13);
        ctx.closePath();

        ctx.fillStyle = cursorSettings.cursorStyle === 'macos-white' ? '#FFFFFF' : '#111317';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = cursorSettings.cursorStyle === 'macos-white' ? '#111317' : '#FFFFFF';
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore(); // end video clip
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; br: number; bl: number }
  ) {
    let r = typeof radius === 'number'
      ? { tl: radius, tr: radius, br: radius, bl: radius }
      : radius;

    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
  }
}

export const exportService = new ExportService();
