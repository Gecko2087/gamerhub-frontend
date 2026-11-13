const response = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
});
const fail = (message, status) => response({ message, error: message }, status);
const profileShape = row => ({ _id: row.id, name: row.name, allowedRating: row.rating });
const visitor = row => ({ id: row.id, _id: row.id, name: 'Visitante demo', role: 'user', demo: true, expiresAt: new Date(row.expires).toISOString() });
const hash = async token => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))), byte => byte.toString(16).padStart(2, '0')).join('');
const validGame = game => Number.isSafeInteger(game?.id) && game.id > 0 && typeof game.title === 'string';
function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
const gameShape = game => ({
  _id: String(game.id), name: game.title,
  backgroundImage: httpsUrl(game.thumbnail) || '/covers/fallback.svg',
  website: httpsUrl(game.game_url), description: game.short_description || '',
  releaseDate: game.release_date, ageRating: 'M',
  genres: game.genre ? [game.genre] : [], platforms: game.platform ? [game.platform] : [],
});

async function catalog(db) {
  const row = await db.prepare('SELECT payload, refreshed FROM catalog WHERE id=1').first();
  const now = Date.now();
  if (row && now - row.refreshed < 900_000) return JSON.parse(row.payload);
  try {
    const upstream = await fetch('https://www.freetogame.com/api/games', { redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) throw new Error('FreeToGame unavailable');
    const data = (await upstream.json()).filter(validGame);
    const payload = JSON.stringify(data);
    if (!data.length || new TextEncoder().encode(payload).length > 1_000_000) throw new Error('Invalid catalog');
    await db.prepare('INSERT OR REPLACE INTO catalog VALUES (1,?,?)').bind(payload, now).run();
    return data;
  } catch (error) {
    if (row) return JSON.parse(row.payload);
    throw error;
  }
}

async function body(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let size = 0;
  let value = '';
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 4096) { await reader.cancel(); return null; }
    value += decoder.decode(chunk.value, { stream: true });
  }
  try { return JSON.parse(value + decoder.decode()); } catch { return null; }
}

async function startDemo(db) {
  const now = Date.now();
  const day = Math.floor(now / 86_400_000);
  const budget = await db.prepare('INSERT INTO budget VALUES (?,1) ON CONFLICT(day) DO UPDATE SET used=used+1 WHERE used<120 RETURNING used').bind(day).first();
  if (!budget) return fail('La demo alcanzó su límite diario.', 429);
  const token = crypto.randomUUID() + crypto.randomUUID();
  const row = { id: crypto.randomUUID(), expires: now + 3_600_000 };
  await db.batch([
    db.prepare('INSERT INTO sessions (token_hash,id,expires) VALUES (?,?,?)').bind(await hash(token), row.id, row.expires),
    db.prepare("INSERT INTO profiles VALUES (?,?,?, 'ADULTS')").bind(crypto.randomUUID(), row.id, 'Mi perfil demo'),
  ]);
  return response({ token, user: visitor(row), expiresAt: visitor(row).expiresAt }, 201);
}

async function gamesRoute(db, url, key) {
  let games;
  try { games = await catalog(db); } catch { return fail('El catálogo no está disponible.', 503); }
  if (key !== 'public') {
    const game = games.find(item => String(item.id) === key);
    return game ? response(gameShape(game)) : fail('Juego no encontrado.', 404);
  }
  const query = url.searchParams;
  const search = (query.get('search') || '').slice(0, 100).toLowerCase();
  const genre = query.get('genre');
  const platform = query.get('platform');
  const page = Math.max(1, Number.parseInt(query.get('page'), 10) || 1);
  const size = Math.min(50, Math.max(1, Number.parseInt(query.get('pageSize'), 10) || 20));
  const matches = games.filter(game => game.title.toLowerCase().includes(search) &&
    (!genre || game.genre === genre) && (!platform || game.platform === platform));
  return response({ total: matches.length, games: matches.slice((page - 1) * size, page * size).map(gameShape), source: 'freetogame' });
}

