import { CSSProperties } from 'react';
import { Block, HeadingContent, ButtonContent } from '@/types/builder';
import { 
  icons, 
  LucideIcon, 
  HelpCircle, 
  Image as ImageIcon, 
  Play, 
  GalleryHorizontal, 
  Square, 
  ChevronDown, 
  Check, 
  Star, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from 'lucide-react';

function getIconByName(name: string): LucideIcon {
  const icon = icons[name as keyof typeof icons];
  return icon || HelpCircle;
}

// Alignment classes mapping (Tailwind can't use dynamic class names)
const alignmentClasses: Record<string, string> = {
  left: 'text-left justify-start',
  center: 'text-center justify-center',
  right: 'text-right justify-end',
  justify: 'text-justify',
  stretch: 'w-full',
};

// Build heading inline styles from advanced properties
function buildHeadingStyles(heading: HeadingContent): CSSProperties {
  const styles: CSSProperties = {};
  
  // Typography
  if (heading.style?.typography) {
    const typo = heading.style.typography;
    if (typo.fontFamily && typo.fontFamily !== 'inherit') {
      styles.fontFamily = typo.fontFamily;
    }
    if (typo.fontSize?.desktop) {
      styles.fontSize = `${typo.fontSize.desktop}${typo.fontSizeUnit || 'px'}`;
    }
    if (typo.fontWeight) {
      styles.fontWeight = typo.fontWeight;
    }
    if (typo.textTransform && typo.textTransform !== 'none') {
      styles.textTransform = typo.textTransform;
    }
    if (typo.fontStyle && typo.fontStyle !== 'normal') {
      styles.fontStyle = typo.fontStyle;
    }
    if (typo.textDecoration && typo.textDecoration !== 'none') {
      styles.textDecoration = typo.textDecoration;
    }
    if (typo.lineHeight?.value) {
      styles.lineHeight = `${typo.lineHeight.value}${typo.lineHeight.unit || 'em'}`;
    }
    if (typo.letterSpacing) {
      styles.letterSpacing = `${typo.letterSpacing}px`;
    }
  }
  
  // Text Color
  if (heading.style?.textColor) {
    const color = heading.style.textColor;
    if (color.type === 'solid' && color.solid) {
      styles.color = color.solid;
    } else if (color.type === 'gradient' && color.gradient) {
      const { angle = 90, stops } = color.gradient;
      const gradientStops = stops.map(s => `${s.color} ${s.position}%`).join(', ');
      styles.background = `linear-gradient(${angle}deg, ${gradientStops})`;
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.backgroundClip = 'text';
    }
  }
  
  // Text Shadow
  if (heading.style?.textShadow) {
    const shadow = heading.style.textShadow;
    if (shadow.blur || shadow.horizontal || shadow.vertical) {
      styles.textShadow = `${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.color}`;
    }
  }
  
  // Blend Mode
  if (heading.style?.blendMode && heading.style.blendMode !== 'normal') {
    styles.mixBlendMode = heading.style.blendMode as CSSProperties['mixBlendMode'];
  }
  
  return styles;
}

// Build wrapper styles from advanced properties
function buildWrapperStyles(heading: HeadingContent): CSSProperties {
  const styles: CSSProperties = {};
  
  if (!heading.advanced) return styles;
  
  const adv = heading.advanced;
  
  // Margin
  if (adv.margin) {
    styles.marginTop = `${adv.margin.top}px`;
    styles.marginRight = `${adv.margin.right}px`;
    styles.marginBottom = `${adv.margin.bottom}px`;
    styles.marginLeft = `${adv.margin.left}px`;
  }
  
  // Padding
  if (adv.padding) {
    styles.paddingTop = `${adv.padding.top}px`;
    styles.paddingRight = `${adv.padding.right}px`;
    styles.paddingBottom = `${adv.padding.bottom}px`;
    styles.paddingLeft = `${adv.padding.left}px`;
  }
  
  // Width
  if (adv.width === 'full') {
    styles.width = '100%';
  } else if (adv.width === 'inline') {
    styles.width = 'auto';
    styles.display = 'inline-block';
  } else if (adv.width === 'custom' && adv.customWidth) {
    styles.width = `${adv.customWidth}%`;
  }
  
  // Position
  if (adv.position && adv.position !== 'static') {
    styles.position = adv.position;
    if (adv.zIndex !== undefined) {
      styles.zIndex = adv.zIndex;
    }
  }
  
  // Opacity
  if (adv.opacity !== undefined && adv.opacity < 100) {
    styles.opacity = adv.opacity / 100;
  }
  
  // Border
  if (adv.border && adv.border.type !== 'none') {
    styles.borderStyle = adv.border.type;
    styles.borderWidth = `${adv.border.width}px`;
    styles.borderColor = adv.border.color;
    styles.borderRadius = `${adv.border.radius}px`;
  }
  
  return styles;
}

// Build responsive visibility classes
function buildResponsiveClasses(heading: HeadingContent): string {
  if (!heading.advanced?.responsive) return '';
  
  const classes: string[] = [];
  const resp = heading.advanced.responsive;
  
  if (resp.hideOnDesktop) classes.push('lg:hidden');
  if (resp.hideOnTablet) classes.push('md:hidden lg:block');
  if (resp.hideOnMobile) classes.push('max-md:hidden');
  
  return classes.join(' ');
}

interface WidgetRendererProps {
  block: Block;
}

export function WidgetRenderer({ block }: WidgetRendererProps) {
  switch (block.type) {
    case 'heading': {
      const heading = block.content.heading as HeadingContent | undefined;
      const defaultHeading: HeadingContent = {
        text: 'Heading',
        level: 'h2',
        size: 'large',
        alignment: { desktop: 'left' },
        style: {
          textColor: { type: 'solid' },
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
      
      const merged: HeadingContent = {
        ...defaultHeading,
        ...heading,
        alignment: typeof heading?.alignment === 'string' 
          ? { desktop: heading.alignment as 'left' | 'center' | 'right' | 'justify' }
          : heading?.alignment || defaultHeading.alignment,
        style: {
          ...defaultHeading.style,
          ...heading?.style,
          typography: { ...defaultHeading.style.typography, ...heading?.style?.typography },
          textColor: { ...defaultHeading.style.textColor, ...heading?.style?.textColor },
        },
        advanced: {
          ...defaultHeading.advanced,
          ...heading?.advanced,
          margin: { ...defaultHeading.advanced.margin, ...heading?.advanced?.margin },
          padding: { ...defaultHeading.advanced.padding, ...heading?.advanced?.padding },
          border: { ...defaultHeading.advanced.border, ...heading?.advanced?.border },
          responsive: { ...defaultHeading.advanced.responsive, ...heading?.advanced?.responsive },
        },
      };
      
      const text = merged.text;
      const level = merged.level;
      const alignment = merged.alignment.desktop;
      const Tag = level as keyof JSX.IntrinsicElements;
      
      const headingStyles = buildHeadingStyles(merged);
      const wrapperStyles = buildWrapperStyles(merged);
      const responsiveClasses = buildResponsiveClasses(merged);
      
      // Link wrapper
      const content = merged.link?.url ? (
        <a 
          href={merged.link.url} 
          target={merged.link.openInNewTab ? '_blank' : undefined}
          rel={merged.link.nofollow ? 'nofollow' : undefined}
          className="hover:opacity-80 transition-opacity"
        >
          {text}
        </a>
      ) : text;
      
      // Custom attributes
      const customProps: Record<string, string> = {};
      if (merged.advanced?.cssId) customProps.id = merged.advanced.cssId;
      
      const cssClasses = merged.advanced?.cssClasses || '';
      
      return (
        <div 
          className={`${alignmentClasses[alignment] || 'text-left'} ${responsiveClasses}`}
          style={wrapperStyles}
        >
          <Tag 
            className={`text-foreground ${cssClasses}`}
            style={headingStyles}
            {...customProps}
          >
            {content}
          </Tag>
        </div>
      );
    }
    case 'paragraph': {
      const { text, alignment } = block.content.paragraph || { text: 'Your text here', alignment: 'left' };
      return <div className={`p-4 ${alignmentClasses[alignment]}`}><p className="text-muted-foreground leading-relaxed">{text}</p></div>;
    }
    case 'button': {
      const rawButton = block.content.button;
      
      // Handle legacy button format
      const isLegacy = rawButton && !('link' in rawButton);
      
      const defaultButton: ButtonContent = {
        text: 'Button',
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

      // Merge button data with legacy support
      const button: ButtonContent = isLegacy 
        ? {
            ...defaultButton,
            text: (rawButton as any)?.text || 'Button',
            link: { url: (rawButton as any)?.url || '#', openInNewTab: false, nofollow: false },
          }
        : { ...defaultButton, ...rawButton as ButtonContent };

      const IconComponent = button.icon.enabled ? getIconByName(button.icon.name) : null;
      
      // Build inline styles
      const buttonStyles: CSSProperties = {
        fontFamily: button.style.typography.fontFamily !== 'inherit' ? button.style.typography.fontFamily : undefined,
        fontSize: `${button.style.typography.fontSize.desktop}${button.style.typography.fontSizeUnit}`,
        fontWeight: button.style.typography.fontWeight,
        textTransform: button.style.typography.textTransform !== 'none' ? button.style.typography.textTransform : undefined,
        letterSpacing: button.style.typography.letterSpacing ? `${button.style.typography.letterSpacing}px` : undefined,
        color: button.style.normal.textColor || undefined,
        backgroundColor: button.style.normal.backgroundColor || undefined,
        borderColor: button.style.normal.borderColor || undefined,
        borderWidth: button.style.borderWidth ? `${button.style.borderWidth}px` : undefined,
        borderStyle: button.style.borderWidth ? 'solid' : undefined,
        borderRadius: `${button.style.borderRadius}px`,
        paddingTop: `${button.style.padding.top}px`,
        paddingRight: `${button.style.padding.right}px`,
        paddingBottom: `${button.style.padding.bottom}px`,
        paddingLeft: `${button.style.padding.left}px`,
        transitionProperty: 'color, background-color, border-color, box-shadow',
        transitionDuration: `${button.style.hover.transitionDuration}ms`,
        transitionTimingFunction: 'ease-in-out',
      };

      // Wrapper styles for margin and width
      const wrapperStyles: CSSProperties = {
        marginTop: `${button.advanced.margin.top}px`,
        marginRight: `${button.advanced.margin.right}px`,
        marginBottom: `${button.advanced.margin.bottom}px`,
        marginLeft: `${button.advanced.margin.left}px`,
      };

      // Width handling
      let buttonWidthClass = '';
      if (button.advanced.width === 'full') {
        buttonWidthClass = 'w-full';
      } else if (button.advanced.width === 'custom' && button.advanced.customWidth) {
        buttonStyles.width = `${button.advanced.customWidth}${button.advanced.customWidthUnit}`;
      }

      // Build hover CSS variables for use in inline hover styles
      const hoverVars = {
        '--hover-text': button.style.hover.textColor || button.style.normal.textColor || 'inherit',
        '--hover-bg': button.style.hover.backgroundColor || button.style.normal.backgroundColor || 'inherit',
        '--hover-border': button.style.hover.borderColor || button.style.normal.borderColor || 'transparent',
      } as CSSProperties;

      // Responsive visibility classes
      const visibilityClasses: string[] = [];
      if (button.advanced.responsive.hideOnDesktop) visibilityClasses.push('lg:hidden');
      if (button.advanced.responsive.hideOnTablet) visibilityClasses.push('md:hidden lg:block');
      if (button.advanced.responsive.hideOnMobile) visibilityClasses.push('max-md:hidden');

      const alignment = button.alignment.desktop;
      const alignClass = alignmentClasses[alignment] || 'justify-start';
      
      // Default styling if no custom colors
      const defaultClasses = !button.style.normal.backgroundColor 
        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
        : '';
      
      const hoverClasses = button.style.hover.backgroundColor || button.style.hover.textColor
        ? 'hover:[color:var(--hover-text)] hover:[background-color:var(--hover-bg)] hover:[border-color:var(--hover-border)]'
        : '';

      const customProps: Record<string, string> = {};
      if (button.advanced.cssId) customProps.id = button.advanced.cssId;

      const buttonElement = (
        <button
          type={button.buttonType}
          className={`inline-flex items-center font-medium ${buttonWidthClass} ${defaultClasses} ${hoverClasses} ${button.advanced.cssClasses || ''}`}
          style={{ ...buttonStyles, ...hoverVars }}
          {...customProps}
        >
          {IconComponent && button.icon.position === 'left' && (
            <IconComponent className="h-4 w-4" style={{ marginRight: button.icon.spacing }} />
          )}
          {button.text}
          {IconComponent && button.icon.position === 'right' && (
            <IconComponent className="h-4 w-4" style={{ marginLeft: button.icon.spacing }} />
          )}
        </button>
      );

      return (
        <div 
          className={`p-4 flex ${alignClass} ${visibilityClasses.join(' ')}`}
          style={wrapperStyles}
        >
          {button.link.url && button.link.url !== '#' ? (
            <a 
              href={button.link.url}
              target={button.link.openInNewTab ? '_blank' : undefined}
              rel={button.link.nofollow ? 'nofollow' : undefined}
            >
              {buttonElement}
            </a>
          ) : buttonElement}
        </div>
      );
    }
    case 'icon': {
      const { name, size } = block.content.icon || { name: 'Star', size: 48 };
      const IconComponent = getIconByName(name);
      return <div className="p-4 flex justify-center"><IconComponent style={{ width: size, height: size }} className="text-primary" /></div>;
    }
    case 'divider': {
      const { style, color } = block.content.divider || { style: 'solid', color: '#e5e7eb' };
      return <div className="px-4 py-6"><hr style={{ borderStyle: style, borderColor: color }} className="border-t-2" /></div>;
    }
    case 'spacer': {
      const { height } = block.content.spacer || { height: 40 };
      return <div style={{ height }} />;
    }
    case 'image': {
      const { url, alt, alignment, width } = block.content.image || { url: '', alt: 'Image', alignment: 'center', width: 'full' };
      const widthClasses = width === 'full' ? 'w-full' : 'max-w-full';
      return <div className={`p-4 ${alignmentClasses[alignment]}`}>{url ? <img src={url} alt={alt} className={`${widthClasses} h-auto rounded-lg inline-block`} /> : <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-2xl mx-auto"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>}</div>;
    }
    case 'video': {
      const { url } = block.content.video || { url: '' };
      return <div className="p-4">{url ? <div className="aspect-video max-w-3xl mx-auto"><iframe src={url} className="w-full h-full rounded-lg" allowFullScreen /></div> : <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-3xl mx-auto"><Play className="h-12 w-12 text-muted-foreground" /></div>}</div>;
    }
    case 'gallery': {
      const { images, columns } = block.content.gallery || { images: [], columns: 3 };
      return <div className="p-4"><div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>{images.length > 0 ? images.map((img, i) => <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden"><img src={img.url} alt={img.alt} className="w-full h-full object-cover" /></div>) : Array.from({ length: columns }).map((_, i) => <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>)}</div></div>;
    }
    case 'slider': {
      const { slides } = block.content.slider || { slides: [] };
      return <div className="p-4"><div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center max-w-4xl mx-auto relative overflow-hidden">{slides.length > 0 && slides[0].imageUrl ? <img src={slides[0].imageUrl} alt={slides[0].title} className="w-full h-full object-cover" /> : <GalleryHorizontal className="h-12 w-12 text-muted-foreground" />}</div></div>;
    }
    case 'container': {
      const { padding, maxWidth, backgroundColor } = block.content.container || { padding: 16, maxWidth: 'lg', backgroundColor: 'transparent' };
      const maxWidthClasses: Record<string, string> = { full: 'max-w-full', lg: 'max-w-6xl', md: 'max-w-4xl', sm: 'max-w-2xl' };
      return <div className={`${maxWidthClasses[maxWidth]} mx-auto`} style={{ padding, backgroundColor }}><div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground min-h-[100px]"><Square className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Container</p></div></div>;
    }
    case 'grid': {
      const { columns, gap } = block.content.grid || { columns: 3, gap: 16 };
      return <div className="p-4"><div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>{Array.from({ length: columns }).map((_, i) => <div key={i} className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground min-h-[100px]"><p className="text-xs">Column {i + 1}</p></div>)}</div></div>;
    }
    case 'tabs': {
      const { items } = block.content.tabs || { items: [{ label: 'Tab 1', content: 'Content' }] };
      return <div className="p-4"><div className="border border-border rounded-lg overflow-hidden"><div className="flex border-b border-border bg-muted/50">{items.map((item, i) => <button key={i} className={`px-4 py-2 text-sm font-medium ${i === 0 ? 'bg-background text-foreground' : 'text-muted-foreground'}`}>{item.label}</button>)}</div><div className="p-4 text-muted-foreground">{items[0]?.content}</div></div></div>;
    }
    case 'accordion': {
      const { items } = block.content.accordion || { items: [{ title: 'Section 1', content: 'Content' }] };
      return <div className="p-4 space-y-2">{items.map((item, i) => <div key={i} className="border border-border rounded-lg overflow-hidden"><div className="flex items-center justify-between p-4 bg-muted/50"><span className="font-medium text-foreground">{item.title}</span><ChevronDown className="h-4 w-4 text-muted-foreground" /></div></div>)}</div>;
    }
    case 'checkout-form': {
      const { title, buttonText } = block.content.checkoutForm || { title: 'Checkout', buttonText: 'Order Now' };
      return <div className="p-6 bg-card border border-border rounded-lg m-4"><h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3><div className="space-y-3"><div className="h-10 bg-muted rounded-md" /><div className="h-10 bg-muted rounded-md" /><div className="h-10 bg-muted rounded-md" /></div><button className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">{buttonText}</button></div>;
    }
    case 'countdown': {
      const { title } = block.content.countdown || { title: 'Sale Ends In' };
      return <div className="p-6 text-center"><p className="text-lg font-medium text-foreground mb-4">{title}</p><div className="flex justify-center gap-4">{['Days', 'Hours', 'Min', 'Sec'].map((unit) => <div key={unit} className="text-center"><div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold">00</div><p className="text-xs text-muted-foreground mt-1">{unit}</p></div>)}</div></div>;
    }
    case 'pricing-table': {
      const { plans } = block.content.pricingTable || { plans: [{ name: 'Basic', price: '৳999', features: ['Feature 1'], highlighted: false }] };
      return <div className="p-4"><div className="flex gap-4 justify-center flex-wrap">{plans.map((plan, i) => <div key={i} className={`p-6 rounded-lg border ${plan.highlighted ? 'border-primary bg-primary/5' : 'border-border'} w-64`}><h4 className="font-semibold text-lg text-foreground">{plan.name}</h4><p className="text-2xl font-bold text-foreground mt-2">{plan.price}</p><ul className="mt-4 space-y-2">{plan.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul></div>)}</div></div>;
    }
    case 'testimonials': {
      const { items } = block.content.testimonials || { items: [{ name: 'John Doe', role: 'Customer', text: 'Great!', avatar: '' }] };
      return <div className="p-6"><div className="flex gap-6 justify-center flex-wrap">{items.map((item, i) => <div key={i} className="p-6 bg-card border border-border rounded-lg max-w-sm"><div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}</div><p className="text-muted-foreground mb-4">"{item.text}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">{item.name.charAt(0)}</div><div><p className="font-medium text-foreground text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.role}</p></div></div></div>)}</div></div>;
    }
    case 'progress-bar': {
      const { value, label } = block.content.progressBar || { value: 75, label: 'Progress' };
      return <div className="p-4"><div className="flex justify-between text-sm mb-2"><span className="text-foreground font-medium">{label}</span><span className="text-muted-foreground">{value}%</span></div><div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} /></div></div>;
    }
    case 'google-map': {
      const { height } = block.content.googleMap || { height: 300 };
      return <div className="p-4"><div className="bg-muted rounded-lg flex items-center justify-center" style={{ height }}><MapPin className="h-12 w-12 text-muted-foreground" /></div></div>;
    }
    case 'social-icons': {
      const { size } = block.content.socialIcons || { size: 'md' };
      const sizeClasses: Record<string, string> = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' };
      const socialIcons = [Facebook, Twitter, Instagram, Youtube];
      return <div className="p-4 flex justify-center gap-4">{socialIcons.map((Icon, i) => <div key={i} className="p-2 rounded-lg bg-muted"><Icon className={`${sizeClasses[size]} text-muted-foreground`} /></div>)}</div>;
    }
    case 'hero': {
      const { headline, subtext, ctaText } = block.content.hero || { headline: 'Hero', subtext: '', ctaText: 'CTA' };
      return <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 px-6"><div className="max-w-4xl mx-auto text-center"><h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{headline}</h1><p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">{subtext}</p><button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">{ctaText}</button></div></div>;
    }
    case 'product-showcase': {
      const { title, description, price, imageUrl, imagePosition } = block.content.productShowcase || { title: 'Product', description: '', price: '', imageUrl: '', imagePosition: 'left' };
      return <div className="p-8"><div className={`flex flex-col ${imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}><div className="flex-1"><div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">{imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : <ImageIcon className="h-16 w-16 text-muted-foreground" />}</div></div><div className="flex-1"><h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2><p className="text-muted-foreground mb-4">{description}</p><p className="text-2xl font-bold text-primary">{price}</p></div></div></div>;
    }
    case 'checkout': {
      const { title, buttonText } = block.content.checkout || { title: 'Checkout', buttonText: 'Order' };
      return <div className="p-6 bg-card border border-border rounded-lg m-4"><h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3><div className="space-y-3"><div className="h-10 bg-muted rounded-md" /><div className="h-10 bg-muted rounded-md" /></div><button className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">{buttonText}</button></div>;
    }
    default:
      return <div className="p-8 bg-muted text-center"><HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">Unknown: {block.type}</p></div>;
  }
}
