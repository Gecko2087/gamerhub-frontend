import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useProfile } from './ProfileContext';

const FavoritesContext = createContext();
const empty = [];
const ids = game => typeof game === 'object' && game !== null
  ? [game._id, game.rawgId, game.id].filter(value => value != null).map(String)
  : [String(game)];
const sameGame = (left, right) => ids(left).some(id => ids(right).includes(id));

function ProfileFavorites({ profileId, children }) {
  const [games, setGames] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(Promise.resolve());
  const endpoint = `${API_URL}/profiles/${profileId}/watchlist`;

  useEffect(() => {
    if (!profileId) return;
    const controller = new AbortController();
    axios.get(endpoint, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setGames(data);
    }).catch(() => {
      if (!controller.signal.aborted) setError('No se pudieron cargar los favoritos.');
    });
    return () => controller.abort();
  }, [endpoint, profileId, attempt]);

  const retry = () => {
    setError('');
    setAttempt(value => value + 1);
  };

  const contains = game => games?.some(item => sameGame(item, game)) ?? false;

  const toggle = async (game, requestId = ids(game)[0]) => {
    if (!profileId || !games || !game || !requestId) throw new Error('Favoritos no disponibles.');
    const remove = contains(game);
    const operation = pending.current.then(async () => {
      if (remove) {
        await axios.delete(`${endpoint}/${encodeURIComponent(requestId)}`);
        setGames(items => items.filter(item => !sameGame(item, game)));
      } else {
        await axios.post(endpoint, { gameId: requestId });
        setGames(items => items.some(item => sameGame(item, game)) ? items : [...items, game]);
      }
    });
    pending.current = operation.catch(() => {});
    return operation;
  };

  return <FavoritesContext.Provider value={{
    games: games ?? empty, ready: games !== null, error, retry, contains, toggle,
  }}>{children}</FavoritesContext.Provider>;
}

export function FavoritesProvider({ children }) {
  const { selectedProfile } = useProfile();
  const profileId = selectedProfile?._id;
  return <ProfileFavorites key={profileId ?? 'none'} profileId={profileId}>{children}</ProfileFavorites>;
}

export const useFavorites = () => useContext(FavoritesContext);
