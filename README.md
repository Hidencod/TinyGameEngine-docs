# Tiny Game Engine — Documentation

User documentation for [Tiny Game Engine](https://hidencod.github.io/tge-assets/), the mobile-first 3D game engine and editor. Built with [Docusaurus](https://docusaurus.io).

## Develop

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # static site in build/
```

## Screenshots and reference data

Every screenshot is captured automatically from the real editor in a phone-sized browser,
and the reference pages (conditions, actions, expressions, scripting API) are generated from the engine source.
Both need the editor's dev server running (in the TinyGameEngine repo):

```bash
npx vite --port 5199 --strictPort
```

Then, in this repo:

| Command | What it does |
| --- | --- |
| `npm run docs:shots` | Capture all screenshots → `static/img/shots/*.webp` |
| `npm run docs:shots -- editor events` | Only scenarios whose file name matches |
| `npm run docs:shots -- --shot=inspector` | Only shots whose name contains the text |
| `npm run docs:data` | Dump ACEs, expressions, API docs… from the engine → `src/data/*.json` |
| `npm run docs:reference` | Regenerate `docs/reference/{conditions,actions,expressions,scripting-api}.mdx` |

Scenarios live in `tools/capture/scenarios/`; helpers (highlights, numbered badges, crops) in `tools/capture/lib.mjs`.

## Writing pages

MDX components available on every page (`src/components/Shots.tsx`):

- `<Phone name="shot-name" caption="…" />` — a screenshot in a phone frame
- `<Crop name="card-mesh" width={360} />` — a cropped screenshot
- `<Row>…</Row>` — screenshots side by side
- `<Side shot="…">text</Side>` — text with a screenshot on the right
- `<Step n={1} title="…">…</Step>` — a numbered step
- `<Legend items={[…]} />` — explains the numbered red badges on a screenshot

## Deploy

Connected to Vercel: every push to `main` deploys.
