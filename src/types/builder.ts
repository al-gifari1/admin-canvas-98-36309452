// Widget types for the page builder
export type WidgetType =
  // Basic
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'icon'
  | 'divider'
  | 'spacer'
  // Media
  | 'image'
  | 'video'
  | 'gallery'
  | 'slider'
  // Layout
  | 'container'
  | 'grid'
  | 'flex-container'
  | 'smart-grid'
  | 'tabs'
  | 'accordion'
  // Commerce & Marketing
  | 'checkout-form'
  | 'countdown'
  | 'pricing-table'
  | 'testimonials'
  | 'progress-bar'
  | 'google-map'
  | 'social-icons'
  // Legacy (for backwards compatibility)
  | 'hero'
  | 'product-showcase'
  | 'checkout'
  | 'features'
  | 'faq';

export type WidgetCategory = 'basic' | 'media' | 'layout' | 'commerce' | 'legacy';

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  category: WidgetCategory;
}

// Responsive value type
export interface ResponsiveValue {
  desktop: number;
  tablet?: number;
  mobile?: number;
}

// Heading specific types
export interface HeadingLink {
  url: string;
  openInNewTab: boolean;
  nofollow: boolean;
}

export interface HeadingAlignment {
  desktop: 'left' | 'center' | 'right' | 'justify';
  tablet?: 'left' | 'center' | 'right' | 'justify';
  mobile?: 'left' | 'center' | 'right' | 'justify';
}

export interface HeadingTextColor {
  type: 'solid' | 'gradient';
  solid?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };
}

export interface HeadingTypography {
  fontFamily: string;
  fontSize: ResponsiveValue;
  fontSizeUnit: 'px' | 'rem' | 'vw';
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontStyle: 'normal' | 'italic' | 'oblique';
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  lineHeight: { value: number; unit: 'em' | 'px' };
  letterSpacing: number;
}

export interface HeadingTextShadow {
  horizontal: number;
  vertical: number;
  blur: number;
  color: string;
}

export interface HeadingStyle {
  textColor: HeadingTextColor;
  typography: HeadingTypography;
  textShadow?: HeadingTextShadow;
  blendMode: string;
}

export interface HeadingAdvanced {
  margin: { top: number; right: number; bottom: number; left: number; linked: boolean };
  padding: { top: number; right: number; bottom: number; left: number; linked: boolean };
  width: 'default' | 'full' | 'inline' | 'custom';
  customWidth?: number;
  position: 'static' | 'relative' | 'absolute' | 'fixed';
  zIndex?: number;
  opacity: number;
  border: {
    type: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
    width: number;
    color: string;
    radius: number;
  };
  responsive: {
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;
  };
  cssId?: string;
  cssClasses?: string;
  customCSS?: string;
}

export interface HeadingContent {
  text: string;
  link?: HeadingLink;
  size: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  alignment: HeadingAlignment;
  style: HeadingStyle;
  advanced: HeadingAdvanced;
}

// Container/Grid specific types
export interface ContainerLayout {
  displayType: 'flex' | 'grid';
  columns: ResponsiveValue;
  rows: 'auto' | number;
  columnGap: ResponsiveValue;
  rowGap: ResponsiveValue;
  justifyItems: 'start' | 'center' | 'end' | 'stretch';
  alignItems: 'start' | 'center' | 'end' | 'stretch';
  justifyContent: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignContent: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  // New MVP properties
  autoFlow?: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  columnWidth?: { type: 'auto' | 'fr' | 'px' | '%'; value?: number };
  rowHeight?: { type: 'auto' | 'minmax' | 'custom'; value?: number; minValue?: number };
  gapPreset?: 'none' | 'small' | 'medium' | 'large';
}

export interface ContainerBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: { color: string; position: number }[];
  };
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'repeat';
    position: string;
  };
}

export interface ContainerBorder {
  style: 'none' | 'solid' | 'dashed' | 'dotted';
  width: { top: number; right: number; bottom: number; left: number; linked: boolean };
  color: string;
  radius: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number; linked: boolean };
}

export interface ContainerShadow {
  enabled: boolean;
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
}

export interface ContainerShapeDivider {
  enabled: boolean;
  position: 'top' | 'bottom';
  shape: 'waves' | 'curves' | 'triangle' | 'tilt';
  color: string;
  height: number;
  flip: boolean;
}

