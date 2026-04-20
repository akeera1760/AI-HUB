import { AITool } from '../lib/supabase';
import { ExternalLink } from 'lucide-react';

interface ToolCardProps {
  tool: AITool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <a
      href={tool.website_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${index * 70}ms` }}
      className="tool-card animate-tool-in block rounded-2xl border border-violet-400/10 bg-white/5 p-6 shadow-md transition-all duration-300 group hover:-translate-y-1 hover:border-violet-400/35 hover:shadow-xl backdrop-blur"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-violet-50 group-hover:text-violet-200 transition-colors">
          {tool.name}
        </h3>
        <ExternalLink className="w-5 h-5 text-violet-300/55 group-hover:text-violet-200 transition-colors flex-shrink-0 ml-2" />
      </div>
      <p className="text-violet-200/78 leading-relaxed">
        {tool.description}
      </p>
    </a>
  );
}
