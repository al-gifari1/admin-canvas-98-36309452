import { CSSProperties } from 'react';
import { Block, SmartGridContent } from '@/types/builder';
import { GapHandles, GridGuides } from './canvas';
import { ScopedStyle } from './ScopedStyle';

interface SmartGridRendererProps {
  block: Block;
  isSelected?: boolean;
  onContentChange?: (content: Partial<SmartGridContent>) => void;
}

// Default smart grid for fallback
const DEFAULT_GRID: SmartGridContent = {
  layout: {
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    rows: 'auto',
    columnGap: { desktop: 20, tablet: 16, mobile: 12 },
    rowGap: { desktop: 20, tablet: 16, mobile: 12 },
    autoFlow: 'row',
    justifyItems: 'stretch',
    alignItems: 'stretch',
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
    showColumnGuides: true,
    gapHandles: true,
    cellResizable: true,
  },
};

export function SmartGridRenderer({
  block,
  isSelected = false,
  onContentChange,
}: SmartGridRendererProps) {
  const smartGrid = block.content.smartGrid || DEFAULT_GRID;
  const { layout, background, border, shadow, advanced, canvasInteraction } = {
    ...DEFAULT_GRID,
    ...smartGrid,
    layout: { ...DEFAULT_GRID.layout, ...smartGrid?.layout },
    background: { ...DEFAULT_GRID.background, ...smartGrid?.background },
    border: { ...DEFAULT_GRID.border, ...smartGrid?.border },
    shadow: { ...DEFAULT_GRID.shadow, ...smartGrid?.shadow },
    advanced: { ...DEFAULT_GRID.advanced, ...smartGrid?.advanced },
    canvasInteraction: { ...DEFAULT_GRID.canvasInteraction, ...smartGrid?.canvasInteraction },
  };

  const columns = layout.columns.desktop;
  const columnGap = layout.columnGap.desktop;
  const rowGap = layout.rowGap.desktop;

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

  // Grid layout styles
  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridAutoFlow: layout.autoFlow || 'row',
    gap: `${rowGap}px ${columnGap}px`,
    justifyItems: layout.justifyItems,
    alignItems: layout.alignItems,
    minHeight: '100px',
  };

  // Custom row template if specified
  if (layout.rows !== 'auto' && layout.rowTemplate) {
    gridStyles.gridTemplateRows = layout.rowTemplate;
  }

  // Responsive visibility classes
  const visibilityClasses: string[] = [];
  if (advanced.responsive.hideOnDesktop) visibilityClasses.push('lg:hidden');
  if (advanced.responsive.hideOnTablet) visibilityClasses.push('md:hidden lg:block');
  if (advanced.responsive.hideOnMobile) visibilityClasses.push('max-md:hidden');

  const handleColumnGapChange = (newGap: number) => {
    onContentChange?.({
      layout: {
        ...layout,
        columnGap: { ...layout.columnGap, desktop: newGap },
      },
    });
  };

  const handleRowGapChange = (newGap: number) => {
    onContentChange?.({
      layout: {
        ...layout,
        rowGap: { ...layout.rowGap, desktop: newGap },
      },
    });
  };

  return (
    <div
      className={`widget-${block.id} ${advanced.maxWidth !== 'custom' ? maxWidthClasses[advanced.maxWidth] || '' : ''} ${advanced.cssClasses || ''} ${visibilityClasses.join(' ')} relative`}
      style={containerStyles}
      id={advanced.cssId || undefined}
    >
      <ScopedStyle widgetId={block.id} css={advanced.customCSS} />
      {/* Grid content area */}
      <div style={gridStyles} className="relative">
        {/* Canvas interaction: Grid guides */}
        {canvasInteraction?.showColumnGuides && (
          <GridGuides
            columns={columns}
            rows={layout.rows}
            columnGap={columnGap}
            rowGap={rowGap}
            isSelected={isSelected}
          />
        )}

        {/* Canvas interaction: Gap handles */}
        {canvasInteraction?.gapHandles && (
          <GapHandles
            columnGap={columnGap}
            rowGap={rowGap}
            columns={columns}
            onColumnGapChange={handleColumnGapChange}
            onRowGapChange={handleRowGapChange}
            isSelected={isSelected}
          />
        )}

        {/* Placeholder cells */}
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground min-h-[80px] flex items-center justify-center bg-muted/20 relative"
          >
            <p className="text-xs">Cell {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
