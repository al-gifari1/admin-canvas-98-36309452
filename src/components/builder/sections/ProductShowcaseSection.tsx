import { Block } from '@/types/builder';

interface ProductShowcaseSectionProps {
  block: Block;
  isPreview?: boolean;
}

export function ProductShowcaseSection({ block, isPreview }: ProductShowcaseSectionProps) {
  const content = block.content.productShowcase;
  
  if (!content) return null;

  const isImageLeft = content.imagePosition === 'left';

  return (
    <div className="py-12 px-6 bg-card">
      <div className="max-w-4xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-8 items-center ${!isImageLeft ? 'md:flex-row-reverse' : ''}`}>
          <div className={`${!isImageLeft ? 'md:order-2' : ''}`}>
            <img
              src={content.imageUrl}
              alt={content.title}
              className="rounded-xl shadow-lg w-full h-72 object-cover"
            />
          </div>
          <div className={`space-y-4 ${!isImageLeft ? 'md:order-1' : ''}`}>
            <h2 className="text-2xl font-bold text-card-foreground">
              {content.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {content.price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳4,999
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
