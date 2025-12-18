import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Block } from '@/types/builder';
import { HeroSection } from './sections/HeroSection';
import { ProductShowcaseSection } from './sections/ProductShowcaseSection';
import { CheckoutSection } from './sections/CheckoutSection';
import { Button } from '@/components/ui/button';

interface BuilderCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  viewMode: 'mobile' | 'desktop';
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
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

  const renderSection = () => {
    switch (block.type) {
      case 'hero':
        return <HeroSection block={block} />;
      case 'product-showcase':
        return <ProductShowcaseSection block={block} />;
      case 'checkout':
        return <CheckoutSection block={block} />;
      default:
        return (
          <div className="p-8 bg-muted text-center text-muted-foreground">
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 z-50' : ''} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Controls overlay */}
      <div
        className={`absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 rounded bg-card border border-border shadow-sm hover:bg-accent cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded bg-card border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Section content */}
      <div className="pointer-events-none">{renderSection()}</div>
    </div>
  );
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  viewMode,
}: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div
      className="flex-1 bg-muted/30 overflow-auto p-8"
      onClick={() => onSelectBlock(null)}
    >
      <div
        ref={setNodeRef}
        className={`mx-auto bg-background shadow-xl rounded-lg overflow-hidden min-h-[600px] transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1024px]'
        } ${isOver ? 'ring-2 ring-primary ring-dashed' : ''}`}
      >
        {blocks.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-border rounded-lg m-4">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Drag sections here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Build your landing page by adding sections
              </p>
            </div>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative pl-12">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
