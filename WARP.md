# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Key commands

This repo is a Next.js 15 app (App Router) with TypeScript and Tailwind.

From the project root:

- **Start dev server**
  - `npm run dev`
- **Build for production**
  - `npm run build`
- **Start production server (after build)**
  - `npm run start`
- **Run ESLint**
  - `npm run lint`
- **Format code with Prettier (write changes)**
  - `npm run format`
- **Check formatting only (no writes)**
  - `npm run format:check`

> Note: There is currently **no test script or test runner configured** in `package.json`. If you add a test setup (e.g. Jest, Vitest, Playwright), also add appropriate `npm run test` (and single-test examples) here.

## Application structure and flow

### App router and pages

- `app/layout.tsx`
  - Global root layout.
  - Loads Google fonts (Figtree, Inter, Geist_Mono), applies them as CSS variables, and injects global styles from `app/globals.css` (which re-exports `styles/globals.css`).
  - Registers `@vercel/analytics` via `<Analytics />` in the root body.

- `app/page.tsx`
  - Marketing/landing page for "Vyx".
  - Composes presentational sections from `components/`:
    - `PortfolioNavbar`, `ProductTeaserCard`, `BankingScaleHero`, `CaseStudiesCarousel`, `IntegrationCarousel`, `PricingSection`, `FAQSection`, `Footer`.

- `app/upload/page.tsx`
  - **Client component** implementing the main user workflow:
    - Collects a `videoUrl` (intended to be a YouTube link).
    - Lets the user choose one or more content types (e.g. `blog-post`, `linkedin-post`, `x-post`, `instagram-post`, `image-only`) and the number of items per type.
    - Validates basic input (URL presence, at least one content type), then dynamically imports `N8NClient` from `@/lib/n8n-client`.
    - Uses `N8NClient.isValidYouTubeUrl` to validate URL format, then `N8NClient.mapContentTypes` to translate UI IDs into backend tokens.
    - Calls `N8NClient.generateContent(videoUrl, mappedTypes)`; on success, serializes the full response into a URL-safe string and navigates to `/results?data=…` via `next/navigation`'s `useRouter`.
  - Shows a `ProcessingModal` overlay while the request is in-flight and lets the user cancel (which only dismisses the UI state, not the network request).

- `app/results/page.tsx`
  - **Client component** (wrapped in a `Suspense` boundary) which:
    - Reads the `data` query parameter, decodes and parses it into an `N8NResponse` (`@/lib/n8n-client` type).
    - Handles error cases (missing/invalid payload) and shows appropriate messaging with a link back to `/upload`.
    - Filters `data.content.items` to ignore empty `content` fields and renders each remaining `ResultItem` in a responsive card layout.
    - Displays per-item **virality** and **usefulness** scores and any generated image (`image_url`).
    - Provides actions to:
      - Copy the content text to the clipboard (`navigator.clipboard`), with transient "Copied!" feedback.
      - Download individual images via `fetch` + blob -> `a[download]` anchor.
    - Includes a `Download All Package` button that bundles the full `N8NResponse` as a JSON blob and downloads it as `content-package-<timestamp>.json`.

### Library and service integration

- `lib/n8n-client.ts`
  - Centralizes the integration with an external **n8n** workflow exposed as a webhook.
  - Uses `NEXT_PUBLIC_N8N_WEBHOOK_URL` (see environment notes below), defaulting to `http://localhost:5678/webhook/ingest-content` if the env var is not set.
  - Exposes:
    - `N8NClient.isValidYouTubeUrl(url: string)` — regex-based check that the URL looks like a YouTube watch or short link.
    - `N8NClient.generateContent(videoUrl: string, contentTypes: string[])` — POSTs `{ videoUrl, contentTypes }` to the webhook.
      - Uses `AbortSignal.timeout(300_000)` (when available) to bound the call at ~5 minutes.
      - Throws on non-2xx responses and normalizes timeout-like errors to a friendly message.
    - `N8NClient.mapContentTypes(selected: string[])` — maps UI-facing IDs to backend tokens (e.g. `blog-post` → `blog`, `linkedin-post` → `linkedin`, `x-post` → `x`, `image-only` → `image`, plus some future IDs like `facebook-post`, `instagram-reel` mapped to stable tokens).
  - **Important coupling**: The backend workflow is assumed to return a JSON payload matching the `N8NResponse` TypeScript interfaces in this file. Keep this file in sync with any changes to the webhook/OPUS output schema.

