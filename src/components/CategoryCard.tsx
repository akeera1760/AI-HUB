import { Category } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { FocusEvent, MouseEvent } from 'react';

interface CategoryCardProps {
  index: number;
  category: Category;
  toolCount: number;
  isActive: boolean;
  isDimmed: boolean;
  disabled: boolean;
  onHoverStart: (element: HTMLElement) => void;
  onHoverEnd: () => void;
  onSelect: (categoryId: string) => void;
}

export function CategoryCard({
  index,
  category,
  toolCount,
  isActive,
  isDimmed,
  disabled,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: CategoryCardProps) {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
    return Icon;
  };

  const Icon = getIcon(category.icon);

  const handleHoverStart = (
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>
  ) => {
    onHoverStart(event.currentTarget);
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      onMouseEnter={handleHoverStart}
      onFocus={handleHoverStart}
      onBlur={onHoverEnd}
      disabled={disabled}
      style={{ animationDelay: `${index * 90}ms` }}
      className={[
        'category-card group relative z-10 overflow-hidden rounded-[28px] border p-8 text-left',
        'animate-category-in',
        isActive ? 'category-card-active' : '',
        isDimmed ? 'category-card-dimmed' : '',
        disabled ? 'cursor-wait' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="category-card-shine" />
      <div className="category-card-noise" />
      <div className="flex items-start justify-between mb-6">
        <div className="category-icon-wrap p-4 rounded-2xl transition-all">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <ChevronRight className="w-6 h-6 text-violet-300/55 transition-all duration-300 group-hover:text-violet-200 group-hover:translate-x-1" />
      </div>
      <div className="mb-3 inline-flex items-center rounded-full border border-violet-300/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/65 backdrop-blur">
        Browse tools
      </div>
      <h3 className="text-2xl font-bold text-violet-50 group-hover:text-violet-200 transition-colors mb-2">
        {category.name}
      </h3>
      <p className="text-violet-200/78 relative z-10">
        {toolCount} {toolCount === 1 ? 'tool' : 'tools'} available
      </p>
      <div className="mt-6 flex items-center justify-between text-sm font-medium text-violet-200/60 relative z-10">
        <span>Tap to explore</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          View collection
        </span>
      </div>
    </button>
  );
}
