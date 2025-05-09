import { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './GameCard';

const GameRecommendations = ({ profileId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/games/recommendations/${profileId}`);
        setRecommendations(response.data);
      } catch (err) {
        setError('Error al cargar las recomendaciones');
        console.error('Error al cargar recomendaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchRecommendations();
    }
  }, [profileId]);

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

  if (recommendations.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No hay recomendaciones disponibles. Agrega juegos a tu lista de seguimiento para obtener recomendaciones personalizadas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Recomendaciones para ti
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((game) => (
          <GameCard key={game._id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameRecommendations;