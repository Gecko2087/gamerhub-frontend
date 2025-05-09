import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function UserSettingsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'owner',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'owner'
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validar que las contraseñas coincidan
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Solo enviar los campos que han cambiado
      const dataToUpdate = {
        name: formData.name !== user.name ? formData.name : undefined,
        role: formData.role !== user.role ? formData.role : undefined
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (formData.newPassword && formData.currentPassword) {
        dataToUpdate.currentPassword = formData.currentPassword;
        dataToUpdate.newPassword = formData.newPassword;
      }

      // Filtrar campos undefined
      const finalData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
      );

      // Solo enviar si hay cambios
      if (Object.keys(finalData).length > 0) {
        await axios.put('/api/auth/user', finalData);
        setSuccess(true);
        toast.success('Configuración actualizada correctamente');
        // Actualizar el usuario en el contexto
        if (dataToUpdate.name || dataToUpdate.role) {
          updateUser({
            ...user,
            name: dataToUpdate.name || user.name,
            role: dataToUpdate.role || user.role
          });
        }
      } else {
        setError('No se han realizado cambios');
        toast.info('No se han realizado cambios');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al actualizar la configuración');
      toast.error(err.response?.data?.error || 'Error al actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario es owner, deshabilitar el selector de rol
  const isOwner = user?.role === 'owner';

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        Configuración de Cuenta
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Información Personal
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                El email no se puede cambiar
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Rol de Usuario
          </h2>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Selecciona un rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              disabled={isOwner}
            >
              <option value="owner">Propietario</option>
              <option value="admin">Administrador</option>
            </select>
            {isOwner && (
              <p className="mt-1 text-xs text-slate-400">Solo un administrador puede cambiar tu rol.</p>
            )}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Los administradores pueden gestionar perfiles y contenido.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Cambiar Contraseña
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña Actual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}