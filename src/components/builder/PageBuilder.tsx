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
import { ArrowLeft, Save, Eye, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { BuilderLibrary } from '@/components/builder/BuilderLibrary';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { BuilderEditor } from '@/components/builder/BuilderEditor';
import { Block, BlockType, PageContent, DEFAULT_BLOCK_CONTENT } from '@/types/builder';

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
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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
          setBlocks(pageData.content.blocks);
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
      const blockType = activeData.type as BlockType;
      const newBlock: Block = {
        id: generateBlockId(),
        type: blockType,
        content: { ...DEFAULT_BLOCK_CONTENT[blockType] },
      };
      setBlocks((prev) => [...prev, newBlock]);
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
    // Open preview in new tab (you could implement a proper preview route)
    toast({
      title: 'Preview',
      description: 'Preview functionality will open the published page.',
    });
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
          {/* Zone A: Library */}
          <BuilderLibrary />

          {/* Zone B: Canvas */}
          <BuilderCanvas
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onDeleteBlock={handleDeleteBlock}
            viewMode={viewMode}
          />

          {/* Zone C: Editor */}
          <BuilderEditor
            block={selectedBlock}
            onClose={() => setSelectedBlockId(null)}
            onUpdate={handleUpdateBlock}
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
