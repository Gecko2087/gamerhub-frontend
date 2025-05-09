import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GameCard from '../components/GameCard';
import { toast } from 'react-toastify';
import { useProfile } from '../context/ProfileContext';

export default function Watchlist() {
  const { profileId } = useParams();
  const { selectedProfile } = useProfile();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profileId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const { data: watchlistGames } = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${profileId}/watchlist`);
      
      // Eliminar console.log
      setGames(watchlistGames || []);
    } catch (err) {
      // Eliminar console.error
      setError('Error al cargar la watchlist');
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (gameId) => {
    try {
      const gameIdToUse = String(gameId);
      
      if (!gameIdToUse) {
        throw new Error('ID de juego inválido para eliminar');
      }

      setGames(prevGames => prevGames.filter(g => 
        String(g.id) !== gameIdToUse && 
        String(g.rawgId) !== gameIdToUse && 
        String(g._id) !== gameIdToUse
      ));
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/profiles/${profileId}/watchlist/${gameIdToUse}`);
      
      toast.error('Juego eliminado de la watchlist', {
        className: 'bg-red-100 border-red-400 text-red-700',
        progressClassName: 'bg-red-500'
      });
    } catch (err) {
      load();
      const errorMessage = err.response?.data?.error || 'Error al actualizar la watchlist';
      setError(errorMessage);
      toast.error(errorMessage);
      // Eliminar console.error
    }
  };

  // El resto del componente sigue igual
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
          <h1 className="text-3xl font-bold text-white">Mi Watchlist</h1>
          <span className="text-slate-400">
            {games.length} {games.length === 1 ? 'juego' : 'juegos'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            {games.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {games.map((g) => (
                  <GameCard 
                    key={g._id || g.rawgId || g.id} 
                    game={g}
                    profileId={profileId}
                    allowedRating={selectedProfile?.allowedRating || 'M'} 
                    onToggleWatchlist={() => remove(g.id || g.rawgId || g._id)} 
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
                    Watchlist vacía
                  </h3>
                  <p className="text-slate-400 mb-4">
                    No tienes juegos en tu watchlist. Explora el catálogo para agregar algunos.
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
