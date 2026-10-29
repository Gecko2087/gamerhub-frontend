import { API_URL } from '../config/api.js';
import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GameCard from './GameCard';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Watchlist = () => {
  const { selectedProfile } = useProfile();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchWatchlist = async () => {
    if (!selectedProfile?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/profiles/${selectedProfile._id}/watchlist`);
      setGames(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la watchlist');
      toast.error('Error al cargar la watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (gameId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el juego de tu watchlist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/profiles/${selectedProfile._id}/watchlist/${gameId}`);
        toast.error('Juego eliminado de la watchlist', {
          className: 'bg-red-100 border-red-400 text-red-700',
          progressClassName: 'bg-red-500'
        });
        fetchWatchlist();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al remover de watchlist');
        throw err;
      }
    }
  };

  useEffect(() => {
    if (selectedProfile) {
      fetchWatchlist();
    }
  }, [selectedProfile]);

  if (loading) return <p role="status" className="p-8 text-center">Cargando favoritos…</p>;
  if (error) return <div role="alert" className="max-w-xl mx-auto p-6 my-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100"><p>{error}</p><button onClick={fetchWatchlist} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white">Reintentar</button></div>;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <Link to={`/catalog/${selectedProfile?._id || ''}`} className="inline-flex mb-5 py-2 font-semibold text-teal-800 dark:text-teal-200 hover:underline">← Volver al catálogo</Link>
      <h1 className="text-3xl font-bold mb-3">Mis favoritos</h1>
      <p className="mb-6 text-slate-700 dark:text-slate-300">Tu lista de juegos para descubrir después.</p>
      {games.length === 0 && <div role="status" className="rounded-xl border border-dashed border-slate-400 p-8 text-center"><h2 className="text-xl font-semibold">Tu próxima aventura empieza aquí</h2><p className="mt-2">Todavía no guardaste juegos. Explora el catálogo y agrega tus favoritos.</p><Link to={`/catalog/${selectedProfile?._id || ''}`} className="inline-block mt-5 rounded-lg bg-teal-700 px-4 py-3 text-white">Explorar catálogo</Link></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard
            key={game._id || game.id || game.rawgId}
            game={game}
            profileId={selectedProfile._id}
            allowedRating={selectedProfile?.allowedRating || 'M'}
            onToggleWatchlist={() => handleRemoveFromWatchlist(game._id || game.rawgId || game.id)} // Usar siempre el _id de MongoDB
            isInWatchlist={true}
          />
        ))}
      </div>
    </section>
  );
};

export default Watchlist;
