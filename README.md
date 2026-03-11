# 🚀 BlogVerse — Full Stack Implementation Guide


---

## 1. Project Overview <a name="overview"></a>

BlogVerse is a full-stack, AI-powered blogging platform with:
- Role-based user management (Reader / Writer / Both)
- Real-time engagement (Socket.io)
- Analytics dashboards for both readers and writers
- Personalized content feed
- Google OAuth 2.0 authentication

---

## 2. Tech Stack <a name="tech-stack"></a>

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas + Mongoose |
| AI | OpenAI GPT-4o-mini |
| Real-time | Socket.io |
| Auth | JWT + Google OAuth 2.0 |
| Storage | Cloudinary |
| Editor | TipTap Rich Text Editor |
| Charts | Recharts |
| State | Zustand |

---

## 3. Project Structure <a name="project-structure"></a>

```
blogify-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   └── socket.ts            # Socket.io setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Login, register, Google OAuth
│   │   │   ├── blog.controller.ts   # CRUD + feed + trending
│   │   │   ├── comment.controller.ts
│   │   │   ├── social.controller.ts # Likes, bookmarks, follows
│   │   │   ├── ai.controller.ts     # OpenAI integration
│   │   │   ├── analytics.controller.ts
│   │   │   └── notification.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT auth + role check
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Blog.model.ts
│   │   │   ├── Comment.model.ts
│   │   │   ├── Social.model.ts      # Like, Bookmark, Follower, Notification
│   │   │   └── Analytics.model.ts  # ReaderAnalytics, WriterAnalytics
│   │   ├── routes/
│   │   │   └── *.routes.ts
│   │   └── index.ts                 # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── feed/page.tsx        # Personalized feed
│   │   │   ├── explore/page.tsx     # Browse all blogs
│   │   │   ├── write/page.tsx       # Blog editor
│   │   │   ├── blog/[slug]/page.tsx # Blog reader
│   │   │   ├── dashboard/page.tsx   # Analytics
│   │   │   ├── profile/[userId]/page.tsx
│   │   │   ├── bookmarks/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── blog/BlogCard.tsx
│   │   │   ├── blog/CommentsSection.tsx
│   │   │   ├── editor/RichTextEditor.tsx
│   │   │   ├── editor/AIAssistant.tsx
│   │   │   └── providers/
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   └── lib/
│   │       ├── api.ts               # Axios client
│   │       └── store/auth.store.ts  # Zustand auth state
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```


## Database Collections

| Collection | Purpose |
|-----------|---------|
| users | User accounts, roles, preferences |
| blogs | Blog posts with metadata |
| comments | Nested comments system |
| likes | Blog and comment likes |
| bookmarks | Saved articles |
| followers | Follow relationships |
| notifications | Real-time notifications |
| readeranalytics | Per-user reading stats |
| writeranalytics | Per-writer publishing stats |

---

