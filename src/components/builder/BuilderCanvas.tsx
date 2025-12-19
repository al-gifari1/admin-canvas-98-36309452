import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, HelpCircle, MousePointerClick, ArrowLeft, LucideIcon, Plus, Library } from 'lucide-react';
import { icons } from 'lucide-react';
import { Block, WIDGET_LIBRARY, WidgetType, DEFAULT_WIDGET_CONTENT } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { WidgetRenderer } from './WidgetRenderer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

function getIconByName(name: string): LucideIcon {
  const icon = icons[name as keyof typeof icons];
  return icon || HelpCircle;
}

interface BuilderCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock?: (id: string) => void;
  onAddBlock?: (type: WidgetType, index: number) => void;
  viewMode: 'mobile' | 'desktop';
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get widget info for label
  const widgetInfo = WIDGET_LIBRARY.find((w) => w.type === block.type);
  const IconComponent = widgetInfo?.icon 
    ? getIconByName(widgetInfo.icon)
    : HelpCircle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 z-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection indicator & controls */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all ${
          isSelected
            ? 'ring-2 ring-primary ring-inset'
            : 'ring-0 group-hover:ring-1 group-hover:ring-primary/30'
        }`}
      />

      {/* Floating toolbar */}
      <div
        className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 bg-primary text-primary-foreground rounded-t-md text-xs font-medium transition-opacity z-20 ${
          isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-primary-foreground/20 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-1.5">
            <IconComponent className="h-3 w-3" />
            <span>{widgetInfo?.label || block.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 hover:bg-primary-foreground/20 rounded"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-destructive/80 rounded"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Widget content */}
      <div className="pointer-events-none">
        <WidgetRenderer block={block} />
      </div>
    </div>
  );
}

function DropZone({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg transition-all ${
        isOver
          ? 'border-primary bg-primary/5 min-h-[100px]'
          : 'border-transparent min-h-[20px]'
      }`}
    />
  );
}

// Add Widget Button with dropdown
function AddWidgetButton({ onAddWidget }: { onAddWidget: (type: WidgetType) => void }) {
  // Group widgets by category
  const groupedWidgets = WIDGET_LIBRARY.reduce((acc, widget) => {
    if (widget.category === 'legacy') return acc;
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof WIDGET_LIBRARY>);

  const categoryLabels: Record<string, string> = {
    basic: 'Basic',
    media: 'Media',
    layout: 'Layout',
    commerce: 'Commerce & Marketing',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs border-dashed"
        >
          <Plus className="h-3 w-3" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
        {Object.entries(groupedWidgets).map(([category, widgets]) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {categoryLabels[category] || category}
            </DropdownMenuLabel>
            {widgets.map((widget) => {
              const IconComponent = getIconByName(widget.icon);
              return (
                <DropdownMenuItem
                  key={widget.type}
                  onClick={() => onAddWidget(widget.type)}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{widget.label}</span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  viewMode,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  const handleDeleteClick = (blockId: string) => {
    setBlockToDelete(blockId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (blockToDelete) {
      onDeleteBlock(blockToDelete);
    }
    setDeleteDialogOpen(false);
    setBlockToDelete(null);
  };

  const handleAddWidget = (type: WidgetType, index: number) => {
    if (onAddBlock) {
      onAddBlock(type, index);
    }
  };

  return (
    <>
      <div
        className="flex-1 bg-muted/50 overflow-auto"
        onClick={() => onSelectBlock(null)}
      >
        {/* Canvas wrapper with padding */}
        <div className="p-8 min-h-full">
          {/* Document simulation */}
          <div
            ref={setNodeRef}
            className={`mx-auto bg-background shadow-2xl rounded-lg overflow-hidden min-h-[800px] transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1200px]'
            }`}
          >
            {blocks.length === 0 ? (
              <div
                className={`min-h-[800px] flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
                  isOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <MousePointerClick className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Start Building Your Page
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag widgets from the left panel or click below to add.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Drag from Library</span>
                    </div>
                    {onAddBlock && (
                      <>
                        <span className="text-muted-foreground">or</span>
                        <AddWidgetButton onAddWidget={(type) => handleAddWidget(type, 0)} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="relative">
                  {/* Top add button */}
                  {onAddBlock && (
                    <div className="flex justify-center py-2 border-b border-dashed border-border/50 bg-muted/30">
                      <AddWidgetButton onAddWidget={(type) => handleAddWidget(type, 0)} />
                    </div>
                  )}
                  
                  {/* Top drop indicator */}
                  {isOver && blocks.length > 0 && <DropZone isOver={isOver} />}
                  
                  {blocks.map((block, index) => (
                    <div key={block.id} className="relative">
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        onDelete={() => handleDeleteClick(block.id)}
                        onDuplicate={onDuplicateBlock ? () => onDuplicateBlock(block.id) : undefined}
                      />
                      {/* Add button between blocks */}
                      {onAddBlock && (
                        <div className="flex justify-center py-2 border-y border-dashed border-border/50 bg-muted/30 opacity-0 hover:opacity-100 transition-opacity">
                          <AddWidgetButton onAddWidget={(type) => handleAddWidget(type, index + 1)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
