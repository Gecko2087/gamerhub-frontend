import { useFavorites } from '../context/FavoritesContext';
import { API_URL } from '../config/api.js';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
import { gameCover, coverFallback } from '../utils/gameCover';

export default function GameDetailsPage() {
  const { id } = useParams();
  const { selectedProfile } = useProfile();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { contains, toggle, ready, error: favoritesError, retry: retryFavorites } = useFavorites();
  const isInWatchlist = contains(id);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const catalog = `/catalog/${selectedProfile?._id || ''}`;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError(''); setNotice(''); setGame(null);
      try {
        const response = await axios.get(`${API_URL}/games/${id}`);
        if (!active) return;
        setGame(response.data);
      } catch {
        if (active) setError('No se pudieron cargar los detalles. Revisa la conexión y vuelve a intentarlo.');
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [id, selectedProfile?._id, retry]);

  async function toggleWatchlist() {
    if (!selectedProfile?._id || saving) return;
    setSaving(true); setNotice('');
    try {
      await toggle(game, id);
      setNotice(isInWatchlist ? 'Juego quitado de favoritos.' : 'Juego agregado a favoritos.');
    } catch { setNotice('No se pudo actualizar favoritos. Vuelve a intentarlo.'); }
    finally { setSaving(false); }
  }
  const names = values => (values || []).map(value => typeof value === 'string' ? value : value.platform?.name || value.name).filter(Boolean);

  return <section className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6">
    <Link to={catalog} className="inline-flex mb-6 py-2 font-semibold text-teal-800 dark:text-teal-200 hover:underline">← Volver al catálogo</Link>
    {loading ? <p role="status" className="py-16 text-center">Cargando detalles…</p>
      : error ? <div role="alert" className="rounded-xl bg-red-100 dark:bg-red-950 p-6 text-red-900 dark:text-red-100"><p>{error}</p><button className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div>
      : !game ? <p role="status">Juego no encontrado. Vuelve al catálogo para elegir otro título.</p>
      : <div className="grid gap-8 md:grid-cols-2 items-start">
        <img src={gameCover(game)} onError={coverFallback} alt={`Portada de ${game.name}`} width="800" height="450" className="w-full rounded-2xl aspect-video object-cover shadow-lg" />
        <div className="min-w-0">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-800 dark:text-teal-200">Descubre tu próxima aventura</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold break-words">{game.name}</h1>
          <div className="my-5 flex flex-wrap gap-2 text-sm">
            {names(game.platforms).map(name => <span key={name} className="rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1">{name}</span>)}
            {game.ageRating && <span className="rounded-full bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-indigo-950 dark:text-indigo-100">Clasificación: {game.ageRating}</span>}
          </div>
          <button onClick={toggleWatchlist} disabled={saving || !ready} aria-pressed={isInWatchlist} className="rounded-lg bg-teal-700 hover:bg-teal-800 px-5 py-3 text-white font-semibold disabled:opacity-60">{saving ? 'Actualizando favoritos…' : isInWatchlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}</button>
          <p role="status" aria-live="polite" className="mt-3 text-sm">{notice}</p>
          {favoritesError && <p role="alert">{favoritesError} <button onClick={retryFavorites} className="underline">Reintentar</button></p>}
          <section className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h2 className="text-xl font-bold">Acerca del juego</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700 dark:text-slate-200">{game.description || game.description_raw || 'Todavía no hay una descripción para este título.'}</p>
            {names(game.genres).length > 0 && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Géneros: {names(game.genres).join(', ')}</p>}
            {Number(game.rating) > 0 && <p className="mt-3 text-sm">Valoración del catálogo: {Number(game.rating).toFixed(1)} / 5</p>}
            {game.website && /^https?:\/\//i.test(game.website) && <a href={game.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-teal-800 dark:text-teal-200 underline">Sitio oficial (abre otra pestaña)</a>}
          </section>
        </div>
      </div>}
  </section>;
}
