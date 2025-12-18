import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, User } from 'lucide-react';

interface TestimonialsPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export function TestimonialsProperties({ content, onUpdate, tab }: TestimonialsPropertiesProps) {
  const testimonials = content.testimonials || { 
    items: [{ name: 'John Doe', role: 'Customer', text: 'Great product!', avatar: '' }] 
  };

  const updateTestimonials = (items: TestimonialItem[]) => {
    onUpdate({
      ...content,
      testimonials: { items },
    });
  };

  const updateItem = (index: number, updates: Partial<TestimonialItem>) => {
    const newItems = [...testimonials.items];
    newItems[index] = { ...newItems[index], ...updates };
    updateTestimonials(newItems);
  };

  const addItem = () => {
    updateTestimonials([
      ...testimonials.items,
      { name: 'New Customer', role: 'Customer', text: 'Amazing experience!', avatar: '' }
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = testimonials.items.filter((_, i) => i !== index);
    updateTestimonials(newItems);
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Testimonials ({testimonials.items.length})</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-2">
            {testimonials.items.map((item, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">Testimonial {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeItem(index)}
                    disabled={testimonials.items.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Quote</Label>
                  <Textarea
                    value={item.text}
                    onChange={(e) => updateItem(index, { text: e.target.value })}
                    placeholder="What did they say?"
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="John Doe"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Role</Label>
                    <Input
                      value={item.role}
                      onChange={(e) => updateItem(index, { role: e.target.value })}
                      placeholder="Customer"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Avatar URL (optional)</Label>
                  <Input
                    value={item.avatar}
                    onChange={(e) => updateItem(index, { avatar: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Testimonial styling options coming soon. Cards inherit your theme colors.
        </p>
      </div>
    </div>
  );
}
