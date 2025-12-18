import { useDraggable } from '@dnd-kit/core';
import { Layout, ShoppingCart, Image, MessageSquare, List, HelpCircle } from 'lucide-react';
import { BlockType } from '@/types/builder';

interface SectionItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionItem[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    description: 'Headline, subtext, image & CTA',
    icon: Layout,
  },
  {
    type: 'product-showcase',
    label: 'Product Showcase',
    description: 'Image with product details',
    icon: Image,
  },
  {
    type: 'checkout',
    label: 'Checkout Form',
    description: 'Order form placeholder',
    icon: ShoppingCart,
  },
];

function DraggableSectionItem({ section }: { section: SectionItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${section.type}`,
    data: { type: section.type, fromLibrary: true },
  });

  const Icon = section.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-card-foreground">
            {section.label}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {section.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuilderLibrary() {
  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Section Library</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag sections to the canvas
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {SECTIONS.map((section) => (
          <DraggableSectionItem key={section.type} section={section} />
        ))}
      </div>
    </div>
  );
}
