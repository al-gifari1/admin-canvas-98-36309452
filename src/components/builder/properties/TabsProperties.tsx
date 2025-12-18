import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface TabsPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface TabItem {
  label: string;
  content: string;
}

export function TabsProperties({ content, onUpdate, tab: activeTab }: TabsPropertiesProps) {
  const tabs = content.tabs || { 
    items: [
      { label: 'Tab 1', content: 'Content for tab 1' },
      { label: 'Tab 2', content: 'Content for tab 2' }
    ] 
  };

  const updateTabs = (items: TabItem[]) => {
    onUpdate({
      ...content,
      tabs: { items },
    });
  };

  const updateItem = (index: number, updates: Partial<TabItem>) => {
    const newItems = [...tabs.items];
    newItems[index] = { ...newItems[index], ...updates };
    updateTabs(newItems);
  };

  const addItem = () => {
    updateTabs([
      ...tabs.items,
      { label: `Tab ${tabs.items.length + 1}`, content: 'New tab content' }
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = tabs.items.filter((_, i) => i !== index);
    updateTabs(newItems);
  };

  if (activeTab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Tabs ({tabs.items.length})</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add Tab
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-2">
            {tabs.items.map((item, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Tab {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeItem(index)}
                    disabled={tabs.items.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Tab Label</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(index, { label: e.target.value })}
                    placeholder="Tab name"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Tab Content</Label>
                  <Textarea
                    value={item.content}
                    onChange={(e) => updateItem(index, { content: e.target.value })}
                    placeholder="Tab content..."
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
          Tab styling options coming soon. Tabs inherit your theme colors.
        </p>
      </div>
    </div>
  );
}
