# Somnithos — Production Readiness Audit

## 1. Current Technology / Stack
- **Frontend**: React 19 (`19.2.8`), TypeScript (`6.0.2`), Vite 8 (`8.2.2`).
- **Styling**: Vanilla CSS design system (*Midnight & Gold* palette in `src/index.css`).
- **Icons & UI**: Lucide React (`lucide-react`), Canvas Confetti (`canvas-confetti`).
- **Audio Engine**: Web Audio API with procedural oscillators for ambient soundscapes.
- **Testing**: 7 test suites (164 tests) running via Node.js TSX runner.

## 2. Frontend
- Single Page Application (SPA) built with React 19 and Vite.
- Responsive layout supporting mobile (390px), tablet (768px), and desktop (1024px, 1440px).
- Client calls backend via relative routes (`/api/analyze-dream`, `/api/generate-artwork`).

## 3. Backend
- Dual-mode architecture:
  - **Dev/Preview**: Vite server middleware plugin (`dreamAnalysisApiPlugin` in `vite.config.ts`).
  - **Production**: Standalone Node.js HTTP server (`server/index.ts`) handling POST API routes, CORS, and health checks.

## 4. Database / Storage
- **Current**: Client-side `localStorage` vaults with versioned namespaces:
  - `somnithos_dream_journal_v2` (Private Dream Archive & Patterns)
  - `somnithos_community_dreams_v2` (Anonymous Community Wall)
  - `somnithos_community_reports_v2` (Trust & Safety Moderation Reports)
- **Architecture**: Modular repository abstractions (`DreamRepository`, `CommunityRepository`) ready for database adapters (PostgreSQL / Supabase).

## 5. Gemini Integration
- **Model**: `gemini-1.5-flash` via Google Generative Language REST API (`GeminiClient.ts`).
- **Role**: Dream understanding, feature extraction, cautious reflection, and prompt synthesis.
- **Safety**: `AnalysisValidationLayer` sanitizes hallucinations and enforces `NO_RELIABLE_SOURCE` when ungrounded.

## 6. Image Generation
- **Primary Provider**: Google Imagen 3 (`imagen-3.0-generate-002`) via Generative Language API.
- **Fallback**: Procedural SVG/Canvas atmospheric generator (`ProceduralArtworkProvider`).

## 7. Authentication
- Pseudonymous client session architecture (`CommunityService.getClientToken()`, `anon-xxxx`).
- No centralized user passwords or OAuth tables required for current MVP.

## 8. Environment Variables Needed (Names Only)
- `GEMINI_API_KEY` (Required for live AI reasoning)
- `IMAGEN_API_KEY` (Optional; defaults to `GEMINI_API_KEY`)
- `GEMINI_MODEL` (Optional; defaults to `gemini-1.5-flash`)
- `PORT` (Optional; defaults to `3001`)

## 9. What is Still Mock / Fallback
- Deterministic analysis fallback engine if API key is omitted.
- Procedural SVG artwork generator if Imagen 3 key is omitted.
- Historical & psychology evidence stored in typed in-memory datasets (`mockEvidenceData.ts`, `mockResearchData.ts`).
- Storage in browser `localStorage` rather than remote SQL database.

## 10. Security Issues
- **Git Secrets**: Clean. No `.env` files or API keys are tracked in Git.
- **Client Key Exposure**: Zero. Keys are isolated to server-side code only.
- **Privacy**: Dreams are private by default; community sharing is explicit and anonymized.
- **Abuse Prevention**: 50 KB payload limit, in-memory rate limiting on submissions and reports, and automated PII redaction.

## 11. Deployment Requirements
- Node.js runtime (v18+ or v20+).
- Build command: `npm run build` (`tsc -b && vite build`).
- Start command: `node server/index.ts` (or serverless function wrappers for `/api/*`).
- Environment variable configuration for `GEMINI_API_KEY`.

## 12. Recommended Hosting / Deployment Setup
- **Frontend + Serverless**: **Vercel** or **Netlify** (hosting `dist/` on CDN with `/api/*` serverless functions).
- **Unified Container / Web Service**: **Render**, **Railway**, or **GCP Cloud Run** (running `server/index.ts`).

## 13. Biggest Blockers
- **Zero code or build blockers**: TypeScript compiles with 0 errors; all 164 automated tests pass 100%.
- **Action blocker**: Supplying a live `GEMINI_API_KEY` on the hosting provider to enable live AI synthesis instead of procedural fallback.

---

## WHAT I NEED TO DO NEXT

1. **Obtain API Key**: Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. **Select Hosting**: Create a project on **Vercel** or **Render**.
3. **Connect Repository**: Link `https://github.com/rangachaitanya4314/somnithos`.
4. **Set Environment Variable**: Add `GEMINI_API_KEY` in the hosting provider dashboard.
5. **Configure Domain**: Point DNS for `somnithos.ai` to your hosting provider.
