'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Loader2, BookOpen, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [interests, setInterests] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'picks' | 'insights'>('picks');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, intRes] = await Promise.all([
        api.get('/ai-reader/recommendations'),
        api.get('/ai-reader/evolving-interests'),
      ]);
      setRecommendations(recRes.data.recommendations || []);
      setInterests(intRes.data.interests);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const personalityEmoji: any = {
    'The Curious Explorer': '🧭',
    'The Deep Diver': '🤿',
    'The Trend Follower': '📈',
    'The Balanced Reader': '⚖️',
    'The Specialist': '🎯',
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-sm">AI Personalization</h2>
        </div>
        <button onClick={fetchData} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('picks')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === 'picks' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
        >
          🎯 For You
        </button>
        <button
          onClick={() => setTab('insights')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === 'insights' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
        >
          🧠 Your Reading DNA
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span className="text-sm">Analyzing your reading habits...</span>
          </div>
        ) : tab === 'picks' ? (
          <div className="space-y-3">
            {recommendations.length > 0 ? recommendations.map((rec, i) => (
              <Link
                key={rec.blog._id}
                href={`/blog/${rec.blog.slug}`}
                className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {rec.blog.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="h-3 w-3 text-purple-400 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground line-clamp-1">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{rec.blog.category}</span>
                    <span className="text-xs text-muted-foreground">{rec.matchScore}% match</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Read more blogs to get AI picks</p>
                <Link href="/explore" className="text-xs text-purple-500 hover:underline mt-1 inline-block">
                  Explore blogs →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {interests ? (
              <>
                {/* Reading personality */}
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl">
                  <p className="text-3xl mb-1">{personalityEmoji[interests.readingPersonality] || '📖'}</p>
                  <p className="font-semibold text-sm">{interests.readingPersonality}</p>
                  {interests.insight && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{interests.insight}</p>
                  )}
                </div>

                {/* Primary interest */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">PRIMARY INTEREST</p>
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full text-sm font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {interests.primaryInterest}
                  </span>
                </div>

                {/* Emerging interests */}
                {interests.emergingInterests?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">EMERGING INTERESTS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.emergingInterests.map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">✨ {t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Read at least 3 blogs to see your reading DNA</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};