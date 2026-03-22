/**
 * routes/spells.js
 * GET /spells          — lista con filtros
 * GET /spells/:name    — un hechizo por nombre
 *
 * Query params:
 *   ?search=fireball
 *   ?source=PHB,XGE
 *   ?level=3           — nivel de hechizo (0=cantrip)
 *   ?class=Wizard      — hechizos de una clase
 *   ?school=EV         — escuela de magia
 *   ?ritual=true
 *   ?concentration=true
 *   ?page=1&limit=20
 */

import { Router } from 'express';
import { store, stripTags } from '../utils/store.js';
import { paginate, findByName } from '../utils/query.js';

const router = Router();

function formatSpell(s) {
  return {
    name:          s.name,
    source:        s.source,
    level:         s.level,
    school:        s.school,
    time:          s.time,
    range:         s.range,
    components:    s.components,
    duration:      s.duration,
    classes:       s.classes,
    ritual:        s.meta?.ritual    ?? false,
    concentration: s.duration?.some?.(d => d.concentration) ?? false,
    entries:       s.entries ? stripTags(s.entries) : '',
    entriesHigherLevel: s.entriesHigherLevel ? stripTags(s.entriesHigherLevel) : '',
    damageInflict: s.damageInflict ?? [],
    savingThrow:   s.savingThrow   ?? [],
    abilityCheck:  s.abilityCheck  ?? [],
  };
}

// GET /spells
router.get('/', (req, res) => {
  let arr = store.spells;

  // Filtro por nivel
  if (req.query.level !== undefined) {
    const lvl = parseInt(req.query.level);
    arr = arr.filter(s => s.level === lvl);
  }

  // Filtro por clase
  if (req.query.class) {
    const cls = req.query.class.toLowerCase();
    arr = arr.filter(s =>
      s.classes?.fromClassList?.some(c => c.name.toLowerCase() === cls) ||
      s.classes?.fromSubclass?.some(c => c.class.name.toLowerCase() === cls)
    );
  }

  // Filtro por escuela
  if (req.query.school) {
    arr = arr.filter(s => s.school?.toUpperCase() === req.query.school.toUpperCase());
  }

  // Filtro ritual
  if (req.query.ritual === 'true') {
    arr = arr.filter(s => s.meta?.ritual === true);
  }

  // Filtro concentration
  if (req.query.concentration === 'true') {
    arr = arr.filter(s => s.duration?.some(d => d.concentration));
  }

  const { total, page, pages, limit, results } = paginate(arr, req.query);

  res.json({
    total, page, pages, limit,
    results: results.map(formatSpell),
  });
});

// GET /spells/:name
router.get('/:name', (req, res) => {
  const spell = findByName(store.spells, req.params.name);
  if (!spell) return res.status(404).json({ error: `Hechizo "${req.params.name}" no encontrado` });
  res.json(formatSpell(spell));
});

export default router;
