import { useState, useCallback, useRef, useEffect } from 'react';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface Size {
  width: number;
  height: number;
}

interface UseResizableOptions {
  initialSize?: Size;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (size: Size) => void;
  onResizeEnd?: (size: Size) => void;
  aspectRatio?: number; // width / height
  step?: number;
}

interface UseResizableReturn {
  size: Size;
  isResizing: boolean;
  direction: ResizeDirection | null;
  getHandleProps: (dir: ResizeDirection) => {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
}

export function useResizable({
  initialSize = { width: 100, height: 100 },
  minWidth = 50,
  minHeight = 50,
  maxWidth = Infinity,
  maxHeight = Infinity,
  onResize,
  onResizeEnd,
  aspectRatio,
  step = 1,
}: UseResizableOptions): UseResizableReturn {
  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [direction, setDirection] = useState<ResizeDirection | null>(null);
  
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef<Size>(initialSize);

  const clamp = useCallback(
    (value: number, min: number, max: number) => 
      Math.min(max, Math.max(min, Math.round(value / step) * step)),
    [step]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isResizing || !direction) return;

      const deltaX = clientX - startPos.current.x;
      const deltaY = clientY - startPos.current.y;

      let newWidth = startSize.current.width;
      let newHeight = startSize.current.height;

      // Calculate new dimensions based on direction
      if (direction.includes('e')) newWidth += deltaX;
      if (direction.includes('w')) newWidth -= deltaX;
      if (direction.includes('s')) newHeight += deltaY;
      if (direction.includes('n')) newHeight -= deltaY;

      // Apply constraints
      newWidth = clamp(newWidth, minWidth, maxWidth);
      newHeight = clamp(newHeight, minHeight, maxHeight);

      // Apply aspect ratio if specified
      if (aspectRatio) {
        if (direction.includes('e') || direction.includes('w')) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        newWidth = clamp(newWidth, minWidth, maxWidth);
        newHeight = clamp(newHeight, minHeight, maxHeight);
      }

      const newSize = { width: newWidth, height: newHeight };
      setSize(newSize);
      onResize?.(newSize);
    },
    [isResizing, direction, clamp, minWidth, minHeight, maxWidth, maxHeight, aspectRatio, onResize]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => handleMove(e.clientX, e.clientY),
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleMove]
  );

  const handleEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setDirection(null);
      onResizeEnd?.(size);
    }
  }, [isResizing, size, onResizeEnd]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isResizing, handleMouseMove, handleTouchMove, handleEnd]);

  const getHandleProps = useCallback(
    (dir: ResizeDirection) => {
      const getCursor = (): React.CSSProperties['cursor'] => {
        switch (dir) {
          case 'n':
          case 's':
            return 'ns-resize';
          case 'e':
          case 'w':
            return 'ew-resize';
          case 'ne':
          case 'sw':
            return 'nesw-resize';
          case 'nw':
          case 'se':
            return 'nwse-resize';
          default:
            return 'default';
        }
      };

      return {
        onMouseDown: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          startPos.current = { x: e.clientX, y: e.clientY };
          startSize.current = size;
          setDirection(dir);
          setIsResizing(true);
        },
        onTouchStart: (e: React.TouchEvent) => {
          if (e.touches.length === 1) {
            e.stopPropagation();
            startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            startSize.current = size;
            setDirection(dir);
            setIsResizing(true);
          }
        },
        style: {
          cursor: getCursor(),
        } as React.CSSProperties,
      };
    },
    [size]
  );

  return {
    size,
    isResizing,
    direction,
    getHandleProps,
  };
}
