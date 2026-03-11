'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Clock, Target, Zap } from 'lucide-react';
import api from '@/lib/api';

interface Props { blogId: string; readTime: number; }

export const SmartSummary = ({ blogId, readTime }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleOpen = async () => {
    if (summary) { setOpen(!open); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await api.get(`/ai-reader/summary/${blogId}`);
      setSummary(res.data.summary);
    } catch {
      setSummary({ thirtySecondSummary: 'Could not generate summary.', keyTakeaways: [], whoShouldRead: '', difficulty: '', mood: '' });
    } finally {
      setLoading(false);
    }
  };

  const diffColor: any = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  return (
    <div className="border rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      <button onClick={handleOpen} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">AI Reader Summary</p>
            <p className="text-xs text-muted-foreground">Key insights before reading · {readTime} min read</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t bg-white/60 dark:bg-black/20">
          {loading ? (
            <div className="flex items-center gap-3 py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <span className="text-sm">Analyzing content...</span>
            </div>
          ) : summary && (
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {summary.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffColor[summary.difficulty] || 'bg-muted text-muted-foreground'}`}>
                    {summary.difficulty}
                  </span>
                )}
                {summary.mood && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                    {summary.mood}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">30-Second Summary</p>
                  <p className="text-sm leading-relaxed">{summary.thirtySecondSummary}</p>
                </div>
              </div>

              {summary.keyTakeaways?.length > 0 && (
                <div className="flex gap-3">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Key Takeaways</p>
                    <ul className="space-y-1.5">
                      {summary.keyTakeaways.map((t: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-purple-500 font-bold">·</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {summary.whoShouldRead && (
                <div className="flex gap-3">
                  <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Who Should Read This</p>
                    <p className="text-sm">{summary.whoShouldRead}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};