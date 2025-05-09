import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AgeGate from '../components/AgeGate';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-toastify';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const GameDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { selectedProfile } = useProfile();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();
  const gameRef = useRef(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/games/${id}`);
        setGame(response.data);
        // Solo consultar la watchlist si hay perfil seleccionado
        if (selectedProfile?._id) {
          const watchlistResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist`);
          const gameInWatchlist = watchlistResponse.data.some(gameInList => 
            String(gameInList.id) === String(id) || String(gameInList.rawgId) === String(id) || String(gameInList._id) === String(id)
          );
          setIsInWatchlist(gameInWatchlist);
        } else {
          setIsInWatchlist(false);
        }
      } catch (err) {
        setError('Error al cargar los detalles del juego');
      } finally {
        setLoading(false);
      }
    };
    // Ejecutar siempre que cambie el id
    if (id) {
      fetchGameDetails();
    }
  }, [id, selectedProfile]);

  const toggleWatchlist = async () => {
    if (!selectedProfile?._id) {
      toast.error('Por favor, selecciona un perfil primero');
      return;
    }
    const gameIdForApi = id;
    try {
      if (isInWatchlist) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist/${gameIdForApi}`);
        toast.error('Juego eliminado de la watchlist', { position: 'bottom-right', autoClose: 2000, style: { background: '#dc2626', color: '#fff' } });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist`, { gameId: gameIdForApi });
        toast.success('Juego agregado a la watchlist', { position: 'bottom-right', autoClose: 2000 });
      }
      const watchlistResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist`);
      const gameInWatchlist = watchlistResponse.data.some(gameInList => 
        String(gameInList.id) === String(id) || String(gameInList.rawgId) === String(id) || String(gameInList._id) === String(id)
      );
      setIsInWatchlist(gameInWatchlist);
    } catch (err) {
      toast.error('Error al actualizar la watchlist');
    }
  };

  const updateRating = async (newRating) => {
    if (!selectedProfile?._id) {
      toast.error('Por favor, selecciona un perfil primero');
      return;
    }
    const gameIdForApi = id;

    try {
      // Implementación pendiente de la funcionalidad de ratings
      toast.info('La calificación de juegos estará disponible próximamente');
    } catch (err) {
      toast.error('Error al actualizar la calificación');
    }
  };

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => updateRating(i)}
          className={`w-8 h-8 cursor-pointer hover:text-yellow-400 transition-colors ${
            i <= rating ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          {i <= rating ? <StarIconSolid /> : <StarIcon />}
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Juego no encontrado
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center transition-colors duration-500">
      <div className="absolute inset-0 z-10 bg-black/70 dark:bg-black/80 transition-colors duration-500" />
      <div className="relative z-20 w-full max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
        <button
          onClick={() => navigate('/catalog/' + (selectedProfile?._id || ''))}
          className="mb-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg self-start transition-colors"
        >
          ← Volver al Catálogo
        </button>
        <div className="w-full md:w-96 flex flex-col gap-4 items-center">
          <img
            src={game.backgroundImage || game.background_image || '/placeholder-game.jpg'}
            alt={game.name}
            className="w-full rounded-lg shadow-lg object-cover aspect-video"
          />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700 dark:text-gray-200 opacity-80 transition-colors duration-500">
              {game.releaseDate && (
                <span className="bg-gray-200 dark:bg-gray-900/60 px-2 py-1 rounded transition-colors duration-500">{new Date(game.releaseDate).toLocaleDateString()}</span>
              )}
              {game.platforms && game.platforms.map(p => (
                <span key={p} className="bg-gray-200 dark:bg-gray-900/60 px-2 py-1 rounded transition-colors duration-500">{p}</span>
              ))}
              {game.rating && (
                <span className="bg-gray-200 dark:bg-gray-900/60 px-2 py-1 rounded transition-colors duration-500">⭐ {game.rating}</span>
              )}
              {game.metacritic && (
                <span className="bg-green-200 dark:bg-green-700/80 px-2 py-1 rounded transition-colors duration-500">Metacritic: {game.metacritic}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg mb-2 transition-colors duration-500">{game.name}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={toggleWatchlist}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg border border-indigo-500/30
                  ${isInWatchlist ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white/80 hover:bg-white text-indigo-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-indigo-200'}`}
              >
                {isInWatchlist ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v12a1 1 0 001.447.894L10 16.118l5.553 1.776A1 1 0 0017 17V5a2 2 0 00-2-2H5z" /></svg>
                    En Watchlist
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Añadir a Watchlist
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-green-700 dark:text-green-400 font-bold text-lg transition-colors duration-500">{game.rating >= 4 ? 'Excepcional' : game.rating >= 3 ? 'Recomendado' : 'Normal'}</span>
              <span className="text-gray-700 dark:text-gray-300 transition-colors duration-500">{game.genres && game.genres.join(', ')}</span>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-black/60 rounded-lg p-6 mt-4 shadow-lg transition-colors duration-500">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-500">Descripción</h2>
            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line transition-colors duration-500">{game.description}</p>
            {game.website && (
              <a href={game.website} target="_blank" rel="noopener noreferrer" className="block mt-4 text-teal-600 dark:text-teal-400 hover:underline transition-colors duration-500">Sitio oficial →</a>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {game.genres && game.genres.map((genre) => (
              <span key={genre} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm transition-colors duration-500">{genre}</span>
            ))}
            {game.ageRating && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm transition-colors duration-500">{game.ageRating}+</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;