"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceContent = exports.generateContent = exports.suggestTags = exports.improveGrammar = exports.suggestTitles = exports.generateSummary = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
// ─── Groq replaces OpenAI ───────────────────────
const callAI = async (systemPrompt, userContent, maxTokens = 1000) => {
    if (!process.env.GROQ_API_KEY) {
        throw new errorHandler_1.AppError('GROQ_API_KEY is not set in your .env file', 503);
    }
    const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
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
const generateSummary = async (req, res) => {
    const { content } = zod_1.z.object({ content: zod_1.z.string().min(50) }).parse(req.body);
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 3000);
    const result = await callAI('You are a professional blog editor. Generate a concise, engaging 2-3 sentence summary for the given blog content. Return only the summary text, nothing else.', plainText);
    res.json({ success: true, summary: result.trim() });
};
exports.generateSummary = generateSummary;
// Suggest titles
const suggestTitles = async (req, res) => {
    const { content, currentTitle } = zod_1.z.object({ content: zod_1.z.string().min(10), currentTitle: zod_1.z.string().optional() }).parse(req.body);
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);
    const result = await callAI('You are a professional blog editor. Suggest exactly 5 catchy, SEO-friendly blog titles. Return ONLY a JSON array of 5 strings, no markdown, no extra text. Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]', `Current title: ${currentTitle || 'none'}\n\nContent: ${plainText}`);
    let titles = [];
    try {
        titles = JSON.parse(result.replace(/```json|```/g, '').trim());
    }
    catch {
        titles = result.split('\n').filter((l) => l.trim()).slice(0, 5);
    }
    res.json({ success: true, titles });
};
exports.suggestTitles = suggestTitles;
// Improve grammar
const improveGrammar = async (req, res) => {
    const { content } = zod_1.z.object({ content: zod_1.z.string().min(10) }).parse(req.body);
    const result = await callAI('You are a professional editor. Fix grammar, spelling, and improve clarity of the given text. Preserve the original meaning, tone, and HTML formatting if present. Return only the improved text.', content.substring(0, 3000));
    res.json({ success: true, content: result.trim() });
};
exports.improveGrammar = improveGrammar;
// Suggest tags
const suggestTags = async (req, res) => {
    const { content, category } = zod_1.z.object({ content: zod_1.z.string().min(10), category: zod_1.z.string().optional() }).parse(req.body);
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, 2000);
    const result = await callAI('You are a blog SEO expert. Suggest exactly 8 relevant tags for the blog. Return ONLY a JSON array of 8 lowercase strings, no markdown, no extra text. Example: ["tag1", "tag2", "tag3"]', `Category: ${category || 'general'}\n\nContent: ${plainText}`);
    let tags = [];
    try {
        tags = JSON.parse(result.replace(/```json|```/g, '').trim());
    }
    catch {
        tags = result.split(',').map((t) => t.trim().replace(/['"]/g, '')).slice(0, 8);
    }
    res.json({ success: true, tags });
};
exports.suggestTags = suggestTags;
// Generate content
const generateContent = async (req, res) => {
    const { topic, category, outline } = zod_1.z.object({
        topic: zod_1.z.string().min(5),
        category: zod_1.z.string().optional(),
        outline: zod_1.z.string().optional(),
    }).parse(req.body);
    const result = await callAI('You are a professional blog writer. Write an engaging, well-structured blog post in HTML format using <h2>, <h3>, <p>, <ul>, <li>, <strong> tags. Do not include <html>, <head>, or <body> tags. Write at least 500 words.', `Topic: ${topic}\nCategory: ${category || 'general'}\n${outline ? `Outline: ${outline}` : ''}`, 2000);
    res.json({ success: true, content: result.trim() });
};
exports.generateContent = generateContent;
// Enhance content
const enhanceContent = async (req, res) => {
    const { content, instruction } = zod_1.z.object({
        content: zod_1.z.string().min(10),
        instruction: zod_1.z.string().min(5),
    }).parse(req.body);
    const result = await callAI(`You are a professional blog editor. Enhance the given blog content based on the instruction. Preserve HTML formatting. Return only the enhanced content.`, `Instruction: ${instruction}\n\nContent: ${content.substring(0, 3000)}`, 2000);
    res.json({ success: true, content: result.trim() });
};
exports.enhanceContent = enhanceContent;
//# sourceMappingURL=ai.controller.js.map