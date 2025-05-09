import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(1, 'El nombre debe tener al menos 1 carácter')
    .max(20, 'El nombre no puede tener más de 20 caracteres')
});

const ProfileForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isKidProfile, setIsKidProfile] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/${id}`);
          const profile = response.data;
          setValue('name', profile.name);
          setIsKidProfile(profile.allowedRating === 'KIDS');
        } catch (err) {
          setError('Error al cargar el perfil');
        }
      };
      fetchProfile();
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const profileData = {
        ...data,
        allowedRating: isKidProfile ? 'KIDS' : 'ADULTS'
      };

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/profiles/${id}`, profileData);
        toast.success('Perfil actualizado correctamente');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/profiles`, profileData);
        toast.success('Perfil creado correctamente');
      }
      navigate('/profiles');
    } catch (err) {
      toast.error('Error al guardar el perfil');
      setError('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {id ? 'Editar Perfil' : 'Añadir Nuevo Perfil'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="Nombre del perfil"
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Perfil para niños
            </label>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                id="toggle"
                checked={isKidProfile}
                onChange={() => setIsKidProfile(!isKidProfile)}
                className="sr-only"
              />
              <div className={`block w-12 h-6 rounded-full ${isKidProfile ? 'bg-red-500' : 'bg-gray-600'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${isKidProfile ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/profiles')}
              className="px-4 py-2 text-sm font-medium bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {id ? 'Actualizar Perfil' : 'Añadir Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;