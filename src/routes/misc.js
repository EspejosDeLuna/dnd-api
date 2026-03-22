/**
 * routes/misc.js
 * Rutas para: razas, trasfondos, feats, items, monstruos, condiciones, acciones
 */

import { Router } from 'express';
import { store, stripTags } from '../utils/store.js';
import { paginate, findByName } from '../utils/query.js';

const router = Router();

// ── RAZAS ─────────────────────────────────────────────────────────────────────
router.get('/races', (req, res) => {
  let arr = store.races;
  if (req.query.type === 'subrace') {
    arr = arr.filter(r => r._isSubrace);
  } else if (req.query.type === 'base') {
    arr = arr.filter(r => !r._isSubrace);
  }
  const { total, page, pages, limit, results } = paginate(arr, req.query);
  res.json({ total, page, pages, limit, results: results.map(r => ({
    name:        r.name,
    source:      r.source,
    size:        r.size,
    speed:       r.speed,
    ability:     r.ability,
    traitTags:   r.traitTags,
    languageTags: r.languageTags,
    entries:     r.entries ? stripTags(r.entries) : '',
  }))});
});

router.get('/races/:name', (req, res) => {
  const r = findByName(store.races, req.params.name);
  if (!r) return res.status(404).json({ error: `Raza "${req.params.name}" no encontrada` });
  res.json({
    name: r.name, source: r.source, size: r.size, speed: r.speed,
    ability: r.ability, traitTags: r.traitTags, languageTags: r.languageTags,
    darkvision: r.darkvision, resist: r.resist, immune: r.immune,
    entries: r.entries ? stripTags(r.entries) : '',
    subraces: r.subraces,
  });
});

// ── TRASFONDOS ────────────────────────────────────────────────────────────────
router.get('/backgrounds', (req, res) => {
  const { total, page, pages, limit, results } = paginate(store.backgrounds, req.query);
  res.json({ total, page, pages, limit, results: results.map(b => ({
    name:         b.name,
    source:       b.source,
    skillProficiencies: b.skillProficiencies,
    languageProficiencies: b.languageProficiencies,
    toolProficiencies: b.toolProficiencies,
    startingEquipment: b.startingEquipment,
    feat:         b.feats,
    entries:      b.entries ? stripTags(b.entries) : '',
  }))});
});

router.get('/backgrounds/:name', (req, res) => {
  const b = findByName(store.backgrounds, req.params.name);
  if (!b) return res.status(404).json({ error: `Trasfondo "${req.params.name}" no encontrado` });
  res.json({
    name: b.name, source: b.source,
    skillProficiencies: b.skillProficiencies,
    languageProficiencies: b.languageProficiencies,
    toolProficiencies: b.toolProficiencies,
    feat: b.feats,
    startingEquipment: b.startingEquipment,
    entries: b.entries ? stripTags(b.entries) : '',
  });
});

// ── FEATS ─────────────────────────────────────────────────────────────────────
router.get('/feats', (req, res) => {
  let arr = store.feats;
  if (req.query.prerequisite) {
    arr = arr.filter(f => f.prerequisite);
  }
  const { total, page, pages, limit, results } = paginate(arr, req.query);
  res.json({ total, page, pages, limit, results: results.map(f => ({
    name:          f.name,
    source:        f.source,
    prerequisite:  f.prerequisite,
    ability:       f.ability,
    skillProficiencies: f.skillProficiencies,
    additionalSpells: f.additionalSpells,
    entries:       f.entries ? stripTags(f.entries) : '',
  }))});
});

router.get('/feats/:name', (req, res) => {
  const f = findByName(store.feats, req.params.name);
  if (!f) return res.status(404).json({ error: `Feat "${req.params.name}" no encontrada` });
  res.json({
    name: f.name, source: f.source, prerequisite: f.prerequisite,
    ability: f.ability, skillProficiencies: f.skillProficiencies,
    additionalSpells: f.additionalSpells,
    entries: f.entries ? stripTags(f.entries) : '',
  });
});

// ── ITEMS ─────────────────────────────────────────────────────────────────────
router.get('/items', (req, res) => {
  let arr = store.items;
  if (req.query.type) {
    const t = req.query.type.toUpperCase();
    arr = arr.filter(i => i.type?.toUpperCase() === t);
  }
  if (req.query.rarity) {
    arr = arr.filter(i => i.rarity?.toLowerCase() === req.query.rarity.toLowerCase());
  }
  if (req.query.magic === 'true')  arr = arr.filter(i => i.wondrous || i.rarity);
  if (req.query.magic === 'false') arr = arr.filter(i => !i.wondrous && !i.rarity);

  const { total, page, pages, limit, results } = paginate(arr, req.query);
  res.json({ total, page, pages, limit, results: results.map(i => ({
    name:     i.name,
    source:   i.source,
    type:     i.type,
    rarity:   i.rarity,
    weight:   i.weight,
    value:    i.value,
    ac:       i.ac,
    damage:   i.dmg1,
    damageType: i.dmgType,
    properties: i.property,
    wondrous: i.wondrous ?? false,
    attunement: i.reqAttune,
    entries:  i.entries ? stripTags(i.entries) : '',
  }))});
});

router.get('/items/:name', (req, res) => {
  const i = findByName(store.items, req.params.name);
  if (!i) return res.status(404).json({ error: `Item "${req.params.name}" no encontrado` });
  res.json({
    name: i.name, source: i.source, type: i.type, rarity: i.rarity,
    weight: i.weight, value: i.value, ac: i.ac,
    damage: i.dmg1, damageVersatile: i.dmg2, damageType: i.dmgType,
    properties: i.property, range: i.range, wondrous: i.wondrous,
    reqAttune: i.reqAttune, bonusWeapon: i.bonusWeapon, bonusAc: i.bonusAc,
    entries: i.entries ? stripTags(i.entries) : '',
  });
});

// ── MONSTRUOS ─────────────────────────────────────────────────────────────────
router.get('/monsters', (req, res) => {
  let arr = store.monsters;
  if (req.query.cr)   arr = arr.filter(m => String(m.cr) === req.query.cr || m.cr?.cr === req.query.cr);
  if (req.query.type) arr = arr.filter(m => m.type?.toLowerCase() === req.query.type.toLowerCase() || m.type?.type?.toLowerCase() === req.query.type.toLowerCase());
  if (req.query.size) arr = arr.filter(m => m.size?.[0]?.toUpperCase() === req.query.size[0]?.toUpperCase());

  const { total, page, pages, limit, results } = paginate(arr, req.query);
  res.json({ total, page, pages, limit, results: results.map(m => ({
    name:   m.name,
    source: m.source,
    size:   m.size,
    type:   m.type,
    alignment: m.alignment,
    ac:     m.ac,
    hp:     m.hp,
    speed:  m.speed,
    str: m.str, dex: m.dex, con: m.con,
    int: m.int, wis: m.wis, cha: m.cha,
    cr:     m.cr,
    passive: m.passive,
  }))});
});

router.get('/monsters/:name', (req, res) => {
  const m = findByName(store.monsters, req.params.name);
  if (!m) return res.status(404).json({ error: `Monstruo "${req.params.name}" no encontrado` });
  res.json({
    ...m,
    // Limpiar tags de los traits y actions
    trait:  m.trait?.map(t => ({ ...t, entries: stripTags(t.entries) })),
    action: m.action?.map(a => ({ ...a, entries: stripTags(a.entries) })),
    reaction: m.reaction?.map(r => ({ ...r, entries: stripTags(r.entries) })),
    legendaryActions: m.legendary?.map(l => ({ ...l, entries: stripTags(l.entries) })),
  });
});

// ── CONDICIONES ───────────────────────────────────────────────────────────────
router.get('/conditions', (req, res) => {
  const { total, page, pages, limit, results } = paginate(store.conditions, req.query);
  res.json({ total, page, pages, limit, results: results.map(c => ({
    name:    c.name,
    source:  c.source,
    entries: c.entries ? stripTags(c.entries) : '',
  }))});
});

router.get('/conditions/:name', (req, res) => {
  const c = findByName(store.conditions, req.params.name);
  if (!c) return res.status(404).json({ error: `Condición "${req.params.name}" no encontrada` });
  res.json({ name: c.name, source: c.source, entries: stripTags(c.entries) });
});

// ── ACCIONES ─────────────────────────────────────────────────────────────────
router.get('/actions', (req, res) => {
  const { total, page, pages, limit, results } = paginate(store.actions, req.query);
  res.json({ total, page, pages, limit, results: results.map(a => ({
    name:    a.name,
    source:  a.source,
    time:    a.time,
    entries: a.entries ? stripTags(a.entries) : '',
  }))});
});

export default router;
