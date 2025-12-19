// HTML Generator Utility - Converts Block JSON to HTML string
import { Block, WidgetContent, HeadingContent, ButtonContent, ContainerContent, GridContent, FlexContainerContent } from '@/types/builder';

// Helper to build inline style string
function buildStyleString(styles: Record<string, string | number | undefined>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
}

// Generate heading HTML
function generateHeadingHTML(content: HeadingContent): string {
  const { text, level, alignment, style, advanced } = content;
  const Tag = level || 'h2';
  
  const styles: Record<string, string | number | undefined> = {
    textAlign: alignment?.desktop,
    fontFamily: style?.typography?.fontFamily,
    fontSize: style?.typography?.fontSize?.desktop ? `${style.typography.fontSize.desktop}${style.typography.fontSizeUnit || 'px'}` : undefined,
    fontWeight: style?.typography?.fontWeight,
    textTransform: style?.typography?.textTransform,
    fontStyle: style?.typography?.fontStyle,
    textDecoration: style?.typography?.textDecoration,
    lineHeight: style?.typography?.lineHeight ? `${style.typography.lineHeight.value}${style.typography.lineHeight.unit}` : undefined,
    letterSpacing: style?.typography?.letterSpacing ? `${style.typography.letterSpacing}px` : undefined,
    color: style?.textColor?.type === 'solid' ? style.textColor.solid : undefined,
    marginTop: `${advanced?.margin?.top || 0}px`,
    marginRight: `${advanced?.margin?.right || 0}px`,
    marginBottom: `${advanced?.margin?.bottom || 0}px`,
    marginLeft: `${advanced?.margin?.left || 0}px`,
    paddingTop: `${advanced?.padding?.top || 0}px`,
    paddingRight: `${advanced?.padding?.right || 0}px`,
    paddingBottom: `${advanced?.padding?.bottom || 0}px`,
    paddingLeft: `${advanced?.padding?.left || 0}px`,
  };

  // Handle gradient text
  if (style?.textColor?.type === 'gradient' && style.textColor.gradient) {
    const { gradient } = style.textColor;
    const stops = gradient.stops?.map(s => `${s.color} ${s.position}%`).join(', ') || '#000 0%, #666 100%';
    styles.background = `linear-gradient(${gradient.angle || 90}deg, ${stops})`;
    styles.backgroundClip = 'text';
    styles.WebkitBackgroundClip = 'text';
    styles.WebkitTextFillColor = 'transparent';
  }

  // Handle text shadow
  if (style?.textShadow) {
    const { horizontal, vertical, blur, color } = style.textShadow;
    styles.textShadow = `${horizontal}px ${vertical}px ${blur}px ${color}`;
  }

  const styleStr = buildStyleString(styles);
  const classStr = advanced?.cssClasses ? ` class="${advanced.cssClasses}"` : '';
  const idStr = advanced?.cssId ? ` id="${advanced.cssId}"` : '';

  return `<${Tag}${idStr}${classStr} style="${styleStr}">${text}</${Tag}>`;
}

// Generate paragraph HTML
function generateParagraphHTML(content: { text: string; alignment: string }): string {
  const styles = {
    textAlign: content.alignment,
  };
  return `<p style="${buildStyleString(styles)}">${content.text}</p>`;
}

