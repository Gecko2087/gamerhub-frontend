import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StarIcon } from '@heroicons/react/24/solid';

const GameCard = ({ game, profileId, allowedRating, onToggleWatchlist, isInWatchlist, watchlistLoading }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Uso el ID que esté disponible para asegurar compatibilidad con la API
  const gameId = game._id || game.rawgId || game.id || null;

  // Verifico si el contenido es apto para niños según la clasificación ESRB
  const isAppropriateForKids = () => {
    // Busco la clasificación en cualquiera de sus posibles ubicaciones
    const ageRating = game.ageRating || 
                     (game.esrb_rating?.name ? game.esrb_rating.name : null) || 
                     game.esrbRating;
    
    if (!ageRating) {
      // Mejor prevenir - si no tiene clasificación, no lo muestro a niños
      return false;
    }
    
    // Normalizo el formato para poder comparar
    const normalizedRating = String(ageRating).toUpperCase();
    
    // Las clasificaciones seguras para perfiles infantiles
    return normalizedRating === 'E' || 
           normalizedRating === 'EVERYONE' || 
           normalizedRating === 'E10+' || 
           normalizedRating === 'EVERYONE 10+' ||
           normalizedRating === 'EC';
  };

  // Marco el juego como restringido si es perfil infantil y contenido no apto
  const isRestricted = allowedRating === 'KIDS' && !isAppropriateForKids();

  const handleToggleWatchlist = async (e) => {
    e.stopPropagation();
    const idToUse = game._id || game.rawgId || game.id;
    
    if (!profileId || !idToUse) {
      setError('No se pudo identificar el perfil o el juego.');
      return;
    }
    
    if (isRestricted) {
      setError('Este contenido está restringido para tu perfil.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onToggleWatchlist(idToUse);
    } catch (err) {
      setError('Error al actualizar la watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formateo las plataformas en un texto legible
  const getPlatformsString = (platforms) => {
    if (!platforms) return 'Multiplataforma';
    if (Array.isArray(platforms)) {
      // Manejo especial para la API de RAWG que usa una estructura anidada
      if (platforms.length > 0 && typeof platforms[0] === 'object') {
        return platforms.map(p => p.platform?.name || p.name).filter(Boolean).join(', ');
      }
      return platforms.join(', ');
    }
    return String(platforms);
  };

  // Creo un resumen corto para la tarjeta
  const resumen = game.description_raw
    ? game.description_raw.length > 120
      ? game.description_raw.slice(0, 120) + '...'
      : game.description_raw
    : (game.description && game.description.length > 120
        ? game.description.slice(0, 120) + '...'
        : game.description || 'Sin descripción.');

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] transition-transform border border-slate-300 dark:border-slate-700 group"
      onClick={() => navigate(`/games/${game._id}`)}
    >
      <div className={`block ${isRestricted ? 'pointer-events-none opacity-70 grayscale' : ''}`}>
        <div className="relative pb-[56.25%] overflow-hidden group">
          <img
            src={game.background_image || game.backgroundImage || '/placeholder-game.jpg'}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          {isRestricted && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transform -rotate-12">
                No disponible
              </div>
            </div>
          )}
          {!isRestricted && game.rating > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-lg">
              {game.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 transition-colors duration-500">
          {game.name}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 mb-3 text-sm line-clamp-2 flex-grow transition-colors duration-500">
          {resumen}
        </p>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres?.slice(0, 3).map((genre) => (
              <span
                key={typeof genre === 'string' ? genre : genre.id || genre.name}
                className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full transition-colors duration-500"
              >
                {typeof genre === 'string' ? genre : genre.name}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(game.releaseDate) || 'Sin fecha'}</span>
            </div>
            {!isRestricted && (
              <div className="flex items-center">
                <svg className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span>{getPlatformsString(game.platforms)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 transition-colors duration-500">
          <div className="flex items-center">
            {/* Etiqueta con el color según edad recomendada */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-500 ${
              game.ageRating === 'E' || game.ageRating === 'EC' ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
              : game.ageRating === 'E10+' ? 'bg-green-200 dark:bg-green-400/20 text-green-800 dark:text-green-600'
              : game.ageRating === 'T' ? 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400'
              : game.ageRating === 'M' || game.ageRating === 'AO' ? 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
            }`}>
              {game.ageRating || 'Sin rating'}
            </span>
          </div>

          {isRestricted ? (
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 transition-colors duration-500">
              No disponible para este perfil
            </span>
          ) : (
            <button
              onClick={handleToggleWatchlist}
              disabled={isLoading || watchlistLoading}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 bg-teal-100 dark:bg-teal-600/20 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-600/30"
            >
              {(isLoading || watchlistLoading) ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  {isInWatchlist ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Quitar
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Watchlist
                    </>
                  )}
                </span>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
