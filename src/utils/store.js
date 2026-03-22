/**
 * store.js
 * Carga todos los JSON locales al arrancar el servidor
 * y construye índices en memoria para búsquedas rápidas.
 *
 * Los datos de 5etools usan tags del tipo {@creature goblin}
 * El helper stripTags() los limpia para devolver texto plano.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

// ── Tag stripper para el formato interno de 5etools ──────────────────────────
export function stripTags(input) {
  if (!input) return '';
  if (typeof input === 'number') return String(input);
  if (Array.isArray(input)) return input.map(stripTags).join(' ');
  if (typeof input === 'object') {
    // Entradas de tipo {type: 'entries', entries: [...]}
    if (input.entries) return stripTags(input.entries);
    if (input.entry) return stripTags(input.entry);
    if (input.items) return stripTags(input.items);
    return '';
  }
  return String(input)
    .replace(/\{@\w+\s([^}|]+)(?:\|[^}]*)?\}/g, '$1')
    .replace(/\{@[^}]*\}/g, '')
    .trim();
}

// ── Lector de JSON ────────────────────────────────────────────────────────────
function readJSON(filename) {
  const p = path.join(DATA_DIR, filename);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

// ── Store principal ───────────────────────────────────────────────────────────
class DataStore {
  constructor() {
    this.spells      = [];
    this.classes     = [];
    this.subclasses  = [];
    this.races       = [];
    this.backgrounds = [];
    this.feats       = [];
    this.items       = [];
    this.monsters    = [];
    this.conditions  = [];
    this.actions     = [];
    this.rules       = [];
    this.sources     = {};
    this.loaded      = false;
  }

  load() {
    if (this.loaded) return;
    console.log('📚 Cargando datos en memoria...');

    if (!existsSync(DATA_DIR)) {
      console.warn('⚠️  Carpeta /data no encontrada. Corré: node src/loaders/loadData.js');
      this.loaded = true;
      return;
    }

    const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== '_manifest.json');

    for (const file of files) {
      const data = readJSON(file);
      if (!data) continue;

      // Spells
      if (data.spell)      this.spells.push(...data.spell);
      // Classes
      if (data.class)      this.classes.push(...data.class);
      // Subclasses (pueden estar en el mismo archivo o separadas)
      if (data.subclass)   this.subclasses.push(...data.subclass);
      // Races
      if (data.race)       this.races.push(...data.race);
      if (data.subrace)    this.races.push(...data.subrace); // subraces inline
      // Backgrounds
      if (data.background) this.backgrounds.push(...data.background);
      // Feats
      if (data.feat)       this.feats.push(...data.feat);
      // Items
      if (data.item)       this.items.push(...data.item);
      if (data.itemGroup)  this.items.push(...data.itemGroup);
      // Monsters (bestiary)
      if (data.monster)    this.monsters.push(...data.monster);
      // Conditions
      if (data.condition)  this.conditions.push(...data.condition);
      if (data.disease)    this.conditions.push(...data.disease);
      // Actions
      if (data.action)     this.actions.push(...data.action);
      // Rules
      if (data.variantrule) this.rules.push(...data.variantrule);
      // Sources
      if (data.source)     {
        for (const src of data.source) {
          this.sources[src.id] = src;
        }
      }
    }

    // Deduplicar por nombre+source
    this.spells      = this._dedup(this.spells);
    this.classes     = this._dedup(this.classes);
    this.subclasses  = this._dedup(this.subclasses);
    this.races       = this._dedup(this.races);
    this.backgrounds = this._dedup(this.backgrounds);
    this.feats       = this._dedup(this.feats);
    this.items       = this._dedup(this.items);
    this.monsters    = this._dedup(this.monsters);

    this.loaded = true;
    console.log(`✅ Datos cargados:
   • Hechizos:    ${this.spells.length}
   • Clases:      ${this.classes.length}
   • Subclases:   ${this.subclasses.length}
   • Razas:       ${this.races.length}
   • Trasfondos:  ${this.backgrounds.length}
   • Feats:       ${this.feats.length}
   • Items:       ${this.items.length}
   • Monstruos:   ${this.monsters.length}
   • Condiciones: ${this.conditions.length}`);
  }

  _dedup(arr) {
    const seen = new Set();
    return arr.filter(item => {
      const key = `${item.name}_${item.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const store = new DataStore();
