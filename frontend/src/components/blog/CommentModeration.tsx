'use client';

import { useState } from 'react';
import { Shield, Star, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Props {
  commentId: string;
  content: string;
  isAuthor: boolean; // is current user the blog author
}

export const CommentModerationBadge = ({ commentId, content, isAuthor }: Props) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (analysis) return;
    setLoading(true);
    try {
      const res = await api.post('/ai-reader/comment/analyze', { content });
      setAnalysis(res.data.analysis);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when component mounts if blog author
  if (isAuthor && !analysis && !loading) {
    analyze();
  }

  if (!analysis && !loading) return null;

  if (loading) return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1">
      {/* Insightful badge */}
      {analysis.isInsightful && analysis.insightScore >= 7 && (
        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
          <Star className="h-3 w-3" /> Insightful
        </span>
      )}

      {/* Sentiment badge */}
      {analysis.sentiment === 'positive' && (
        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
          😊 Positive
        </span>
      )}

      {/* Toxicity warning — only show to blog author */}
      {isAuthor && analysis.toxicity !== 'none' && (
        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
          analysis.toxicity === 'high'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          <AlertTriangle className="h-3 w-3" />
          {analysis.toxicity === 'high' ? 'Toxic' : analysis.toxicity === 'medium' ? 'Rude' : 'Mild'}
        </span>
      )}

      {/* Spam warning — only show to blog author */}
      {isAuthor && analysis.isSpam && (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
          <Shield className="h-3 w-3" /> Spam
        </span>
      )}
    </div>
  );
};

// Blog author's comment dashboard panel
export const CommentIntelligencePanel = ({ blogId, isAuthor }: { blogId: string; isAuthor: boolean }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  if (!isAuthor) return null;

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ai-reader/comments/analyze/${blogId}`);
      setResults(res.data.results);
      setAnalyzed(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const toxic = results.filter((r) => r.toxicity === 'high' || r.toxicity === 'medium').length;
  const spam = results.filter((r) => r.isSpam).length;
  const insightful = results.filter((r) => r.isInsightful && r.insightScore >= 7).length;

  return (
    <div className="border rounded-xl p-4 bg-muted/30 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <p className="text-sm font-semibold">Comment Intelligence</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
          {analyzed ? 'Re-analyze' : 'Analyze Comments'}
        </button>
      </div>

      {analyzed && (
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-lg font-bold text-amber-600">{insightful}</p>
            <p className="text-xs text-muted-foreground">Insightful</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-lg font-bold text-red-600">{toxic}</p>
            <p className="text-xs text-muted-foreground">Toxic</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-lg font-bold text-gray-600">{spam}</p>
            <p className="text-xs text-muted-foreground">Spam</p>
          </div>
        </div>
      )}
    </div>
  );
};