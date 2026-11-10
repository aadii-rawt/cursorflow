import React from 'react';
import { Play, FolderOpen, Trash2, Clock, Film } from 'lucide-react';
import { RecordingMetadata } from '../../types/recording.types';
import { formatTime, formatFileSize, formatDate } from '../../utils/formatTime';
import { storageService } from '../../services/storage.service';

interface RecordingCardProps {
  recording: RecordingMetadata;
  onOpenEditor: (rec: RecordingMetadata) => void;
  onDelete: (id: string) => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  onOpenEditor,
  onDelete
}) => {
  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.openInFolder(recording.videoPath);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${recording.title}"?`)) {
      onDelete(recording.id);
    }
  };

  return (
    <div
      onClick={() => onOpenEditor(recording)}
      className="group relative flex flex-col bg-card hover:bg-card-hover border border-card-border hover:border-accent-purple/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/50 cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-secondary overflow-hidden">
        {recording.thumbnailPath ? (
          <img
            src={recording.thumbnailPath}
            alt={recording.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-subtle bg-secondary/80">
            <Film className="w-10 h-10 mb-2 opacity-40" />
            <span className="text-xs">Preview</span>
          </div>
        )}

        {/* Hover overlay with big play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg shadow-accent-purple/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
          <Clock className="w-3 h-3 text-accent-sky" />
          {formatTime(recording.duration)}
        </div>

        {/* Resolution tag */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-card/85 backdrop-blur-md text-[10px] font-medium text-text-muted border border-card-border/60">
          {recording.resolution.width}x{recording.resolution.height}
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-text-primary group-hover:text-white line-clamp-1">
            {recording.title}
          </h3>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
            <span>{formatDate(recording.createdAt)}</span>
            <span>•</span>
            <span>{formatFileSize(recording.fileSize)}</span>
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
          <span className="text-[11px] text-text-subtle truncate max-w-[140px]">
            {recording.sourceName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenFolder}
              title="Show in Folder"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Recording"
              className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
