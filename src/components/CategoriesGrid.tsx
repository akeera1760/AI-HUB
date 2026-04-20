import { useRef, useState } from 'react';
import { Category, AITool } from '../lib/supabase';
import { CategoryCard } from './CategoryCard';

interface CategoriesGridProps {
  categories: Category[];
  tools: AITool[];
  activeCategoryId: string | null;
  isTransitioning: boolean;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoriesGrid({
  categories,
  tools,
  activeCategoryId,
  isTransitioning,
  onSelectCategory,
}: CategoriesGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [hoverFrame, setHoverFrame] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    visible: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    visible: false,
  });

  const getToolCountByCategory = (categoryId: string) => {
    return tools.filter(tool => tool.category_id === categoryId).length;
  };

  const updateHoverFrame = (element: HTMLElement) => {
    if (!gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cardRect = element.getBoundingClientRect();

    setHoverFrame({
      top: cardRect.top - gridRect.top,
      left: cardRect.left - gridRect.left,
      width: cardRect.width,
      height: cardRect.height,
      visible: true,
    });
  };

  const clearHoverFrame = () => {
    setHoverFrame((current) => ({ ...current, visible: false }));
  };

  return (
    <div className="category-grid-shell min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="category-orb category-orb-left" />
        <div className="category-orb category-orb-right" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-white/5 px-4 py-2 text-sm font-medium text-violet-200 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            Explore by category
          </div>
          <h2 className="mt-5 mb-2 text-4xl font-bold text-violet-50">
            Pick a lane and let the interface open it up
          </h2>
          <p className="text-violet-200/80">
            {categories.length} categories with {tools.length} tools
          </p>
          {isTransitioning && (
            <p className="mt-3 text-sm font-medium text-violet-300 animate-pulse">
              Opening category...
            </p>
          )}
        </div>

        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          onMouseLeave={clearHoverFrame}
        >
          <div
            aria-hidden="true"
            className={[
              'category-hover-frame',
              hoverFrame.visible && !isTransitioning ? 'category-hover-frame-visible' : '',
            ].join(' ')}
            style={{
              top: `${hoverFrame.top}px`,
              left: `${hoverFrame.left}px`,
              width: `${hoverFrame.width}px`,
              height: `${hoverFrame.height}px`,
            }}
          />
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              index={index}
              category={category}
              toolCount={getToolCountByCategory(category.id)}
              isActive={activeCategoryId === category.id}
              isDimmed={Boolean(activeCategoryId && activeCategoryId !== category.id)}
              disabled={isTransitioning}
              onHoverStart={updateHoverFrame}
              onHoverEnd={clearHoverFrame}
              onSelect={onSelectCategory}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
