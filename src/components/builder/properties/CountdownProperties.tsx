import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface CountdownPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function CountdownProperties({ content, onUpdate, tab }: CountdownPropertiesProps) {
  const countdown = content.countdown || { 
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
    title: 'Sale Ends In' 
  };

  const updateCountdown = (updates: Partial<typeof countdown>) => {
    onUpdate({
      ...content,
      countdown: { ...countdown, ...updates },
    });
  };

  // Format date for datetime-local input
  const formatDateForInput = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="countdown-title">Title</Label>
          <Input
            id="countdown-title"
            value={countdown.title}
            onChange={(e) => updateCountdown({ title: e.target.value })}
            placeholder="Sale Ends In"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="countdown-date">Target Date & Time</Label>
          <Input
            id="countdown-date"
            type="datetime-local"
            value={formatDateForInput(countdown.targetDate)}
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                updateCountdown({ targetDate: date.toISOString() });
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            The countdown will count down to this date
          </p>
        </div>

        {/* Quick presets */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '1 Hour', hours: 1 },
              { label: '24 Hours', hours: 24 },
              { label: '3 Days', hours: 72 },
              { label: '7 Days', hours: 168 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const date = new Date(Date.now() + preset.hours * 60 * 60 * 1000);
                  updateCountdown({ targetDate: date.toISOString() });
                }}
                className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Countdown styling options coming soon. The timer inherits your theme colors.
        </p>
      </div>
    </div>
  );
}
