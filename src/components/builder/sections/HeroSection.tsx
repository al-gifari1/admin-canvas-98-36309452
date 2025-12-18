import { Block } from '@/types/builder';

interface HeroSectionProps {
  block: Block;
  isPreview?: boolean;
}

export function HeroSection({ block, isPreview }: HeroSectionProps) {
  const content = block.content.hero;
  
  if (!content) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {content.headline}
            </h1>
            <p className="text-lg text-muted-foreground">
              {content.subtext}
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              {content.ctaText}
            </button>
          </div>
          <div className="relative">
            <img
              src={content.imageUrl}
              alt="Hero"
              className="rounded-xl shadow-2xl w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
