import React from 'react';
import { Minus, Square, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { useRecordingStore } from '../../store/recording.store';

export const TitleBar: React.FC = () => {
  const { project, theme, toggleTheme } = useEditorStore();
  const { status } = useRecordingStore();

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="h-9 w-full bg-secondary border-b border-card-border/70 flex items-center justify-between px-3 select-none z-50 app-region-drag transition-colors">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2 app-region-no-drag">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-accent-purple to-accent-sky flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-text-primary">
          Cursorful Studio
        </span>

        {status === 'recording' && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-rose/15 text-accent-rose text-[10px] font-medium border border-accent-rose/30 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-ping" />
            REC
          </span>
        )}

        {project && status === 'idle' && (
          <span className="text-[10px] font-mono text-text-subtle ml-2 bg-card px-2 py-0.5 rounded border border-card-border">
            Editor Active
          </span>
        )}
      </div>

      {/* Theme Toggle & Window Controls */}
      <div className="flex items-center app-region-no-drag -mr-1">
        {/* White / Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="px-2 py-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-card border border-transparent hover:border-card-border transition-colors mr-2 flex items-center gap-1.5"
          title={theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-accent-amber" />
              <span className="text-[10px] font-medium hidden sm:inline text-text-muted">White Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-[10px] font-medium hidden sm:inline text-text-muted">Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleMinimize}
          className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-white hover:bg-accent-rose transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
