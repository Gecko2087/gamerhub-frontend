/** Original geometric cover illustrations for the fictional demo catalog. */
export const demoCovers = {
  'Orbit Runner': '/covers/orbit-runner.svg',
  'Forest Signals': '/covers/forest-signals.svg',
  'Neon District': '/covers/neon-district.svg',
  'Deep Horizon': '/covers/deep-horizon.svg',
  'Pixel Kingdom': '/covers/pixel-kingdom.svg',
  'Solar Rally': '/covers/solar-rally.svg',
};
export function gameCover(game) {
  return demoCovers[game.name] || game.background_image || game.backgroundImage || '/covers/fallback.svg';
}
export function coverFallback(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/covers/fallback.svg';
}
