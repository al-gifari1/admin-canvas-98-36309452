import { X } from 'lucide-react';
import { Block, BlockType } from '@/types/builder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BuilderEditorProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (blockId: string, content: Block['content']) => void;
}

export function BuilderEditor({ block, onClose, onUpdate }: BuilderEditorProps) {
  if (!block) {
    return (
      <div className="w-72 border-l border-border bg-background flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a section on the canvas to edit its content
        </p>
      </div>
    );
  }

  const handleChange = (key: string, value: string) => {
    const contentKey = block.type === 'hero' 
      ? 'hero' 
      : block.type === 'product-showcase' 
        ? 'productShowcase' 
        : 'checkout';
    
    const currentContent = block.content[contentKey] || {};
    onUpdate(block.id, {
      ...block.content,
      [contentKey]: {
        ...currentContent,
        [key]: value,
      },
    });
  };

  const renderHeroEditor = () => {
    const content = block.content.hero;
    if (!content) return null;

    return (
      <div className="space-y-4">
        <div>
          <Label>Headline</Label>
          <Input
            value={content.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            placeholder="Enter headline"
          />
        </div>
        <div>
          <Label>Subtext</Label>
          <Textarea
            value={content.subtext}
            onChange={(e) => handleChange('subtext', e.target.value)}
            placeholder="Enter subtext"
            rows={3}
          />
        </div>
        <div>
          <Label>Image URL</Label>
          <Input
            value={content.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>CTA Button Text</Label>
          <Input
            value={content.ctaText}
            onChange={(e) => handleChange('ctaText', e.target.value)}
            placeholder="Order Now"
          />
        </div>
      </div>
    );
  };

  const renderProductEditor = () => {
    const content = block.content.productShowcase;
    if (!content) return null;

    return (
      <div className="space-y-4">
        <div>
          <Label>Product Title</Label>
          <Input
            value={content.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Product name"
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={content.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            value={content.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="৳2,999"
          />
        </div>
        <div>
          <Label>Image URL</Label>
          <Input
            value={content.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Image Position</Label>
          <Select
            value={content.imagePosition}
            onValueChange={(value) => handleChange('imagePosition', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderCheckoutEditor = () => {
    const content = block.content.checkout;
    if (!content) return null;

    return (
      <div className="space-y-4">
        <div>
          <Label>Section Title</Label>
          <Input
            value={content.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Complete Your Order"
          />
        </div>
        <div>
          <Label>Button Text</Label>
          <Input
            value={content.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder="Place Order"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Note: Checkout fields and logic are configured in the Page Dashboard → Checkout Logic tab.
        </p>
      </div>
    );
  };

  const getBlockLabel = (type: BlockType) => {
    switch (type) {
      case 'hero':
        return 'Hero Section';
      case 'product-showcase':
        return 'Product Showcase';
      case 'checkout':
        return 'Checkout Form';
      default:
        return 'Section';
    }
  };

  return (
    <div className="w-72 border-l border-border bg-background flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            {getBlockLabel(block.type)}
          </h3>
          <p className="text-xs text-muted-foreground">Edit section content</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {block.type === 'hero' && renderHeroEditor()}
        {block.type === 'product-showcase' && renderProductEditor()}
        {block.type === 'checkout' && renderCheckoutEditor()}
      </div>
    </div>
  );
}
