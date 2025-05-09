import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileSchema } from '../utils/validations';
import { useProfile } from '../context/ProfileContext';
import Swal from 'sweetalert2';

const CLASIFICACIONES = {
  KIDS: { label: 'Niños', color: 'bg-green-600' },
  ADULTS: { label: 'Adulto', color: 'bg-red-600' }
};

// Formulario para añadir/editar perfil
const ProfileForm = ({ onCancel, onProfileCreated, profile = null, existingProfiles = [] }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      allowedRating: profile?.allowedRating || 'ADULTS'
    }
  });

  const isKidsProfile = watch('allowedRating') === 'KIDS';

  const toggleProfileType = () => {
    setValue('allowedRating', isKidsProfile ? 'ADULTS' : 'KIDS');
  };

  const onSubmit = async (data) => {
    try {
      // Verificar si ya existe un perfil con el mismo nombre
      const existingProfile = existingProfiles.find(p => 
        p.name.toLowerCase() === data.name.toLowerCase() && 
        (!profile || p._id !== profile._id)
      );

      if (existingProfile) {
        Swal.fire({
          title: 'Error',
          text: 'Ya existe un perfil con ese nombre',
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      // Confirmar antes de guardar
      const result = await Swal.fire({
        title: profile ? '¿Actualizar perfil?' : '¿Crear nuevo perfil?',
        text: profile ? '¿Estás seguro de que quieres actualizar este perfil?' : '¿Estás seguro de que quieres crear este perfil?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      let response;
      if (profile) {
        response = await axios.put(`${apiUrl}/profiles/${profile._id}`, {
          ...data,
          userId: localStorage.getItem('userId')
        }, { headers });
        toast.success('Perfil actualizado exitosamente');
      } else {
        response = await axios.post(`${apiUrl}/profiles`, {
          ...data,
          userId: localStorage.getItem('userId')
        }, { headers });
        toast.success('Perfil creado exitosamente');
      }
      reset();
      onProfileCreated(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar perfil');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {profile ? 'Editar Perfil' : 'Añadir Nuevo Perfil'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nombre del perfil"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-gray-300">
              Perfil para niños
            </label>
            <button
              type="button"
              onClick={toggleProfileType}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                isKidsProfile ? 'bg-green-600' : 'bg-red-600'
              }`}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleProfileType();
                }
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isKidsProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <input
              type="hidden"
              {...register('allowedRating')}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors"
            >
              {profile ? 'Guardar Cambios' : 'Añadir Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Profiles() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const { selectProfile } = useProfile();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfiles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/profiles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar perfiles:', error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, navigate]);

  const handleProfileCreated = (newProfile) => {
    if (editingProfile) {
      setProfiles(prev => prev.map(p => p._id === newProfile._id ? newProfile : p));
    } else {
      setProfiles(prev => [...prev, newProfile]);
    }
    setShowForm(false);
    setEditingProfile(null);
  };

  const handleProfileSelect = (profile) => {
    selectProfile(profile);
    navigate(`/catalog/${profile._id}`);
  };

  const handleEditProfile = (profile, e) => {
    e.stopPropagation();
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDeleteProfile = async (profile, e) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: '¿Eliminar perfil?',
      text: '¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const token = localStorage.getItem('token');
        await axios.delete(`${apiUrl}/profiles/${profile._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles(prev => prev.filter(p => p._id !== profile._id));
        toast.success('Perfil eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el perfil');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Selecciona un perfil</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir perfil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="group relative cursor-pointer text-center transform transition-transform hover:scale-105 flex flex-col items-center"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className={`w-32 h-32 rounded-full ${profile.allowedRating === 'KIDS' ? 'bg-green-600' : 'bg-red-600'} mx-auto flex items-center justify-center text-4xl font-bold text-white group-hover:ring-4 ring-offset-2 ring-offset-slate-900 ring-teal-400 transition-all duration-200`}>
                {profile.name[0].toUpperCase()}
              </div>
              <p className="mt-3 text-white font-medium truncate w-full px-1">{profile.name}</p>
              <div className="flex justify-center items-center gap-2 mt-1 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-white ${profile.allowedRating === 'KIDS' ? 'bg-green-600' : 'bg-red-600'} font-semibold`}>
                  {profile.allowedRating === 'KIDS' ? 'Niños' : 'Adulto'}
                </span>
              </div>
              
              {/* Botones de editar y eliminar */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEditProfile(profile, e)}
                  className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
                  title="Editar perfil"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteProfile(profile, e)}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
                  title="Eliminar perfil"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <ProfileForm
            onCancel={() => {
              setShowForm(false);
              setEditingProfile(null);
            }}
            onProfileCreated={handleProfileCreated}
            profile={editingProfile}
            existingProfiles={profiles}
          />
        )}
      </div>
    </main>
  );
}
