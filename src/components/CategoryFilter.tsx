import { Category } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
    return Icon;
  };

  return (
    <div className="sticky top-20 z-10 border-b border-violet-400/10 bg-[#120b22]/72 px-6 py-6 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-950/30'
                : 'border border-violet-400/12 bg-white/5 text-violet-200 hover:bg-violet-400/10'
            }`}
          >
            <LucideIcons.Grid3x3 className="w-5 h-5" />
            All Tools
          </button>
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-950/30'
                    : 'border border-violet-400/12 bg-white/5 text-violet-200 hover:bg-violet-400/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