export interface ContainerAdvanced {
  margin: { top: number; right: number; bottom: number; left: number; linked: boolean };
  padding: { top: number; right: number; bottom: number; left: number; linked: boolean };
  zIndex?: number;
  cssId?: string;
  cssClasses?: string;
  customCSS?: string;
  responsive: {
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;
  };
  minHeight?: ResponsiveValue;
  maxWidth: 'full' | 'lg' | 'md' | 'sm' | 'custom';
  customMaxWidth?: number;
  // New MVP properties
  width?: { type: 'auto' | 'full' | 'custom'; value?: number; unit?: 'px' | '%' | 'vw' };
  height?: { type: 'auto' | 'custom'; value?: number; unit?: 'px' | 'vh' };
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'default' | 'relative' | 'absolute' | 'fixed';
  positionOffsets?: { top?: number; right?: number; bottom?: number; left?: number };
}

export interface ContainerContent {
  layout: ContainerLayout;
  background: ContainerBackground;
  border: ContainerBorder;
  shadow: ContainerShadow;
  shapeDivider?: ContainerShapeDivider;
  advanced: ContainerAdvanced;
}

// Grid item settings for child widgets
export interface GridItemSettings {
  columnSpan: ResponsiveValue;
  rowSpan: ResponsiveValue;
  alignSelf: 'auto' | 'start' | 'center' | 'end' | 'stretch';
  justifySelf: 'auto' | 'start' | 'center' | 'end' | 'stretch';
}

// ============ FLEX CONTAINER TYPES ============
export interface FlexContainerLayout {
  direction: 'row' | 'column';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  alignContent: 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';
  gap: ResponsiveValue;
}

export interface FlexContainerContent {
  layout: FlexContainerLayout;
  background: ContainerBackground;
  border: ContainerBorder;
  shadow: ContainerShadow;
  advanced: ContainerAdvanced;
  canvasInteraction?: {
    paddingHandles: boolean;
    resizable: { width: boolean; height: boolean };
  };
}

// ============ GRID TYPES ============
export interface GridLayout {
  columns: ResponsiveValue;
  columnGap: ResponsiveValue;
  rowGap: ResponsiveValue;
  autoFlow: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  justifyItems: 'start' | 'center' | 'end' | 'stretch';
  alignItems: 'start' | 'center' | 'end' | 'stretch';
}

export interface GridContent {
  layout: GridLayout;
  background: ContainerBackground;
  border: ContainerBorder;
  shadow: ContainerShadow;
  advanced: ContainerAdvanced;
}

// ============ SMART GRID TYPES ============
export interface SmartGridLayout {
  columns: ResponsiveValue;
  rows: 'auto' | number;
  columnGap: ResponsiveValue;
  rowGap: ResponsiveValue;
  columnTemplate?: string;
  rowTemplate?: string;
  autoFlow: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  justifyItems: 'start' | 'center' | 'end' | 'stretch';
  alignItems: 'start' | 'center' | 'end' | 'stretch';
}

export interface SmartGridContent {
  layout: SmartGridLayout;
  background: ContainerBackground;
  border: ContainerBorder;
  shadow: ContainerShadow;
  advanced: ContainerAdvanced;
  canvasInteraction?: {
    showColumnGuides: boolean;
    gapHandles: boolean;
    cellResizable: boolean;
  };
}

export interface SmartGridItemSettings {
  columnSpan: ResponsiveValue;
  rowSpan: ResponsiveValue;
  columnStart?: number;
  rowStart?: number;
  alignSelf: 'auto' | 'start' | 'center' | 'end' | 'stretch';
  justifySelf: 'auto' | 'start' | 'center' | 'end' | 'stretch';
}

// Button specific types
export interface ButtonLink {
  url: string;
  openInNewTab: boolean;
  nofollow: boolean;
}

export interface ButtonIcon {
  enabled: boolean;
  name: string;
  position: 'left' | 'right';
  spacing: number;
}

export interface ButtonAlignment {
  desktop: 'left' | 'center' | 'right' | 'stretch';
  tablet?: 'left' | 'center' | 'right' | 'stretch';
  mobile?: 'left' | 'center' | 'right' | 'stretch';
}

export interface ButtonTypography {
  fontFamily: string;
  fontSize: ResponsiveValue;
  fontSizeUnit: 'px' | 'rem';
  fontWeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
}

