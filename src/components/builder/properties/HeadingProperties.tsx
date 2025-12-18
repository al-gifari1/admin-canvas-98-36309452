import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface HeadingPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function HeadingProperties({ content, onUpdate, tab }: HeadingPropertiesProps) {
  const heading = content.heading || { text: '', level: 'h2' as const, alignment: 'left' as const };

  const updateHeading = (updates: Partial<typeof heading>) => {
    onUpdate({
      ...content,
      heading: { ...heading, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="heading-text">Heading Text</Label>
          <Textarea
            id="heading-text"
            value={heading.text}
            onChange={(e) => updateHeading({ text: e.target.value })}
            placeholder="Enter your heading..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heading-level">HTML Tag</Label>
          <Select
            value={heading.level}
            onValueChange={(value) => updateHeading({ level: value as typeof heading.level })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 - Main Title</SelectItem>
              <SelectItem value="h2">H2 - Section Title</SelectItem>
              <SelectItem value="h3">H3 - Subsection</SelectItem>
              <SelectItem value="h4">H4 - Minor Heading</SelectItem>
              <SelectItem value="h5">H5 - Small Heading</SelectItem>
              <SelectItem value="h6">H6 - Smallest</SelectItem>
            </SelectContent>
          </Select>
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
          value={heading.alignment}
          onValueChange={(value) => value && updateHeading({ alignment: value as typeof heading.alignment })}
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
