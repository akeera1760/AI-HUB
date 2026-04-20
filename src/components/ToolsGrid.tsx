import { AITool } from '../lib/supabase';
import { ToolCard } from './ToolCard';

interface ToolsGridProps {
  tools: AITool[];
  categoryName: string | null;
}

export function ToolsGrid({ tools, categoryName }: ToolsGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-violet-50 mb-2">
          {categoryName || 'Explore AI Tools'}
        </h2>
        <p className="text-violet-200/80">
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
        </p>
      </div>
      {tools.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-violet-200/70 text-xl">No tools found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
