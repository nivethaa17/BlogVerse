'use client';

import { useState } from 'react';
import { Sparkles, FileText, Type, Tags, Zap, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/providers/ToastProvider';

interface AIAssistantProps {
  content: string;
  title: string;
  onApplyContent: (content: string) => void;
  onApplySummary: (summary: string) => void;
  onApplyTitle: (title: string) => void;
  onApplyTags: (tags: string[]) => void;
}

export const AIAssistant = ({
  content, title, onApplyContent, onApplySummary, onApplyTitle, onApplyTags
}: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});
  const [generateTopic, setGenerateTopic] = useState('');
  const [enhanceInstruction, setEnhanceInstruction] = useState('');
  const { toast } = useToast();

  const callAI = async (action: string, payload: any) => {
    setLoading(action);
    try {
      const res = await api.post(`/ai/${action}`, payload);
      setResults((prev: any) => ({ ...prev, [action]: res.data }));
      toast('AI completed!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'AI request failed', 'error');
    } finally {
      setLoading(null);
    }
  };

  const AIButton = ({ action, label, icon: Icon, payload, disabled }: any) => (
    <button
      onClick={() => callAI(action, payload)}
      disabled={!!loading || disabled}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors disabled:opacity-50 w-full"
    >
      {loading === action ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-purple-500" />}
      {label}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">AI Writing Assistant</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Generate Summary */}
          <div>
            <AIButton
              action="summarize"
              label="Generate Summary"
              icon={FileText}
              payload={{ content }}
              disabled={!content || content.length < 50}
            />
            {results.summarize?.summary && (
              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                <p className="mb-2">{results.summarize.summary}</p>
                <button onClick={() => onApplySummary(results.summarize.summary)} className="text-xs text-primary hover:underline">Apply →</button>
              </div>
            )}
          </div>

          {/* Suggest Titles */}
          <div>
            <AIButton
              action="suggest-titles"
              label="Suggest Titles"
              icon={Type}
              payload={{ content }}
              disabled={!content || content.length < 50}
            />
            {results['suggest-titles']?.titles && (
              <div className="mt-2 space-y-1">
                {results['suggest-titles'].titles.map((t: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span className="flex-1 line-clamp-1">{t}</span>
                    <button onClick={() => onApplyTitle(t)} className="text-xs text-primary hover:underline ml-2 whitespace-nowrap">Use</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggest Tags */}
          <div>
            <AIButton
              action="suggest-tags"
              label="Suggest Tags"
              icon={Tags}
              payload={{ title, content }}
              disabled={!content || content.length < 50}
            />
            {results['suggest-tags']?.tags && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <div className="flex flex-wrap gap-1 mb-2">
                  {results['suggest-tags'].tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-background border rounded-full px-2 py-0.5">#{tag}</span>
                  ))}
                </div>
                <button onClick={() => onApplyTags(results['suggest-tags'].tags)} className="text-xs text-primary hover:underline">Apply all →</button>
              </div>
            )}
          </div>

          {/* Generate Content */}
          <div>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder="Blog topic..."
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                className="flex-1 text-sm px-3 py-2 border rounded-md bg-background"
              />
              <button
                onClick={() => callAI('generate-content', { topic: generateTopic })}
                disabled={!generateTopic || !!loading}
                className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading === 'generate-content' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              </button>
            </div>
            {results['generate-content']?.content && (
              <div className="mt-2 p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
                <p className="mb-2 line-clamp-4">{results['generate-content'].content.substring(0, 200)}...</p>
                <button onClick={() => onApplyContent(results['generate-content'].content)} className="text-xs text-primary hover:underline">Apply to editor →</button>
              </div>
            )}
          </div>

          {/* Enhance Content */}
          <div>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                placeholder="Enhancement instruction..."
                value={enhanceInstruction}
                onChange={(e) => setEnhanceInstruction(e.target.value)}
                className="flex-1 text-sm px-3 py-2 border rounded-md bg-background"
              />
              <button
                onClick={() => callAI('enhance', { content, instruction: enhanceInstruction })}
                disabled={!content || !enhanceInstruction || !!loading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading === 'enhance' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
