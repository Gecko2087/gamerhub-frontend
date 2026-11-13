import { useFavorites } from '../context/FavoritesContext';
import { useParams, Link, Navigate } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { toast } from 'react-toastify';
import { useProfile } from '../context/ProfileContext';

export default function Watchlist() {
  const { profileId } = useParams();
  const { selectedProfile } = useProfile();
  const { games, ready, error, retry, toggle } = useFavorites();

  if (profileId !== String(selectedProfile?._id)) {
    return <Navigate to={`/watchlist/${selectedProfile._id}`} replace />;
  }

  const remove = async game => {
    try {
      await toggle(game);
    } catch (err) {
      toast.error('No se pudo quitar el juego de favoritos.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to={`/catalog/${profileId}`} 
            className="text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Catálogo
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Mis favoritos</h1>
          <span className="text-slate-400" role="status">
            {ready && `${games.length} ${games.length === 1 ? 'juego' : 'juegos'}`}
          </span>
        </div>

        {error ? (
          <p role="alert" className="text-white">{error} <button onClick={retry} className="underline">Reintentar</button></p>
        ) : !ready ? (
          <div className="flex justify-center items-center h-64">
            <p role="status" className="text-white">Cargando favoritos…</p>
          </div>
        ) : (
          <>
            {games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {games.map((g) => (
                  <GameCard 
                    key={g._id || g.rawgId || g.id} 
                    game={g}
                    profileId={profileId}
                    allowedRating={selectedProfile?.allowedRating || 'M'} 
                    onToggleWatchlist={() => remove(g)}
                    isInWatchlist={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
                  <svg 
                    className="w-16 h-16 text-slate-600 mx-auto mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Todavía no tienes favoritos
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Explora el catálogo y guarda los juegos que quieras probar.
                  </p>
                  <Link 
                    to={`/catalog/${profileId}`}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Explorar Catálogo
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
