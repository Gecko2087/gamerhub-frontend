import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Swal from 'sweetalert2';

const initialForm = {
  name: '',
  rawgId: '',
  backgroundImage: '',
  releaseDate: '',
  rating: 0,
  ageRating: 'E',
  description: '',
  platforms: '',
  genres: '',
  website: '',
  metacritic: ''
};

function GameForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(initialData || initialForm);
  useEffect(() => { if (initialData) setForm(initialData); }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      ...form,
      platforms: form.platforms ? form.platforms.split(',').map(s => s.trim()) : [],
      genres: form.genres ? form.genres.split(',').map(s => s.trim()) : []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{initialData ? 'Editar juego' : 'Crear juego'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="w-full p-2 rounded border focus:ring-2 focus:ring-teal-400 dark:bg-slate-900 dark:text-white" required />
        </div>
        {/* Mostrar RAWG ID solo si se está editando un juego que ya lo tiene */}
        {initialData && initialData.rawgId && (
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">RAWG ID</label>
          <input name="rawgId" value={form.rawgId} onChange={handleChange} placeholder="RAWG ID" className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-400 dark:bg-slate-900 dark:text-white" disabled />
        </div>
        )}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
          <input name="backgroundImage" value={form.backgroundImage} onChange={handleChange} placeholder="URL Imagen" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Fecha de lanzamiento</label>
          <input name="releaseDate" value={form.releaseDate} onChange={handleChange} placeholder="YYYY-MM-DD" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Rating</label>
          <input name="rating" type="number" value={form.rating} onChange={handleChange} placeholder="Rating" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Clasificación</label>
          <input name="ageRating" value={form.ageRating} onChange={handleChange} placeholder="E, T, M..." className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Plataformas</label>
          <input name="platforms" value={form.platforms} onChange={handleChange} placeholder="Plataformas (separadas por coma)" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Géneros</label>
          <input name="genres" value={form.genres} onChange={handleChange} placeholder="Géneros (separados por coma)" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Sitio web</label>
          <input name="website" value={form.website || ''} onChange={handleChange} placeholder="Sitio web oficial" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Metacritic</label>
          <input name="metacritic" type="number" value={form.metacritic || ''} onChange={handleChange} placeholder="Puntaje Metacritic" className="w-full p-2 rounded border dark:bg-slate-900 dark:text-white" />
        </div>
        {/* Eliminado campo Video (URL mp4) */}
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow transition-colors">Guardar</button>
        <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded shadow transition-colors">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminGamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Extraer géneros y plataformas únicos para los selectores
  const genresList = useMemo(() => {
    const set = new Set();
    games.forEach(g => (g.genres || []).forEach(genre => set.add(genre)));
    return Array.from(set).sort();
  }, [games]);
  const platformsList = useMemo(() => {
    const set = new Set();
    games.forEach(g => (g.platforms || []).forEach(p => set.add(p)));
    return Array.from(set).sort();
  }, [games]);

  // Fetch con filtros, búsqueda y paginación
  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        search,
        genre,
        platform
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/games`, { params });
      setGames(data.games || []);
      setTotal(data.total || 0);
    } catch {
      setGames([]);
      setTotal(0);
      setTimeout(() => {
        if (games.length === 0) toast.error('Error al cargar juegos');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // Fetch en tiempo real al cambiar filtros, búsqueda o página
  useEffect(() => { fetchGames(); }, [search, genre, platform, page]);

  const handleCreate = () => {
    setEditGame(null);
    setShowForm(true);
  };

  const handleEdit = (game) => {
    setEditGame({ ...game, platforms: (game.platforms||[]).join(','), genres: (game.genres||[]).join(',') });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar juego?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/games/${id}`);
      toast.success('Juego eliminado');
      fetchGames();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleImportPopular = async () => {
    const { value: cantidad } = await Swal.fire({
      title: '¿Cuántos juegos populares deseas importar?',
      input: 'number',
      inputLabel: 'Cantidad (máx. 1000)',
      inputValue: 100,
      inputAttributes: {
        min: 1,
        max: 1000,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: 'Importar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(value) || value <= 0) {
          return 'Debes ingresar un número válido';
        }
        if (value > 1000) {
          return 'El máximo permitido es 1000';
        }
        return null;
      }
    });
    if (!cantidad) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/games/import-popular`, { cantidad });
      toast.success(`Juegos populares importados (${cantidad})`);
      fetchGames();
    } catch {
      toast.error('Error al importar juegos populares');
    }
  };

  const handleFormSubmit = async (formData) => {
    // Normalizar platforms y genres a array antes de enviar
    const safeData = {
      ...formData,
      platforms: Array.isArray(formData.platforms)
        ? formData.platforms
        : (typeof formData.platforms === 'string' && formData.platforms.trim() !== '' ? formData.platforms.split(',').map(s => s.trim()) : []),
      genres: Array.isArray(formData.genres)
        ? formData.genres
        : (typeof formData.genres === 'string' && formData.genres.trim() !== '' ? formData.genres.split(',').map(s => s.trim()) : [])
    };
    // Eliminar propiedad 'clip' si existe
    delete safeData.clip;
    try {
      if (editGame) {
        await axios.put(`${import.meta.env.VITE_API_URL}/games/${editGame._id}`, safeData);
        toast.success('Juego actualizado');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/games`, safeData);
        toast.success('Juego creado');
      }
      setShowForm(false);
      fetchGames();
    } catch {
      toast.error('Error al guardar');
    }
  };

  if (!user || user.role !== 'admin') return <ProtectedRoute requiredRole="admin" />;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white drop-shadow">Administrar Juegos</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow transition-colors">Crear nuevo juego</button>
        <button onClick={handleImportPopular} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors">Importar juegos populares</button>
      </div>
      <div className="mb-2 text-right text-gray-700 dark:text-gray-200 font-semibold">
        Total de juegos: {total}
      </div>
      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre..."
          className="p-2 rounded border dark:bg-slate-900 dark:text-white"
        />
        <select
          value={genre}
          onChange={e => { setGenre(e.target.value); setPage(1); }}
          className="p-2 rounded border dark:bg-slate-900 dark:text-white"
        >
          <option value="">Todos los géneros</option>
          {genresList.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={platform}
          onChange={e => { setPlatform(e.target.value); setPage(1); }}
          className="p-2 rounded border dark:bg-slate-900 dark:text-white"
        >
          <option value="">Todas las plataformas</option>
          {platformsList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
            <GameForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              initialData={editGame}
            />
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center text-lg text-gray-600 dark:text-gray-300">Cargando...</div>
      ) : (
        games.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">No hay juegos cargados.</div>
        ) : (
          <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full bg-white dark:bg-slate-800 rounded-lg">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 text-teal-700 dark:text-teal-300">
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">RAWG ID</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game._id || game.rawgId || game.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => handleEdit(game)}>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{game.name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{game.rawgId}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{game.rating}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={e => { e.stopPropagation(); handleEdit(game); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow transition-colors">Editar</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(game._id); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow transition-colors">Eliminar</button>
                      <a href={`/games/${game.rawgId || game._id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow transition-colors">Ver</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded transition-colors mx-1 ${page === i + 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-100 dark:hover:bg-teal-800'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          </>
        )
      )}
    </div>
  );
}

<style>{`
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease;
}
`}</style>
