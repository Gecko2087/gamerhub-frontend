import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const build = spawnSync(process.execPath, [vite, 'build', '--outDir', 'dist-cloudflare'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, VITE_DEMO_MODE: 'true', VITE_API_URL: '' },
});
if (build.status !== 0) process.exit(build.status ?? 1);
rmSync(new URL('../dist-cloudflare/_redirects', import.meta.url), { force: true });
