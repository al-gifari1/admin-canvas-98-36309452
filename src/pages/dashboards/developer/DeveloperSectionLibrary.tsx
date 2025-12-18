import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Layout, 
  ShoppingBag, 
  MessageSquare, 
  HelpCircle, 
  CreditCard,
  Image,
  Type,
  Star
} from 'lucide-react';

const sections = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with headline, subtext, and CTA button',
    icon: Layout,
    category: 'Header',
  },
  {
    id: 'product-display',
    name: 'Product Display',
    description: 'Showcase product with images, price, and features',
    icon: ShoppingBag,
    category: 'Product',
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews and social proof section',
    icon: MessageSquare,
    category: 'Social Proof',
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Frequently asked questions accordion',
    icon: HelpCircle,
    category: 'Content',
  },
  {
    id: 'checkout-form',
    name: 'Checkout Form',
    description: 'Single-page checkout with customer details',
    icon: CreditCard,
    category: 'Conversion',
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    description: 'Product image carousel or grid',
    icon: Image,
    category: 'Media',
  },
  {
    id: 'text-block',
    name: 'Text Block',
    description: 'Rich text content section',
    icon: Type,
    category: 'Content',
  },
  {
    id: 'features',
    name: 'Features List',
    description: 'Product features with icons',
    icon: Star,
    category: 'Product',
  },
];

export function DeveloperSectionLibrary() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Section Library</h1>
        <p className="text-muted-foreground">
          Reusable components for building landing pages
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {section.category}
                </Badge>
              </div>
              <CardTitle className="text-base">{section.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-muted-foreground">
            More sections coming soon. The builder will allow drag & drop of these components.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}