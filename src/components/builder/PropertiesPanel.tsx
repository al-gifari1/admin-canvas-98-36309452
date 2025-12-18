import { X, Settings } from 'lucide-react';
import { Block } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertiesPanelProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (blockId: string, content: Block['content']) => void;
}

export function PropertiesPanel({ block, onClose, onUpdate }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="w-[300px] border-l border-border bg-card flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Properties</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No Widget Selected</h3>
          <p className="text-sm text-muted-foreground">
            Click on a widget in the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] border-l border-border bg-card flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-foreground">Properties</h2>
          <p className="text-xs text-muted-foreground capitalize">{block.type.replace('-', ' ')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Properties Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              Property Editor
            </p>
            <p className="text-xs text-muted-foreground">
              Widget editing controls will appear here. Coming soon!
            </p>
          </div>

          {/* Preview of current content */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Current Content</h4>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[200px] text-muted-foreground">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
