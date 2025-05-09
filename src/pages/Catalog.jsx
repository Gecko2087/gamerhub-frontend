import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import GameCard from '../components/GameCard';
import { toast } from 'react-toastify';

/**
 * Comprueba si un juego es adecuado para perfiles infantiles según su clasificación
 * @param {Object} juego - El juego a evaluar
 * @param {Object} perfil - El perfil del usuario
 * @returns {boolean} - Devuelve true si es apropiado para el perfil
 */
function esJuegoApto(juego, perfil) {
  // Si el perfil es para adultos, permitir todo
  if (perfil.allowedRating !== 'KIDS') {
    return true;
  }
  
  // Para perfiles infantiles, verificar clasificación ESRB
  const ageRating = juego.ageRating || 
                   (juego.esrb_rating?.name ? juego.esrb_rating.name : null) || 
                   juego.esrbRating;
  
  if (!ageRating) {
    // Si no hay clasificación, ser conservadores y no mostrarlo a niños
    return false;
  }
  
  // Normalizar la clasificación para comparación
  const normalizedRating = String(ageRating).toUpperCase();
  
  // Solo mostrar juegos con clasificación E (Everyone) o E10+ (Everyone 10+)
  const isAppropriate = normalizedRating === 'E' || 
                      normalizedRating === 'EVERYONE' || 
                      normalizedRating === 'E10+' || 
                      normalizedRating === 'EVERYONE 10+' ||
                      normalizedRating === 'EC';
  
  return isAppropriate;
}

