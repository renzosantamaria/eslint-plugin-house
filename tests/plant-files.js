import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export function plantFiles(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'house-'));

  t.after(() => rmSync(root, { force: true, recursive: true }));

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }

  return root;
}
