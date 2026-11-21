# Asset sources — 2026-08-14 Hopinn homepage prototype

## Paper artboard G2M-0

File `Hopinn ideas`, page `Epic 2 — Главный лендинг`, node `G2M-0`.
https://app.paper.design/file/01KY726806KNNEMK9C3VVPC88G/7-0/G2M-0

- `paper/skyline.png` — panoramic St. Petersburg skyline (user export `image 214.png`, 2026-08-14). Transparent ground, shown full-width above search without side-crop.
- `illust/hopinn-muted/` — the only illustration pack, see `illust/SOURCES.md`
- `logos/*.png` — partner marks for the «Среди наших отелей» grid (6 brands from the original Epic 2 set). Dark-on-transparent on white cells. Examples, not a shortlist of “your hotel”.
  - `corinthia.png`, `w-hotels.png`, `four-seasons.png` — processed locally from the brands' public marks
  - `so-hotels.png` — Wikimedia Commons `Logo SO Hotels.svg` (PD-textlogo)
  - `radisson.png` — Wikimedia Commons `Radisson Hotels logo.svg` (PD-textlogo)
  - `domina.png` — official Domina St. Petersburg header mark (`spb.dominarussia.com`)

## Photos

`photos/hotel-teaser-01.jpg` … `04.jpg` — Hopinn DS teaser photos from `projects/hopinn/design-system/web/public/photos/` (synthetic listings, names hidden).
`photos/hotel-map-petrogradsky.jpg`, `hotel-map-teaser.jpg` — районная карта с Paper artboard `9T3-0` (OSM-стиль; ODbL).

Review avatars (`reviews/*.jpg`) — Openverse, CC BY 2.0, commercial-safe. See `reviews/SOURCES.md`.

## Map

Results map: MapLibre GL JS (engine behind [mapcn](https://mapcn.dev)) + Carto Positron light style (`basemaps.cartocdn.com/gl/positron-gl-style`). `spb-districts.json` now contains 18 draft Hopinn booking zones derived from OSM administrative boundaries via Nominatim (OpenStreetMap contributors, ODbL; source simplification `polygon_threshold=0.00025`). Internal cuts are product geometry, not official neighbourhood boundaries. Provenance and generation: [BOOKING-ZONES.md](../../../../BOOKING-ZONES.md).

## UI icons

**Lucide** (ISC) — обычные UI-иконки: удобства, фильтры, сортировка, пешком/машина, слои карты (landmark / train-front / plane). См. `lucide/SOURCES.md`.

**Метро СПб** — `icons/metro-spb.svg` (Wikimedia), не Lucide: фирменный знак петербургского метро.

Filled Calendar / price-tag / shield в поисковой полосе — инлайн из Paper JSX G2M-0 (не трогали). Фото и логотипы — без изменений.