async function profilesRoute(request, db, user, id, collection, gameId) {
  const method = request.method;
  if (!id && method === 'GET') {
    const rows = await db.prepare('SELECT * FROM profiles WHERE owner=? ORDER BY rowid').bind(user.id).all();
    return response(rows.results.map(profileShape));
  }
  const profile = id && await db.prepare('SELECT * FROM profiles WHERE id=? AND owner=?').bind(id, user.id).first();
  if (id && !profile) return fail('Perfil no encontrado.', 404);
  if (collection === 'watchlist') {
    if (method === 'DELETE' && gameId) {
      await db.prepare('DELETE FROM favorites WHERE profile=? AND game=?').bind(id, gameId).run();
      return response({ ok: true });
    }
    if (gameId) return fail('Ruta no disponible.', 404);
    let games;
    try { games = await catalog(db); } catch { return fail('El catálogo no está disponible.', 503); }
    if (method === 'GET') {
      const rows = await db.prepare('SELECT game FROM favorites WHERE profile=?').bind(id).all();
      const saved = new Set(rows.results.map(row => row.game));
      return response(games.filter(game => saved.has(String(game.id))).map(gameShape));
    }
    if (method === 'POST') {
      const payload = await body(request);
      const key = String(payload?.gameId ?? '');
      if (!games.some(game => String(game.id) === key)) return fail('Juego no encontrado.', 404);
      if (profile.rating === 'KIDS') return fail('Juego no disponible para este perfil.', 403);
      await db.prepare('INSERT OR IGNORE INTO favorites VALUES (?,?)').bind(id, key).run();
      return response({ ok: true });
    }
  }
  if (!collection && id && method === 'DELETE') {
    await db.prepare('DELETE FROM profiles WHERE id=? AND owner=?').bind(id, user.id).run();
    return response({ ok: true });
  }
  if (!collection && ((!id && method === 'POST') || (id && method === 'PUT'))) {
    const payload = await body(request);
    const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
    const rating = payload?.allowedRating;
    if (!name || name.length > 20 || !['ADULTS', 'KIDS'].includes(rating)) return fail('Revisa el nombre y la clasificación del perfil.', 400);
    const row = id
      ? await db.prepare('UPDATE OR IGNORE profiles SET name=?, rating=? WHERE id=? AND owner=? RETURNING *').bind(name, rating, id, user.id).first()
      : await db.prepare('INSERT OR IGNORE INTO profiles SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM profiles WHERE owner=?)<5 RETURNING *').bind(crypto.randomUUID(), user.id, name, rating, user.id).first();
    return row ? response(profileShape(row), id ? 200 : 201) : fail('Nombre repetido o límite de perfiles alcanzado.', 409);
  }
  return fail('Ruta no disponible.', 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const [, prefix, area, id, collection, gameId, ...extra] = url.pathname.split('/');
    if (prefix !== 'api' || extra.length) return fail('Ruta no disponible.', 404);
    const db = env.DB;
    try {
      if (request.method === 'GET' && area === 'health') {
        await db.prepare('SELECT id FROM sessions LIMIT 1').all();
        return response({ service: 'gamerhub', status: 'ok' });
      }
      if (request.method === 'POST' && area === 'auth' && id === 'demo' && !collection) {
        if (request.headers.get('Origin') !== url.origin) return fail('Origen no permitido.', 403);
        return await startDemo(db);
      }
      const token = request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9-]{72})$/)?.[1];
      if (!token) return fail('Inicia tu sesión demo.', 401);
      const user = await db.prepare('UPDATE sessions SET requests=requests+1 WHERE token_hash=? AND expires>? AND requests<250 RETURNING id, expires').bind(await hash(token), Date.now()).first();
      if (!user) return fail('Sesión vencida o límite de solicitudes alcanzado.', 401);
      if (area === 'auth' && id === 'me' && request.method === 'GET') return response(visitor(user));
      if (area === 'games' && id && !collection && request.method === 'GET') return await gamesRoute(db, url, id);
      if (area === 'profiles') return await profilesRoute(request, db, user, id, collection, gameId);
      return fail('Ruta no disponible.', 404);
    } catch {
      return fail('El servicio no está disponible.', 503);
    }
  },
  async scheduled(_event, env) {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires<=?').bind(now),
      env.DB.prepare('DELETE FROM budget WHERE day<?').bind(Math.floor(now / 86_400_000)),
    ]);
  },
};
