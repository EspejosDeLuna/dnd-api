/**
 * loadData.js
 *
 * Descarga todos los JSON de 5etools-2014 desde GitHub raw
 * y los guarda localmente en /data.
 *
 * Corré esto UNA SOLA VEZ (o cuando quieras actualizar los datos):
 *   node src/loaders/loadData.js
 *
 * Los datos quedan en /data/*.json — la API los sirve desde ahí.
 * Así no dependés de que GitHub esté online para servir la API.
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-2014-src/main/data';

// ── Todos los archivos que queremos descargar ────────────────────────────────
// Organizados por categoría para facilitar el mantenimiento
const FILES = {
  // Spells
  spells: [
    'spells/spells-phb.json',
    'spells/spells-xge.json',
    'spells/spells-tce.json',
    'spells/spells-ggr.json',
    'spells/spells-scc.json',
    'spells/spells-ftd.json',
    'spells/spells-idrotf.json',
    'spells/spells-llok.json',
    'spells/spells-ai.json',
    'spells/spells-egw.json',
    'spells/spells-erlw.json',
  ],
  // Classes y subclases
  classes: [
    'class/class-barbarian.json',
    'class/class-bard.json',
    'class/class-cleric.json',
    'class/class-druid.json',
    'class/class-fighter.json',
    'class/class-monk.json',
    'class/class-paladin.json',
    'class/class-ranger.json',
    'class/class-rogue.json',
    'class/class-sorcerer.json',
    'class/class-warlock.json',
    'class/class-wizard.json',
    'class/class-artificer.json',
    // Subclases de sourcebooks
    'class/class-subclass-additional.json',
  ],
  // Razas
  races: [
    'races.json',
  ],
  // Trasfondos
  backgrounds: [
    'backgrounds.json',
  ],
  // Feats
  feats: [
    'feats.json',
  ],
  // Items
  items: [
    'items.json',
    'items-base.json',
  ],
  // Bestiary (monstruos)
  bestiary: [
    'bestiary/bestiary-mm.json',
    'bestiary/bestiary-vgm.json',
    'bestiary/bestiary-mtf.json',
    'bestiary/bestiary-mpmm.json',
    'bestiary/bestiary-bgdia.json',
    'bestiary/bestiary-cos.json',
    'bestiary/bestiary-hotdq.json',
    'bestiary/bestiary-lmop.json',
    'bestiary/bestiary-pota.json',
    'bestiary/bestiary-rot.json',
    'bestiary/bestiary-skt.json',
    'bestiary/bestiary-tftyp.json',
    'bestiary/bestiary-toa.json',
    'bestiary/bestiary-wdh.json',
    'bestiary/bestiary-wdmm.json',
    'bestiary/bestiary-gos.json',
    'bestiary/bestiary-ai.json',
    'bestiary/bestiary-erlw.json',
    'bestiary/bestiary-rmbre.json',
    'bestiary/bestiary-egw.json',
    'bestiary/bestiary-idrotf.json',
    'bestiary/bestiary-tce.json',
    'bestiary/bestiary-ggr.json',
    'bestiary/bestiary-llok.json',
    'bestiary/bestiary-wbtw.json',
    'bestiary/bestiary-crcotn.json',
    'bestiary/bestiary-jttrc.json',
    'bestiary/bestiary-mpmm.json',
    'bestiary/bestiary-ftd.json',
    'bestiary/bestiary-dsotdq.json',
    'bestiary/bestiary-pabtso.json',
  ],
  // Condiciones y reglas
  conditions: [
    'conditionsdiseases.json',
  ],
  // Habilidades (skills, senses, actions)
  actions: [
    'actions.json',
  ],
  // Sentidos y movement
  senses: [
    'senses.json',
  ],
  // Variantrules
  rules: [
    'variantrules.json',
    'optionalfeatures.json',
  ],
  // Fuentes (source index)
  sources: [
    'sources.json',
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function downloadFile(relPath) {
  const url = `${BASE_URL}/${relPath}`;
  const localPath = path.join(DATA_DIR, relPath.replace(/\//g, '_'));

  try {
    const text = await fetchJSON(url);
    await writeFile(localPath, text, 'utf8');
    console.log(`  ✓ ${relPath}`);
    return { path: localPath, key: relPath };
  } catch (err) {
    // Algunos archivos pueden no existir en el mirror — los salteamos
    console.warn(`  ✗ ${relPath} — ${err.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📦 Bertini\'s 5e API — Descargando datos de 5etools 2014...\n');
  await ensureDir(DATA_DIR);

  const manifest = {}; // Registro de qué archivos se descargaron con éxito
  let total = 0, ok = 0, fail = 0;

  for (const [category, files] of Object.entries(FILES)) {
    console.log(`\n── ${category.toUpperCase()} ──`);
    manifest[category] = [];

    for (const file of files) {
      total++;
      const result = await downloadFile(file);
      if (result) {
        ok++;
        manifest[category].push({
          source: file,
          local: path.basename(result.path),
        });
      } else {
        fail++;
      }
      // Pequeño delay para no martillar el servidor
      await new Promise(r => setTimeout(r, 150));
    }
  }

  // Guardá el manifest para que la API sepa qué archivos tiene disponibles
  await writeFile(
    path.join(DATA_DIR, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(`\n✅ Descarga completa: ${ok}/${total} archivos (${fail} fallaron)`);
  console.log(`📂 Datos guardados en: ${DATA_DIR}`);
  console.log(`\nAhora podés correr: npm start`);
}

main().catch(console.error);
