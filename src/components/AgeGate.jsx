import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AgeGate = ({ gameId, profileId, children }) => {
  const [isAllowed, setIsAllowed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAge = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/games/validate-age/${gameId}/${profileId}`
        );
        setIsAllowed(response.data.isAllowed);
      } catch (err) {
        setError('Error al validar la edad');
        console.error('Error al validar edad:', err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId && profileId) {
      validateAge();
    }
  }, [gameId, profileId]);

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

  if (!isAllowed) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border-2 border-red-400 dark:border-red-600">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Acceso denegado por edad
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Lo sentimos, este contenido está restringido para tu edad o clasificación de perfil.
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm text-red-600 dark:text-red-400">
            Para acceder a este contenido, necesitas un perfil con clasificación adecuada.
            <br />
            Si crees que esto es un error, consulta con el administrador de la cuenta.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/profiles')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold"
          >
            Cambiar perfil
          </button>
          <button
            onClick={() => navigate('/games')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AgeGate;