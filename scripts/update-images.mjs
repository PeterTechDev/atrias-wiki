import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' 
});

async function run() {
  // Map updates for places
  const mapUpdates = [
    ['atrias', '/images/maps/world-map.jpg'],
    ['skeld', '/images/maps/skeld.jpg'],
    ['humma', '/images/maps/humma.png'],
    ['arena', '/images/maps/arena-paragon.jpg'],
    ['vigilia-de-akos', '/images/maps/akos.jpg'],
    ['norbria', '/images/maps/norbria.jpg'],
    ['pedraluna', '/images/maps/pedraluna.jpg'],
    ['sol-manso', '/images/maps/sol-manso.jpg'],
  ];

  for (const [slug, mapUrl] of mapUpdates) {
    const existing = await pool.query('SELECT data FROM entities WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      const data = { ...(existing.rows[0].data || {}), map: mapUrl };
      const r = await pool.query('UPDATE entities SET data = $1 WHERE slug = $2 RETURNING name', [JSON.stringify(data), slug]);
      if (r.rowCount > 0) console.log('Map set:', r.rows[0].name, '->', mapUrl);
    } else {
      console.log('No match for slug:', slug);
    }
  }

  // Image updates for entities
  const imageUpdates = [
    ['atrias', '/images/maps/world-map-hires.jpg'],
    ['akos', '/images/characters/akos.jpg'],
  ];

  for (const [slug, imgUrl] of imageUpdates) {
    const r = await pool.query('UPDATE entities SET image = $1 WHERE slug = $2 RETURNING name', [imgUrl, slug]);
    if (r.rowCount > 0) console.log('Image set:', r.rows[0].name, '->', imgUrl);
  }

  // Stats
  const totals = await pool.query('SELECT count(*) as total, count(image) as with_img FROM entities');
  console.log('\nEntities:', totals.rows[0].total, '| With images:', totals.rows[0].with_img);
  
  await pool.end();
}

run().catch(e => { console.error(e); pool.end(); });
