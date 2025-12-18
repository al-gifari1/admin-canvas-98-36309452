import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface LinkValue {
  url: string;
  openInNewTab: boolean;
  nofollow: boolean;
}

interface LinkOptionsInputProps {
  label: string;
  value: LinkValue;
  onChange: (value: LinkValue) => void;
}

export function LinkOptionsInput({ label, value, onChange }: LinkOptionsInputProps) {
  const update = (updates: Partial<LinkValue>) => {
    onChange({ ...value, ...updates });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input
          value={value.url}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="https://example.com"
          className="h-8 text-xs flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-tab" className="text-xs">Open in new tab</Label>
                <Switch
                  id="new-tab"
                  checked={value.openInNewTab}
                  onCheckedChange={(checked) => update({ openInNewTab: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="nofollow" className="text-xs">Add nofollow</Label>
                <Switch
                  id="nofollow"
                  checked={value.nofollow}
                  onCheckedChange={(checked) => update({ nofollow: checked })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
