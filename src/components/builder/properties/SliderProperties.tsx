import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';

interface SliderPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface SlideItem {
  imageUrl: string;
  title: string;
  description: string;
}

export function SliderProperties({ content, onUpdate, tab }: SliderPropertiesProps) {
  const slider = content.slider || { 
    slides: [
      { imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', title: 'Slide 1', description: 'Description' }
    ], 
    autoplay: true, 
    interval: 5000 
  };

  const updateSlider = (updates: Partial<typeof slider>) => {
    onUpdate({
      ...content,
      slider: { ...slider, ...updates },
    });
  };

  const updateSlide = (index: number, updates: Partial<SlideItem>) => {
    const newSlides = [...slider.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    updateSlider({ slides: newSlides });
  };

  const addSlide = () => {
    updateSlider({
      slides: [...slider.slides, { imageUrl: '', title: `Slide ${slider.slides.length + 1}`, description: '' }]
    });
  };

  const removeSlide = (index: number) => {
    const newSlides = slider.slides.filter((_, i) => i !== index);
    updateSlider({ slides: newSlides });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Slides ({slider.slides.length})</Label>
          <Button size="sm" variant="outline" onClick={addSlide}>
            <Plus className="h-3 w-3 mr-1" />
            Add Slide
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-2">
            {slider.slides.map((slide, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="w-12 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {slide.imageUrl ? (
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm">Slide {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeSlide(index)}
                    disabled={slider.slides.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    value={slide.imageUrl}
                    onChange={(e) => updateSlide(index, { imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                    placeholder="Slide title"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={slide.description}
                    onChange={(e) => updateSlide(index, { description: e.target.value })}
                    placeholder="Slide description..."
                    rows={2}
                    className="text-sm"
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
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="slider-autoplay">Autoplay</Label>
          <p className="text-xs text-muted-foreground">
            Automatically cycle through slides
          </p>
        </div>
        <Switch
          id="slider-autoplay"
          checked={slider.autoplay}
          onCheckedChange={(checked) => updateSlider({ autoplay: checked })}
        />
      </div>

      {slider.autoplay && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Interval</Label>
            <span className="text-xs text-muted-foreground">{slider.interval / 1000}s</span>
          </div>
          <Slider
            value={[slider.interval]}
            onValueChange={([value]) => updateSlider({ interval: value })}
            min={1000}
            max={10000}
            step={500}
          />
          <p className="text-xs text-muted-foreground">
            Time between slides (1-10 seconds)
          </p>
        </div>
      )}

      {/* Preview of first slide */}
      {slider.slides[0] && (
        <div className="space-y-2">
          <Label>First Slide Preview</Label>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {slider.slides[0].imageUrl ? (
              <img 
                src={slider.slides[0].imageUrl} 
                alt={slider.slides[0].title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
