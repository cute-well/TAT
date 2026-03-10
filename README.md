# DocuMind AI — Smart Document Management System

A modern, AI-powered document management platform that scans and processes documents, extracts key data (names, dates, amounts), and automatically categorizes them into folders. Built with React, Express, PostgreSQL, and Google Gemini AI.

---

## Features

- **AI-Powered Data Extraction** — Automatically extracts names, dates, and financial amounts from any document text using Google Gemini.
- **Automatic Categorization** — AI suggests a document category (Invoice, Contract, Receipt, Report, etc.) and creates or assigns the folder automatically.
- **Document Dashboard** — Browse all processed documents with status badges, extracted-data previews, and animated cards.
- **Category Folders** — Navigate documents organized into categories from the sidebar.
- **Document Detail View** — Inspect the full content and all AI-extracted entities for any document.
- **CSV Report Generation** — Export all document data to a downloadable CSV report with one click.
- **Real-time Processing** — Documents are processed asynchronously; the UI refreshes automatically when extraction completes.
- **Scanning Animation** — Visual feedback during AI processing with a smooth scanning overlay.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS    |
| UI Library | shadcn/ui, Radix UI, Framer Motion          |
| Backend    | Node.js, Express 5, TypeScript              |
| Database   | PostgreSQL via Drizzle ORM                  |
| AI         | Google Gemini 2.5 Flash (`@google/genai`)   |
| Routing    | wouter (client), Express (server)           |
| State      | TanStack React Query                        |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or a hosted database URL)
- Google Gemini API key

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/cute-well/TAT.git
cd TAT
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/documind
AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Push the Database Schema

```bash
npm run db:push
```

This creates the `categories` and `documents` tables and seeds them with sample data on first run.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Available Scripts

| Command         | Description                                  |
|-----------------|----------------------------------------------|
| `npm run dev`   | Start the development server (port 5000)     |
| `npm run build` | Build client + server for production         |
| `npm start`     | Run the production build                     |
| `npm run check` | TypeScript type-check                        |
| `npm run db:push` | Push the Drizzle schema to the database    |

---

## Project Structure

```
.
├── client/                   # React frontend (Vite)
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       │   ├── documents/    # Document cards, process/create dialogs
│       │   ├── layout/       # Sidebar, main layout
│       │   └── ui/           # shadcn/ui + custom components
│       ├── hooks/            # React Query hooks for documents & categories
│       ├── lib/              # Utilities, query client
│       └── pages/            # Dashboard, Document Detail, Category View
├── server/                   # Express backend
│   ├── index.ts              # App entry point
│   ├── routes.ts             # API route handlers + AI processing logic
│   ├── storage.ts            # Database access layer (Drizzle)
│   └── db.ts                 # PostgreSQL connection
├── shared/                   # Shared types & API contract
│   ├── schema.ts             # Drizzle schema (categories, documents)
│   └── routes.ts             # Typed API route definitions + Zod schemas
├── script/
│   └── build.ts              # Production build script
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## API Endpoints

| Method | Path                     | Description                                  |
|--------|--------------------------|----------------------------------------------|
| GET    | `/api/categories`        | List all categories                          |
| POST   | `/api/categories`        | Create a new category                        |
| GET    | `/api/documents`         | List all documents (with category info)      |
| GET    | `/api/documents/:id`     | Get a single document by ID                  |
| POST   | `/api/documents/process` | Submit document text for AI processing       |

### POST `/api/documents/process` — Request Body

```json
{
  "title": "Q3 Invoice - Acme Corp",
  "text": "Invoice #1024\nDate: 2024-07-01\nAmount Due: $1,250.00\nBilled to: Acme Corp"
}
```

### Response (201)

```json
{
  "id": 3,
  "title": "Q3 Invoice - Acme Corp",
  "content": "...",
  "status": "processing",
  "categoryId": null,
  "extractedData": null,
  "createdAt": "2024-07-01T12:00:00.000Z"
}
```

The document is processed asynchronously. Poll `GET /api/documents/:id` or refresh the dashboard to see the final extracted data once processing completes.

---

## How Document Processing Works

1. User submits a document title and raw text (OCR output or typed content).
2. The API immediately creates a `processing` document record and responds with `201`.
3. Asynchronously, the text is sent to **Google Gemini 2.5 Flash** with a structured prompt requesting JSON output with `names`, `dates`, `amounts`, and `suggestedCategory`.
4. The AI response is parsed, and the document is updated to `completed` with the extracted data.
5. If the suggested category does not exist, it is automatically created and assigned.
6. The frontend React Query cache is invalidated on the next poll/refetch, showing the updated card.

---

## Production Build

```bash
npm run build
npm start
```

The build script bundles the Vite client to `dist/public/` and compiles the Express server to `dist/index.cjs`.

---

## License

MIT
