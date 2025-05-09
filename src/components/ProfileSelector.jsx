import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';

const ProfileSelector = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles`);
        setProfiles(response.data);
      } catch (err) {
        setError('Error al cargar los perfiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleProfileSelect = (profileId) => {
    // Guardar el perfil seleccionado en el localStorage
    localStorage.setItem('selectedProfile', profileId);
    navigate('/games');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        ¿Quién está jugando?
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <button
            key={profile._id}
            onClick={() => handleProfileSelect(profile._id)}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {profile.allowedRating === 'E' ? 'Para todos' : 
               profile.allowedRating === 'T' ? 'Adolescentes' : 'Adultos'}
            </p>
          </button>
        ))}
        
        <button
          onClick={() => navigate('/profiles/new')}
          className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <PlusIcon className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Agregar perfil
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;