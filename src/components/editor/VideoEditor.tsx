import React from 'react';
import { useEditorStore } from '../../store/editor.store';
import { EditorHeader } from './EditorHeader';
import { LeftSidebar } from './LeftSidebar';
import { PreviewCanvas } from './PreviewCanvas';
import { RightSidebar } from './RightSidebar';
import { Timeline } from '../timeline/Timeline';

interface VideoEditorProps {
  onBackToDashboard: () => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ onBackToDashboard }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* 1. Header */}
      <EditorHeader onBackToDashboard={onBackToDashboard} />

      {/* 2. Main Middle Workspace: Left Sidebar + Center Preview + Right Properties */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <PreviewCanvas />
        <RightSidebar />
      </div>

      {/* 3. Bottom Multi-Track Timeline */}
      <Timeline />
    </div>
  );
};
