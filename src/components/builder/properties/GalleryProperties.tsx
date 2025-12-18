import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';

interface GalleryPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

interface GalleryImage {
  url: string;
  alt: string;
}

export function GalleryProperties({ content, onUpdate, tab }: GalleryPropertiesProps) {
  const gallery = content.gallery || { 
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Image 1' },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Image 2' },
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Image 3' }
    ], 
    columns: 3 as const 
  };

  const updateGallery = (updates: Partial<typeof gallery>) => {
    onUpdate({
      ...content,
      gallery: { ...gallery, ...updates },
    });
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const newImages = [...gallery.images];
    newImages[index] = { ...newImages[index], ...updates };
    updateGallery({ images: newImages });
  };

  const addImage = () => {
    updateGallery({
      images: [...gallery.images, { url: '', alt: `Image ${gallery.images.length + 1}` }]
    });
  };

  const removeImage = (index: number) => {
    const newImages = gallery.images.filter((_, i) => i !== index);
    updateGallery({ images: newImages });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Images ({gallery.images.length})</Label>
          <Button size="sm" variant="outline" onClick={addImage}>
            <Plus className="h-3 w-3 mr-1" />
            Add Image
          </Button>
        </div>

        <ScrollArea className="h-[350px]">
          <div className="space-y-3 pr-2">
            {gallery.images.map((image, index) => (
              <div key={index} className="p-3 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {image.url ? (
                        <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-sm">Image {index + 1}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => removeImage(index)}
                    disabled={gallery.images.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    value={image.url}
                    onChange={(e) => updateImage(index, { url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Alt Text</Label>
                  <Input
                    value={image.alt}
                    onChange={(e) => updateImage(index, { alt: e.target.value })}
                    placeholder="Image description"
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
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String(gallery.columns)}
          onValueChange={(value) => updateGallery({ columns: Number(value) as typeof gallery.columns })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div 
          className="grid gap-1 border border-border rounded-lg p-2" 
          style={{ gridTemplateColumns: `repeat(${gallery.columns}, 1fr)` }}
        >
          {gallery.images.slice(0, gallery.columns * 2).map((image, i) => (
            <div key={i} className="aspect-square bg-muted rounded overflow-hidden">
              {image.url ? (
                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
