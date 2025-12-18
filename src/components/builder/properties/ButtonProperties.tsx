import { Block, ButtonContent } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { DeviceToggle, ResponsiveSlider, ColorPicker, BoxModelControl, LinkOptionsInput } from '../controls';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { icons } from 'lucide-react';

interface ButtonPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const DEFAULT_BUTTON: ButtonContent = {
  text: 'Click Me',
  link: { url: '#', openInNewTab: false, nofollow: false },
  icon: { enabled: false, name: 'ArrowRight', position: 'right', spacing: 8 },
  buttonType: 'button',
  alignment: { desktop: 'left' },
  style: {
    typography: {
      fontFamily: 'inherit',
      fontSize: { desktop: 16 },
      fontSizeUnit: 'px',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: 0,
    },
    normal: { textColor: '', backgroundColor: '', borderColor: '' },
    hover: { textColor: '', backgroundColor: '', borderColor: '', transitionDuration: 300 },
    padding: { top: 12, right: 24, bottom: 12, left: 24, linked: false },
    borderRadius: 8,
    borderWidth: 0,
  },
  advanced: {
    margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    width: 'auto',
    customWidthUnit: 'px',
    responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  },
};

// Popular icon options for buttons
const ICON_OPTIONS = [
  'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronLeft', 'ChevronDown',
  'ExternalLink', 'Download', 'Upload', 'Play', 'ShoppingCart', 'Heart',
  'Star', 'Check', 'Plus', 'Minus', 'Send', 'Mail', 'Phone', 'Calendar',
];

