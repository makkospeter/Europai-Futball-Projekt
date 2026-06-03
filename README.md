# Euro Football Manager

Egy Vite + TypeScript alapú webalkalmazás európai futballklubok és meccsek kezelésére. A projekt célja a REST API kommunikáció, CRUD műveletek, kliens oldali validáció, hash routing és reszponzív UI gyakorlása.

## Használt technológiák

- Vite
- TypeScript strict módban
- HTML + natív CSS
- JSON Server REST API
- Git / GitHub

## Fő erőforrások

A `db.json` két fő gyűjteményt tartalmaz:

1. `clubs` – európai klubok adatai
2. `matches` – rangadók és európai kupameccsek

Mindkét erőforrás legalább 10 mintaadatot tartalmaz, és használható rajtuk a GET, POST, PUT és DELETE művelet.

## Funkciók

- Dashboard összesítő statisztikákkal
- Klubok listázása, keresése és ország szerinti szűrése
- Klub részletes nézet
- Klub létrehozása, szerkesztése és törlése
- Meccsek listázása, keresése és státusz szerinti szűrése
- Meccs részletes nézet
- Meccs létrehozása, szerkesztése és törlése
- Betöltési állapot és API hibaüzenet
- Üres állapot kezelése
- Kliens oldali form validáció mezőnkénti hibaüzenetekkel
- Hash routing: `#/clubs`, `#/clubs/1`, `#/matches`, `#/matches/1`
- Reszponzív layout mobil, tablet és asztali nézetre

## Telepítés és futtatás

```bash
npm install
```

JSON Server indítása külön terminálban:

```bash
npm run server
```

Vite fejlesztői szerver indítása másik terminálban:

```bash
npm run dev
```

Alkalmazás megnyitása:

```text
http://localhost:5173
```

API elérhetőség:

```text
http://localhost:3001/clubs
http://localhost:3001/matches
```

## Build

```bash
npm run build
```

## Ajánlott Git munkafolyamat

Példa branchek:

- `feature/project-setup`
- `feature/club-crud`
- `feature/match-crud`
- `feature/form-validation`
- `style/responsive-ui`

Példa commit üzenetek:

- `feat: create vite typescript project`
- `feat: add json server football data`
- `feat: implement club crud pages`
- `fix: validate match team selection`
- `style: improve mobile card layout`

## Csapattagok

- Név 1 – GitHub profil link
- Név 2 – GitHub profil link
- Név 3 – GitHub profil link

## Projektstruktúra

```text
src/
  api/          API hívások
  components/   UI renderelő függvények
  styles/       CSS fájlok
  types/        TypeScript interfészek és enumok
  utils/        DOM és form segédfüggvények
  main.ts       belépési pont és routing
```
