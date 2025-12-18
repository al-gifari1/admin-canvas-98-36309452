import { useState } from 'react';
import { X, Settings, FileText, Palette } from 'lucide-react';
import { Block, WIDGET_LIBRARY } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeadingProperties } from './properties/HeadingProperties';
import { ParagraphProperties } from './properties/ParagraphProperties';
import { ImageProperties } from './properties/ImageProperties';
import { ButtonProperties } from './properties/ButtonProperties';
import { VideoProperties } from './properties/VideoProperties';
import { DividerProperties } from './properties/DividerProperties';
import { SpacerProperties } from './properties/SpacerProperties';
import { IconProperties } from './properties/IconProperties';
import { CheckoutFormProperties } from './properties/CheckoutFormProperties';
import { CountdownProperties } from './properties/CountdownProperties';
import { PricingTableProperties } from './properties/PricingTableProperties';
import { TestimonialsProperties } from './properties/TestimonialsProperties';
import { ProgressBarProperties } from './properties/ProgressBarProperties';

interface PropertiesPanelProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (blockId: string, content: Block['content']) => void;
}

export function PropertiesPanel({ block, onClose, onUpdate }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

  if (!block) {
    return (
      <div className="w-[300px] border-l border-border bg-card flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Properties</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No Widget Selected</h3>
          <p className="text-sm text-muted-foreground">
            Click on a widget in the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const widgetInfo = WIDGET_LIBRARY.find((w) => w.type === block.type);

  const handleUpdate = (content: Block['content']) => {
    onUpdate(block.id, content);
  };

  const renderPropertyEditor = (tab: 'content' | 'style') => {
    switch (block.type) {
      case 'heading':
        return <HeadingProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'paragraph':
        return <ParagraphProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'image':
        return <ImageProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'button':
        return <ButtonProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'video':
        return <VideoProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'divider':
        return <DividerProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'spacer':
        return <SpacerProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'icon':
        return <IconProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'checkout-form':
        return <CheckoutFormProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'countdown':
        return <CountdownProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'pricing-table':
        return <PricingTableProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'testimonials':
        return <TestimonialsProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      case 'progress-bar':
        return <ProgressBarProperties content={block.content} onUpdate={handleUpdate} tab={tab} />;
      default:
        return (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              {tab === 'content' ? 'Content Editor' : 'Style Editor'}
            </p>
            <p className="text-xs text-muted-foreground">
              Coming soon for {widgetInfo?.label || block.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-[300px] border-l border-border bg-card flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-foreground">Properties</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {widgetInfo?.label || block.type.replace('-', ' ')}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'content' | 'style')} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 pb-0 border-b border-border">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2">
              <Palette className="h-3.5 w-3.5" />
              Style
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="p-4 mt-0">
            {renderPropertyEditor('content')}
          </TabsContent>
          <TabsContent value="style" className="p-4 mt-0">
            {renderPropertyEditor('style')}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
