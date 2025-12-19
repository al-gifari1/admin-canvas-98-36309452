import { useDragValue } from '@/hooks/useDragValue';
import { cn } from '@/lib/utils';

interface BoxModel {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked?: boolean;
}

interface PaddingHandlesProps {
  padding: BoxModel;
  onChange: (padding: BoxModel) => void;
  isSelected: boolean;
  minValue?: number;
  maxValue?: number;
}

export function PaddingHandles({
  padding,
  onChange,
  isSelected,
  minValue = 0,
  maxValue = 100,
}: PaddingHandlesProps) {
  const handlePaddingChange = (side: keyof Omit<BoxModel, 'linked'>, value: number) => {
    if (padding.linked) {
      onChange({
        top: value,
        right: value,
        bottom: value,
        left: value,
        linked: true,
      });
    } else {
      onChange({
        ...padding,
        [side]: value,
      });
    }
  };

  const topHandle = useDragValue({
    value: padding.top,
    min: minValue,
    max: maxValue,
    step: 1,
    onChange: (v) => handlePaddingChange('top', v),
    direction: 'vertical',
  });

  const rightHandle = useDragValue({
    value: padding.right,
    min: minValue,
    max: maxValue,
    step: 1,
    onChange: (v) => handlePaddingChange('right', v),
    direction: 'horizontal',
  });

  const bottomHandle = useDragValue({
    value: padding.bottom,
    min: minValue,
    max: maxValue,
    step: 1,
    onChange: (v) => handlePaddingChange('bottom', v),
    direction: 'vertical',
  });

  const leftHandle = useDragValue({
    value: padding.left,
    min: minValue,
    max: maxValue,
    step: 1,
    onChange: (v) => handlePaddingChange('left', v),
    direction: 'horizontal',
  });

  if (!isSelected) return null;

  const handleBaseClass = cn(
    'absolute bg-primary/80 hover:bg-primary transition-colors',
    'flex items-center justify-center text-[10px] font-medium text-primary-foreground',
    'select-none cursor-grab active:cursor-grabbing z-30'
  );

  return (
    <>
      {/* Top Padding Handle */}
      <div
        className={cn(handleBaseClass, 'left-1/2 -translate-x-1/2 rounded-b-sm')}
        style={{
          top: 0,
          width: 40,
          height: Math.max(padding.top, 16),
          minHeight: 16,
        }}
        onMouseDown={topHandle.handleMouseDown}
        onTouchStart={topHandle.handleTouchStart}
        title={`Top padding: ${padding.top}px`}
      >
        {padding.top > 20 && <span>{padding.top}</span>}
      </div>

      {/* Right Padding Handle */}
      <div
        className={cn(handleBaseClass, 'top-1/2 -translate-y-1/2 rounded-l-sm')}
        style={{
          right: 0,
          width: Math.max(padding.right, 16),
          minWidth: 16,
          height: 40,
        }}
        onMouseDown={rightHandle.handleMouseDown}
        onTouchStart={rightHandle.handleTouchStart}
        title={`Right padding: ${padding.right}px`}
      >
        {padding.right > 20 && <span>{padding.right}</span>}
      </div>

      {/* Bottom Padding Handle */}
      <div
        className={cn(handleBaseClass, 'left-1/2 -translate-x-1/2 rounded-t-sm')}
        style={{
          bottom: 0,
          width: 40,
          height: Math.max(padding.bottom, 16),
          minHeight: 16,
        }}
        onMouseDown={bottomHandle.handleMouseDown}
        onTouchStart={bottomHandle.handleTouchStart}
        title={`Bottom padding: ${padding.bottom}px`}
      >
        {padding.bottom > 20 && <span>{padding.bottom}</span>}
      </div>

      {/* Left Padding Handle */}
      <div
        className={cn(handleBaseClass, 'top-1/2 -translate-y-1/2 rounded-r-sm')}
        style={{
          left: 0,
          width: Math.max(padding.left, 16),
          minWidth: 16,
          height: 40,
        }}
        onMouseDown={leftHandle.handleMouseDown}
        onTouchStart={leftHandle.handleTouchStart}
        title={`Left padding: ${padding.left}px`}
      >
        {padding.left > 20 && <span>{padding.left}</span>}
      </div>

      {/* Corner indicators when any handle is being dragged */}
      {(topHandle.isDragging || rightHandle.isDragging || bottomHandle.isDragging || leftHandle.isDragging) && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none z-20" />
      )}
    </>
  );
}
