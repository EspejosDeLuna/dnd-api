/**
 * server.js — Bertini's 5e API
 *
 * API REST completa con todos los datos de D&D 5e 2014 (5etools).
 *
 * SETUP:
 *   1. npm install
 *   2. node src/loaders/loadData.js   ← descarga los datos (una vez)
 *   3. npm start                       ← arranca la API
 *
 * ENDPOINTS:
 *   GET /                        → info y endpoints disponibles
 *   GET /search?q=fireball       → búsqueda global
 *   GET /spells                  → lista de hechizos
 *   GET /spells/:name            → un hechizo
 *   GET /classes                 → lista de clases
 *   GET /classes/:name           → una clase
 *   GET /classes/:name/subclasses→ subclases de una clase
 *   GET /classes/:name/spells    → hechizos de una clase
 *   GET /races                   → lista de razas
 *   GET /races/:name             → una raza
 *   GET /backgrounds             → lista de trasfondos
 *   GET /backgrounds/:name       → un trasfondo
 *   GET /feats                   → lista de feats
 *   GET /feats/:name             → una feat
 *   GET /items                   → lista de items
 *   GET /items/:name             → un item
 *   GET /monsters                → lista de monstruos
 *   GET /monsters/:name          → un monstruo
 *   GET /conditions              → lista de condiciones
 *   GET /conditions/:name        → una condición
 *   GET /actions                 → lista de acciones de combate
 *
 * FILTROS GLOBALES (aplican a todos los endpoints de lista):
 *   ?search=<texto>      búsqueda parcial por nombre
 *   ?source=PHB,XGE      filtrar por fuente
 *   ?page=1&limit=20     paginación
 *
 * FILTROS ESPECÍFICOS:
 *   Spells:   ?level=3 ?class=Wizard ?school=EV ?ritual=true ?concentration=true
 *   Items:    ?type=S ?rarity=rare ?magic=true
 *   Monsters: ?cr=5 ?type=undead ?size=L
 */

import express from 'express';
import cors from 'cors';
import { store } from './utils/store.js';
import spellsRouter      from './routes/spells.js';
import classesRouter     from './routes/classes.js';
import miscRouter        from './routes/misc.js';
import searchRouter      from './routes/search.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Cargar datos al arrancar
store.load();

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name:    "Bertini's 5e API",
    version: '1.0.0',
    description: 'API REST de D&D 5e 2014 — datos de 5etools',
    stats: {
      spells:      store.spells.length,
      classes:     store.classes.length,
      subclasses:  store.subclasses.length,
      races:       store.races.length,
      backgrounds: store.backgrounds.length,
      feats:       store.feats.length,
      items:       store.items.length,
      monsters:    store.monsters.length,
      conditions:  store.conditions.length,
    },
    endpoints: {
      search:      'GET /search?q=<texto>',
      spells:      'GET /spells[/:name][?level=N&class=X&school=X&ritual=bool&concentration=bool]',
      classes:     'GET /classes[/:name][/subclasses][/spells]',
      races:       'GET /races[/:name]',
      backgrounds: 'GET /backgrounds[/:name]',
      feats:       'GET /feats[/:name]',
      items:       'GET /items[/:name][?type=X&rarity=X&magic=bool]',
      monsters:    'GET /monsters[/:name][?cr=N&type=X&size=X]',
      conditions:  'GET /conditions[/:name]',
      actions:     'GET /actions',
    },
    commonParams: '?search=X&source=PHB,XGE&page=N&limit=N',
  });
});

app.use('/search',      searchRouter);
app.use('/spells',      spellsRouter);
app.use('/classes',     classesRouter);
app.use('/races',       miscRouter);
app.use('/backgrounds', miscRouter);
app.use('/feats',       miscRouter);
app.use('/items',       miscRouter);
app.use('/monsters',    miscRouter);
app.use('/conditions',  miscRouter);
app.use('/actions',     miscRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint "${req.path}" no encontrado` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🐉 Bertini's 5e API corriendo en http://localhost:${PORT}`);
  console.log(`   ${store.spells.length} hechizos · ${store.monsters.length} monstruos · ${store.items.length} items`);
  console.log(`\n   GET http://localhost:${PORT}/          → info`);
  console.log(`   GET http://localhost:${PORT}/spells     → hechizos`);
  console.log(`   GET http://localhost:${PORT}/search?q=fireball\n`);
});
