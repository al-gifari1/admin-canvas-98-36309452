import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface VideoPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function VideoProperties({ content, onUpdate, tab }: VideoPropertiesProps) {
  const video = content.video || { url: '', type: 'youtube' as const, autoplay: false };

  const updateVideo = (updates: Partial<typeof video>) => {
    onUpdate({
      ...content,
      video: { ...video, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            value={video.url}
            onChange={(e) => updateVideo({ url: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
          />
          <p className="text-xs text-muted-foreground">
            Use embed URLs for YouTube or Vimeo
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-type">Platform</Label>
          <Select
            value={video.type}
            onValueChange={(value) => updateVideo({ type: value as typeof video.type })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="video-autoplay">Autoplay</Label>
          <p className="text-xs text-muted-foreground">
            Start playing automatically
          </p>
        </div>
        <Switch
          id="video-autoplay"
          checked={video.autoplay}
          onCheckedChange={(checked) => updateVideo({ autoplay: checked })}
        />
      </div>
    </div>
  );
}
