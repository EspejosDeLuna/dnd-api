/**
 * routes/classes.js
 * GET /classes              — lista de clases
 * GET /classes/:name        — una clase completa
 * GET /classes/:name/subclasses — subclases de una clase
 * GET /classes/:name/spells — hechizos disponibles para esa clase
 */

import { Router } from 'express';
import { store, stripTags } from '../utils/store.js';
import { paginate, findByName } from '../utils/query.js';

const router = Router();

function formatClass(c) {
  return {
    name:        c.name,
    source:      c.source,
    hd:          c.hd,
    proficiency: c.proficiency,
    spellcastingAbility: c.spellcastingAbility,
    casterProgression:   c.casterProgression,
    preparedSpells:      c.preparedSpells,
    cantripProgression:  c.cantripProgression,
    spellsKnownProgression: c.spellsKnownProgression,
    startingProficiencies: c.startingProficiencies,
    startingEquipment:   c.startingEquipment,
    multiclassing:       c.multiclassing,
    classTableGroups:    c.classTableGroups,
    // Features resumidos (sin el texto completo para la lista)
    classFeatures: c.classFeatures,
  };
}

function formatSubclass(sc) {
  return {
    name:            sc.name,
    source:          sc.source,
    className:       sc.className,
    classSource:     sc.classSource,
    shortName:       sc.shortName,
    subclassFeatures: sc.subclassFeatures,
  };
}

// GET /classes
router.get('/', (req, res) => {
  const { total, page, pages, limit, results } = paginate(store.classes, req.query);
  res.json({ total, page, pages, limit, results: results.map(formatClass) });
});

// GET /classes/:name
router.get('/:name', (req, res) => {
  const cls = findByName(store.classes, req.params.name);
  if (!cls) return res.status(404).json({ error: `Clase "${req.params.name}" no encontrada` });
  res.json(formatClass(cls));
});

// GET /classes/:name/subclasses
router.get('/:name/subclasses', (req, res) => {
  const name = req.params.name.toLowerCase().replace(/-/g, ' ');
  const subs = store.subclasses.filter(sc =>
    sc.className?.toLowerCase() === name
  );
  const { total, page, pages, limit, results } = paginate(subs, req.query);
  res.json({ total, page, pages, limit, results: results.map(formatSubclass) });
});

// GET /classes/:name/spells
router.get('/:name/spells', (req, res) => {
  const name = req.params.name.toLowerCase().replace(/-/g, ' ');
  const spells = store.spells.filter(s =>
    s.classes?.fromClassList?.some(c => c.name.toLowerCase() === name)
  );
  const { total, page, pages, limit, results } = paginate(spells, req.query);
  res.json({ total, page, pages, limit, results: results.map(s => ({
    name: s.name, source: s.source, level: s.level, school: s.school,
  }))});
});

export default router;
