import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, HelpCircle, MousePointerClick, ArrowLeft, LucideIcon, Plus, Library, Loader2, Layout, ShoppingCart, Star, Puzzle, ImageOff, Code } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

function getIconByName(name: string): LucideIcon {
  const icon = icons[name as keyof typeof icons];
  return icon || HelpCircle;
}

interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  type: string;
  content: Json;
  is_system_template: boolean;
  thumbnail_url: string | null;
}

interface BuilderCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock?: (id: string) => void;
  onAddBlock?: (type: WidgetType, index: number) => void;
  onImportBlocks?: (blocks: Block[], index: number) => void;
  onUpdateBlockContent?: (blockId: string, content: Partial<Block['content']>) => void;
  onToggleCodeMode?: (blockId: string) => void;
  viewMode: 'mobile' | 'desktop';
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onContentChange,
  onToggleCodeMode,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onContentChange?: (content: Partial<Block['content']>) => void;
  onToggleCodeMode?: () => void;
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
          {/* Code Mode Toggle */}
          {onToggleCodeMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCodeMode();
              }}
              className={`p-1 hover:bg-primary-foreground/20 rounded ${block.mode === 'code' ? 'bg-amber-500/30' : ''}`}
              title={block.mode === 'code' ? 'Code Mode Active' : 'Switch to Code Mode'}
            >
              <Code className="h-3 w-3" />
            </button>
          )}
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

      {/* Widget content - code mode uses dangerouslySetInnerHTML */}
      <div className={isSelected ? 'relative' : 'pointer-events-none'}>
        {block.mode === 'code' ? (
          <div 
            className="code-mode-section relative"
            dangerouslySetInnerHTML={{ __html: block.htmlContent || '<!-- Empty Code Block -->' }} 
          />
        ) : (
          <WidgetRenderer 
            block={block} 
            isSelected={isSelected}
            onContentChange={onContentChange}
          />
        )}
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
function AddWidgetButton({ 
  onAddWidget, 
  onOpenLibrary 
}: { 
  onAddWidget: (type: WidgetType) => void;
  onOpenLibrary: () => void;
}) {
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
    <div className="flex items-center gap-2">
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
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs border-dashed"
        onClick={onOpenLibrary}
      >
        <Library className="h-3 w-3" />
        Import from Library
      </Button>
    </div>
  );
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  hero: Layout,
  features: Star,
  commerce: ShoppingCart,
  custom: Puzzle,
};

// Import from Library Dialog
function ImportLibraryDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (blocks: Block[]) => void;
}) {
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('section_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (template: SectionTemplate) => {
    try {
      // Parse the content - it could be a single block or array of blocks
      const content = template.content as unknown;
      let blocks: Block[] = [];

      if (Array.isArray(content)) {
        blocks = content.map((block: Block, index: number) => ({
          ...block,
          id: `${block.type}-${Date.now()}-${index}`,
        }));
      } else if (content && typeof content === 'object') {
        // Single block
        const block = content as Block;
        blocks = [{
          ...block,
          id: `${block.type || 'container'}-${Date.now()}`,
        }];
      }

      if (blocks.length === 0) {
        toast.error('Template has no valid content');
        return;
      }

      onImport(blocks);
      onOpenChange(false);
      toast.success(`Imported "${template.name}" successfully`);
    } catch (error) {
      console.error('Error importing template:', error);
      toast.error('Failed to import template');
    }
  };

  const categories = [...new Set(templates.map(t => t.category))];
  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            Import from Section Library
          </DialogTitle>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const IconComponent = CATEGORY_ICONS[category] || Puzzle;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-1.5"
              >
                <IconComponent className="h-3.5 w-3.5" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            );
          })}
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Library className="h-12 w-12 mb-3 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Create templates in the Section Library</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = CATEGORY_ICONS[template.category] || Puzzle;
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-colors group overflow-hidden"
                    onClick={() => handleImport(template)}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative aspect-video bg-muted border-b">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      {template.is_system_template && (
                        <span className="absolute top-2 right-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-3 w-3 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {template.name}
                          </h4>
                          <p className="text-xs text-muted-foreground capitalize truncate">
                            {template.category} • {template.type}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  onImportBlocks,
  onUpdateBlockContent,
  onToggleCodeMode,
  viewMode,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState(0);

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

  const handleOpenLibrary = (index: number) => {
    setInsertIndex(index);
    setLibraryDialogOpen(true);
  };

  const handleImportFromLibrary = (importedBlocks: Block[]) => {
    if (onImportBlocks) {
      onImportBlocks(importedBlocks, insertIndex);
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
                        <AddWidgetButton 
                          onAddWidget={(type) => handleAddWidget(type, 0)} 
                          onOpenLibrary={() => handleOpenLibrary(0)}
                        />
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
                  {/* Top drop indicator */}
                  {isOver && blocks.length > 0 && <DropZone isOver={isOver} />}
                  
                  {blocks.map((block, index) => (
                    <div key={block.id} className="relative">
                      {/* Add widget zone BEFORE each block - appears on hover */}
                      {onAddBlock && (
                        <div className="group/add relative h-4 -mt-2 -mb-2 z-30">
                          {/* Dashed line indicator */}
                          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary/40 opacity-0 group-hover/add:opacity-100 transition-opacity" />
                          {/* Centered button container */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/add:opacity-100 transition-opacity">
                            <AddWidgetButton 
                              onAddWidget={(type) => handleAddWidget(type, index)} 
                              onOpenLibrary={() => handleOpenLibrary(index)}
                            />
                          </div>
                        </div>
                      )}
                      
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        onDelete={() => handleDeleteClick(block.id)}
                        onDuplicate={onDuplicateBlock ? () => onDuplicateBlock(block.id) : undefined}
                        onContentChange={onUpdateBlockContent ? (content) => onUpdateBlockContent(block.id, content) : undefined}
                        onToggleCodeMode={onToggleCodeMode ? () => onToggleCodeMode(block.id) : undefined}
                      />
                    </div>
                  ))}
                  
                  {/* Add widget zone at the END of all blocks */}
                  {onAddBlock && (
                    <div className="group/add relative h-4 mt-2 z-30">
                      {/* Dashed line indicator */}
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary/40 opacity-0 group-hover/add:opacity-100 transition-opacity" />
                      {/* Centered button container */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/add:opacity-100 transition-opacity">
                        <AddWidgetButton 
                          onAddWidget={(type) => handleAddWidget(type, blocks.length)} 
                          onOpenLibrary={() => handleOpenLibrary(blocks.length)}
                        />
                      </div>
                    </div>
                  )}
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

      {/* Import from Library Dialog */}
      <ImportLibraryDialog
        open={libraryDialogOpen}
        onOpenChange={setLibraryDialogOpen}
        onImport={handleImportFromLibrary}
      />
    </>
  );
}
