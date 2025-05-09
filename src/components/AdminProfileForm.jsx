import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(1, 'El nombre debe tener al menos 1 carácter')
    .max(20, 'El nombre no puede tener más de 20 caracteres')
});

const AdminProfileForm = ({ userId, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isKidProfile, setIsKidProfile] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Incluir el userId para que el backend sepa a qué usuario asociar el perfil
      const profileData = {
        ...data,
        userId,
        allowedRating: isKidProfile ? 'KIDS' : 'ADULTS'
      };
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/profiles`, profileData);
      toast.success('Perfil creado correctamente');
      
      // Si hay una función onSuccess, llamarla con el perfil creado
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Cerrar el formulario o resetear los campos
      reset();
      if (onCancel) onCancel();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear el perfil');
      console.error('Error al crear perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Añadir Nuevo Perfil
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
            <button
              type="button"
              onClick={() => setIsKidProfile(!isKidProfile)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                isKidProfile ? 'bg-green-600' : 'bg-red-600'
              }`}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsKidProfile(!isKidProfile);
                }
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isKidProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Añadir Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfileForm;