// Vice City Dusk Cover Studio — entry program for make.fun gta6-cover-art-01 (round 7).
// Copies app/ and screenshots/ from this repository into the output directory and
// writes /output/dossier.json with buildDossier from vendor/makefun-app.ts.
// Runs on Node 22+ with no dependencies: `node main.ts` (or MAKEFUN_OUTPUT_DIR
// to point it at another directory when run outside the grader).

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

/** Copy a directory tree of plain files (no symlinks) from src to dest. */
function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, entry.name);
    const to = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      cpSync(from, to);
    } else {
      throw new Error(`copyTree: ${from} is not a plain file or directory`);
    }
  }
}

function requireDir(path: string, label: string): void {
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    throw new Error(`${label}: no such directory in the repository: ${path}`);
  }
}

requireDir(join(repoRoot, 'app'), 'app');
requireDir(join(repoRoot, 'screenshots'), 'screenshots');

mkdirSync(outDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

/** Count the plain files under a directory, recursively. */
function countFiles(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

/* Verify what was handed in: the dossier parses, app/ and screenshots/ are
   present with the expected files, and the dossier's own schema tag matches. */
const dossierJson = JSON.parse(readFileSync(join(outDir, 'dossier.json'), 'utf8'));
const appFiles = countFiles(join(outDir, 'app'));
const shotFiles = readdirSync(join(outDir, 'screenshots'))
  .filter((f) => /\.(png|jpe?g)$/i.test(f));
if (dossierJson.schema !== 'makefun/dossier/v1') {
  throw new Error(`dossier.json: unexpected schema ${String(dossierJson.schema)}`);
}
if (!existsSync(join(outDir, 'app', 'index.html'))) {
  throw new Error('output is missing app/index.html');
}
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots: expected 3 or 4 images, found ${shotFiles.length}`);
}
console.log(`Vice City Dusk Cover Studio: wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
console.log(`  app/: ${appFiles} files, screenshots/: ${shotFiles.join(', ')}`);
