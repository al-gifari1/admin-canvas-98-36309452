import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDragValueOptions {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  direction?: 'horizontal' | 'vertical' | 'both';
}

interface UseDragValueReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
}

export function useDragValue({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  direction = 'both',
}: UseDragValueOptions): UseDragValueReturn {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startValue = useRef(value);

  const clamp = useCallback(
    (val: number) => Math.min(max, Math.max(min, Math.round(val / step) * step)),
    [min, max, step]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      let delta = 0;
      if (direction === 'horizontal' || direction === 'both') {
        delta += clientX - startPos.current.x;
      }
      if (direction === 'vertical' || direction === 'both') {
        delta -= clientY - startPos.current.y;
      }

      const newValue = clamp(startValue.current + delta);
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [isDragging, direction, clamp, value, onChange]
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
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startPos.current = { x: e.clientX, y: e.clientY };
      startValue.current = value;
      setIsDragging(true);
    },
    [value]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.stopPropagation();
        startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startValue.current = value;
        setIsDragging(true);
      }
    },
    [value]
  );

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}
