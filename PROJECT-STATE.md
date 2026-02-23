# PROJECT-STATE.md — Átrias Wiki
*Last updated: 2026-02-23 by Kuroko 👻*

## Vision
A D&D wiki gift for Peter's Tuesday night campaign. 176 entities across 7 continents. Narrated by Thaveus. Built to feel like lore Peter and the players can actually explore.

---

## Stack
- Next.js (App Router), TypeScript
- Sanity CMS (content backend)
- Audio narration per chapter/session

---

## What's Built & Working

| Route | Status | Notes |
|-------|--------|-------|
| `/characters/[slug]` | ✅ | Character detail pages |
| `/factions/[slug]` | ✅ | Faction detail pages |
| `/items/[slug]` | ✅ | Item detail pages |
| `/lore/[slug]` | ✅ | Lore pages |
| `/map` | ✅ | Interactive map with collapsible sidebar categories |
| `/monsters/[slug]` | ✅ | Monster entries |
| `/places/[slug]` | ✅ | Places/locations |
| `/sessions/[campaign]/[chapter]` | ✅ | Session recap pages with audio |
| `/browse` | ✅ | Browse all entities |
| `/search` | ✅ | Search |
| `Hyperbolic Time Chamber (/chamber)` | ❌ Reverted | Was a D&D session prep hub — reverted (reason unclear) |

### Audio
Guild chapter audio uses clean narration v2. Dynamic audio paths per campaign/chapter.

---

## Key Decisions (don't relitigate)
- **Thaveus as narrator** — all narration is from Thaveus's POV
- **"Certa vez"** — only for standalone stories, NOT for serial chapters
- **Don't add titles to already-known characters** — e.g. if they're known as "Mira", don't call them "Lady Mira"
- **Peter is VERY particular** about tone, timeline accuracy, and character representation. Check with him before writing lore.
- **Sanity CMS** — content lives in Sanity, not in code files

---

## Open / What's Next
- [x] Atrias Session Intake Pipeline — Ego review passed and 4 blocking UI issues fixed (2026-02-23)
- [x] Status badge translated to Portuguese in chapter list
- [x] Required field indicators added to /sessions/new form
- [x] Improved audio processing feedback message
- [x] "Capítulo" double prefix bug in chapter list fixed
- [x] Inconsistent section icon colors addressed (already amber-600)
- [ ] Hyperbolic Time Chamber was built then reverted — Peter needs to decide if it should come back and what it should do
- [ ] 176 entities in Sanity — unclear which are complete vs stubs
- [ ] No recent code activity — this is effectively paused (except for these recent UI fixes)
- [ ] Peter's D&D is Tuesdays 8 PM — natural time to ask "anything to add to the wiki from last session?"

---

## Running Locally
```bash
cd ~/projects/atrias-wiki
npm run dev
# Needs SANITY_* env vars — check .env.local
```

---

## Content Rules (Critical)
These exist because Peter caught errors before and was unhappy:
1. Never invent lore without Peter's sign-off
2. Timeline accuracy matters — check session order before writing recaps
3. Character voices must match how they've been played at the table
4. "Certa vez" (once upon a time) = standalone stories only