export interface ButtonColors {
  textColor: string;
  backgroundColor: string;
  borderColor: string;
}

export interface ButtonHoverColors {
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  transitionDuration: number;
}

export interface ButtonStyle {
  typography: ButtonTypography;
  normal: ButtonColors;
  hover: ButtonHoverColors;
  padding: { top: number; right: number; bottom: number; left: number; linked: boolean };
  borderRadius: number;
  borderWidth: number;
  boxShadow?: {
    horizontal: number;
    vertical: number;
    blur: number;
    spread: number;
    color: string;
  };
  hoverBoxShadow?: {
    horizontal: number;
    vertical: number;
    blur: number;
    spread: number;
    color: string;
  };
}

export interface ButtonAdvanced {
  margin: { top: number; right: number; bottom: number; left: number; linked: boolean };
  width: 'auto' | 'full' | 'custom';
  customWidth?: number;
  customWidthUnit: 'px' | '%';
  responsive: {
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;
  };
  cssId?: string;
  cssClasses?: string;
  customCSS?: string;
}

export interface ButtonContent {
  text: string;
  link: ButtonLink;
  icon: ButtonIcon;
  buttonType: 'button' | 'submit' | 'reset';
  alignment: ButtonAlignment;
  style: ButtonStyle;
  advanced: ButtonAdvanced;
}

export interface WidgetContent {
  // Basic
  heading?: HeadingContent;
  paragraph?: {
    text: string;
    alignment: 'left' | 'center' | 'right';
  };
  button?: ButtonContent;
  icon?: {
    name: string;
    size: number;
    color: string;
  };
  divider?: {
    style: 'solid' | 'dashed' | 'dotted';
    width: number;
    color: string;
  };
  spacer?: {
    height: number;
  };
  // Media
  image?: {
    url: string;
    alt: string;
    width: 'full' | 'auto';
    alignment: 'left' | 'center' | 'right';
  };
  video?: {
    url: string;
    type: 'youtube' | 'vimeo';
    autoplay: boolean;
  };
  gallery?: {
    images: { url: string; alt: string }[];
    columns: 2 | 3 | 4;
  };
  slider?: {
    slides: { imageUrl: string; title: string; description: string }[];
    autoplay: boolean;
    interval: number;
  };
  // Layout
  container?: ContainerContent;
  grid?: GridContent;
  flexContainer?: FlexContainerContent;
  smartGrid?: SmartGridContent;
  tabs?: {
    items: { label: string; content: string }[];
  };
  accordion?: {
    items: { title: string; content: string }[];
  };
  // Commerce
  checkoutForm?: {
    title: string;
    buttonText: string;
    showQuantity: boolean;
  };
  countdown?: {
    targetDate: string;
    title: string;
  };
  pricingTable?: {
    plans: {
      name: string;
      price: string;
      features: string[];
      highlighted: boolean;
    }[];
  };
  testimonials?: {
    items: {
      name: string;
      role: string;
      text: string;
      avatar: string;
    }[];
  };
  progressBar?: {
    value: number;
    label: string;
    color: string;
  };
  googleMap?: {
    embedUrl: string;
    height: number;
  };
  socialIcons?: {
    icons: { platform: string; url: string }[];
    size: 'sm' | 'md' | 'lg';
  };
  // Legacy
  hero?: {
    headline: string;
    subtext: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
  };
  productShowcase?: {
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
  };
  checkout?: {
    title: string;
    buttonText: string;
  };
}

// Code mode version history entry
export interface BlockCodeModeVersion {
  timestamp: string;
  htmlContent: string;
}

export interface Block {
  id: string;
  type: WidgetType;
  content: WidgetContent;
  // Code Mode Fields
  mode?: 'visual' | 'code';
  htmlContent?: string;
  lastVisualSnapshot?: WidgetContent;
  codeVersionHistory?: BlockCodeModeVersion[];
}

// Keep for backwards compatibility
export type BlockType = WidgetType;
export type BlockContent = WidgetContent;

export interface PageContent {
  blocks: Block[];
}

