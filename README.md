# vaditya.in

Personal site of VSSV Aditya Ram — AI engineer building production agentic systems on Azure, and shipping the products around them.

Live at https://vaditya.in (GitHub Pages, `CNAME` in this repo).

## What's here

- `index.html` — home: current stack, selected work, about, skills, experience, contact.
- `projects.html` — all work: three featured pieces plus earlier systems.
- `project-telecom-assistant.html` — case study for a telecom chat + real-time voice assistant built at TCS (client name and infrastructure withheld).
- `live-project-budget.html` — the Budget app, live at https://budget.vaditya.in (separate repo/Worker).
- `style.css` — the "Blueprint" design system: light and dark themes, IBM Plex + Bricolage Grotesque.
- `script.js` — theme toggle, mobile nav, scroll reveal, contact form (opens the visitor's mail app), clickable work rows.
- `ask-widget.js` — the "Ask about Aditya" assistant widget; talks to a separate Cloudflare Worker at https://ask.vaditya.in (RAG over this site's content, Gemini with a Workers AI fallback).
- `secret-entry.js` / `secret-entry.css` — a small hidden door. It asks for a key and hands it to the assistant Worker; the destination is not in this repo. Leave it be.

No build step. Edit the HTML/CSS, push to `main`, GitHub Pages does the rest.

## Updating the assistant's knowledge

The assistant answers only from a hand-written set of content chunks in the `portfolio-assistant` Worker's `src/content.ts`. When copy on this site changes materially, update those chunks and re-run the ingest endpoint so the embeddings match.
