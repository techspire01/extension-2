import React, { useState } from 'react';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Settings as SettingsIcon,
  Bot,
  Compass,
  Search,
  Cpu,
  Zap,
  Share2,
  Palette,
  MessageSquare,
} from 'lucide-react';
import { AIToolItem, AppSettings } from '../types';

interface AIToolsDockProps {
  settings: AppSettings;
  tools: AIToolItem[];
  onOpenSettings: () => void;
}

export const AIToolsDock: React.FC<AIToolsDockProps> = ({
  settings,
  tools,
  onOpenSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!settings.showAITools) {
    return null;
  }

  const enabledTools = tools.filter((t) => t.enabled);
  const isOnlyIcons = settings.aiToolsOnlyIcons ?? true;

  const getToolIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'chatgpt':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'gemini':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'claude':
        return <Bot className="w-4 h-4 text-amber-600" />;
      case 'copilot':
        return <Compass className="w-4 h-4 text-sky-500" />;
      case 'perplexity':
        return <Search className="w-4 h-4 text-teal-500" />;
      case 'deepseek':
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'grok':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'meta ai':
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      case 'adobe firefly':
        return <Palette className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[var(--md-sys-color-primary)]" />;
    }
  };

  return (
    <div
      id="aiToolsCont"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none"
    >
      <div className="flex flex-col items-center">
        {/* Expanded Tools Palette */}
        {isExpanded && (
          <div
            id="toolsCont"
            className="mb-2 p-2.5 rounded-3xl bg-[var(--md-sys-color-surface-container-high)]/95 backdrop-blur-2xl border border-[var(--md-sys-color-outline)] shadow-2xl flex items-center flex-wrap justify-center gap-1.5 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {enabledTools.map((tool) => (
              <a
                key={tool.id}
                id={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${tool.name} - ${tool.description}`}
                className={`flex items-center rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline)]/40 hover:border-transparent text-xs font-semibold shadow-xs hover:shadow transition-all duration-150 active:scale-95 group ${
                  isOnlyIcons ? 'p-2.5 aspect-square' : 'gap-2 px-3 py-2'
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--md-sys-color-surface)] shadow-xs group-hover:scale-110 transition-transform">
                  {getToolIcon(tool.name)}
                </div>
                {!isOnlyIcons && <span className="tLabel">{tool.name}</span>}
              </a>
            ))}

            <button
              onClick={onOpenSettings}
              title="Configure AI Tools"
              className="p-2 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Tools Dock Pill Toggle */}
        <button
          id="aiToolsIcon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--md-sys-color-surface-container)]/90 hover:bg-[var(--md-sys-color-surface-container)] backdrop-blur-xl border border-[var(--md-sys-color-outline)] shadow-md hover:shadow-lg text-xs font-bold text-[var(--md-sys-color-on-surface)] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[var(--md-sys-color-primary)] animate-pulse" />
          <span id="ai_tools" className="tracking-wide">
            AI Tools
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
            {enabledTools.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          )}
        </button>
      </div>
    </div>
  );
};