export const WIDGET_LIBRARY: WidgetDefinition[] = [
  // Basic
  { type: 'heading', label: 'Heading', description: 'H1-H6 headings', icon: 'Type', category: 'basic' },
  { type: 'paragraph', label: 'Paragraph', description: 'Rich text block', icon: 'AlignLeft', category: 'basic' },
  { type: 'button', label: 'Button', description: 'CTA button', icon: 'MousePointerClick', category: 'basic' },
  { type: 'icon', label: 'Icon', description: 'Lucide icon', icon: 'Sparkles', category: 'basic' },
  { type: 'divider', label: 'Divider', description: 'Horizontal line', icon: 'Minus', category: 'basic' },
  { type: 'spacer', label: 'Spacer', description: 'Vertical space', icon: 'MoveVertical', category: 'basic' },
  // Media
  { type: 'image', label: 'Image', description: 'Single image', icon: 'Image', category: 'media' },
  { type: 'video', label: 'Video', description: 'YouTube/Vimeo embed', icon: 'Play', category: 'media' },
  { type: 'gallery', label: 'Gallery', description: 'Image grid', icon: 'LayoutGrid', category: 'media' },
  { type: 'slider', label: 'Slider', description: 'Image carousel', icon: 'GalleryHorizontal', category: 'media' },
  // Layout
  { type: 'container', label: 'Container', description: 'Section wrapper', icon: 'Square', category: 'layout' },
  { type: 'grid', label: 'Grid', description: 'Column layout', icon: 'Columns3', category: 'layout' },
  { type: 'flex-container', label: 'Flex Container', description: 'Flexible box layout', icon: 'Box', category: 'layout' },
  { type: 'smart-grid', label: 'Smart Grid', description: '2D grid with span controls', icon: 'Grid3x3', category: 'layout' },
  { type: 'tabs', label: 'Tabs', description: 'Tabbed content', icon: 'PanelTop', category: 'layout' },
  { type: 'accordion', label: 'Accordion', description: 'Collapsible panels', icon: 'ChevronDown', category: 'layout' },
  // Commerce & Marketing
  { type: 'checkout-form', label: 'Checkout Form', description: 'Order form', icon: 'CreditCard', category: 'commerce' },
  { type: 'countdown', label: 'Countdown', description: 'Timer widget', icon: 'Clock', category: 'commerce' },
  { type: 'pricing-table', label: 'Pricing Table', description: 'Price comparison', icon: 'DollarSign', category: 'commerce' },
  { type: 'testimonials', label: 'Testimonials', description: 'Customer reviews', icon: 'Quote', category: 'commerce' },
  { type: 'progress-bar', label: 'Progress Bar', description: 'Visual progress', icon: 'BarChart3', category: 'commerce' },
  { type: 'google-map', label: 'Google Map', description: 'Embedded map', icon: 'MapPin', category: 'commerce' },
  { type: 'social-icons', label: 'Social Icons', description: 'Social links', icon: 'Share2', category: 'commerce' },
];

