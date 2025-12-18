import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ResponsiveSlider, ResponsiveValue, SizeUnit } from './ResponsiveSlider';

export interface TypographyValue {
  fontFamily: string;
  fontSize: ResponsiveValue;
  fontSizeUnit: SizeUnit;
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle: 'normal' | 'italic' | 'oblique';
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  lineHeight: { value: number; unit: 'em' | 'px' };
  letterSpacing: number;
}

interface TypographyControlProps {
  value: TypographyValue;
  onChange: (value: TypographyValue) => void;
}

const fontFamilies = [
  { value: 'inherit', label: 'Default' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'monospace', label: 'Monospace' },
];

const fontWeights = [
  { value: 100, label: 'Thin (100)' },
  { value: 200, label: 'Extra Light (200)' },
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' },
];

export function TypographyControl({ value, onChange }: TypographyControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const update = (updates: Partial<TypographyValue>) => {
    onChange({ ...value, ...updates });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground text-muted-foreground">
        <span>Typography</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2">
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Font Family</Label>
          <Select value={value.fontFamily} onValueChange={(v) => update({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <ResponsiveSlider
          label="Font Size"
          value={value.fontSize}
          onChange={(v) => update({ fontSize: v })}
          min={8}
          max={120}
          unit={value.fontSizeUnit}
          onUnitChange={(u) => update({ fontSizeUnit: u })}
          units={['px', 'rem', 'vw']}
        />

        {/* Font Weight */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Weight</Label>
          <Select value={String(value.fontWeight)} onValueChange={(v) => update({ fontWeight: Number(v) })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontWeights.map((weight) => (
                <SelectItem key={weight.value} value={String(weight.value)}>
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Transform */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Transform</Label>
          <Select value={value.textTransform} onValueChange={(v) => update({ textTransform: v as TypographyValue['textTransform'] })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="lowercase">lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Style */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Style</Label>
          <Select value={value.fontStyle} onValueChange={(v) => update({ fontStyle: v as TypographyValue['fontStyle'] })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
              <SelectItem value="oblique">Oblique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Decoration */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Decoration</Label>
          <Select value={value.textDecoration} onValueChange={(v) => update({ textDecoration: v as TypographyValue['textDecoration'] })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="line-through">Line Through</SelectItem>
              <SelectItem value="overline">Overline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Line Height</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[value.lineHeight.value]}
              onValueChange={([v]) => update({ lineHeight: { ...value.lineHeight, value: v } })}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <Input
              type="number"
              value={value.lineHeight.value}
              onChange={(e) => update({ lineHeight: { ...value.lineHeight, value: Number(e.target.value) } })}
              className="w-16 h-8 text-xs"
              step={0.1}
            />
            <Select 
              value={value.lineHeight.unit} 
              onValueChange={(v) => update({ lineHeight: { ...value.lineHeight, unit: v as 'em' | 'px' } })}
            >
              <SelectTrigger className="w-14 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em">em</SelectItem>
                <SelectItem value="px">px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Letter Spacing</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[value.letterSpacing]}
              onValueChange={([v]) => update({ letterSpacing: v })}
              min={-5}
              max={20}
              step={0.5}
              className="flex-1"
            />
            <Input
              type="number"
              value={value.letterSpacing}
              onChange={(e) => update({ letterSpacing: Number(e.target.value) })}
              className="w-16 h-8 text-xs"
              step={0.5}
            />
            <span className="text-xs text-muted-foreground w-6">px</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
