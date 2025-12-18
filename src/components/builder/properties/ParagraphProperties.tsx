import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ParagraphPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function ParagraphProperties({ content, onUpdate, tab }: ParagraphPropertiesProps) {
  const paragraph = content.paragraph || { text: '', alignment: 'left' as const };

  const updateParagraph = (updates: Partial<typeof paragraph>) => {
    onUpdate({
      ...content,
      paragraph: { ...paragraph, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paragraph-text">Text Content</Label>
          <Textarea
            id="paragraph-text"
            value={paragraph.text}
            onChange={(e) => updateParagraph({ text: e.target.value })}
            placeholder="Enter your text..."
            rows={6}
          />
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <ToggleGroup
          type="single"
          value={paragraph.alignment}
          onValueChange={(value) => value && updateParagraph({ alignment: value as typeof paragraph.alignment })}
          className="justify-start"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
