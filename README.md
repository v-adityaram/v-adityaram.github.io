# vaditya.in

Personal site of VSSV Aditya Ram: AI engineer building enterprise prototypes at TCS and independent live products with Azure and Cloudflare.

Live at https://vaditya.in (GitHub Pages, `CNAME` in this repo).

## What's here

- `index.html` — compact introduction, selected work, about, skills, experience, contact. Detailed stack and credentials expand on demand.
- `projects.html` — all work: three featured pieces plus earlier systems.
- The homepage’s quiet “After hours” row and footer link to the live arcade at https://games.vaditya.in. `arcade-preview.html` remains a useful entry page for old bookmarks, with a link to the playable games. The independent `vaditya-arcade` app uses Cloudflare static assets and free SQLite-backed Durable Objects for multiplayer.
- `work-atlas.html` / `work-atlas.css` / `work-atlas.js` — interactive project map on a separate page. Project/filter state is shareable (`?project=paperbrief&filter=retrieval`) and supports Back/Forward. Small screens use a list; keyboard navigation is available throughout.
- `assets/Resume.pdf` / `assets/Resume.docx` — current resume downloads with TCS clients described by industry; other employer and project names are retained.
- `project-telecom-assistant.html` — case study for a telecom chat + real-time voice assistant built at TCS (client name and infrastructure withheld).
- `project-preview.js` — illustrative telecom walkthrough with synthetic examples. It makes no model calls, account lookups or microphone requests.
- `live-project-budget.html` — the Budget app, live at https://budget.vaditya.in (separate repo/Worker).
- `style.css` — the "Blueprint" design system: light and dark themes, IBM Plex + Bricolage Grotesque.
- `script.js` — theme toggle, mobile nav with Escape dismissal, scroll reveal, email-copy fallback and contact form (opens the visitor's mail app). Project navigation uses native links.
- `ask-widget.js` — the "Ask about Aditya" assistant widget; talks to a separate Cloudflare Worker at https://ask.vaditya.in (RAG over this site's content, Gemini with a Workers AI fallback).
- `assets/logo-mark.svg` — the VA mark (source of truth; the header inlines it and colours it with CSS). `favicon-light/dark.png`, `apple-touch-icon.png`, `logo-header-light/dark.png` and `logo-mark-light/dark.png` are renders of it.
- `assets/budget-preview.jpg` — the real local Budget UI rendered with isolated sample API responses, not a screenshot of a personal account. `assets/social-preview.png` is the 1200 × 630 branded sharing image. Each public page provides a canonical URL, Open Graph and Twitter card metadata.
- `secret-entry.js` / `secret-entry.css` — a small hidden door. It asks for a key and hands it to the assistant Worker; the destination is not in this repo. Leave it be.

No build step. Edit the HTML/CSS, push to `main`, GitHub Pages does the rest.

## Background motion

The shared CSS draws two faint contour surfaces and moves only their transforms. Screens up to 640px use one 360px surface. The dotted paper stays static, and there are no animation libraries, extra image requests, or JavaScript frame loops.

The header's pause button remembers the visitor's preference across pages. Reduced-motion and data-saver preferences keep the contours still; hidden tabs pause them. Without JavaScript, the original static dotted background remains. The two inlined control icons are from Phosphor Icons under the MIT license in `assets/phosphor-LICENSE.txt`.

## Updating the assistant's knowledge

The assistant answers only from a hand-written set of content chunks in the `portfolio-assistant` Worker's `src/content.ts`. When copy on this site changes materially, update those chunks and re-run the ingest endpoint so the embeddings match.
