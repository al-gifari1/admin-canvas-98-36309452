import { cn } from '@/lib/utils';

interface GridGuidesProps {
  columns: number;
  rows?: number | 'auto';
  columnGap: number;
  rowGap: number;
  isSelected: boolean;
  showGuides?: boolean;
}

export function GridGuides({
  columns,
  rows = 'auto',
  columnGap,
  rowGap,
  isSelected,
  showGuides = true,
}: GridGuidesProps) {
  if (!showGuides) return null;

  const rowCount = rows === 'auto' ? 1 : rows;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Column guides - vertical dashed lines */}
      {Array.from({ length: columns - 1 }).map((_, i) => {
        const leftPercent = ((i + 1) / columns) * 100;
        return (
          <div
            key={`col-guide-${i}`}
            className={cn(
              'absolute top-0 bottom-0 border-l-2 border-dashed transition-colors',
              isSelected ? 'border-primary/40' : 'border-border/30'
            )}
            style={{
              left: `calc(${leftPercent}% - ${columnGap / 2}px)`,
            }}
          />
        );
      })}

      {/* Row guides - horizontal dashed lines (only if rows is a number) */}
      {rows !== 'auto' &&
        Array.from({ length: rowCount - 1 }).map((_, i) => {
          const topPercent = ((i + 1) / rowCount) * 100;
          return (
            <div
              key={`row-guide-${i}`}
              className={cn(
                'absolute left-0 right-0 border-t-2 border-dashed transition-colors',
                isSelected ? 'border-primary/40' : 'border-border/30'
              )}
              style={{
                top: `calc(${topPercent}% - ${rowGap / 2}px)`,
              }}
            />
          );
        })}

      {/* Column labels */}
      {isSelected && (
        <div className="absolute -top-6 left-0 right-0 flex justify-around text-[10px] text-muted-foreground font-medium">
          {Array.from({ length: columns }).map((_, i) => (
            <span key={`col-label-${i}`} className="bg-background px-1 rounded">
              {i + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
