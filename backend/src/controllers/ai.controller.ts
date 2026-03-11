import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import Groq from 'groq-sdk';

// ─── Groq replaces OpenAI ───────────────────────
const callAI = async (systemPrompt: string, userContent: string, maxTokens = 1000): Promise<string> => {
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
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content || '';
};

// Generate summary
export const generateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = z.object({ content: z.string().min(50) }).parse(req.body);
  const plainText = content.replace(/<[^>]*>/g, '').substring(0, 3000);
  const result = await callAI(
    'You are a professional blog editor. Generate a concise, engaging 2-3 sentence summary for the given blog content. Return only the summary text, nothing else.',
    plainText
  );
  res.json({ success: true, summary: result.trim() });
};

// Suggest titles
export const suggestTitles = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, currentTitle } = z.object({ content: z.string().min(10), currentTitle: z.string().optional() }).parse(req.body);
  const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);
  const result = await callAI(
    'You are a professional blog editor. Suggest exactly 5 catchy, SEO-friendly blog titles. Return ONLY a JSON array of 5 strings, no markdown, no extra text. Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]',
    `Current title: ${currentTitle || 'none'}\n\nContent: ${plainText}`
  );
  let titles: string[] = [];
  try { titles = JSON.parse(result.replace(/```json|```/g, '').trim()); }
  catch { titles = result.split('\n').filter((l) => l.trim()).slice(0, 5); }
  res.json({ success: true, titles });
};

// Improve grammar
export const improveGrammar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = z.object({ content: z.string().min(10) }).parse(req.body);
  const result = await callAI(
    'You are a professional editor. Fix grammar, spelling, and improve clarity of the given text. Preserve the original meaning, tone, and HTML formatting if present. Return only the improved text.',
    content.substring(0, 3000)
  );
  res.json({ success: true, content: result.trim() });
};

// Suggest tags
export const suggestTags = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, category } = z.object({ content: z.string().min(10), category: z.string().optional() }).parse(req.body);
  const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);
  const result = await callAI(
    'You are a blog SEO expert. Suggest exactly 8 relevant tags for the blog. Return ONLY a JSON array of 8 lowercase strings, no markdown, no extra text. Example: ["tag1", "tag2", "tag3"]',
    `Category: ${category || 'general'}\n\nContent: ${plainText}`
  );
  let tags: string[] = [];
  try { tags = JSON.parse(result.replace(/```json|```/g, '').trim()); }
  catch { tags = result.split(',').map((t) => t.trim().replace(/['"]/g, '')).slice(0, 8); }
  res.json({ success: true, tags });
};

// Generate content
export const generateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { topic, category, outline } = z.object({
    topic: z.string().min(5),
    category: z.string().optional(),
    outline: z.string().optional(),
  }).parse(req.body);

  const result = await callAI(
    'You are a professional blog writer. Write an engaging, well-structured blog post in HTML format using <h2>, <h3>, <p>, <ul>, <li>, <strong> tags. Do not include <html>, <head>, or <body> tags. Write at least 500 words.',
    `Topic: ${topic}\nCategory: ${category || 'general'}\n${outline ? `Outline: ${outline}` : ''}`,
    2000
  );
  res.json({ success: true, content: result.trim() });
};

// Enhance content
export const enhanceContent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, instruction } = z.object({
    content: z.string().min(10),
    instruction: z.string().min(5),
  }).parse(req.body);

  const result = await callAI(
    `You are a professional blog editor. Enhance the given blog content based on the instruction. Preserve HTML formatting. Return only the enhanced content.`,
    `Instruction: ${instruction}\n\nContent: ${content.substring(0, 3000)}`,
    2000
  );
  res.json({ success: true, content: result.trim() });
};