export const DEFAULT_WIDGET_CONTENT: Record<WidgetType, WidgetContent> = {
  // Basic
  heading: { 
    heading: { 
      text: 'Your Heading Here', 
      level: 'h2',
      size: 'large',
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
    } 
  },
  paragraph: { paragraph: { text: 'Enter your text content here. You can edit this in the properties panel.', alignment: 'left' } },
  button: { 
    button: { 
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
        normal: {
          textColor: '',
          backgroundColor: '',
          borderColor: '',
        },
        hover: {
          textColor: '',
          backgroundColor: '',
          borderColor: '',
          transitionDuration: 300,
        },
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
    } 
  },
  icon: { icon: { name: 'Star', size: 48, color: 'currentColor' } },
  divider: { divider: { style: 'solid', width: 100, color: '#e5e7eb' } },
  spacer: { spacer: { height: 40 } },
  // Media
  image: { image: { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', alt: 'Image', width: 'full', alignment: 'center' } },
  video: { video: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'youtube', autoplay: false } },
  gallery: { gallery: { images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Image 1' }, { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Image 2' }, { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Image 3' }], columns: 3 } },
  slider: { slider: { slides: [{ imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', title: 'Slide 1', description: 'Description' }], autoplay: true, interval: 5000 } },
  // Layout
  container: { 
    container: {
      layout: {
        displayType: 'grid',
        columns: { desktop: 4, tablet: 2, mobile: 1 },
        rows: 'auto',
        columnGap: { desktop: 20, tablet: 16, mobile: 12 },
        rowGap: { desktop: 20, tablet: 16, mobile: 12 },
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start',
      },
      background: {
        type: 'solid',
        color: 'transparent',
      },
      border: {
        style: 'none',
        width: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        color: '#e5e7eb',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true },
      },
      shadow: {
        enabled: false,
        horizontal: 0,
        vertical: 4,
        blur: 6,
        spread: 0,
        color: 'rgba(0,0,0,0.1)',
      },
      advanced: {
        margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        padding: { top: 16, right: 16, bottom: 16, left: 16, linked: true },
        maxWidth: 'lg',
        responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
      },
    }
  },
  grid: {
    grid: {
      layout: {
        columns: { desktop: 3, tablet: 2, mobile: 1 },
        columnGap: { desktop: 16, tablet: 12, mobile: 8 },
        rowGap: { desktop: 16, tablet: 12, mobile: 8 },
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
    }
  },
  'flex-container': {
    flexContainer: {
      layout: {
        direction: 'row',
        wrap: 'wrap',
        justifyContent: 'start',
        alignItems: 'stretch',
        alignContent: 'start',
        gap: { desktop: 16, tablet: 12, mobile: 8 },
      },
      background: {
        type: 'solid',
        color: 'transparent',
      },
      border: {
        style: 'none',
        width: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        color: '#e5e7eb',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true },
      },
      shadow: {
        enabled: false,
        horizontal: 0,
        vertical: 4,
        blur: 6,
        spread: 0,
        color: 'rgba(0,0,0,0.1)',
      },
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
    },
  },
  'smart-grid': {
    smartGrid: {
      layout: {
        columns: { desktop: 4, tablet: 2, mobile: 1 },
        rows: 'auto',
        columnGap: { desktop: 20, tablet: 16, mobile: 12 },
        rowGap: { desktop: 20, tablet: 16, mobile: 12 },
        autoFlow: 'row',
        justifyItems: 'stretch',
        alignItems: 'stretch',
      },
      background: {
        type: 'solid',
        color: 'transparent',
      },
      border: {
        style: 'none',
        width: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
        color: '#e5e7eb',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true },
      },
      shadow: {
        enabled: false,
        horizontal: 0,
        vertical: 4,
        blur: 6,
        spread: 0,
        color: 'rgba(0,0,0,0.1)',
      },
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
    },
  },
  tabs: { tabs: { items: [{ label: 'Tab 1', content: 'Content for tab 1' }, { label: 'Tab 2', content: 'Content for tab 2' }] } },
  accordion: { accordion: { items: [{ title: 'Section 1', content: 'Content for section 1' }, { title: 'Section 2', content: 'Content for section 2' }] } },
  // Commerce
  'checkout-form': { checkoutForm: { title: 'Complete Your Order', buttonText: 'Place Order', showQuantity: true } },
  countdown: { countdown: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Sale Ends In' } },
  'pricing-table': { pricingTable: { plans: [{ name: 'Basic', price: '৳999', features: ['Feature 1', 'Feature 2'], highlighted: false }, { name: 'Pro', price: '৳2999', features: ['Everything in Basic', 'Feature 3', 'Feature 4'], highlighted: true }] } },
  testimonials: { testimonials: { items: [{ name: 'John Doe', role: 'Customer', text: 'Great product!', avatar: '' }] } },
  'progress-bar': { progressBar: { value: 75, label: 'Progress', color: 'primary' } },
  'google-map': { googleMap: { embedUrl: '', height: 300 } },
  'social-icons': { socialIcons: { icons: [{ platform: 'facebook', url: '#' }, { platform: 'twitter', url: '#' }], size: 'md' } },
  // Legacy
  hero: { hero: { headline: 'Your Amazing Product', subtext: 'Transform your life with our revolutionary solution.', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', ctaText: 'Order Now', ctaUrl: '#checkout' } },
  'product-showcase': { productShowcase: { title: 'Premium Quality Product', description: 'Experience the difference with our carefully crafted solution.', price: '৳2,999', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', imagePosition: 'left' } },
  checkout: { checkout: { title: 'Complete Your Order', buttonText: 'Place Order' } },
  features: {},
  faq: {},
};

// Backwards compatibility alias
export const DEFAULT_BLOCK_CONTENT = DEFAULT_WIDGET_CONTENT;
