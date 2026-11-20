# gta6-cover-art-7

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-7/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-7/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice City Dusk Cover Studio** — turn any photo and a caption into GTA 6-style cover art: the iconic multi-panel poster / loading-screen look with a Vice City neon-sunset grade, exported as a PNG to share. It runs fully offline in the desktop browser from its own static files — your photos never leave your machine, and every sample scene is drawn procedurally in code. No Rockstar Games logos, artwork or fonts anywhere.

## What it does

- **4 layout templates** — Hero Poster, Loading Screen, Split Panels, Story 9:16
- **Any photo** — upload your own, or try one of 4 original sample scenes drawn in code (beach sunset, city street, palm avenue, night car); per-panel crop and position by drag and scroll-zoom, sliders included, plus "fill all panels" and shuffle
- **Caption lettering in the genre's style** — big outlined title, neon-script subtitle, and a top tag, all editable
- **4 neon-dusk grades** — Sunset, Neon Night, Pastel Vice, Mono — with film grain and vignette
- **One-click PNG export in 4 post sizes** — Poster 4:5 (1080×1350), Story 9:16 (1080×1920), Square 1:1 (1080×1080), Wide 16:9 (1920×1080)
- **Undo / redo** for every edit, and a live preview that is the cover itself

## Run it

```sh
python3 -m http.server 8123 --directory app
# open http://localhost:8123/index.html
```

Or serve `app/` with any static server and open `index.html` in desktop Chrome. No build step, no network requests, no install.

## How it works

`app/app.js` renders the cover on a 2D canvas: each panel's photo is cover-fit with its own crop and zoom, the chosen grade is applied as composite gradient overlays (plus an optional grayscale filter for Mono), then grain, vignette, a white frame, and the caption lettering are drawn on top. Export renders the same pipeline at the chosen post size. `main.ts` (Node 22) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ecdsgx0z&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
