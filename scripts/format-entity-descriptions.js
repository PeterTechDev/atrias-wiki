#!/usr/bin/env node

/**
 * Fix paragraph formatting in entities.description.
 *
 * Criteria:
 * - description length > 500 chars
 * - contains NO paragraph breaks ("\n\n")
 * - exclude slug === 'thaveus'
 *
 * Strategy:
 * - Split into sentences
 * - Group 2–3 sentences per paragraph (merge last single sentence into previous)
 * - Join paragraphs with "\n\n"
 */

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

function splitIntoSentences(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return [];

  // Split on whitespace after a sentence-ending punctuation.
  // Heuristic: next token starts with an uppercase (including accented) or a quote.
  const parts = t.split(/(?<=[.!?])\s+(?=(?:(?:"|“|”|'|‘|’|\(|\[))?[A-ZÀ-ÖØ-Þ])/u);
  return parts.map(s => s.trim()).filter(Boolean);
}

function groupSentences(sentences) {
  const paragraphs = [];
  for (let i = 0; i < sentences.length; ) {
    // Default: 3 per paragraph; if nearing the end, do 2.
    const remaining = sentences.length - i;
    let take = 3;
    if (remaining === 4) take = 2; // 2 + 2
    else if (remaining === 3 && i === 0) take = 2; // 2 + 1 (better than one huge block)
    else if (remaining === 2) take = 2;
    else if (remaining === 1) take = 1;

    paragraphs.push(sentences.slice(i, i + take).join(' '));
    i += take;
  }

  return paragraphs;
}

function formatDescription(original) {
  const sentences = splitIntoSentences(original);
  // Only skip ultra-short descriptions.
  if (sentences.length <= 1) return original.trim();
  const paragraphs = groupSentences(sentences);
  return paragraphs.join('\n\n').trim();
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const selectSql = `
    SELECT id, slug, description
    FROM entities
    WHERE slug <> 'thaveus'
      AND description IS NOT NULL
      AND length(description) > 500
      AND position(E'\n\n' in description) = 0
    ORDER BY slug ASC
  `;

  const { rows } = await client.query(selectSql);
  console.log(`Found ${rows.length} candidate entities to reflow.`);

  let updated = 0;
  const changedSlugs = [];

  await client.query('BEGIN');
  try {
    for (const r of rows) {
      const before = (r.description ?? '').trim();
      const after = formatDescription(before);

      // Only update when we actually introduce paragraph breaks.
      if (after !== before && after.includes('\n\n')) {
        await client.query(
          'UPDATE entities SET description = $1 WHERE id = $2',
          [after, r.id]
        );
        updated++;
        changedSlugs.push(r.slug);
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }

  console.log(`Updated ${updated} entity descriptions.`);
  if (changedSlugs.length) {
    console.log('Changed slugs:');
    for (const s of changedSlugs) console.log(`- ${s}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