export default function Catalog() {
  const { profileId } = useParams();
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Almacena todos los juegos para filtrado local
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAllGames, setIsLoadingAllGames] = useState(false);
  const [error, setError] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(8);

  const loadProfileAndWatchlist = useCallback(async () => {
    try {
      const { data: profileData } = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${profileId}`); 
      setProfile(profileData); 
      
      if (profileData) {
        const { data: watchlistGames } = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${profileId}/watchlist`);
        setWatchlist(watchlistGames.map(g => g.id || g.rawgId || g._id) || []);
      }
    } catch (err) {
      setError('No se pudo cargar el perfil o la watchlist');
    }
  }, [profileId]);

  // Función para cargar todos los juegos cuando estamos en perfil infantil
  const loadAllGamesForKidsProfile = useCallback(async () => {
    if (!profile || profile.allowedRating !== 'KIDS') return;
    
    try {
      setIsLoadingAllGames(true);
      let allFetchedGames = [];
      let currentFetchPage = 1;
      let hasMorePages = true;
      
      // Cargar juegos de todas las páginas
      while (hasMorePages) {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/games/popular`, {
          params: {
            page: currentFetchPage,
            pageSize: 50 // Cargar más juegos por página para reducir el número de llamadas
          }
        });
        
        const gamesFromPage = Array.isArray(data) ? data : (data.results || []);
        
        // Eliminar duplicados antes de agregar al array
        const uniqueGames = [];
        const seenIds = new Set();
        
        gamesFromPage.forEach(game => {
          const gameId = game._id || game.rawgId || game.id;
          if (gameId && !seenIds.has(String(gameId))) {
            seenIds.add(String(gameId));
            uniqueGames.push(game);
          }
        });
        
        allFetchedGames = [...allFetchedGames, ...uniqueGames];
        
        // Verificar si hay más páginas para cargar
        hasMorePages = gamesFromPage.length >= 50;
        currentFetchPage++;
        
        // Limitar a 200 juegos para no sobrecargar la memoria
        if (allFetchedGames.length > 200) {
          hasMorePages = false;
        }
      }
      
      setAllGames(allFetchedGames);
      setCurrentPage(1); // Reiniciar a primera página
    } catch (error) {
      setError('Error al cargar la colección completa de juegos');
    } finally {
      setIsLoadingAllGames(false);
    }
  }, [profile]);

  // Cargar juegos por defecto al entrar
  const loadAllGames = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/games/popular`);
      const gamesArray = Array.isArray(data) ? data : (data.results || []);
      
      // Eliminar duplicados basados en rawgId o _id
      const uniqueGames = [];
      const gameIds = new Set();
      
      gamesArray.forEach(game => {
        const gameId = game._id || game.rawgId || game.id;
        if (gameId && !gameIds.has(String(gameId))) {
          gameIds.add(String(gameId));
          uniqueGames.push(game);
        }
      });
      
      setGames(uniqueGames);
    } catch (err) {
      setError('Error al cargar los juegos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto para cargar perfil, watchlist y juegos iniciales
  useEffect(() => {
    loadProfileAndWatchlist();
    loadAllGames();
  }, [loadProfileAndWatchlist, loadAllGames]);

  // Efecto para cargar todos los juegos cuando se detecta un perfil infantil
  useEffect(() => {
    if (profile?.allowedRating === 'KIDS' && allGames.length === 0) {
      loadAllGamesForKidsProfile();
    }
  }, [profile, allGames.length, loadAllGamesForKidsProfile]);

  const toggleWatchlist = async (gameId) => {
    try {
      const gameInWatchlist = watchlist.find(id => String(id) === String(gameId));
      const isInWatchlist = !!gameInWatchlist;

      if (isInWatchlist) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/profiles/${profileId}/watchlist/${gameId}`);
        toast.info('Juego removido de la watchlist');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/profiles/${profileId}/watchlist`, { gameId: gameId });
        toast.success('Juego agregado a la watchlist');
      }
      await loadProfileAndWatchlist();
    } catch (err) {
      setError('Error al actualizar la watchlist');
    }
  };

  // Filtrar juegos apropiados para el perfil actual
  const juegosFiltradosYAptos = useMemo(() => {
    // Para perfiles adultos, usar los juegos sin filtrar
    if (!profile || profile.allowedRating !== 'KIDS') {
      return games;
    }
    
    // Para perfil infantil, filtrar juegos apropiados
    // Si tenemos todos los juegos cargados, usarlos para un filtrado completo
    const juegosAFiltrar = allGames.length > 0 ? allGames : games;
    
    // Primero filtramos por edad apropiada
    const apropiados = juegosAFiltrar.filter(juego => esJuegoApto(juego, profile));
    
    // Luego eliminamos duplicados
    const uniqueGames = [];
    const seenIds = new Set();
    
    apropiados.forEach(juego => {
      const juegoId = juego._id || juego.rawgId || juego.id;
      if (juegoId && !seenIds.has(String(juegoId))) {
        seenIds.add(String(juegoId));
        uniqueGames.push(juego);
      }
    });
    
    return uniqueGames;
  }, [profile, games, allGames]);

  // Lógica de Paginación
  const totalPages = Math.ceil(juegosFiltradosYAptos.length / gamesPerPage);
  
  // Ajustar página actual si es mayor que el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = juegosFiltradosYAptos.slice(indexOfFirstGame, indexOfLastGame);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <Link 
            to="/profiles" 
            className="text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Perfiles
          </Link>
          {profile?.allowedRating === 'KIDS' && (
            <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
              Mostrando contenido apto para niños
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Mostrar indicador de carga para todos los juegos */}
        {isLoadingAllGames && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando todos los juegos para perfil infantil...
          </div>
        )}

        {juegosFiltradosYAptos.length === 0 && !isLoading && !isLoadingAllGames && (
          <div className="bg-slate-800 rounded-lg p-6 text-center mb-6">
            <h2 className="text-xl text-white mb-2">No hay juegos disponibles</h2>
            {profile?.allowedRating === 'KIDS' && (
              <p className="text-slate-400">
                Para perfiles infantiles solo se muestran juegos con clasificación adecuada para niños.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading && !isLoadingAllGames ? (
            // Mostrar loading placeholders
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-slate-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-slate-700 rounded mb-3"></div>
                  <div className="h-12 bg-slate-700 rounded mb-3"></div>
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-slate-700 rounded-full"></div>
                    <div className="h-5 w-16 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            currentGames.map((game, index) => {
              const displayGameId = game.id || game.rawgId || game._id; // Priorizar RAWG ID (game.id)
              return (
                <GameCard 
                  key={`${displayGameId}-${index}`} 
                  game={game}
                  profileId={profileId}
                  allowedRating={profile?.allowedRating || 'ADULTS'} // Default a 'ADULTS' si no hay perfil
                  onToggleWatchlist={() => toggleWatchlist(displayGameId)} // Pasar el ID correcto
                  isInWatchlist={watchlist.some(id => String(id) === String(displayGameId))}
                />
              );
            })
          )}
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && !isLoading && !isLoadingAllGames && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {totalPages <= 7 ? (
              // Si hay 7 páginas o menos, mostrar todas
              [...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`px-4 py-2 rounded-md transition-colors ${currentPage === number + 1 ? 'bg-teal-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  {number + 1}
                </button>
              ))
            ) : (
              // Si hay más de 7 páginas, mostrar un subconjunto con elipsis
              <>
                {/* Primera página */}
                <button
                  onClick={() => paginate(1)}
                  className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-teal-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  1
                </button>
                
                {/* Elipsis inicial si estamos lejos del principio */}
                {currentPage > 3 && <span className="px-2 text-slate-400">...</span>}
                
                {/* Páginas alrededor de la actual */}
                {[...Array(totalPages).keys()]
                  .filter(n => {
                    const pageNum = n + 1;
                    return pageNum !== 1 && 
                           pageNum !== totalPages && 
                           Math.abs(pageNum - currentPage) <= 1;
                  })
                  .map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`px-4 py-2 rounded-md ${currentPage === number + 1 ? 'bg-teal-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                
                {/* Elipsis final si estamos lejos del final */}
                {currentPage < totalPages - 2 && <span className="px-2 text-slate-400">...</span>}
                
                {/* Última página */}
                <button
                  onClick={() => paginate(totalPages)}
                  className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-teal-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
