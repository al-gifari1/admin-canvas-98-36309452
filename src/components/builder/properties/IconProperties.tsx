import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { icons } from 'lucide-react';
import { useState } from 'react';

interface IconPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

// Popular icons for quick selection
const popularIcons = [
  'Star', 'Heart', 'Check', 'X', 'Plus', 'Minus',
  'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronDown',
  'Home', 'User', 'Settings', 'Mail', 'Phone', 'MapPin',
  'Calendar', 'Clock', 'Search', 'Menu', 'Share2', 'Download',
  'Upload', 'Camera', 'Image', 'Video', 'Music', 'FileText',
  'Folder', 'Trash2', 'Edit', 'Copy', 'Save', 'Send',
  'ThumbsUp', 'MessageCircle', 'Bell', 'Lock', 'Unlock', 'Eye'
];

export function IconProperties({ content, onUpdate, tab }: IconPropertiesProps) {
  const icon = content.icon || { name: 'Star', size: 48, color: 'currentColor' };
  const [search, setSearch] = useState('');

  const updateIcon = (updates: Partial<typeof icon>) => {
    onUpdate({
      ...content,
      icon: { ...icon, ...updates },
    });
  };

  const filteredIcons = search
    ? Object.keys(icons).filter((name) => 
        name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 30)
    : popularIcons;

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Current Icon</Label>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {(() => {
              const IconComponent = icons[icon.name as keyof typeof icons];
              return IconComponent ? (
                <IconComponent className="h-8 w-8" />
              ) : (
                <div className="h-8 w-8 bg-border rounded" />
              );
            })()}
            <span className="font-medium">{icon.name}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon-search">Search Icons</Label>
          <Input
            id="icon-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
          />
        </div>

        <div className="space-y-2">
          <Label>{search ? 'Search Results' : 'Popular Icons'}</Label>
          <ScrollArea className="h-[200px] border border-border rounded-lg p-2">
            <div className="grid grid-cols-5 gap-1">
              {filteredIcons.map((name) => {
                const IconComponent = icons[name as keyof typeof icons];
                if (!IconComponent) return null;
                return (
                  <button
                    key={name}
                    onClick={() => updateIcon({ name })}
                    className={`p-2 rounded-md hover:bg-muted transition-colors ${
                      icon.name === name ? 'bg-primary/10 ring-1 ring-primary' : ''
                    }`}
                    title={name}
                  >
                    <IconComponent className="h-5 w-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Size</Label>
          <span className="text-xs text-muted-foreground">{icon.size}px</span>
        </div>
        <Slider
          value={[icon.size]}
          onValueChange={([value]) => updateIcon({ size: value })}
          min={16}
          max={128}
          step={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon-color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="icon-color"
            type="color"
            value={icon.color === 'currentColor' ? '#000000' : icon.color}
            onChange={(e) => updateIcon({ color: e.target.value })}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            value={icon.color}
            onChange={(e) => updateIcon({ color: e.target.value })}
            placeholder="currentColor"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Use "currentColor" to inherit text color
        </p>
      </div>
    </div>
  );
}
