import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CustomCSSFieldsProps {
  cssId?: string;
  cssClasses?: string;
  customCSS?: string;
  onCssIdChange: (value: string) => void;
  onCssClassesChange: (value: string) => void;
  onCustomCSSChange: (value: string) => void;
}

export function CustomCSSFields({
  cssId = '',
  cssClasses = '',
  customCSS = '',
  onCssIdChange,
  onCssClassesChange,
  onCustomCSSChange,
}: CustomCSSFieldsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Custom Attributes</Label>
      
      <div className="space-y-2">
        <div>
          <Label className="text-[10px] text-muted-foreground">CSS ID</Label>
          <Input
            value={cssId}
            onChange={(e) => onCssIdChange(e.target.value)}
            placeholder="my-element"
            className="h-8 text-xs"
          />
        </div>
        
        <div>
          <Label className="text-[10px] text-muted-foreground">CSS Classes</Label>
          <Input
            value={cssClasses}
            onChange={(e) => onCssClassesChange(e.target.value)}
            placeholder="class-1 class-2"
            className="h-8 text-xs"
          />
        </div>
        
        <div>
          <Label className="text-[10px] text-muted-foreground">Custom CSS</Label>
          <Textarea
            value={customCSS}
            onChange={(e) => onCustomCSSChange(e.target.value)}
            placeholder="selector { transform: rotate(5deg); }"
            className="font-mono text-xs min-h-[80px] resize-y"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Use &apos;selector&apos; to target this widget. Example: selector {"{"} border: 1px solid red; {"}"}
          </p>
        </div>
      </div>
    </div>
  );
}