- `lib/utils.ts`
  - Defines `cn(...inputs)` using `clsx` and `tailwind-merge`; this is the standard helper used in `components/ui` to merge class names.

### UI components and hooks

- `components/`
  - Marketing/UX sections (`BankingScaleHero`, `CaseStudiesCarousel`, `PricingSection`, etc.) are mostly presentational and consume the shared UI primitives and design tokens defined elsewhere.
  - `ProcessingModal`
    - Client-only modal rendered via `createPortal(document.body)`.
    - Uses three loader animations (`components/loaders/LoaderAnimation{1,2,3}.tsx`) that are dynamically imported with `next/dynamic` (`ssr: false`).
    - Cycles through a set of user-facing progress messages and picks a loader animation based on elapsed seconds since opening.
  - `theme-provider.tsx`
    - Thin wrapper around `next-themes`' `ThemeProvider`, used to provide theme context where needed.

- `components/ui/`
  - A reusable component library (largely Tailwind + Radix-based) including `button`, `card`, `dialog`, `accordion`, `tabs`, `table`, etc.
  - Components follow the pattern:
    - Use `class-variance-authority` (`cva`) for variants and sizes.
    - Use the `cn` helper to merge Tailwind classes.
    - Wire accessibility and structure to Radix primitives where relevant.
  - Example: `components/ui/button.tsx` defines `buttonVariants` with `variant` and `size` options and a `Button` component that can render as a native `<button>` or as a child via Radix `Slot`.

- `hooks/`
  - `use-scroll-direction.ts` tracks scroll direction (`"up" | "down"`) and whether the user is near the top of the page; used for navigation and header behavior.
  - `use-mobile.ts` and `use-toast.ts` mirror some of the patterns in `components/ui`, exposing convenience bindings to the underlying UI primitives.

### Styling and theming

- `styles/globals.css`
  - Tailwind v4 entry point:
    - `@import 'tailwindcss';`
    - `@import 'tw-animate-css';`
  - Declares CSS custom properties for light and dark themes (background, foreground, primary, semantic colors, chart colors, and sidebar colors).
  - Uses `@theme inline` to map those variables into Tailwind design tokens (e.g. `--color-background`, `--radius-*`, `--color-sidebar-*`).
  - Sets up a `dark` variant using `.dark` and a custom `@custom-variant dark (&:is(.dark *));` so Tailwind utilities can target dark mode.
  - In `@layer base`, applies `border-border` and `outline-ring/50` globally and sets `body` background/foreground from the theme variables.

### Configuration

- `tsconfig.json`
  - Uses modern `moduleResolution: "bundler"` and `jsx: "preserve"` suitable for Next.js 15.
  - Enables `strict` type-checking but note that **builds will not fail on type errors** (see `next.config.mjs`).
  - Sets a path alias: `@/*` → `./*` so imports like `@/components/...` and `@/lib/...` resolve to the project root.

- `next.config.mjs`
  - `typescript.ignoreBuildErrors: true` — Next will build even if TypeScript reports errors. Be aware of this when relying on CI builds to enforce type safety.
  - `images.unoptimized: true` — disables Next Image Optimization, so `<img>` tags and static assets are served without built-in optimization.

- `postcss.config.mjs`
  - Configures `@tailwindcss/postcss` as the sole PostCSS plugin, consistent with Tailwind v4 setup.

## Environment and external services

- **n8n webhook URL**
  - The main business logic (transcripts, OPUS scoring, image generation) is offloaded to an external n8n workflow.
  - Frontend calls are configured via the environment variable:
    - `NEXT_PUBLIC_N8N_WEBHOOK_URL`
  - If this variable is not set, `lib/n8n-client.ts` falls back to:
    - `https://primary-production-a9f7.up.railway.app/webhook-test/ingest-content` (Railway production)
  - **Important**: This is a long-running call (60-90 seconds) due to:
    - YouTube transcript extraction (~10-20s)
    - OPUS content generation (~30-60s)
    - Freepik Flux Dev image generation (~20-50s per image)
  - The `ProcessingModal` component handles the loading state during this time.

## Notes for future Warp agents

- There is currently **no** `CLAUDE.md`, `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` in this repo; this `WARP.md` is the primary AI-rules document.
- When adding new routes under `app/`, keep in mind the existing flow: `/upload` → `N8NClient.generateContent` → `/results` with encoded `N8NResponse` in the query string.
- If you introduce a formal testing setup or additional CLI scripts, update the **Key commands** section so future agents can run the relevant workflows directly.
