#!/usr/bin/env node
/**
 * Dump reference data (ACEs, expression functions, scripting API, behaviors…)
 * straight from the engine source, via the editor's Vite dev server.
 *
 *   (in TinyGameEngine)       npx vite --port 5199 --strictPort
 *   (in TinyGameEngine-docs)  npm run docs:data
 *
 * Writes src/data/*.json, then run `npm run docs:reference` to regenerate the reference pages.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const TGE = process.env.TGE_URL ?? 'http://localhost:5199';
const out = resolve(import.meta.dirname, '../../src/data');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(TGE + '/src/editor/code/dev.html').catch(() => page.goto(TGE));
const data = await page.evaluate(async () => {
  const aces = await import('/src/engine/events/aces.ts');
  const expr = await import('/src/engine/events/expr.ts');
  const props = await import('/src/engine/events/props.ts');
  const api = await import('/src/editor/code/apiDocs.ts');
  const snippets = await import('/src/editor/code/snippets.ts');
  const factory = await import('/src/shared/factory.ts');
  const meta = await import('/src/editor/inspector/meta.ts');
  const templates = await import('/src/editor/templates/index.ts');
  const strip = (a) => ({
    id: a.id, kind: a.kind, category: a.category, label: a.label, hint: a.hint ?? null, display: a.display,
    displayNoObject: a.displayNoObject ?? null, icon: a.icon, description: a.description, isTrigger: !!a.isTrigger,
    objectRequired: !!a.objectRequired, objectOptional: !!a.objectOptional, target: a.target,
    loop: a.cond?.loop ?? null, noInvert: !!a.cond?.noInvert, isWait: !!a.act?.wait,
    params: a.params.map((p) => ({ id: p.id, label: p.label, type: p.type, options: p.options ?? null, default: p.default ?? null, optional: !!p.optional, hint: p.hint ?? null, varScope: p.varScope ?? null })),
  });
  return {
    aces: {
      categories: aces.ACE_CATEGORIES, icons: aces.CATEGORY_ICONS,
      list: aces.ACES.filter((a) => a.kind !== 'expression').map(strip),
    },
    expressions: { functions: expr.EXPRESSION_FUNCTIONS, objectProps: expr.OBJECT_PROPS, builtins: expr.BUILTIN_NAMES, compareOps: expr.COMPARE_OPS, comparableProps: props.COMPARABLE_PROPS },
    api: { groups: api.API_GROUPS, lifecycle: api.LIFECYCLE, helpers: api.HELPERS, globals: api.GLOBALS, vec3: api.VEC3_MEMBERS },
    snippets: snippets.SNIPPETS,
    behaviors: { defaults: factory.BEHAVIOR_DEFAULTS, info: meta.BEHAVIOR_INFO },
    components: { info: meta.COMPONENT_INFO },
    particles: Object.entries(factory.PARTICLE_PRESETS).map(([id, p]) => ({ id, name: p.name, icon: p.icon, description: p.description })),
    uiPresets: Object.entries(factory.UI_PRESETS).map(([id, p]) => ({ id, name: p.name, kind: p.ui.kind })),
    templates: templates.TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.description, icon: t.icon })),
  };
});
for (const [k, v] of Object.entries(data)) writeFileSync(join(out, k + '.json'), JSON.stringify(v, null, 2) + '\n');
console.log('wrote', Object.keys(data).map((k) => k + '.json').join(', '));
await browser.close();
