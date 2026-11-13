import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import GameCard from './GameCard';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Watchlist = () => {
  const { selectedProfile } = useProfile();
  const { games, ready, error, retry, toggle } = useFavorites();

  const handleRemoveFromWatchlist = async (game) => {
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
        await toggle(game);
        toast.success('Juego quitado de favoritos.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al remover de watchlist');
        throw err;
      }
    }
  };

  if (error) return <div role="alert" className="max-w-xl mx-auto p-6 my-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100"><p>{error}</p><button onClick={retry} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white">Reintentar</button></div>;
  if (!ready) return <p role="status" className="p-8 text-center">Cargando favoritos…</p>;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <Link to={`/catalog/${selectedProfile?._id || ''}`} className="inline-flex mb-5 py-2 font-semibold text-teal-800 dark:text-teal-200 hover:underline">← Volver al catálogo</Link>
      <h1 className="text-3xl font-bold mb-3">Mis favoritos</h1>
      <p role="status" className="mb-6 text-slate-700 dark:text-slate-300">{games.length} {games.length === 1 ? 'juego guardado' : 'juegos guardados'}</p>
      {games.length === 0 && <div role="status" className="rounded-xl border border-dashed border-slate-400 p-8 text-center"><h2 className="text-xl font-semibold">Tu próxima aventura empieza aquí</h2><p className="mt-2">Todavía no guardaste juegos. Explora el catálogo y agrega tus favoritos.</p><Link to={`/catalog/${selectedProfile?._id || ''}`} className="inline-block mt-5 rounded-lg bg-teal-700 px-4 py-3 text-white">Explorar catálogo</Link></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard
            key={game._id || game.id || game.rawgId}
            game={game}
            profileId={selectedProfile._id}
            allowedRating={selectedProfile?.allowedRating || 'M'}
            onToggleWatchlist={() => handleRemoveFromWatchlist(game)}
            isInWatchlist={true}
          />
        ))}
      </div>
    </section>
  );
};

export default Watchlist;