// Generate button HTML
function generateButtonHTML(content: ButtonContent): string {
  const { text, link, style, advanced, alignment } = content;
  
  const styles: Record<string, string | number | undefined> = {
    display: 'inline-block',
    textAlign: 'center',
    fontFamily: style?.typography?.fontFamily,
    fontSize: style?.typography?.fontSize?.desktop ? `${style.typography.fontSize.desktop}${style.typography.fontSizeUnit || 'px'}` : undefined,
    fontWeight: style?.typography?.fontWeight,
    textTransform: style?.typography?.textTransform,
    letterSpacing: style?.typography?.letterSpacing ? `${style.typography.letterSpacing}px` : undefined,
    color: style?.normal?.textColor || '#ffffff',
    backgroundColor: style?.normal?.backgroundColor || '#3b82f6',
    borderColor: style?.normal?.borderColor,
    borderWidth: style?.borderWidth ? `${style.borderWidth}px` : undefined,
    borderStyle: style?.borderWidth ? 'solid' : undefined,
    borderRadius: style?.borderRadius ? `${style.borderRadius}px` : undefined,
    paddingTop: `${style?.padding?.top || 12}px`,
    paddingRight: `${style?.padding?.right || 24}px`,
    paddingBottom: `${style?.padding?.bottom || 12}px`,
    paddingLeft: `${style?.padding?.left || 24}px`,
    marginTop: `${advanced?.margin?.top || 0}px`,
    marginRight: `${advanced?.margin?.right || 0}px`,
    marginBottom: `${advanced?.margin?.bottom || 0}px`,
    marginLeft: `${advanced?.margin?.left || 0}px`,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const wrapperStyles: Record<string, string | undefined> = {
    textAlign: alignment?.desktop,
  };

  const styleStr = buildStyleString(styles);
  const wrapperStyleStr = buildStyleString(wrapperStyles);
  const href = link?.url || '#';
  const target = link?.openInNewTab ? ' target="_blank"' : '';
  const rel = link?.nofollow ? ' rel="nofollow"' : '';
  const classStr = advanced?.cssClasses ? ` class="${advanced.cssClasses}"` : '';
  const idStr = advanced?.cssId ? ` id="${advanced.cssId}"` : '';

  return `<div style="${wrapperStyleStr}"><a${idStr}${classStr} href="${href}"${target}${rel} style="${styleStr}">${text}</a></div>`;
}

// Generate image HTML
function generateImageHTML(content: { url: string; alt: string; width: string; alignment: string }): string {
  const wrapperStyles = {
    textAlign: content.alignment,
  };
  const imgStyles: Record<string, string> = {
    maxWidth: content.width === 'full' ? '100%' : 'auto',
    height: 'auto',
  };
  
  return `<div style="${buildStyleString(wrapperStyles)}"><img src="${content.url}" alt="${content.alt}" style="${buildStyleString(imgStyles)}" /></div>`;
}

// Generate container/grid/flex HTML with children placeholder
function generateContainerHTML(content: ContainerContent | GridContent | FlexContainerContent, type: string): string {
  const { background, border, shadow, advanced } = content as ContainerContent;
  const layout = (content as ContainerContent).layout || (content as GridContent).layout;
  
  const styles: Record<string, string | number | undefined> = {
    marginTop: `${advanced?.margin?.top || 0}px`,
    marginRight: `${advanced?.margin?.right || 0}px`,
    marginBottom: `${advanced?.margin?.bottom || 0}px`,
    marginLeft: `${advanced?.margin?.left || 0}px`,
    paddingTop: `${advanced?.padding?.top || 0}px`,
    paddingRight: `${advanced?.padding?.right || 0}px`,
    paddingBottom: `${advanced?.padding?.bottom || 0}px`,
    paddingLeft: `${advanced?.padding?.left || 0}px`,
  };

  // Background
  if (background?.type === 'solid' && background.color) {
    styles.backgroundColor = background.color;
  } else if (background?.type === 'gradient' && background.gradient) {
    const stops = background.gradient.stops?.map(s => `${s.color} ${s.position}%`).join(', ');
    styles.background = `linear-gradient(${background.gradient.angle || 90}deg, ${stops})`;
  } else if (background?.type === 'image' && background.image?.url) {
    styles.backgroundImage = `url('${background.image.url}')`;
    styles.backgroundSize = background.image.size || 'cover';
    styles.backgroundPosition = background.image.position || 'center';
  }

  // Border
  if (border?.style && border.style !== 'none') {
    styles.borderStyle = border.style;
    styles.borderTopWidth = `${border.width?.top || 0}px`;
    styles.borderRightWidth = `${border.width?.right || 0}px`;
    styles.borderBottomWidth = `${border.width?.bottom || 0}px`;
    styles.borderLeftWidth = `${border.width?.left || 0}px`;
    styles.borderColor = border.color;
    styles.borderTopLeftRadius = `${border.radius?.topLeft || 0}px`;
    styles.borderTopRightRadius = `${border.radius?.topRight || 0}px`;
    styles.borderBottomRightRadius = `${border.radius?.bottomRight || 0}px`;
    styles.borderBottomLeftRadius = `${border.radius?.bottomLeft || 0}px`;
  }

  // Shadow
  if (shadow?.enabled) {
    styles.boxShadow = `${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
  }

  // Layout
  if (type === 'grid' || type === 'container' || type === 'smart-grid') {
    styles.display = 'grid';
    styles.gridTemplateColumns = `repeat(${layout.columns?.desktop || 3}, 1fr)`;
    styles.columnGap = `${layout.columnGap?.desktop || 16}px`;
    styles.rowGap = `${layout.rowGap?.desktop || 16}px`;
  } else if (type === 'flex-container') {
    const flexLayout = (content as FlexContainerContent).layout;
    styles.display = 'flex';
    styles.flexDirection = flexLayout?.direction || 'row';
    styles.flexWrap = flexLayout?.wrap || 'wrap';
    styles.gap = `${flexLayout?.gap?.desktop || 16}px`;
  }

  // Max width
  const maxWidthMap: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    full: '100%',
  };
  if (advanced?.maxWidth && advanced.maxWidth !== 'custom') {
    styles.maxWidth = maxWidthMap[advanced.maxWidth] || '100%';
    styles.marginLeft = 'auto';
    styles.marginRight = 'auto';
  }

  const classStr = advanced?.cssClasses ? ` class="${advanced.cssClasses}"` : '';
  const idStr = advanced?.cssId ? ` id="${advanced.cssId}"` : '';

  return `<div${idStr}${classStr} style="${buildStyleString(styles)}">
  <!-- Container children - add your content here -->
</div>`;
}

// Generate divider HTML
function generateDividerHTML(content: { style: string; width: number; color: string }): string {
  const styles = {
    borderTop: `1px ${content.style} ${content.color}`,
    width: `${content.width}%`,
    margin: '16px auto',
  };
  return `<hr style="${buildStyleString(styles)}" />`;
}

// Generate spacer HTML
function generateSpacerHTML(content: { height: number }): string {
  return `<div style="height: ${content.height}px;"></div>`;
}

// Generate icon HTML
function generateIconHTML(content: { name: string; size: number; color: string }): string {
  return `<div style="width: ${content.size}px; height: ${content.size}px; color: ${content.color}; display: flex; align-items: center; justify-content: center;">
  <!-- Icon: ${content.name} - Replace with actual SVG -->
  <svg width="${content.size}" height="${content.size}" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
</div>`;
}

// Generate video HTML
function generateVideoHTML(content: { url: string; type: string; autoplay: boolean }): string {
  const autoplayStr = content.autoplay ? '?autoplay=1' : '';
  return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe src="${content.url}${autoplayStr}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
</div>`;
}

// Main export function
export function generateHTMLFromBlock(block: Block): string {
  const { type, content } = block;

  switch (type) {
    case 'heading':
      return content.heading ? generateHeadingHTML(content.heading) : '<!-- Heading -->';
    
    case 'paragraph':
      return content.paragraph ? generateParagraphHTML(content.paragraph) : '<!-- Paragraph -->';
    
    case 'button':
      return content.button ? generateButtonHTML(content.button) : '<!-- Button -->';
    
    case 'image':
      return content.image ? generateImageHTML(content.image) : '<!-- Image -->';
    
    case 'container':
      return content.container ? generateContainerHTML(content.container, 'container') : '<!-- Container -->';
    
    case 'grid':
      return content.grid ? generateContainerHTML(content.grid, 'grid') : '<!-- Grid -->';
    
    case 'flex-container':
      return content.flexContainer ? generateContainerHTML(content.flexContainer, 'flex-container') : '<!-- Flex Container -->';
    
    case 'smart-grid':
      return content.smartGrid ? generateContainerHTML(content.smartGrid as unknown as ContainerContent, 'smart-grid') : '<!-- Smart Grid -->';
    
    case 'divider':
      return content.divider ? generateDividerHTML(content.divider) : '<!-- Divider -->';
    
    case 'spacer':
      return content.spacer ? generateSpacerHTML(content.spacer) : '<!-- Spacer -->';
    
    case 'icon':
      return content.icon ? generateIconHTML(content.icon) : '<!-- Icon -->';
    
    case 'video':
      return content.video ? generateVideoHTML(content.video) : '<!-- Video -->';

    // Legacy sections - generate basic HTML structure
    case 'hero':
      if (content.hero) {
        return `<section style="padding: 60px 20px; text-align: center;">
  <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 16px;">${content.hero.headline}</h1>
  <p style="font-size: 18px; color: #666; margin-bottom: 24px;">${content.hero.subtext}</p>
  ${content.hero.imageUrl ? `<img src="${content.hero.imageUrl}" alt="Hero" style="max-width: 100%; height: auto; margin-bottom: 24px;" />` : ''}
  <a href="${content.hero.ctaUrl}" style="display: inline-block; padding: 12px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">${content.hero.ctaText}</a>
</section>`;
      }
      return '<!-- Hero Section -->';

    case 'checkout-form':
      if (content.checkoutForm) {
        return `<div style="padding: 24px; max-width: 500px; margin: 0 auto;">
  <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">${content.checkoutForm.title}</h3>
  <form>
    <input type="text" placeholder="Name" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;" />
    <input type="tel" placeholder="Phone" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;" />
    <input type="text" placeholder="Address" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid #ddd; border-radius: 6px;" />
    <button type="submit" style="width: 100%; padding: 14px; background: #22c55e; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">${content.checkoutForm.buttonText}</button>
  </form>
</div>`;
      }
      return '<!-- Checkout Form -->';

    default:
      return `<!-- ${type} widget - custom HTML needed -->`;
  }
}

// Generate HTML for multiple blocks
export function generateHTMLFromBlocks(blocks: Block[]): string {
  return blocks.map(block => generateHTMLFromBlock(block)).join('\n\n');
}
