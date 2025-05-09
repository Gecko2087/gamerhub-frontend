import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserForm from '../components/UserForm';
import AdminProfileForm from '../components/AdminProfileForm';
import Swal from 'sweetalert2';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const { user: currentUser, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
        // Obtener los perfiles para cada usuario
        const usersWithProfiles = await Promise.all(
          response.data.map(async (user) => {
            try {
              const profilesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/user/${user._id}`);
              return { ...user, profiles: profilesResponse.data };
            } catch (err) {
              console.error(`Error al obtener perfiles para usuario ${user._id}:`, err);
              return { ...user, profiles: [] };
            }
          })
        );
        setUsers(usersWithProfiles);
        setError(null);
      } catch (err) {
        setError('Error al cargar usuarios');
        console.error('Error:', err);
        if (err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasRole, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      setError(null);
      toast.success('Rol actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar rol');
      toast.error(err.response?.data?.message || 'Error al actualizar rol');
      console.error('Error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setError(null);
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
      toast.error(err.response?.data?.message || 'Error al eliminar usuario');
      console.error('Error:', err);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, newUser);
      setUsers([...users, { ...response.data, profiles: [] }]);
      setError(null);
      toast.success('Usuario agregado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar usuario');
      toast.error(err.response?.data?.message || 'Error al agregar usuario');
      console.error('Error:', err);
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}`, updatedData);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, ...response.data } : user
      ));
      setError(null);
      toast.success('Usuario actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
      console.error('Error:', err);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, userData);
      setUsers([...users, { ...response.data, profiles: [] }]);
      setShowCreateForm(false);
      toast.success('Usuario creado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleDeleteProfile = async (profileId, userId) => {
    const result = await Swal.fire({
      title: '¿Eliminar perfil?',
      text: '¿Estás seguro de que deseas eliminar este perfil? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/profiles/${profileId}`);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, profiles: user.profiles.filter(profile => profile._id !== profileId) } : user
      ));
      toast.success('Perfil eliminado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar perfil');
      console.error('Error:', err);
    }
  };

  const handleAddProfileSuccess = (newProfile) => {
    // Actualizar el array de usuarios con el nuevo perfil
    setUsers(users.map(user => 
      user._id === newProfile.userId ? 
        { ...user, profiles: [...user.profiles, newProfile] } : 
        user
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Perfiles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <React.Fragment key={user._id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user._id === currentUser._id}
                      className={`text-sm rounded-md ${
                        user._id === currentUser._id
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 mr-2"
                      >
                        {user.profiles?.length || 0} perfiles
                        {expandedUser === user._id ? ' ▼' : ' ▶'}
                      </button>
                      <button
                        onClick={() => setSelectedUserForProfile(user._id)}
                        className="ml-2 text-xs bg-teal-100 text-teal-700 dark:bg-teal-700 dark:text-teal-100 hover:bg-teal-200 dark:hover:bg-teal-600 rounded px-2 py-1 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo perfil
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={user._id === currentUser._id}
                      className={`text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ${
                        user._id === currentUser._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                {expandedUser === user._id && user.profiles?.length > 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4">
                      <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {user.profiles.map(profile => (
                          <div key={profile._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${profile.allowedRating === 'KIDS' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white font-bold`}>
                                  {profile.name[0].toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{profile.name}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {profile.allowedRating === 'KIDS' ? 'Perfil para Niños' : 'Perfil para Adultos'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteProfile(profile._id, user._id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {(selectedUser || showCreateForm) && (
        <UserForm
          user={selectedUser}
          onCancel={() => {
            setSelectedUser(null);
            setShowCreateForm(false);
          }}
          onSave={selectedUser ? handleUpdateUser : handleCreateUser}
        />
      )}

      {selectedUserForProfile && (
        <AdminProfileForm
          userId={selectedUserForProfile}
          onCancel={() => setSelectedUserForProfile(null)}
          onSuccess={handleAddProfileSuccess}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;