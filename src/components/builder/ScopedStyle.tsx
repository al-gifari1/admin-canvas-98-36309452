interface ScopedStyleProps {
  widgetId: string;
  css?: string;
}

/**
 * Injects scoped CSS styles for a widget.
 * Replaces 'selector' keyword with the widget's unique class (.widget-{id})
 * 
 * Usage in Custom CSS field:
 * selector { transform: rotate(5deg); }
 * selector:hover { opacity: 0.8; }
 */
export function ScopedStyle({ widgetId, css }: ScopedStyleProps) {
  if (!css?.trim()) return null;

  // Replace 'selector' with the scoped widget class
  const scopedCSS = css.replace(/selector/g, `.widget-${widgetId}`);

  return <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />;
}
