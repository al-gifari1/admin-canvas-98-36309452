import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, ChevronDown, ChevronRight, GripVertical, HelpCircle, SearchX, LucideIcon } from 'lucide-react';
import { icons } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { WIDGET_LIBRARY, WidgetDefinition, type WidgetCategory as WidgetCategoryType } from '@/types/builder';

const CATEGORY_CONFIG: Record<WidgetCategoryType, { label: string; color: string }> = {
  basic: { label: 'Basic', color: 'bg-blue-500/10 text-blue-600' },
  media: { label: 'Media', color: 'bg-purple-500/10 text-purple-600' },
  layout: { label: 'Layout', color: 'bg-green-500/10 text-green-600' },
  commerce: { label: 'Commerce & Marketing', color: 'bg-orange-500/10 text-orange-600' },
  legacy: { label: 'Legacy Sections', color: 'bg-muted text-muted-foreground' },
};

function getIconByName(name: string): LucideIcon {
  const icon = icons[name as keyof typeof icons];
  return icon || HelpCircle;
}

function DraggableWidget({ widget }: { widget: WidgetDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${widget.type}`,
    data: { type: widget.type, fromLibrary: true },
  });

  const IconComponent = getIconByName(widget.icon);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 scale-95 ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {widget.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {widget.description}
        </p>
      </div>
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function WidgetCategoryGroup({ 
  category, 
  widgets, 
  defaultOpen = true 
}: { 
  category: WidgetCategoryType; 
  widgets: WidgetDefinition[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = CATEGORY_CONFIG[category];

  if (widgets.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 text-sm font-semibold text-foreground hover:text-primary transition-colors">
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>{config.label}</span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {widgets.length}
          </Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pb-4">
          {widgets.map((widget) => (
            <DraggableWidget key={widget.type} widget={widget} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WidgetLibrary() {
  type GroupedWidgets = Record<WidgetCategoryType, WidgetDefinition[]>;
  const [searchQuery, setSearchQuery] = useState('');

  const groupedWidgets = useMemo(() => {
    const filtered = searchQuery
      ? WIDGET_LIBRARY.filter(
          (w) =>
            w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : WIDGET_LIBRARY;

    const groups: GroupedWidgets = {
      basic: [],
      media: [],
      layout: [],
      commerce: [],
      legacy: [],
    };

    filtered.forEach((widget) => {
      groups[widget.category].push(widget);
    });

    return groups;
  }, [searchQuery]);

  const totalResults = Object.values(groupedWidgets).flat().length;

  return (
    <div className="w-[300px] border-r border-border bg-card flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-foreground">Widgets</h2>
          <Badge variant="outline" className="text-xs">
            {totalResults} items
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Widget List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {totalResults === 0 ? (
            <div className="text-center py-8">
              <SearchX className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No widgets found</p>
            </div>
          ) : (
            <>
              <WidgetCategoryGroup category="basic" widgets={groupedWidgets.basic} />
              <WidgetCategoryGroup category="media" widgets={groupedWidgets.media} />
              <WidgetCategoryGroup category="layout" widgets={groupedWidgets.layout} />
              <WidgetCategoryGroup category="commerce" widgets={groupedWidgets.commerce} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Drag widgets onto the canvas to build your page
        </p>
      </div>
    </div>
  );
}
