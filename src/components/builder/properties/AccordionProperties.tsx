import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

interface AccordionPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface AccordionItem {
  title: string;
  content: string;
}

export function AccordionProperties({ content, onUpdate, tab }: AccordionPropertiesProps) {
  const accordion = content.accordion || { 
    items: [
      { title: 'Section 1', content: 'Content for section 1' },
      { title: 'Section 2', content: 'Content for section 2' }
    ] 
  };

  const updateAccordion = (items: AccordionItem[]) => {
    onUpdate({
      ...content,
      accordion: { items },
    });
  };

  const updateItem = (index: number, updates: Partial<AccordionItem>) => {
    const newItems = [...accordion.items];
    newItems[index] = { ...newItems[index], ...updates };
    updateAccordion(newItems);
  };

  const addItem = () => {
    updateAccordion([
      ...accordion.items,
      { title: `Section ${accordion.items.length + 1}`, content: 'New section content' }
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = accordion.items.filter((_, i) => i !== index);
    updateAccordion(newItems);
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Sections ({accordion.items.length})</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add Section
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-2">
            {accordion.items.map((item, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Section {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeItem(index)}
                    disabled={accordion.items.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    placeholder="Section title"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <Textarea
                    value={item.content}
                    onChange={(e) => updateItem(index, { content: e.target.value })}
                    placeholder="Section content..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Accordion styling options coming soon. Panels inherit your theme colors.
        </p>
      </div>
    </div>
  );
}
