#!/usr/bin/env node
/**
 * Match images from content-inbox/extracted to entities in Postgres.
 *
 * Usage:
 *   node scripts/match-images.mjs --dry-run
 *   node scripts/match-images.mjs --apply
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Client } from 'pg';

const PROJECT_ROOT = path.resolve(process.cwd());
const INBOX_DIR = path.join(PROJECT_ROOT, 'content-inbox', 'extracted');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DRY_RUN = !APPLY;

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

const TYPE_TO_FOLDER = {
  character: 'characters',
  place: 'places',
  item: 'items',
  faction: 'factions',
  lore: 'lore',
  monster: 'monsters',
};

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
}

function normalizeForMatch(s) {
  if (!s) return '';
  const out = stripDiacritics(String(s).toLowerCase())
    .replace(/&/g, ' and ')
    .replace(/['’`"´^~]/g, '')
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // keep spaces for tokenization
  return out;
}

function compactKey(s) {
  return normalizeForMatch(s)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '');
}

function slugKey(s) {
  return normalizeForMatch(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isProbablyGenerated(filenameBase) {
  const s = filenameBase.toLowerCase();
  if (s.startsWith('generated_image_')) return true;
  if (/^_[0-9a-f-]{20,}$/i.test(s)) return true;
  if (/^[0-9a-f]{24,}$/i.test(s)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true;
  if (/^img[_-]?\d+$/i.test(s)) return true;
  return false;
}

function bigrams(s) {
  const str = compactKey(s);
  const grams = [];
  for (let i = 0; i < str.length - 1; i++) grams.push(str.slice(i, i + 2));
  return grams;
}

function diceCoefficient(a, b) {
  const A = bigrams(a);
  const B = bigrams(b);
  if (!A.length || !B.length) return 0;
  const map = new Map();
  for (const g of A) map.set(g, (map.get(g) || 0) + 1);
  let matches = 0;
  for (const g of B) {
    const n = map.get(g) || 0;
    if (n > 0) {
      matches++;
      map.set(g, n - 1);
    }
  }
  return (2 * matches) / (A.length + B.length);
}

function extLower(p) {
  const e = path.extname(p).toLowerCase();
  return e === '.jpeg' ? '.jpg' : e;
}

function looksLikeMap(filePath) {
  const lc = filePath.toLowerCase();
  return lc.includes('/mapa') || lc.includes('mapas') || lc.includes('/maps') || lc.includes('cromomap') || lc.includes('map ');
}

async function walk(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const ent of entries) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (IMG_EXTS.has(ext)) out.push(p);
      }
    }
  }
  return out.sort();
}

function chooseBestMatch(fileBase, candidates) {
  // candidates: {id,name,slug,type}
  const nFile = normalizeForMatch(fileBase);
  const sFile = slugKey(fileBase);
  const cFile = compactKey(fileBase);

  let best = null;
  for (const e of candidates) {
    const name = e.name || '';
    const slug = e.slug || '';

    // exact-ish keys
    const scoreExact = (compactKey(name) === cFile || compactKey(slug) === cFile || slugKey(name) === sFile || slugKey(slug) === sFile) ? 1 : 0;
    const scoreDiceName = diceCoefficient(nFile, name);
    const scoreDiceSlug = diceCoefficient(nFile, slug);
    const score = Math.max(scoreExact, scoreDiceName * 0.9 + scoreDiceSlug * 0.1);

    if (!best || score > best.score) best = { entity: e, score, scoreExact, scoreDiceName, scoreDiceSlug };
  }
  return best;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function sha1(filePath) {
  const buf = await fs.readFile(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function main() {
  const images = await walk(INBOX_DIR);
  console.log(`Found ${images.length} images under ${path.relative(PROJECT_ROOT, INBOX_DIR)}`);

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const entitiesRes = await client.query('select id, type, slug, name, image, data from entities order by type, name');
  const entities = entitiesRes.rows;
  console.log(`Loaded ${entities.length} entities from DB`);

  const byType = new Map();
  for (const e of entities) {
    if (!byType.has(e.type)) byType.set(e.type, []);
    byType.get(e.type).push(e);
  }

  const matches = [];
  const unmatched = [];
  const ignored = [];

  // precompute: allow matching non-map images across all entity types
  const allEntities = entities;

  for (const imgPath of images) {
    const rel = path.relative(INBOX_DIR, imgPath);
    const base = path.basename(imgPath, path.extname(imgPath));

    if (isProbablyGenerated(base)) {
      ignored.push({ imgPath, rel, reason: 'looks-generated' });
      continue;
    }

    const isMap = looksLikeMap(imgPath);
    const candidatePool = isMap ? (byType.get('place') || []) : allEntities;
    const best = chooseBestMatch(base, candidatePool);

    // thresholds
    const threshold = best?.scoreExact === 1 ? 1 : (isMap ? 0.72 : 0.80);
    if (!best || best.score < threshold) {
      unmatched.push({ imgPath, rel, base, isMap, best: best ? { score: best.score, entity: { id: best.entity.id, type: best.entity.type, name: best.entity.name, slug: best.entity.slug } } : null });
      continue;
    }

    matches.push({ imgPath, rel, base, isMap, best });
  }

  // de-dupe: if multiple images match same entity, pick highest score; keep others as unmatched-collision
  const bestByEntity = new Map();
  const collisions = [];
  for (const m of matches) {
    const id = m.best.entity.id;
    const prev = bestByEntity.get(id);
    if (!prev || m.best.score > prev.best.score) {
      if (prev) collisions.push({ replacedBy: m, replaced: prev });
      bestByEntity.set(id, m);
    } else {
      collisions.push({ replacedBy: prev, replaced: m });
    }
  }

  const finalMatches = Array.from(bestByEntity.values());

  console.log(`Initial matches: ${matches.length}`);
  console.log(`Final matches (after de-dupe): ${finalMatches.length}`);
  console.log(`Collisions: ${collisions.length}`);
  console.log(`Ignored: ${ignored.length}`);
  console.log(`Unmatched: ${unmatched.length}`);

  // prepare filesystem + DB ops
  const ops = [];
  for (const m of finalMatches) {
    const e = m.best.entity;
    const ext = extLower(m.imgPath);

    if (m.isMap) {
      const destDir = path.join(IMAGES_DIR, 'maps');
      await ensureDir(destDir);
      const destName = `${e.slug}${ext}`;
      const destFsPath = path.join(destDir, destName);
      const publicUrl = `/images/maps/${destName}`;

      ops.push({ kind: 'map', entity: e, src: m.imgPath, destFsPath, publicUrl, rel: m.rel, score: m.best.score });
    } else {
      const folder = TYPE_TO_FOLDER[e.type];
      if (!folder) {
        unmatched.push({ imgPath: m.imgPath, rel: m.rel, base: m.base, isMap: m.isMap, reason: `unknown-type:${e.type}` });
        continue;
      }
      const destDir = path.join(IMAGES_DIR, folder);
      await ensureDir(destDir);
      const destName = `${e.slug}${ext}`;
      const destFsPath = path.join(destDir, destName);
      const publicUrl = `/images/${folder}/${destName}`;

      ops.push({ kind: 'image', entity: e, src: m.imgPath, destFsPath, publicUrl, rel: m.rel, score: m.best.score });
    }
  }

  // execute ops
  let copied = 0;
  let dbUpdated = 0;
  let mapUpdated = 0;
  const alreadyUpToDate = [];
  const errors = [];

  for (const op of ops) {
    try {
      // copy if missing or different
      let shouldCopy = true;
      try {
        const [srcHash, dstHash] = await Promise.all([sha1(op.src), sha1(op.destFsPath)]);
        if (srcHash === dstHash) shouldCopy = false;
      } catch {
        // dest doesn't exist
        shouldCopy = true;
      }

      if (DRY_RUN) {
        // no side effects
      } else {
        if (shouldCopy) {
          await fs.copyFile(op.src, op.destFsPath);
          copied++;
        }

        if (op.kind === 'image') {
          if (op.entity.image === op.publicUrl) {
            alreadyUpToDate.push({ id: op.entity.id, slug: op.entity.slug, kind: op.kind, url: op.publicUrl });
          } else {
            await client.query('update entities set image = $1 where id = $2', [op.publicUrl, op.entity.id]);
            dbUpdated++;
          }
        } else if (op.kind === 'map') {
          const data = op.entity.data && typeof op.entity.data === 'object' ? op.entity.data : {};
          if (data.map === op.publicUrl) {
            alreadyUpToDate.push({ id: op.entity.id, slug: op.entity.slug, kind: op.kind, url: op.publicUrl });
          } else {
            const newData = { ...data, map: op.publicUrl };
            await client.query('update entities set data = $1 where id = $2', [newData, op.entity.id]);
            mapUpdated++;
          }
        }
      }
    } catch (e) {
      errors.push({ op, error: String(e?.stack || e) });
    }
  }

  // output report file
  const report = {
    dryRun: DRY_RUN,
    foundImages: images.length,
    loadedEntities: entities.length,
    initialMatches: matches.length,
    finalMatches: finalMatches.length,
    collisions: collisions.length,
    ignored: ignored.length,
    unmatched: unmatched.length,
    ops: ops.map(o => ({ kind: o.kind, srcRel: path.relative(INBOX_DIR, o.src), entity: { id: o.entity.id, type: o.entity.type, slug: o.entity.slug, name: o.entity.name }, publicUrl: o.publicUrl, score: o.score })),
    ignoredList: ignored.map(i => ({ rel: i.rel, reason: i.reason })),
    unmatchedList: unmatched.slice(0, 500).map(u => ({ rel: u.rel, base: u.base, isMap: u.isMap, best: u.best || null, reason: u.reason || null })),
    collisionsSample: collisions.slice(0, 50).map(c => ({
      entity: { id: c.replacedBy.best.entity.id, name: c.replacedBy.best.entity.name, slug: c.replacedBy.best.entity.slug, type: c.replacedBy.best.entity.type },
      kept: { rel: c.replacedBy.rel, score: c.replacedBy.best.score },
      dropped: { rel: c.replaced.rel, score: c.replaced.best.score },
    })),
    applied: DRY_RUN ? null : { copied, dbUpdated, mapUpdated, alreadyUpToDate: alreadyUpToDate.length, errors: errors.length },
    errors: errors.slice(0, 50),
  };

  const reportPath = path.join(PROJECT_ROOT, 'import-output', `image-match-report-${Date.now()}${DRY_RUN ? '-dry' : ''}.json`);
  await ensureDir(path.dirname(reportPath));
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Report written to ${path.relative(PROJECT_ROOT, reportPath)}`);

  if (!DRY_RUN) {
    console.log(`Applied: copied=${copied}, imageFieldUpdated=${dbUpdated}, mapDataUpdated=${mapUpdated}, errors=${errors.length}`);
  } else {
    console.log('Dry run only (no files copied, no DB updates). Run with --apply to execute.');
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
