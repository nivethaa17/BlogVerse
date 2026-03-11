import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Blog } from '../models/Blog.model';
import { Comment } from '../models/Comment.model';
import { ReaderAnalytics } from '../models/Analytics.model';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import Groq from 'groq-sdk';

const callAI = async (systemPrompt: string, userContent: string, maxTokens = 800): Promise<string> => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('GROQ_API_KEY is not set in your .env file', 503);
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.4,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content || '';
};

const parseJSON = (text: string, fallback: any) => {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return fallback; }
};

export const getSmartSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId).select('title content category tags');
  if (!blog) throw new AppError('Blog not found', 404);
  const plainText = blog.content.replace(/<[^>]*>/g, '').substring(0, 4000);
  const result = await callAI(
    `You are a smart reading assistant. Return a JSON object with exactly these keys:
{
  "thirtySecondSummary": "2-3 sentence summary",
  "keyTakeaways": ["takeaway 1","takeaway 2","takeaway 3","takeaway 4"],
  "whoShouldRead": "1 sentence ideal reader",
  "difficulty": "Beginner or Intermediate or Advanced",
  "mood": "Informative or Inspiring or Technical or Opinion or Story"
}
Return only valid JSON, no markdown backticks.`,
    `Title: ${blog.title}\n\nContent: ${plainText}`
  );
  const summary = parseJSON(result, {
    thirtySecondSummary: 'Summary unavailable.', keyTakeaways: [],
    whoShouldRead: '', difficulty: 'Unknown', mood: 'Informative',
  });
  res.json({ success: true, summary });
};

const analyzeCommentSchema = z.object({ content: z.string().min(1).max(2000) });

export const analyzeComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = analyzeCommentSchema.parse(req.body);
  const result = await callAI(
    `Analyze a blog comment and return JSON with exactly these keys:
{
  "toxicity": "none or low or medium or high",
  "isSpam": true or false,
  "sentiment": "positive or neutral or negative",
  "isInsightful": true or false,
  "insightScore": number from 0 to 10,
  "reason": "one sentence",
  "shouldBlock": true or false
}
Return only valid JSON, no markdown.`,
    `Comment: ${content}`
  );
  const analysis = parseJSON(result, {
    toxicity: 'none', isSpam: false, sentiment: 'neutral',
    isInsightful: false, insightScore: 0, reason: '', shouldBlock: false,
  });
  res.json({ success: true, analysis });
};

export const analyzeAllComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);
  if (!blog) throw new AppError('Blog not found', 404);
  if (blog.author.toString() !== req.user!._id.toString()) {
    throw new AppError('Only the blog author can analyze comments', 403);
  }
  const comments = await Comment.find({ blog: blogId, parentComment: null })
    .populate('author', 'name').limit(20).sort({ createdAt: -1 });
  if (comments.length === 0) { res.json({ success: true, results: [] }); return; }
  const commentsText = comments.map((c, i) => `Comment ${i + 1} (ID: ${c._id}): "${c.content}"`).join('\n\n');
  const result = await callAI(
    `Analyze these comments and return a JSON array. Each item:
{ "id": "comment ID", "toxicity": "none/low/medium/high", "isSpam": boolean, "sentiment": "positive/neutral/negative", "isInsightful": boolean, "insightScore": 0-10, "shouldBlock": boolean }
Return only a valid JSON array, no markdown.`,
    commentsText, 1200
  );
  const results = parseJSON(result, []);
  res.json({ success: true, results, totalAnalyzed: comments.length });
};

export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const readerAnalytics = await ReaderAnalytics.findOne({ user: userId });
  const categoryDist = readerAnalytics?.categoryDistribution
    ? Object.entries(readerAnalytics.categoryDistribution as any)
        .sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5)
    : [];
  const topCategories = categoryDist.map(([cat]) => cat);
  const userPreferences = req.user!.preferences || [];
  const allInterests = [...new Set([...topCategories, ...userPreferences])];
  const candidateBlogs = await Blog.find({
    status: 'published', author: { $ne: userId },
    ...(allInterests.length > 0 ? { category: { $in: allInterests } } : {}),
  }).populate('author', 'name avatar isPublic').sort({ viewsCount: -1, createdAt: -1 }).limit(30)
    .select('title summary category tags viewsCount likesCount slug author _id');
  if (candidateBlogs.length === 0) {
    res.json({ success: true, recommendations: [], message: 'Read more blogs to get personalized recommendations' });
    return;
  }
  const blogsForAI = candidateBlogs.slice(0, 15).map((b, i) => ({
    index: i, title: b.title, category: b.category,
    tags: (b.tags || []).join(', '), summary: b.summary?.substring(0, 100) || '',
  }));
  const userProfile = {
    topCategories: categoryDist.slice(0, 3).map(([cat, count]) => `${cat}(${count} reads)`).join(', '),
    preferences: userPreferences.join(', '),
    totalRead: readerAnalytics?.totalBlogsRead || 0,
  };
  const result = await callAI(
    `Select the top 5 most relevant blogs for this user. Return a JSON array of exactly 5:
[{ "index": number, "reason": "You might like this because... (max 12 words)", "matchScore": 0-100 }]
Return only valid JSON array, no markdown.`,
    `User: ${JSON.stringify(userProfile)}\n\nBlogs: ${JSON.stringify(blogsForAI)}`, 500
  );
  const aiRankings: any[] = parseJSON(result,
    candidateBlogs.slice(0, 5).map((_, i) => ({ index: i, reason: 'Based on your reading history', matchScore: 70 }))
  );
  const recommendations = aiRankings
    .filter((r) => r.index < candidateBlogs.length)
    .map((r) => ({ blog: candidateBlogs[r.index], reason: r.reason, matchScore: r.matchScore }));
  res.json({ success: true, recommendations });
};

export const getEvolvingInterests = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const analytics = await ReaderAnalytics.findOne({ user: userId });
  if (!analytics || analytics.totalBlogsRead < 3) {
    res.json({ success: true, message: 'Read at least 3 blogs to detect your evolving interests', interests: null });
    return;
  }
  const categoryDist = analytics.categoryDistribution as any;
  const categories = Object.entries(categoryDist || {})
    .map(([cat, count]) => ({ category: cat, count: count as number }))
    .sort((a, b) => b.count - a.count);
  const result = await callAI(
    `Based on a user's reading distribution, return a JSON object:
{
  "primaryInterest": "main category",
  "emergingInterests": ["topic1", "topic2"],
  "readingPersonality": "one of: The Curious Explorer, The Deep Diver, The Trend Follower, The Balanced Reader, The Specialist",
  "insight": "one interesting observation about reading habits (max 20 words)"
}
Return only valid JSON, no markdown.`,
    `Distribution: ${JSON.stringify(categories)}\nTotal read: ${analytics.totalBlogsRead}`
  );
  const interests = parseJSON(result, {
    primaryInterest: categories[0]?.category || 'Unknown',
    emergingInterests: [], readingPersonality: 'The Balanced Reader', insight: '',
  });
  res.json({ success: true, interests, totalBlogsRead: analytics.totalBlogsRead });
};