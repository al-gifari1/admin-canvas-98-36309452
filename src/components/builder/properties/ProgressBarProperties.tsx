import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProgressBarPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function ProgressBarProperties({ content, onUpdate, tab }: ProgressBarPropertiesProps) {
  const progressBar = content.progressBar || { value: 75, label: 'Progress', color: 'primary' };

  const updateProgressBar = (updates: Partial<typeof progressBar>) => {
    onUpdate({
      ...content,
      progressBar: { ...progressBar, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="progress-label">Label</Label>
          <Input
            id="progress-label"
            value={progressBar.label}
            onChange={(e) => updateProgressBar({ label: e.target.value })}
            placeholder="Progress"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Value</Label>
            <span className="text-sm font-medium">{progressBar.value}%</span>
          </div>
          <Slider
            value={[progressBar.value]}
            onValueChange={([value]) => updateProgressBar({ value })}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-xs mb-1">
              <span>{progressBar.label}</span>
              <span>{progressBar.value}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${progressBar.value}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Bar Color</Label>
        <Select
          value={progressBar.color}
          onValueChange={(value) => updateProgressBar({ color: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span>Primary</span>
              </div>
            </SelectItem>
            <SelectItem value="secondary">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary" />
                <span>Secondary</span>
              </div>
            </SelectItem>
            <SelectItem value="destructive">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive" />
                <span>Destructive</span>
              </div>
            </SelectItem>
            <SelectItem value="green">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span>Green</span>
              </div>
            </SelectItem>
            <SelectItem value="yellow">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span>Yellow</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
