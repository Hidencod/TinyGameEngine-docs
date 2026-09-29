/**
 * Helpers for driving the Tiny Game Engine editor in a phone-sized browser and
 * saving documentation screenshots (static/img/shots/<name>.webp).
 */
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

export const TGE = process.env.TGE_URL ?? 'http://localhost:5199';
export const OUT = resolve(import.meta.dirname, '../../static/img/shots');

/** Phone portrait (CSS px). Screenshots are taken at 2x. */
export const PHONE = { width: 400, height: 800 };
export const LANDSCAPE = { width: 860, height: 400 };

const HL_STYLE = `
.__hl{position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ff5a36;border-radius:12px;
  box-shadow:0 0 0 3px rgba(255,255,255,.85),0 0 0 9999px rgba(0,0,0,.28);}
.__hl.__soft{box-shadow:0 0 0 3px rgba(255,255,255,.85);}
.__hl-badge{position:fixed;z-index:2147483647;pointer-events:none;min-width:26px;height:26px;padding:0 7px;border-radius:13px;
  background:#ff5a36;color:#fff;font:700 15px/26px system-ui,sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.4);}
.__hl-note{position:fixed;z-index:2147483647;pointer-events:none;max-width:220px;padding:6px 10px;border-radius:8px;
  background:#ff5a36;color:#fff;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4);}
.__finger{position:fixed;z-index:2147483647;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
  background:rgba(255,90,54,.35);border:3px solid #ff5a36;box-shadow:0 0 0 3px rgba(255,255,255,.8);}
* { caret-color: transparent !important; }
`;

export class Shooter {
  constructor(page, { only = null, log = true } = {}) {
    this.page = page;
    this.only = only;
    this.log = log;
    this.count = 0;
  }

  /** Wait for sheet/dialog animations and rendering to settle. */
  async settle(ms = 450) { await this.page.waitForTimeout(ms); }

  async ensureStyle() {
    await this.page.evaluate((css) => {
      if (document.getElementById('__hlstyle')) return;
      const s = document.createElement('style'); s.id = '__hlstyle'; s.textContent = css; document.head.appendChild(s);
    }, HL_STYLE);
  }

  /**
   * Draw a highlight box around each target (locator or {x,y,w,h}) with an optional number or note.
   * opts.dim=false keeps the rest of the screen bright.
   */
  async highlight(targets, opts = {}) {
    await this.ensureStyle();
    const list = Array.isArray(targets) ? targets : [targets];
    const boxes = [];
    for (const t of list) {
      const item = t && t.target ? t : { target: t };
      let box = null;
      if (item.target && typeof item.target.boundingBox === 'function') {
        const loc = item.target.first();
        if (!item.noScroll) await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
        box = await loc.boundingBox({ timeout: 5000 }).catch(() => null);
      } else if (item.target) box = { x: item.target.x, y: item.target.y, width: item.target.w, height: item.target.h };
      if (!box) { console.warn('  ! highlight target not found', item.label ?? ''); continue; }
      boxes.push({ ...box, label: item.label ?? null, note: item.note ?? null, pad: item.pad ?? 4, side: item.side ?? 'auto', badge: item.badge ?? 'tl' });
    }
    await this.page.evaluate(({ boxes, dim }) => {
      const vw = innerWidth, vh = innerHeight;
      for (const b of boxes) {
        const d = document.createElement('div');
        d.className = '__hl' + (dim && boxes.length === 1 ? '' : ' __soft');
        d.style.left = b.x - b.pad + 'px'; d.style.top = b.y - b.pad + 'px';
        d.style.width = b.width + b.pad * 2 + 'px'; d.style.height = b.height + b.pad * 2 + 'px';
        document.body.appendChild(d);
        if (b.label != null) {
          const s = document.createElement('div'); s.className = '__hl-badge'; s.textContent = String(b.label);
          // Badge placement: top-left corner (default), right of the box, below it, or centered.
          let left = b.x - b.pad - 12, top = b.y - b.pad - 12;
          if (b.badge === 'right') { left = b.x + b.width + b.pad + 4; top = b.y + b.height / 2 - 13; }
          else if (b.badge === 'below') { left = b.x + b.width / 2 - 13; top = b.y + b.height + b.pad + 3; }
          else if (b.badge === 'center') { left = b.x + b.width / 2 - 13; top = b.y + b.height / 2 - 13; }
          left = Math.min(vw - 30, Math.max(2, left));
          top = Math.min(vh - 30, Math.max(2, top));
          s.style.left = left + 'px'; s.style.top = top + 'px';
          document.body.appendChild(s);
        }
        if (b.note) {
          const n = document.createElement('div'); n.className = '__hl-note'; n.textContent = b.note;
          document.body.appendChild(n);
          const r = n.getBoundingClientRect();
          let top = b.y + b.height + b.pad + 8;
          if (b.side === 'above' || (b.side === 'auto' && top + r.height > vh - 4)) top = b.y - b.pad - r.height - 8;
          const left = Math.min(vw - r.width - 6, Math.max(6, b.x + b.width / 2 - r.width / 2));
          n.style.left = left + 'px'; n.style.top = Math.max(4, top) + 'px';
        }
      }
    }, { boxes, dim: opts.dim !== false });
  }