const FONT_OPTIONS = [
  { value: 'inherit', label: 'Inherit' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
];

export function ButtonProperties({ content, onUpdate, tab }: ButtonPropertiesProps) {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Merge with defaults, handling legacy format
  const rawButton = content.button;
  const button: ButtonContent = rawButton && 'link' in rawButton 
    ? { ...DEFAULT_BUTTON, ...rawButton }
    : { 
        ...DEFAULT_BUTTON, 
        text: rawButton?.text || DEFAULT_BUTTON.text,
        link: { url: (rawButton as any)?.url || '#', openInNewTab: false, nofollow: false },
      };

  const updateButton = (updates: Partial<ButtonContent>) => {
    onUpdate({
      ...content,
      button: { ...button, ...updates },
    });
  };

  const updateStyle = (updates: Partial<ButtonContent['style']>) => {
    updateButton({
      style: { ...button.style, ...updates },
    });
  };

  const updateAdvanced = (updates: Partial<ButtonContent['advanced']>) => {
    updateButton({
      advanced: { ...button.advanced, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        {/* Button Text */}
        <div className="space-y-2">
          <Label htmlFor="button-text">Button Text</Label>
          <Input
            id="button-text"
            value={button.text}
            onChange={(e) => updateButton({ text: e.target.value })}
            placeholder="Enter button text..."
          />
        </div>

        {/* Link Options */}
        <LinkOptionsInput
          label="Link URL"
          value={button.link}
          onChange={(link) => updateButton({ link })}
        />

        {/* Button Type */}
        <div className="space-y-2">
          <Label>Button Type</Label>
          <Select
            value={button.buttonType}
            onValueChange={(value) => updateButton({ buttonType: value as ButtonContent['buttonType'] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="submit">Submit</SelectItem>
              <SelectItem value="reset">Reset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon */}
        <div className="space-y-3 p-3 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <Label>Icon</Label>
            <Switch
              checked={button.icon.enabled}
              onCheckedChange={(enabled) => updateButton({ 
                icon: { ...button.icon, enabled } 
              })}
            />
          </div>
          
          {button.icon.enabled && (
            <>
              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Select
                  value={button.icon.name}
                  onValueChange={(name) => updateButton({ 
                    icon: { ...button.icon, name } 
                  })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-60">
                    {ICON_OPTIONS.map((iconName) => {
                      const IconComponent = icons[iconName as keyof typeof icons];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <span className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            {iconName}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={button.icon.position}
                  onValueChange={(position) => updateButton({ 
                    icon: { ...button.icon, position: position as 'left' | 'right' } 
                  })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Icon Spacing ({button.icon.spacing}px)</Label>
                <Slider
                  value={[button.icon.spacing]}
                  onValueChange={([spacing]) => updateButton({ 
                    icon: { ...button.icon, spacing } 
                  })}
                  min={0}
                  max={24}
                  step={1}
                />
              </div>
            </>
          )}
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Alignment</Label>
            <DeviceToggle value={activeDevice} onChange={setActiveDevice} />
          </div>
          <ToggleGroup
            type="single"
            value={button.alignment[activeDevice] || button.alignment.desktop}
            onValueChange={(value) => value && updateButton({ 
              alignment: { ...button.alignment, [activeDevice]: value as 'left' | 'center' | 'right' | 'stretch' } 
            })}
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
            <ToggleGroupItem value="stretch" aria-label="Stretch">
              <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  if (tab === 'style') {
    return (
      <div className="space-y-6">
        {/* Typography */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Typography</h4>
          
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={button.style.typography.fontFamily}
              onValueChange={(fontFamily) => updateStyle({ 
                typography: { ...button.style.typography, fontFamily } 
              })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ResponsiveSlider
            label="Font Size"
            value={button.style.typography.fontSize}
            onChange={(fontSize) => updateStyle({ 
              typography: { ...button.style.typography, fontSize } 
            })}
            min={10}
            max={48}
            step={1}
            unit={button.style.typography.fontSizeUnit}
            units={['px', 'rem']}
            onUnitChange={(fontSizeUnit) => updateStyle({ 
              typography: { ...button.style.typography, fontSizeUnit: fontSizeUnit as 'px' | 'rem' } 
            })}
          />

          <div className="space-y-2">
            <Label>Font Weight ({button.style.typography.fontWeight})</Label>
            <Slider
              value={[button.style.typography.fontWeight]}
              onValueChange={([fontWeight]) => updateStyle({ 
                typography: { ...button.style.typography, fontWeight } 
              })}
              min={100}
              max={900}
              step={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Text Transform</Label>
            <Select
              value={button.style.typography.textTransform}
              onValueChange={(textTransform) => updateStyle({ 
                typography: { ...button.style.typography, textTransform: textTransform as ButtonContent['style']['typography']['textTransform'] } 
              })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="uppercase">UPPERCASE</SelectItem>
                <SelectItem value="lowercase">lowercase</SelectItem>
                <SelectItem value="capitalize">Capitalize</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Letter Spacing ({button.style.typography.letterSpacing}px)</Label>
            <Slider
              value={[button.style.typography.letterSpacing]}
              onValueChange={([letterSpacing]) => updateStyle({ 
                typography: { ...button.style.typography, letterSpacing } 
              })}
              min={-2}
              max={10}
              step={0.5}
            />
          </div>
        </div>

        {/* Normal State Colors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Normal State</h4>
          
          <ColorPicker
            label="Text Color"
            value={{ type: 'solid', solid: button.style.normal.textColor }}
            onChange={(val) => updateStyle({ 
              normal: { ...button.style.normal, textColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />
          
          <ColorPicker
            label="Background Color"
            value={{ type: 'solid', solid: button.style.normal.backgroundColor }}
            onChange={(val) => updateStyle({ 
              normal: { ...button.style.normal, backgroundColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />
          
          <ColorPicker
            label="Border Color"
            value={{ type: 'solid', solid: button.style.normal.borderColor }}
            onChange={(val) => updateStyle({ 
              normal: { ...button.style.normal, borderColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />
        </div>

        {/* Hover State Colors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Hover State</h4>
          
          <ColorPicker
            label="Text Color"
            value={{ type: 'solid', solid: button.style.hover.textColor }}
            onChange={(val) => updateStyle({ 
              hover: { ...button.style.hover, textColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />
          
          <ColorPicker
            label="Background Color"
            value={{ type: 'solid', solid: button.style.hover.backgroundColor }}
            onChange={(val) => updateStyle({ 
              hover: { ...button.style.hover, backgroundColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />
          
          <ColorPicker
            label="Border Color"
            value={{ type: 'solid', solid: button.style.hover.borderColor }}
            onChange={(val) => updateStyle({ 
              hover: { ...button.style.hover, borderColor: val.type === 'solid' ? val.solid || '' : '' } 
            })}
          />

          <div className="space-y-2">
            <Label>Transition Duration ({button.style.hover.transitionDuration}ms)</Label>
            <Slider
              value={[button.style.hover.transitionDuration]}
              onValueChange={([transitionDuration]) => updateStyle({ 
                hover: { ...button.style.hover, transitionDuration } 
              })}
              min={0}
              max={1000}
              step={50}
            />
          </div>
        </div>

        {/* Padding */}
        <BoxModelControl
          label="Padding"
          value={button.style.padding}
          onChange={(padding) => updateStyle({ padding })}
          unit="px"
        />

        {/* Border */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Border</h4>
          
          <div className="space-y-2">
            <Label>Border Width ({button.style.borderWidth}px)</Label>
            <Slider
              value={[button.style.borderWidth]}
              onValueChange={([borderWidth]) => updateStyle({ borderWidth })}
              min={0}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Border Radius ({button.style.borderRadius}px)</Label>
            <Slider
              value={[button.style.borderRadius]}
              onValueChange={([borderRadius]) => updateStyle({ borderRadius })}
              min={0}
              max={50}
              step={1}
            />
          </div>
        </div>
      </div>
    );
  }

  // Advanced tab
  return (
    <div className="space-y-6">
      {/* Margin */}
      <BoxModelControl
        label="Margin"
        value={button.advanced.margin}
        onChange={(margin) => updateAdvanced({ margin })}
        unit="px"
      />

      {/* Width */}
      <div className="space-y-2">
        <Label>Width</Label>
        <Select
          value={button.advanced.width}
          onValueChange={(width) => updateAdvanced({ width: width as ButtonContent['advanced']['width'] })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="full">Full Width (100%)</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {button.advanced.width === 'custom' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={button.advanced.customWidth || ''}
              onChange={(e) => updateAdvanced({ customWidth: Number(e.target.value) })}
              placeholder="Width value"
              className="flex-1"
            />
            <Select
              value={button.advanced.customWidthUnit}
              onValueChange={(unit) => updateAdvanced({ customWidthUnit: unit as 'px' | '%' })}
            >
              <SelectTrigger className="w-20 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="%">%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Responsive Visibility */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Responsive Visibility</h4>
        
        <div className="flex items-center justify-between">
          <Label className="text-sm">Hide on Desktop</Label>
          <Switch
            checked={button.advanced.responsive.hideOnDesktop}
            onCheckedChange={(hideOnDesktop) => updateAdvanced({ 
              responsive: { ...button.advanced.responsive, hideOnDesktop } 
            })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-sm">Hide on Tablet</Label>
          <Switch
            checked={button.advanced.responsive.hideOnTablet}
            onCheckedChange={(hideOnTablet) => updateAdvanced({ 
              responsive: { ...button.advanced.responsive, hideOnTablet } 
            })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-sm">Hide on Mobile</Label>
          <Switch
            checked={button.advanced.responsive.hideOnMobile}
            onCheckedChange={(hideOnMobile) => updateAdvanced({ 
              responsive: { ...button.advanced.responsive, hideOnMobile } 
            })}
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Custom Attributes</h4>
        
        <div className="space-y-2">
          <Label htmlFor="css-id">CSS ID</Label>
          <Input
            id="css-id"
            value={button.advanced.cssId || ''}
            onChange={(e) => updateAdvanced({ cssId: e.target.value })}
            placeholder="my-button"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="css-classes">CSS Classes</Label>
          <Input
            id="css-classes"
            value={button.advanced.cssClasses || ''}
            onChange={(e) => updateAdvanced({ cssClasses: e.target.value })}
            placeholder="class-1 class-2"
          />
        </div>
      </div>
    </div>
  );
}
