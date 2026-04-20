import { Category, AITool } from '../lib/supabase';
import { ToolCard } from './ToolCard';
import { CategoryFeedback } from './CategoryFeedback';
import { ChevronLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ToolsViewProps {
  category: Category;
  tools: AITool[];
  onBack: () => void;
}

export function ToolsView({ category, tools, onBack }: ToolsViewProps) {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
    return Icon;
  };

  const Icon = getIcon(category.icon);

  return (
    <div className="tools-stage min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="category-orb category-orb-left" />
        <div className="category-orb category-orb-right" />
      </div>

      <div className="relative border-b border-violet-400/10 bg-[#120b22]/68 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 animate-stage-in">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-violet-300 hover:text-fuchsia-300 transition-colors mb-6 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Categories
          </button>
          <div className="flex items-center gap-4">
            <div className="category-icon-wrap p-4 rounded-2xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-violet-50">{category.name}</h1>
              <p className="text-violet-200/80 mt-1">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {tools.length === 0 ? (
          <div className="text-center py-20 animate-stage-in">
            <p className="text-violet-200/70 text-xl">No tools found in this category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
            <CategoryFeedback category={category} tools={tools} />
          </>
        )}
      </div>
    </div>
  );
}