  /** A finger marker at a point (for "tap here" / "drag from here"). */
  async finger(x, y) {
    await this.ensureStyle();
    await this.page.evaluate(({ x, y }) => {
      const d = document.createElement('div'); d.className = '__finger'; d.style.left = x + 'px'; d.style.top = y + 'px';
      document.body.appendChild(d);
    }, { x, y });
  }

  async clearMarks() {
    await this.page.evaluate(() => document.querySelectorAll('.__hl,.__hl-badge,.__hl-note,.__finger').forEach((e) => e.remove()));
  }

  /**
   * Save a screenshot. opts.clip: a locator to crop to (with opts.pad CSS px around it),
   * opts.hl: highlight targets (see highlight()), opts.dim.
   */
  async shot(name, opts = {}) {
    if (this.only && !this.only.some((o) => name.includes(o))) return;
    await this.page.mouse.move(-20, -20).catch(() => {});
    if (opts.wait !== 0) await this.settle(opts.wait ?? 350);
    if (!opts.toasts) await this.page.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
    if (opts.hl) await this.highlight(opts.hl, { dim: opts.dim });
    let clip;
    if (opts.clip) {
      const box = typeof opts.clip.boundingBox === 'function' ? await opts.clip.first().boundingBox() : opts.clip;
      if (box) {
        const pad = opts.pad ?? 8;
        const vp = this.page.viewportSize();
        const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad);
        clip = {
          x, y,
          width: Math.min(vp.width - x, box.width + pad * 2 + (opts.padRight ?? 0)),
          height: Math.min(vp.height - y, box.height + pad * 2 + (opts.padBottom ?? 0)),
        };
      }
    }
    const buf = await this.page.screenshot({ clip, animations: 'disabled', caret: 'hide' });
    await this.clearMarks();
    const file = join(OUT, name + '.webp');
    mkdirSync(dirname(file), { recursive: true });
    await sharp(buf).webp({ quality: 86, effort: 5 }).toFile(file);
    this.count++;
    if (this.log) console.log('  ✓', name);
  }
}

// ---------------------------------------------------------------------------
// Editor driving helpers
// ---------------------------------------------------------------------------

