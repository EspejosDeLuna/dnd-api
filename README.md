# Bertini's 5e API

API REST completa con todos los datos de D&D 5e 2014, construida sobre los datos de 5etools.

## Setup en 3 pasos

```bash
# 1. Instalá dependencias
npm install

# 2. Descargá los datos de 5etools (una sola vez, ~50MB)
node src/loaders/loadData.js

# 3. Arrancá la API
npm start
# → http://localhost:4000
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Bertini's 5e API v1.0"
git remote add origin https://github.com/TU_USUARIO/bertinis-5e-api.git
git push -u origin main
```

**Importante:** el `.gitignore` excluye la carpeta `/data` del repo.  
Los datos son ~50MB y los descargás con `node src/loaders/loadData.js`.

## Deploy (Railway / Render / VPS)

En cualquier plataforma con Node.js:

```bash
# Variables de entorno opcionales
PORT=4000   # default

# Comandos
npm install
node src/loaders/loadData.js   # descargar datos
npm start
```

En Railway/Render podés agregar `node src/loaders/loadData.js` como build command.

## Endpoints

### `GET /`
Info de la API y conteo de entidades disponibles.

### `GET /search?q=fireball`
Búsqueda global en todas las categorías.
- `?q=<texto>` requerido, mínimo 2 caracteres
- `?types=spells,items` filtrar categorías
- `?limit=5` resultados por categoría (default 5)

### `GET /spells`
Lista de hechizos con filtros:
- `?level=3` — nivel (0 = cantrip)
- `?class=Wizard` — hechizos de una clase
- `?school=EV` — escuela (EV, NE, CO, EN, IL, TR, AB, DI)
- `?ritual=true` — solo rituales
- `?concentration=true` — solo concentración

### `GET /spells/:name`
Un hechizo. Ej: `/spells/fireball` o `/spells/cure-wounds`

### `GET /classes`
Lista de clases.

### `GET /classes/:name`
Una clase completa con tabla de progresión.

### `GET /classes/:name/subclasses`
Subclases de una clase. Ej: `/classes/fighter/subclasses`

### `GET /classes/:name/spells`
Lista de hechizos disponibles para esa clase.

### `GET /races` · `GET /races/:name`
Razas y subraces.

### `GET /backgrounds` · `GET /backgrounds/:name`
Trasfondos.

### `GET /feats` · `GET /feats/:name`
Feats. Filtro: `?prerequisite=true`

### `GET /items` · `GET /items/:name`
Items. Filtros:
- `?type=S` (sword) / `?type=A` (armor) / etc.
- `?rarity=rare`
- `?magic=true` / `?magic=false`

### `GET /monsters` · `GET /monsters/:name`
Monstruos. Filtros:
- `?cr=5`
- `?type=undead`
- `?size=L`

### `GET /conditions` · `GET /conditions/:name`
Condiciones y enfermedades.

### `GET /actions`
Acciones de combate (Attack, Dash, Disengage, etc.)

## Parámetros globales (todos los endpoints de lista)

| Param | Descripción | Default |
|-------|-------------|---------|
| `?search=X` | Búsqueda parcial por nombre | — |
| `?source=PHB,XGE` | Filtrar por fuente | todos |
| `?page=N` | Número de página | 1 |
| `?limit=N` | Resultados por página (max 100) | 20 |

## Ejemplos

```bash
# Todos los cantrips de Wizard
curl "http://localhost:4000/spells?class=Wizard&level=0"

# Hechizos de concentración nivel 3
curl "http://localhost:4000/spells?level=3&concentration=true"

# Subclases del Fighter
curl "http://localhost:4000/classes/fighter/subclasses"

# Buscar "fireball" en todo
curl "http://localhost:4000/search?q=fireball"

# Monstruos CR 5
curl "http://localhost:4000/monsters?cr=5"

# Items mágicos raros
curl "http://localhost:4000/items?rarity=rare&magic=true&limit=50"

# Feat "Alert"
curl "http://localhost:4000/feats/alert"
```

## Actualizar datos

Cuando 5etools-mirror-3 saque una nueva versión:
```bash
node src/loaders/loadData.js
npm start
```
