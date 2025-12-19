import { useState } from 'react';
import { Block, HeadingContent } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import {
  DeviceToggle,
  DeviceType,
  LinkOptionsInput,
  ColorPicker,
  TypographyControl,
  ShadowControl,
  BoxModelControl,
  CustomCSSFields,
} from '../controls';

interface HeadingPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const defaultHeading: HeadingContent = {
  text: '',
  size: 'large',
  level: 'h2',
  alignment: { desktop: 'left' },
  style: {
    textColor: { type: 'solid', solid: '' },
    typography: {
      fontFamily: 'inherit',
      fontSize: { desktop: 36 },
      fontSizeUnit: 'px',
      fontWeight: 700,
      textTransform: 'none',
      fontStyle: 'normal',
      textDecoration: 'none',
      lineHeight: { value: 1.2, unit: 'em' },
      letterSpacing: 0,
    },
    blendMode: 'normal',
  },
  advanced: {
    margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    padding: { top: 16, right: 16, bottom: 16, left: 16, linked: true },
    width: 'default',
    position: 'static',
    opacity: 100,
    border: { type: 'none', width: 0, color: '#000000', radius: 0 },
    responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  },
};

export function HeadingProperties({ content, onUpdate, tab }: HeadingPropertiesProps) {
  const [alignmentDevice, setAlignmentDevice] = useState<DeviceType>('desktop');

  // Merge with defaults to handle legacy data
  const heading: HeadingContent = {
    ...defaultHeading,
    ...content.heading,
    alignment: typeof content.heading?.alignment === 'string' 
      ? { desktop: content.heading.alignment as 'left' | 'center' | 'right' | 'justify' }
      : content.heading?.alignment || defaultHeading.alignment,
    style: {
      ...defaultHeading.style,
      ...content.heading?.style,
      typography: {
        ...defaultHeading.style.typography,
        ...content.heading?.style?.typography,
      },
    },
    advanced: {
      ...defaultHeading.advanced,
      ...content.heading?.advanced,
      margin: { ...defaultHeading.advanced.margin, ...content.heading?.advanced?.margin },
      padding: { ...defaultHeading.advanced.padding, ...content.heading?.advanced?.padding },
      border: { ...defaultHeading.advanced.border, ...content.heading?.advanced?.border },
      responsive: { ...defaultHeading.advanced.responsive, ...content.heading?.advanced?.responsive },
    },
  };

  const updateHeading = (updates: Partial<HeadingContent>) => {
    onUpdate({
      ...content,
      heading: { ...heading, ...updates },
    });
  };

  // CONTENT TAB
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="heading-text">Title</Label>
          <Textarea
            id="heading-text"
            value={heading.text}
            onChange={(e) => updateHeading({ text: e.target.value })}
            placeholder="Enter your heading..."
            rows={3}
          />
        </div>

        {/* Link */}
        <LinkOptionsInput
          label="Link"
          value={heading.link || { url: '', openInNewTab: false, nofollow: false }}
          onChange={(link) => updateHeading({ link })}
        />

        {/* Size */}
        <div className="space-y-2">
          <Label>Size</Label>
          <Select
            value={heading.size}
            onValueChange={(value) => updateHeading({ size: value as HeadingContent['size'] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
              <SelectItem value="xxl">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* HTML Tag */}
        <div className="space-y-2">
          <Label>HTML Tag</Label>
          <Select
            value={heading.level}
            onValueChange={(value) => updateHeading({ level: value as HeadingContent['level'] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
              <SelectItem value="h4">H4</SelectItem>
              <SelectItem value="h5">H5</SelectItem>
              <SelectItem value="h6">H6</SelectItem>
              <SelectItem value="div">Div</SelectItem>
              <SelectItem value="span">Span</SelectItem>
              <SelectItem value="p">P</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alignment with Responsive */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Alignment</Label>
            <DeviceToggle value={alignmentDevice} onChange={setAlignmentDevice} />
          </div>
          <ToggleGroup
            type="single"
            value={heading.alignment[alignmentDevice] || heading.alignment.desktop}
            onValueChange={(value) => {
              if (value) {
                updateHeading({
                  alignment: {
                    ...heading.alignment,
                    [alignmentDevice]: value as 'left' | 'center' | 'right' | 'justify',
                  },
                });
              }
            }}
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
            <ToggleGroupItem value="justify" aria-label="Justify">
              <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  // STYLE TAB
  if (tab === 'style') {
    return (
      <div className="space-y-4">
        {/* Text Color */}
        <ColorPicker
          label="Text Color"
          value={heading.style.textColor}
          onChange={(textColor) => updateHeading({
            style: { ...heading.style, textColor },
          })}
          showGradient={true}
        />

        {/* Typography */}
        <TypographyControl
          value={heading.style.typography as any}
          onChange={(typography) => updateHeading({
            style: { ...heading.style, typography: typography as any },
          })}
        />

        {/* Text Shadow */}
        <ShadowControl
          label="Text Shadow"
          value={heading.style.textShadow || { horizontal: 0, vertical: 0, blur: 0, color: 'rgba(0,0,0,0.3)' }}
          onChange={(textShadow) => updateHeading({
            style: { ...heading.style, textShadow },
          })}
        />

        {/* Blend Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Blend Mode</Label>
          <Select
            value={heading.style.blendMode}
            onValueChange={(value) => updateHeading({
              style: { ...heading.style, blendMode: value },
            })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="screen">Screen</SelectItem>
              <SelectItem value="overlay">Overlay</SelectItem>
              <SelectItem value="darken">Darken</SelectItem>
              <SelectItem value="lighten">Lighten</SelectItem>
              <SelectItem value="color-dodge">Color Dodge</SelectItem>
              <SelectItem value="color-burn">Color Burn</SelectItem>
              <SelectItem value="hard-light">Hard Light</SelectItem>
              <SelectItem value="soft-light">Soft Light</SelectItem>
              <SelectItem value="difference">Difference</SelectItem>
              <SelectItem value="exclusion">Exclusion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // ADVANCED TAB
  return (
    <div className="space-y-4">
      {/* Margin */}
      <BoxModelControl
        label="Margin"
        value={heading.advanced.margin}
        onChange={(margin) => updateHeading({
          advanced: { ...heading.advanced, margin },
        })}
      />

      {/* Padding */}
      <BoxModelControl
        label="Padding"
        value={heading.advanced.padding}
        onChange={(padding) => updateHeading({
          advanced: { ...heading.advanced, padding },
        })}
      />

      {/* Width */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Width</Label>
        <Select
          value={heading.advanced.width}
          onValueChange={(value) => updateHeading({
            advanced: { ...heading.advanced, width: value as HeadingContent['advanced']['width'] },
          })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="full">Full Width (100%)</SelectItem>
            <SelectItem value="inline">Inline (Auto)</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {heading.advanced.width === 'custom' && (
          <div className="flex items-center gap-2 mt-2">
            <Slider
              value={[heading.advanced.customWidth || 100]}
              onValueChange={([v]) => updateHeading({
                advanced: { ...heading.advanced, customWidth: v },
              })}
              min={10}
              max={100}
              className="flex-1"
            />
            <span className="text-xs w-8">{heading.advanced.customWidth || 100}%</span>
          </div>
        )}
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Position</Label>
        <Select
          value={heading.advanced.position}
          onValueChange={(value) => updateHeading({
            advanced: { ...heading.advanced, position: value as HeadingContent['advanced']['position'] },
          })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="relative">Relative</SelectItem>
            <SelectItem value="absolute">Absolute</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
        {heading.advanced.position !== 'static' && (
          <div className="mt-2">
            <Label className="text-xs text-muted-foreground">Z-Index</Label>
            <Input
              type="number"
              value={heading.advanced.zIndex || 0}
              onChange={(e) => updateHeading({
                advanced: { ...heading.advanced, zIndex: Number(e.target.value) },
              })}
              className="h-8 text-xs mt-1"
            />
          </div>
        )}
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Opacity</Label>
          <span className="text-xs text-muted-foreground">{heading.advanced.opacity}%</span>
        </div>
        <Slider
          value={[heading.advanced.opacity]}
          onValueChange={([v]) => updateHeading({
            advanced: { ...heading.advanced, opacity: v },
          })}
          min={0}
          max={100}
        />
      </div>

      {/* Border */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Border</Label>
        <Select
          value={heading.advanced.border.type}
          onValueChange={(value) => updateHeading({
            advanced: {
              ...heading.advanced,
              border: { ...heading.advanced.border, type: value as HeadingContent['advanced']['border']['type'] },
            },
          })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
            <SelectItem value="double">Double</SelectItem>
          </SelectContent>
        </Select>
        {heading.advanced.border.type !== 'none' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={heading.advanced.border.width}
                onChange={(e) => updateHeading({
                  advanced: {
                    ...heading.advanced,
                    border: { ...heading.advanced.border, width: Number(e.target.value) },
                  },
                })}
                className="h-8 text-xs"
                min={0}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Radius</Label>
              <Input
                type="number"
                value={heading.advanced.border.radius}
                onChange={(e) => updateHeading({
                  advanced: {
                    ...heading.advanced,
                    border: { ...heading.advanced.border, radius: Number(e.target.value) },
                  },
                })}
                className="h-8 text-xs"
                min={0}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={heading.advanced.border.color}
                  onChange={(e) => updateHeading({
                    advanced: {
                      ...heading.advanced,
                      border: { ...heading.advanced.border, color: e.target.value },
                    },
                  })}
                  className="w-10 h-8 p-0 border-0"
                />
                <Input
                  value={heading.advanced.border.color}
                  onChange={(e) => updateHeading({
                    advanced: {
                      ...heading.advanced,
                      border: { ...heading.advanced.border, color: e.target.value },
                    },
                  })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Visibility */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Responsive Visibility</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide on Desktop</Label>
            <Switch
              checked={heading.advanced.responsive.hideOnDesktop}
              onCheckedChange={(checked) => updateHeading({
                advanced: {
                  ...heading.advanced,
                  responsive: { ...heading.advanced.responsive, hideOnDesktop: checked },
                },
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide on Tablet</Label>
            <Switch
              checked={heading.advanced.responsive.hideOnTablet}
              onCheckedChange={(checked) => updateHeading({
                advanced: {
                  ...heading.advanced,
                  responsive: { ...heading.advanced.responsive, hideOnTablet: checked },
                },
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide on Mobile</Label>
            <Switch
              checked={heading.advanced.responsive.hideOnMobile}
              onCheckedChange={(checked) => updateHeading({
                advanced: {
                  ...heading.advanced,
                  responsive: { ...heading.advanced.responsive, hideOnMobile: checked },
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* Custom CSS Attributes */}
      <CustomCSSFields
        cssId={heading.advanced.cssId}
        cssClasses={heading.advanced.cssClasses}
        customCSS={heading.advanced.customCSS}
        onCssIdChange={(cssId) => updateHeading({
          advanced: { ...heading.advanced, cssId },
        })}
        onCssClassesChange={(cssClasses) => updateHeading({
          advanced: { ...heading.advanced, cssClasses },
        })}
        onCustomCSSChange={(customCSS) => updateHeading({
          advanced: { ...heading.advanced, customCSS },
        })}
      />
    </div>
  );
}
