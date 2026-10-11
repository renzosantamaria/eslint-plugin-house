import { readFileSync } from 'node:fs';

export const locate = (path) => new URL(`../${path}`, import.meta.url);

const read = (path) => readFileSync(locate(path), 'utf8');

export const manifest = JSON.parse(read('package.json'));
export const readme = read('README.md');
