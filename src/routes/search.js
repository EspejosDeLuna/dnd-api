/**
 * routes/search.js
 * GET /search?q=fireball&types=spells,items
 *
 * Búsqueda global a través de todas las entidades.
 * Devuelve hasta 5 resultados por categoría.
 */

import { Router } from 'express';
import { store } from '../utils/store.js';

const router = Router();

const SEARCHABLE = [
  { key: 'spells',      store: 'spells',      label: 'Hechizo'    },
  { key: 'classes',     store: 'classes',     label: 'Clase'      },
  { key: 'races',       store: 'races',       label: 'Raza'       },
  { key: 'backgrounds', store: 'backgrounds', label: 'Trasfondo'  },
  { key: 'feats',       store: 'feats',       label: 'Feat'       },
  { key: 'items',       store: 'items',       label: 'Item'       },
  { key: 'monsters',    store: 'monsters',    label: 'Monstruo'   },
  { key: 'conditions',  store: 'conditions',  label: 'Condición'  },
];

router.get('/', (req, res) => {
  const q = req.query.q?.toLowerCase();
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Parámetro ?q es requerido (mínimo 2 caracteres)' });
  }

  const typesFilter = req.query.types?.split(',').map(t => t.trim().toLowerCase());
  const limit = Math.min(parseInt(req.query.limit) || 5, 20);

  const results = {};

  for (const { key, store: storeKey, label } of SEARCHABLE) {
    if (typesFilter && !typesFilter.includes(key)) continue;
    results[key] = store[storeKey]
      .filter(item => item.name?.toLowerCase().includes(q))
      .slice(0, limit)
      .map(item => ({ name: item.name, source: item.source, type: label }));
  }

  const total = Object.values(results).reduce((acc, arr) => acc + arr.length, 0);
  res.json({ query: q, total, results });
});

export default router;
