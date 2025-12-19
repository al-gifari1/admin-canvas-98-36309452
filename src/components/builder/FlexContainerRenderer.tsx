import { CSSProperties } from 'react';
import { Block, FlexContainerContent } from '@/types/builder';
import { PaddingHandles } from './canvas/PaddingHandles';

interface FlexContainerRendererProps {
  block: Block;
  isSelected?: boolean;
  onContentChange?: (content: Partial<FlexContainerContent>) => void;
}

// Default flex container for fallback
const DEFAULT_FLEX: FlexContainerContent = {
  layout: {
    direction: 'row',
    wrap: 'wrap',
    justifyContent: 'start',
    alignItems: 'stretch',
    alignContent: 'start',
    gap: { desktop: 16, tablet: 12, mobile: 8 },
  },
  background: { type: 'solid', color: 'transparent' },
  border: {
    style: 'none',
    width: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    color: '#e5e7eb',
    radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true },
  },
  shadow: { enabled: false, horizontal: 0, vertical: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)' },
  advanced: {
    margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    padding: { top: 16, right: 16, bottom: 16, left: 16, linked: true },
    maxWidth: 'lg',
    responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  },
  canvasInteraction: {
    paddingHandles: true,
    resizable: { width: true, height: false },
  },
};

export function FlexContainerRenderer({
  block,
  isSelected = false,
  onContentChange,
}: FlexContainerRendererProps) {
  const flexContainer = block.content.flexContainer || DEFAULT_FLEX;
  const { layout, background, border, shadow, advanced, canvasInteraction } = {
    ...DEFAULT_FLEX,
    ...flexContainer,
    layout: { ...DEFAULT_FLEX.layout, ...flexContainer?.layout },
    background: { ...DEFAULT_FLEX.background, ...flexContainer?.background },
    border: { ...DEFAULT_FLEX.border, ...flexContainer?.border },
    shadow: { ...DEFAULT_FLEX.shadow, ...flexContainer?.shadow },
    advanced: { ...DEFAULT_FLEX.advanced, ...flexContainer?.advanced },
    canvasInteraction: { ...DEFAULT_FLEX.canvasInteraction, ...flexContainer?.canvasInteraction },
  };

  // Max width classes
  const maxWidthClasses: Record<string, string> = {
    full: 'max-w-full',
    lg: 'max-w-6xl',
    md: 'max-w-4xl',
    sm: 'max-w-2xl',
  };

  // Build container styles
  const containerStyles: CSSProperties = {
    paddingTop: `${advanced.padding.top}px`,
    paddingRight: `${advanced.padding.right}px`,
    paddingBottom: `${advanced.padding.bottom}px`,
    paddingLeft: `${advanced.padding.left}px`,
    marginTop: `${advanced.margin.top}px`,
    marginRight: advanced.maxWidth === 'full' ? `${advanced.margin.right}px` : 'auto',
    marginBottom: `${advanced.margin.bottom}px`,
    marginLeft: advanced.maxWidth === 'full' ? `${advanced.margin.left}px` : 'auto',
  };

  // Background
  if (background.type === 'solid' && background.color && background.color !== 'transparent') {
    containerStyles.backgroundColor = background.color;
  } else if (background.type === 'gradient' && background.gradient) {
    const { angle = 90, stops } = background.gradient;
    const gradientStops = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    containerStyles.background = `linear-gradient(${angle}deg, ${gradientStops})`;
  } else if (background.type === 'image' && background.image?.url) {
    containerStyles.backgroundImage = `url(${background.image.url})`;
    containerStyles.backgroundSize = background.image.size === 'repeat' ? 'auto' : background.image.size;
    containerStyles.backgroundRepeat = background.image.size === 'repeat' ? 'repeat' : 'no-repeat';
    containerStyles.backgroundPosition = background.image.position || 'center';
  }

  // Border
  if (border.style !== 'none') {
    containerStyles.borderStyle = border.style;
    containerStyles.borderTopWidth = `${border.width.top}px`;
    containerStyles.borderRightWidth = `${border.width.right}px`;
    containerStyles.borderBottomWidth = `${border.width.bottom}px`;
    containerStyles.borderLeftWidth = `${border.width.left}px`;
    containerStyles.borderColor = border.color;
  }
  containerStyles.borderTopLeftRadius = `${border.radius.topLeft}px`;
  containerStyles.borderTopRightRadius = `${border.radius.topRight}px`;
  containerStyles.borderBottomRightRadius = `${border.radius.bottomRight}px`;
  containerStyles.borderBottomLeftRadius = `${border.radius.bottomLeft}px`;

  // Shadow
  if (shadow.enabled) {
    containerStyles.boxShadow = `${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  }

  // Flex layout styles
  const flexStyles: CSSProperties = {
    display: 'flex',
    flexDirection: layout.direction === 'column' ? 'column' : 'row',
    flexWrap: layout.wrap,
    justifyContent:
      layout.justifyContent === 'between'
        ? 'space-between'
        : layout.justifyContent === 'around'
        ? 'space-around'
        : layout.justifyContent === 'evenly'
        ? 'space-evenly'
        : layout.justifyContent,
    alignItems: layout.alignItems,
    alignContent:
      layout.alignContent === 'between'
        ? 'space-between'
        : layout.alignContent === 'around'
        ? 'space-around'
        : layout.alignContent,
    gap: `${layout.gap.desktop}px`,
    minHeight: '80px',
  };

  // Responsive visibility classes
  const visibilityClasses: string[] = [];
  if (advanced.responsive.hideOnDesktop) visibilityClasses.push('lg:hidden');
  if (advanced.responsive.hideOnTablet) visibilityClasses.push('md:hidden lg:block');
  if (advanced.responsive.hideOnMobile) visibilityClasses.push('max-md:hidden');

  const handlePaddingChange = (newPadding: typeof advanced.padding) => {
    onContentChange?.({
      advanced: {
        ...advanced,
        padding: newPadding,
      },
    });
  };

  return (
    <div
      className={`${advanced.maxWidth !== 'custom' ? maxWidthClasses[advanced.maxWidth] || '' : ''} ${visibilityClasses.join(' ')} relative`}
      style={containerStyles}
    >
      {/* Canvas interaction: Padding handles */}
      {canvasInteraction?.paddingHandles && (
        <PaddingHandles
          padding={advanced.padding}
          onChange={handlePaddingChange}
          isSelected={isSelected}
        />
      )}

      {/* Flex content area */}
      <div style={flexStyles} className="relative">
        {/* Direction indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <span className="text-xs font-medium uppercase tracking-wider">
              {layout.direction === 'column' ? '↕ Column' : '↔ Row'}
            </span>
          </div>
        </div>

        {/* Placeholder children */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground min-h-[60px] min-w-[80px] flex items-center justify-center bg-muted/20"
          >
            <p className="text-xs">Item {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
