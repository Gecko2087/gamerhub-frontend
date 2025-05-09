import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import GameCard from './GameCard';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Watchlist = () => {
  const { selectedProfile } = useProfile();
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameToRemove, setGameToRemove] = useState(null);

  const fetchWatchlist = async () => {
    if (!selectedProfile?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist`);
      setGames(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la watchlist');
      toast.error('Error al cargar la watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (gameId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist`, { gameId: gameId });
      toast.success('Juego agregado a la watchlist');
      fetchWatchlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al agregar a watchlist');
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/profiles/${selectedProfile._id}/watchlist/${gameId}`);
        toast.error('Juego eliminado de la watchlist', {
          className: 'bg-red-100 border-red-400 text-red-700',
          progressClassName: 'bg-red-500'
        });
        fetchWatchlist();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al remover de watchlist');
      }
    }
  };

  useEffect(() => {
    if (selectedProfile) {
      fetchWatchlist();
    }
  }, [selectedProfile]);

  if (loading) return <div className="flex justify-center items-center h-64">Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mi Watchlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard
            key={game._id || game.id || game.rawgId}
            game={game}
            profileId={selectedProfile._id}
            allowedRating={selectedProfile?.allowedRating || 'M'}
            onToggleWatchlist={() => handleRemoveFromWatchlist(game._id)} // Usar siempre el _id de MongoDB
            isInWatchlist={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
