import { API_URL } from '../config/api.js';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GameCard from './GameCard';
import Pagination from './Pagination';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-toastify';

const GameCatalog = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Para filtrado completo en perfiles infantiles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(20); // Tamaño de página fijo
  const { profileId } = useParams();
  const { selectedProfile } = useProfile();
  const prevProfileId = useRef(profileId);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState({});
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loadingAllGames, setLoadingAllGames] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState('');

  // Limpia al cambiar de perfil
  useEffect(() => {
    if (prevProfileId.current !== profileId) {
      setGames([]);
      setAllGames([]);
      setError(null);
      setLoading(true);
      setCurrentPage(1);
      prevProfileId.current = profileId;
    }
  }, [profileId]);

  // Cargar la watchlist del perfil al montar o cambiar de perfil
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!selectedProfile?._id && !profileId) return;
      try {
        const currentProfileId = selectedProfile?._id || profileId;
        const { data: watchlistData } = await axios.get(`${API_URL}/profiles/${currentProfileId}/watchlist`);
        setWatchlist(watchlistData.map(g => g._id || g.rawgId || g.id).filter(Boolean));
      } catch (err) {
        setWatchlist([]);
        setWatchlistStatus('No se pudieron cargar los favoritos. El catálogo sigue disponible.');
      }
    };
    fetchWatchlist();
  }, [selectedProfile?._id, profileId]);

  // Verifica si un juego es apropiado según su clasificación ESRB
  const isGameAppropriateForKids = (game) => {
    const ageRating = game.ageRating || (game.esrb_rating?.name ? game.esrb_rating.name : null);
    
    if (!ageRating) {
      // Por precaución, si no tiene clasificación no lo mostramos a niños
      return false;
    }
    
    const normalizedRating = String(ageRating).toUpperCase();
    
    // Clasificaciones seguras para niños
    return normalizedRating === 'E' || 
           normalizedRating === 'EVERYONE' || 
           normalizedRating === 'E10+' || 
           normalizedRating === 'EVERYONE 10+' ||
           normalizedRating === 'EC';
  };

  // Carga la colección completa de juegos para perfiles infantiles
  const loadAllGamesForKidsProfile = async () => {
    if (selectedProfile?.allowedRating !== 'KIDS') return;
    
    try {
      setLoadingAllGames(true);
      let allFetchedGames = [];
      let currentFetchPage = 1;
      let hasMorePages = true;
      
      // Recorremos todas las páginas disponibles
      while (hasMorePages) {
        const response = await axios.get(`${API_URL}/games/public`, {
          params: {
            page: currentFetchPage,
            pageSize: 50, // Mayor tamaño para reducir peticiones
            search,
            genre,
            platform
          }
        });
        
        const gamesFromPage = response.data.games || [];
        allFetchedGames = [...allFetchedGames, ...gamesFromPage];
        
        // Verificar si hay más páginas que cargar
        const totalPagesFromServer = Math.ceil((response.data.total || 0) / 50);
        hasMorePages = currentFetchPage < totalPagesFromServer;
        currentFetchPage++;
        
        // Limitamos a 200 juegos para evitar problemas de rendimiento
        if (allFetchedGames.length > 200) {
          hasMorePages = false;
        }
      }
      
      setAllGames(allFetchedGames);
    } catch (error) {
      setError('Error al cargar todos los juegos para el filtrado');
    } finally {
      setLoadingAllGames(false);
    }
  };

  // Extraer géneros y plataformas únicos para los filtros
  const genresList = Array.from(new Set(games.flatMap(g => g.genres || []))).sort();
  const platformsList = Array.from(new Set(games.flatMap(g => g.platforms || []))).sort();

  // Carga los juegos con los filtros aplicados
  const fetchGames = async (page = 1, searchValue = search, genreValue = genre, platformValue = platform) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/games/public`, {
        params: {
          page,
          pageSize: 20,
          search: searchValue,
          genre: genreValue,
          platform: platformValue
        }
      });
      setGames(response.data.games || []);
      setTotalGames(response.data.total || 0);
      setCurrentPage(page);
      
      // Si es perfil infantil, cargar todos los juegos para filtrado local
      if (selectedProfile?.allowedRating === 'KIDS' && allGames.length === 0) {
        loadAllGamesForKidsProfile();
      }
    } catch (err) {
      setError(err.response
        ? 'La API no pudo cargar el catálogo. Intenta nuevamente.'
        : 'No se pudo conectar con la API de GamerHub. El catálogo necesita el backend disponible.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar juegos al cambiar filtros o página
  useEffect(() => {
    fetchGames(currentPage, search, genre, platform);
    // eslint-disable-next-line
  }, [profileId, currentPage, search, genre, platform]);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      
      // Limpiar juegos cargados para perfil infantil al cambiar la búsqueda
      if (selectedProfile?.allowedRating === 'KIDS') {
        setAllGames([]);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, selectedProfile?.allowedRating]);

  // Limpiar juegos cargados al cambiar los filtros
  useEffect(() => {
    if (selectedProfile?.allowedRating === 'KIDS') {
      setAllGames([]);
    }
  }, [genre, platform, selectedProfile?.allowedRating]);

  // Maneja la navegación entre páginas
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filtra juegos según el tipo de perfil
  const filteredGames = useMemo(() => {
    // Perfil adulto: usar juegos sin filtro adicional
    if (selectedProfile?.allowedRating !== 'KIDS') {
      return Array.isArray(games) ? games : [];
    }
    
    // Perfil infantil: filtrar por clasificación de edad
    const kidsAppropriateGames = allGames.length > 0 
      ? allGames.filter(isGameAppropriateForKids)
      : (Array.isArray(games) ? games.filter(isGameAppropriateForKids) : []);
    
    // Eliminar duplicados por ID
    const uniqueGames = [];
    const seenIds = new Set();
    
    kidsAppropriateGames.forEach(game => {
      const gameId = game._id || game.id || game.rawgId;
      if (gameId && !seenIds.has(String(gameId))) {
        seenIds.add(String(gameId));
        uniqueGames.push(game);
      }
    });
    
    // Actualizar el total de juegos filtrados para la paginación
    const totalFilteredGames = uniqueGames.length;
    setTotalGames(totalFilteredGames);
    
    // Ajustar la página actual si es necesario
    const totalPages = Math.ceil(totalFilteredGames / gamesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    
    // Aplicar paginación local si tenemos todos los juegos cargados
    if (allGames.length > 0) {
      const startIndex = (currentPage - 1) * gamesPerPage;
      return uniqueGames.slice(startIndex, startIndex + gamesPerPage);
    }
    
    return uniqueGames;
  }, [games, allGames, selectedProfile?.allowedRating, currentPage, gamesPerPage]);

  // Calcular el total de páginas para la paginación
  const totalPages = useMemo(() => {
    return Math.ceil(totalGames / gamesPerPage);
  }, [totalGames, gamesPerPage]);

  // Maneja agregar o quitar juegos de la watchlist
  const toggleWatchlist = async (gameId) => {
    const currentProfileId = selectedProfile?._id || profileId;
    setLoadingWatchlist(prev => ({ ...prev, [gameId]: true }));
    try {
      const isInWatchlist = watchlist.some(id => String(id) === String(gameId));
      if (isInWatchlist) {
        await axios.delete(`${API_URL}/profiles/${currentProfileId}/watchlist/${gameId}`);
        setWatchlistStatus('Juego quitado de favoritos.');
        toast.info('Juego eliminado de la watchlist', {
          position: "bottom-right",
          autoClose: 2000,
          style: { background: '#dc2626', color: '#fff' }
        });
      } else {
        await axios.post(`${API_URL}/profiles/${currentProfileId}/watchlist`, { gameId });
        setWatchlistStatus('Juego agregado a favoritos.');
        toast.success('Juego agregado a la watchlist', {
          position: "bottom-right",
          autoClose: 2000
        });
      }
      // Actualizar watchlist tras la operación
      const { data: updatedWatchlistData } = await axios.get(`${API_URL}/profiles/${currentProfileId}/watchlist`);
      setWatchlist(updatedWatchlistData.map(g => g._id || g.rawgId || g.id).filter(Boolean));
      setLoadingWatchlist(prev => ({ ...prev, [gameId]: false }));
      return true;
    } catch (err) {
      let errorMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      if (errorMsg && errorMsg.toLowerCase().includes('ya está en la lista')) {
        errorMsg = 'El juego ya se encuentra en la watchlist.';
      }
      toast.error(`Error: ${errorMsg}`, {
        position: "bottom-right",
        autoClose: 3000
      });
      setWatchlistStatus(`No se pudo actualizar favoritos: ${errorMsg}`);
      
      try {
        const { data: updatedWatchlistDataOnError } = await axios.get(`${API_URL}/profiles/${currentProfileId}/watchlist`);
        setWatchlist(updatedWatchlistDataOnError.map(g => g._id || g.rawgId || g.id).filter(Boolean));
      } catch (e) {
        setWatchlist([]);
      }
      setLoadingWatchlist(prev => ({ ...prev, [gameId]: false }));
      throw err;
    }
  };

  if (loading && !loadingAllGames) {
    return (
      <div className="flex flex-col justify-center items-center h-64" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" aria-hidden="true"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-300">Cargando catálogo…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="mx-auto my-12 max-w-xl text-center p-6 text-red-800 bg-red-100 rounded-lg">
        <p>{error}</p>
        <button type="button" onClick={() => fetchGames(1, search, genre, platform)} className="mt-4 rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtros y búsqueda */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Catálogo de juegos</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Busca un título y guárdalo en los favoritos del perfil seleccionado.</p>
      </header>
      <div className="flex flex-wrap gap-4 mb-3 items-end" role="search" aria-label="Buscar y filtrar juegos">
        <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Buscar por nombre
          <input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Ejemplo: Zelda"
            autoComplete="off"
            aria-describedby="catalog-status"
            className="p-2 rounded border dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Género
          <select
            value={genre}
            onChange={e => { setGenre(e.target.value); setCurrentPage(1); }}
            className="p-2 rounded border dark:bg-slate-900 dark:text-white"
          >
            <option value="">Todos los géneros</option>
            {genresList.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Plataforma
          <select
            value={platform}
            onChange={e => { setPlatform(e.target.value); setCurrentPage(1); }}
            className="p-2 rounded border dark:bg-slate-900 dark:text-white"
          >
            <option value="">Todas las plataformas</option>
            {platformsList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        
        {selectedProfile?.allowedRating === 'KIDS' && (
          <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm ml-auto">
            Mostrando contenido apto para niños
          </div>
        )}
      </div>
      <p id="catalog-status" className="mb-6 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        {searchInput !== search ? 'Actualizando búsqueda…' : `${filteredGames.length} ${filteredGames.length === 1 ? 'juego visible' : 'juegos visibles'}.`}
      </p>
      {watchlistStatus && <p className="sr-only" role="status" aria-live="polite">{watchlistStatus}</p>}
      
      {loadingAllGames && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4 flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando todos los juegos para perfil infantil...
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGames.map((game, index) => (
          <GameCard
            key={`${game._id || game.id || game.rawgId || 'game'}-${index}`}
            game={game}
            profileId={selectedProfile?._id || profileId}
            allowedRating={selectedProfile?.allowedRating || 'ADULTS'}
            onToggleWatchlist={toggleWatchlist}
            isInWatchlist={watchlist.some(id => String(id) === String(game._id))}
            watchlistLoading={!!loadingWatchlist[game._id]}
          />
        ))}
      </div>
      
      {filteredGames.length === 0 && !loading && !loadingAllGames && (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No encontramos juegos</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Prueba otro nombre o limpia los filtros actuales.</p>
          {selectedProfile?.allowedRating === 'KIDS' && (
            <p className="text-gray-500 dark:text-gray-500">
              Recuerda que para perfiles infantiles solo se muestran juegos con clasificación por edad apropiada.
            </p>
          )}
          {(searchInput || genre || platform) && (
            <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setGenre(''); setPlatform(''); setCurrentPage(1); }} className="mt-4 rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300">
              Limpiar filtros
            </button>
          )}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default GameCatalog;
