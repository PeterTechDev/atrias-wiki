---
target: homepage
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\page.tsx"
target_fingerprint: "sha256:09f7c2774a5128960fd805c1ce3cf06278969671591baaa2bc011f4f9edebcb3"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\page.tsx"
timestamp: 2026-09-11T03-37-12Z
slug: src-app-page-tsx
closed: true
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review)

The homepage establishes a convincing fantasy atmosphere, but its usefulness and attention to the actual world of Átrias fall off below the hero. The best next pass should preserve the illustrated archive and make the content feel equally intentional.

Reviewed as a reading/reference surface: desktop and 390×844 mobile, including search shortcut, no-results guidance, and Escape/focus restoration. Scores are design judgments, not an accessibility certification.

| Heuristic | Score | Finding |
|---|---:|---|
| Visibility of system status | 3/4 | Search/account feedback exists; “recent” misstates the selection. |
| Match with the real world | 2/4 | Familiar RPG categories, but misleading chronology and mixed-language labels. |
| User control and freedom | 3/4 | Search dismisses correctly and restores focus. |
| Consistency and standards | 1/4 | Similar-looking cards have different click behavior. |
| Error prevention | 2/4 | Search guidance helps; misleading affordances remain. |
| Recognition rather than recall | 3/4 | Labeled categories and search suggestions work. |
| Flexibility and efficiency | 3/4 | Working keyboard search; browsing starts below a full-screen entrance. |
| Aesthetic and minimalist design | 2/4 | Strong hero; sparse feature layout and generic statistics weaken it. |
| Error recovery | 3/4 | Useful no-result guidance; retry exists in source. Homepage failure not exercised. |
| Help and documentation | 1/4 | Little orientation for newcomers or contributors. |
| **Total** | **23/40** | **Acceptable — significant improvements needed.** |

**Design specificity and strengths**

The library illustration, ornamented lettering, navy and gold make a coherent fantasy archive. The gold primary action reads clearly, mobile buttons stack without clipping, and global search has useful keyboard behavior. Those are worth preserving.

The page is more specific to fantasy as a genre than to Átrias itself. The repeated card sections could belong to another setting, and the Earth-map image actively contradicts this one.

**Priority issues**

1. **P1 — Faction cards promise interaction and deliver none.** They have hover styling but no detail links, unlike the character cards. Both also display the literal text `\u2694\uFE0F`, crowding the content and breaking immersion. Make each card link to its faction and render a real icon. Suggested command: `$impeccable harden`.

2. **P1 — The featured-region section looks unfinished with real data.** Solária occupies just one column of a three-column cream section, leaving two-thirds empty. Its Earth-map image misrepresents the setting, and the full description makes the card unnecessarily tall. Use an appropriate existing Átrias asset, a short excerpt, and a layout that deliberately accommodates one place. Suggested command: `$impeccable layout`.

3. **P2 — Editorial labels overpromise.** “Crônicas Recentes” shows the first three characters alphabetically, not recent activity. The page also hardcodes seven continents and fifteen documents and claims AI extraction guarantees fidelity; PRODUCT.md does not verify those claims. Rename the section to “Personagens em destaque” or use actual chronology, and publish only supported statistics and provenance. Suggested command: `$impeccable clarify`.

4. **P2 — The entrance delays the wiki.** The full-height hero sits beneath the header, pushing every category and named entry beyond the first viewport. That costs returning players time, although global search provides a good shortcut. Shorten the entrance enough to reveal useful navigation or an authentic world entry. Suggested command: `$impeccable distill`.

5. **P2 — Functional text fades into the background.** The faction heading, subtitle and “Ver todas” link use subdued amber on navy; category counts are similarly dim. On mobile the faction section link wraps awkwardly beside the heading. Brighten functional text using existing tokens and stack the mobile heading/link. Contrast needs measurement before making a compliance claim. Suggested command: `$impeccable polish`.

**Cognitive load and emotional journey**

Moderate load: two of eight checklist items fail—chunking and number of choices—at the eight-category navigation. Focus, grouping, hierarchy, sequential decisions, recognition and progressive disclosure broadly pass. Because this is a wiki index, eight categories are not inherently a reason to hide navigation; grouping world content and campaign records would be more useful.

The illustrated entrance is the emotional peak. The generic Earth map and empty feature space create the first dip; actual character names restore interest, then broken faction presentation interrupts it again. The ending focuses on claims and statistics rather than a compelling next step into the world.

**Persona red flags**

- Returning player: keyboard search works; choosing a faction directly does not.
- New visitor: “recent chronicles” suggests story updates but leads to character biographies.
- Low-vision/keyboard reader: dim functional text and inert cards impede navigation; search focus behavior is a strength.

**Minor observations and detector evidence**

Restore Portuguese diacritics and consistent labels; replace generic “Ler Mais” with destination-specific wording where useful. “Contribuir” and “Studio” both point to `/studio`, for which no route or configured redirect was found; verify and correct that destination. Exact totals do not need a trailing `+`.

The detector returned two findings in `src/app/page.tsx`: one `bounce-easing` warning at line 90 and one `design-system-color` advisory at line 56. The bouncing arrow deserves a reduced-motion check. The black subtitle shadow is a documentation advisory, not a meaningful visual palette problem. Neither finding explains the larger layout and navigation issues; independent browser evidence confirmed the faction defects.

**Questions to consider**

What should the homepage prioritize for returning players? Which authentic Átrias content should replace the generic region presentation?
