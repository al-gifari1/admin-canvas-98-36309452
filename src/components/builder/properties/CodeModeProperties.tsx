import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Block, BlockCodeModeVersion } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Code, Save, History, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeModePropertiesProps {
  block: Block;
  onUpdateHTML: (htmlContent: string, addToHistory?: boolean) => void;
  onRevertToVisual: () => void;
}

export function CodeModeProperties({
  block,
  onUpdateHTML,
  onRevertToVisual,
}: CodeModePropertiesProps) {
  const [code, setCode] = useState(block.htmlContent || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
    setHasUnsavedChanges(true);
  }, []);

  const handleApply = useCallback(() => {
    onUpdateHTML(code, true);
    setHasUnsavedChanges(false);
    toast.success('HTML applied and saved to history');
  }, [code, onUpdateHTML]);

  const handleRestoreVersion = useCallback((timestamp: string) => {
    const version = block.codeVersionHistory?.find(v => v.timestamp === timestamp);
    if (version) {
      setCode(version.htmlContent);
      onUpdateHTML(version.htmlContent, false);
      setHasUnsavedChanges(false);
      toast.success('Version restored');
    }
  }, [block.codeVersionHistory, onUpdateHTML]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-[400px] border-l border-border bg-card flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-lg text-foreground">Code Mode</h2>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
              Unsaved
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Edit raw HTML directly. Changes are applied to the canvas.
        </p>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!hasUnsavedChanges}
          className="gap-1.5"
        >
          {hasUnsavedChanges ? (
            <>
              <Save className="h-3.5 w-3.5" />
              Apply
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          )}
        </Button>

        {/* History Dropdown */}
        {block.codeVersionHistory && block.codeVersionHistory.length > 0 && (
          <Select onValueChange={handleRestoreVersion}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                <SelectValue placeholder="History" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {block.codeVersionHistory.map((version, index) => (
                <SelectItem key={version.timestamp} value={version.timestamp}>
                  <span className="text-xs">
                    {index === 0 ? 'Latest' : `v${block.codeVersionHistory!.length - index}`} - {formatTimestamp(version.timestamp)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        {/* Revert to Visual Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Back to Visual
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revert to Visual Mode?</AlertDialogTitle>
              <AlertDialogDescription>
                Going back to Visual Mode will discard your custom HTML changes.
                The section will be reset to its last visual state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRevertToVisual}>
                Yes, Revert
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="html"
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Footer Tips */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground">
          💡 Tip: Add SVG animations, custom scripts, or complex HTML structures here.
          Use the History dropdown to restore previous versions.
        </p>
      </div>
    </div>
  );
}
