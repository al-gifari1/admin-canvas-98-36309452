import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Save, Eye, Monitor, Smartphone, Loader2, Undo2, Redo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/useHistory';
import { WidgetLibrary } from '@/components/builder/WidgetLibrary';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { Block, WidgetType, PageContent, DEFAULT_WIDGET_CONTENT } from '@/types/builder';
import { generateHTMLFromBlock } from '@/utils/htmlGenerator';

interface PageBuilderProps {
  pageId: string;
  onBack: () => void;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  content: PageContent | null;
}

export function PageBuilder({ pageId, onBack }: PageBuilderProps) {
  const [page, setPage] = useState<LandingPage | null>(null);
  const { state: blocks, set: setBlocks, undo, redo, canUndo, canRedo, reset: resetBlocks } = useHistory<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch page data
  useEffect(() => {
    async function fetchPage() {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id, title, slug, is_published, content')
        .eq('id', pageId)
        .single();

      if (error) {
        console.error('Error fetching page:', error);
        toast({
          title: 'Error loading page',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        const pageData: LandingPage = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          is_published: data.is_published ?? false,
          content: data.content as unknown as PageContent | null,
        };
        setPage(pageData);
        // Load blocks from content
        if (pageData.content?.blocks) {
          resetBlocks(pageData.content.blocks);
        }
      }
      setIsLoading(false);
    }

    fetchPage();
  }, [pageId]);

  const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging from library
    const activeData = active.data.current;
    if (activeData?.fromLibrary) {
      const widgetType = activeData.type as WidgetType;
      const newBlock: Block = {
        id: generateBlockId(),
        type: widgetType,
        content: { ...DEFAULT_WIDGET_CONTENT[widgetType] },
      };
      
      // Insert at drop position if over a block, otherwise at end
      if (over.id === 'canvas') {
        setBlocks((prev) => [...prev, newBlock]);
      } else {
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        if (overIndex >= 0) {
          setBlocks((prev) => {
            const newBlocks = [...prev];
            newBlocks.splice(overIndex, 0, newBlock);
            return newBlocks;
          });
        } else {
          setBlocks((prev) => [...prev, newBlock]);
        }
      }
      setSelectedBlockId(newBlock.id);
      return;
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Add block at specific index (used by AddWidgetButton)
  const handleAddBlock = (type: WidgetType, index: number) => {
    const newBlock: Block = {
      id: generateBlockId(),
      type,
      content: { ...DEFAULT_WIDGET_CONTENT[type] },
    };
    setBlocks((prev) => {
      const newBlocks = [...prev];
      newBlocks.splice(index, 0, newBlock);
      return newBlocks;
    });
    setSelectedBlockId(newBlock.id);
  };

  // Import multiple blocks from library at specific index
  const handleImportBlocks = (importedBlocks: Block[], index: number) => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      newBlocks.splice(index, 0, ...importedBlocks);
      return newBlocks;
    });
    // Select the first imported block
    if (importedBlocks.length > 0) {
      setSelectedBlockId(importedBlocks[0].id);
    }
  };

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const handleUpdateBlock = useCallback((blockId: string, content: Block['content']) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  }, []);

  // Partial content update for canvas interactions (padding handles, gap handles, etc.)
  const handleUpdateBlockContent = useCallback((blockId: string, partialContent: Partial<Block['content']>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId 
          ? { ...block, content: { ...block.content, ...partialContent } } 
          : block
      )
    );
  }, []);

  // Toggle Code Mode for a block
  const handleToggleCodeMode = useCallback((blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;

        // If already in code mode, do nothing (use revert button)
        if (block.mode === 'code') {
          return block;
        }

        // Switch TO code mode
        const htmlContent = generateHTMLFromBlock(block);
        return {
          ...block,
          mode: 'code' as const,
          htmlContent,
          lastVisualSnapshot: { ...block.content },
          codeVersionHistory: [
            {
              timestamp: new Date().toISOString(),
              htmlContent,
            },
          ],
        };
      })
    );
  }, []);

  // Revert from code mode to visual mode
  const handleRevertToVisual = useCallback((blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId || !block.lastVisualSnapshot) return block;

        return {
          ...block,
          mode: 'visual' as const,
          content: block.lastVisualSnapshot,
          htmlContent: undefined,
          // Keep history for reference
        };
      })
    );
    toast({
      title: 'Reverted to Visual Mode',
      description: 'Your section has been restored to its last visual state.',
    });
  }, []);

  // Update block with partial updates (for code mode HTML changes)
  const handleUpdateBlockPartial = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, []);

  const handleSave = async () => {
    if (!page) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('landing_pages')
      .update({
        content: { blocks } as unknown as null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error saving page',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Page saved',
        description: 'Your changes have been saved successfully.',
      });
    }
  };

  const handlePreview = () => {
    window.open(`/preview/${pageId}`, '_blank');
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Page not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Builder
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{page.title}</span>
            <Badge variant={page.is_published ? 'default' : 'secondary'}>
              {page.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Zone A: Widget Library */}
          <WidgetLibrary />

          {/* Zone B: Canvas */}
          <BuilderCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={(id) => {
              const block = blocks.find(b => b.id === id);
              if (block) {
                const newBlock: Block = {
                  id: generateBlockId(),
                  type: block.type,
                  content: { ...block.content },
                };
                const index = blocks.findIndex(b => b.id === id);
                setBlocks((prev) => {
                  const newBlocks = [...prev];
                  newBlocks.splice(index + 1, 0, newBlock);
                  return newBlocks;
                });
                setSelectedBlockId(newBlock.id);
              }
            }}
            onAddBlock={handleAddBlock}
            onImportBlocks={handleImportBlocks}
            onUpdateBlockContent={handleUpdateBlockContent}
            onToggleCodeMode={handleToggleCodeMode}
            viewMode={viewMode}
          />

          {/* Zone C: Properties Panel */}
          <PropertiesPanel
            block={selectedBlock}
            onClose={() => setSelectedBlockId(null)}
            onUpdate={handleUpdateBlock}
            onUpdateBlock={handleUpdateBlockPartial}
            onRevertToVisual={handleRevertToVisual}
          />

          <DragOverlay>
            {activeId ? (
              <div className="p-3 rounded-lg border-2 border-primary bg-card shadow-lg">
                <p className="text-sm font-medium text-foreground">
                  {activeId.startsWith('library-')
                    ? activeId.replace('library-', '').replace('-', ' ')
                    : 'Moving section...'}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
