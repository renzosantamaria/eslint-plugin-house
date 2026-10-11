import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function isInstalled(packageName) {
  try {
    require.resolve(packageName);

    return true;
  } catch {
    return false;
  }
}