export function editorHelpers(page, s) {
  const H = {
    /** Open the app with a clean storage (fresh browser context expected). */
    async home() {
      await page.goto(TGE + '/');
      await page.waitForSelector('.home', { timeout: 30000 });
      await s.settle(800);
    },
    /** Topmost open sheet/dialog. */
    sheet: () => page.locator('.sheet-layer.open').last(),
    async waitSheet() { await page.locator('.sheet-layer.open').last().waitFor(); await s.settle(350); },
    async closeSheet() {
      const n = await page.locator('.sheet-layer').count();
      if (!n) return;
      await page.locator('.sheet-layer .sheet-backdrop').last().click({ position: { x: 10, y: 10 }, force: true });
      await s.settle(350);
    },
    async closeAllSheets() { for (let i = 0; i < 5 && (await page.locator('.sheet-layer').count()); i++) await H.closeSheet(); },
    /** Click an item in the open pick sheet. */
    async pick(label, { exact = false } = {}) {
      const sh = H.sheet();
      const item = sh.locator('.pick-item').filter({ has: page.locator('.pick-label', { hasText: exact ? new RegExp('^' + esc(label) + '$') : label }) }).first();
      await item.scrollIntoViewIfNeeded();
      await item.click();
      await s.settle(400);
    },
    pickItem: (label) => H.sheet().locator('.pick-item').filter({ has: page.locator('.pick-label', { hasText: label }) }).first(),
    /** Answer a prompt dialog. */
    async prompt(text) {
      const input = page.locator('.sheet-layer.open .prompt-input').last();
      await input.waitFor();
      await input.fill(text);
      await page.locator('.sheet-layer.open .dialog-actions .btn.primary').last().click();
      await s.settle(400);
    },
    async confirm(ok = true) {
      const dlg = page.locator('.sheet-layer.open .dialog-actions').last();
      await dlg.locator(ok ? '.btn.primary, .btn.danger' : '.btn:not(.primary):not(.danger)').first().click();
      await s.settle(400);
    },
    /** Create a project from a template and open it in the editor. */
    async newProject(template, name) {
      await page.getByRole('button', { name: /New project/ }).click();
      await H.waitSheet();
      await H.pick(template);
      await H.prompt(name ?? template);
      await page.waitForSelector('.editor', { timeout: 30000 });
      await s.settle(2500);
    },
    async tab(id) {
      await page.locator(`.tab[data-tab="${id}"]`).click();
      await s.settle(400);
    },
    tabBtn: (id) => page.locator(`.tab[data-tab="${id}"]`),
    treeRow: (name) => page.locator('.tree-row').filter({ has: page.locator('.tree-name', { hasText: new RegExp('^' + esc(name) + '$') }) }).first(),
    async select(name) {
      await H.tab('objects');
      const row = H.treeRow(name);
      await row.scrollIntoViewIfNeeded();
      await row.click();
      await s.settle(500);
    },
    /** Select an object and open its Inspector. */
    async inspect(name) { await H.select(name); await H.tab('inspector'); },
    card: (title) => page.locator('.card').filter({ has: page.locator('.card-title', { hasText: new RegExp('^' + esc(title) + '$') }) }).first(),
    async menu() { await page.getByRole('button', { name: 'Menu', exact: true }).click(); await H.waitSheet(); },
    async addObject(label) {
      await H.tab('objects');
      await page.locator('.objects-tab .tab-toolbar .btn.primary').click();
      await H.waitSheet();
      await H.pick(label, { exact: true });
      await s.settle(600);
    },
    /** Set the dock split (percentage of height given to the 3D view). */
    async split(pct) {
      await page.evaluate((pct) => {
        const prefs = JSON.parse(localStorage.getItem('tge:layout') || '{}');
        prefs.portrait = pct; prefs.landscape = pct; prefs.collapsed = false;
        localStorage.setItem('tge:layout', JSON.stringify(prefs));
        document.querySelector('.split')?.style.setProperty('--vp', pct + '%');
      }, pct);
      await s.settle(300);
    },
    /** Scroll an element into view inside its scroller, aligned to the top. */
    async scrollTo(loc, offset = 8) {
      await loc.first().evaluate((el, offset) => {
        let p = el.parentElement;
        while (p && !(p.scrollHeight > p.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
        if (p) p.scrollTop += el.getBoundingClientRect().top - p.getBoundingClientRect().top - offset;
      }, offset);
      await s.settle(250);
    },
    async openPanelById(id, args) {
      // Not exposed; panels open through the UI.
      throw new Error('openPanelById unsupported: ' + id + JSON.stringify(args ?? {}));
    },
  };
  return H;
}

export function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Find the red (x) or blue (z) move arrow of the gizmo on screen by its color.
 * Returns { from, to } in CSS px: from = near the gizmo center, to = the arrow tip.
 */
export async function findArrow(page, axis = 'x') {
  const vp = await page.locator('.split-viewport').boundingBox();
  const buf = await page.screenshot({ clip: vp, animations: 'disabled' });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const sc = info.width / vp.width;
  const red = [], blue = [];
  for (let y = 0; y < info.height; y += 2) for (let x = 0; x < info.width; x += 2) {
    const i = (y * info.width + x) * info.channels;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 215 && g < 110 && b < 120) red.push([x, y]);
    else if (b > 215 && r < 110 && g > 100 && g < 175) blue.push([x, y]);
  }
  const mine = axis === 'x' ? red : blue, other = axis === 'x' ? blue : red;
  if (mine.length < 20 || other.length < 20) return null;
  const c = other.reduce((a, p) => [a[0] + p[0] / other.length, a[1] + p[1] / other.length], [0, 0]);
  let near = mine[0], far = mine[0], dn = Infinity, df = -1;
  for (const p of mine) { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < dn) { dn = d; near = p; } if (d > df) { df = d; far = p; } }
  const toCss = (p) => ({ x: vp.x + p[0] / sc, y: vp.y + p[1] / sc });
  return { from: toCss(near), to: toCss(far) };
}

/** Drag a gizmo arrow outward by `amount` × its on-screen length. */
export async function dragArrow(page, axis = 'x', amount = 1.2) {
  const a = await findArrow(page, axis);
  if (!a) throw new Error('gizmo arrow not found: ' + axis);
  const dx = a.to.x - a.from.x, dy = a.to.y - a.from.y;
  const sx = a.from.x + dx * 0.45, sy = a.from.y + dy * 0.45;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) { await page.mouse.move(sx + dx * amount * i / 14, sy + dy * amount * i / 14); await page.waitForTimeout(25); }
  await page.mouse.up();
  await page.waitForTimeout(500);
  return { sx, sy, ex: sx + dx * amount, ey: sy + dy * amount };
}
