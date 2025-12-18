import { Block } from '@/types/builder';
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
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface WidgetRendererProps {
  block: Block;
}

export function WidgetRenderer({ block }: WidgetRendererProps) {
  switch (block.type) {
    case 'heading': {
      const { text, level, alignment } = block.content.heading || { text: 'Heading', level: 'h2', alignment: 'left' };
      const Tag = level as keyof JSX.IntrinsicElements;
      const sizeClasses: Record<string, string> = { h1: 'text-4xl md:text-5xl font-bold', h2: 'text-3xl md:text-4xl font-bold', h3: 'text-2xl md:text-3xl font-semibold', h4: 'text-xl md:text-2xl font-semibold', h5: 'text-lg md:text-xl font-medium', h6: 'text-base md:text-lg font-medium' };
      return <div className={`p-4 ${alignmentClasses[alignment]}`}><Tag className={`${sizeClasses[level]} text-foreground`}>{text}</Tag></div>;
    }
    case 'paragraph': {
      const { text, alignment } = block.content.paragraph || { text: 'Your text here', alignment: 'left' };
      return <div className={`p-4 ${alignmentClasses[alignment]}`}><p className="text-muted-foreground leading-relaxed">{text}</p></div>;
    }
    case 'button': {
      const { text, variant, size, alignment } = block.content.button || { text: 'Button', variant: 'primary', size: 'md', alignment: 'left' };
      const sizeClasses: Record<string, string> = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-8 py-4 text-lg' };
      const variantClasses: Record<string, string> = { primary: 'bg-primary text-primary-foreground', secondary: 'bg-secondary text-secondary-foreground', outline: 'border border-border bg-transparent text-foreground' };
      return <div className={`p-4 ${alignmentClasses[alignment]}`}><button className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium`}>{text}</button></div>;
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
