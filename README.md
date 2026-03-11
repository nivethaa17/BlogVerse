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


SCREENSHOTS
MAIN PAGE
<img width="1535" height="891" alt="image" src="https://github.com/user-attachments/assets/c3fff94d-3123-405e-8c97-375ff7fc9976" />


<img width="850" height="708" alt="image" src="https://github.com/user-attachments/assets/201fc502-abb3-4545-9f45-3b18e8500acd" />
SIGN IN/SIGN UP PAGE

<img width="1535" height="885" alt="image" src="https://github.com/user-attachments/assets/906490dc-7c72-4f43-85a5-9e565b49dd53" />
USER FEED

<img width="1297" height="781" alt="image" src="https://github.com/user-attachments/assets/2fe507e4-3789-4843-bae7-68057c6b418c" />
USER PROFILE

<img width="1460" height="888" alt="image" src="https://github.com/user-attachments/assets/be70c8e2-d379-43f1-a264-7aef146161be" />
<img width="1437" height="870" alt="image" src="https://github.com/user-attachments/assets/c5bc5ea3-17af-459c-9b8f-c9b1f21f200f" />
USER ANALYTICS DASHBOARD


<img width="1403" height="868" alt="image" src="https://github.com/user-attachments/assets/4d147c08-b158-4217-847f-2ee80d5c67be" />





