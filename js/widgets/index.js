// Widget registry. To add a figure: export a function (el, props, ctx) => cleanup and list it here.
import { neuron, synchrony, brainmap, electrodes } from './neuro.js';
import { spectrum, sampling, filter, bands, artifacts, stimulus } from './signal.js';
import { distribution, leakage, imbalance, confound, ci, multiple } from './stats.js';
import { pipeline, imrad } from './diagrams.js';

export const WIDGETS = { neuron, synchrony, brainmap, electrodes, spectrum, sampling, filter, bands, artifacts, distribution, leakage, imbalance, confound, ci, multiple, pipeline, imrad, stimulus };
export const WIDGET_IDS = Object.keys(WIDGETS);

const live = new Set();

export function mountWidget(id, el, props, ctx) {
  const rec = { id, el, props: props || {}, ctx, cleanup: () => {} };
  const run = () => {
    const fn = WIDGETS[id];
    if (!fn) { el.textContent = `Unknown figure: ${id}`; return; }
    try { rec.cleanup = fn(el, rec.props, ctx) || (() => {}); }
    catch (err) { console.error(err); el.textContent = 'Figure failed to load.'; }
  };
  rec.run = run; run(); live.add(rec);
  return () => { rec.cleanup(); live.delete(rec); };
}

/** Canvas and SVG labels are drawn in one language, so redraw figures in place after a language switch. */
export function remountAll() {
  for (const rec of [...live]) {
    if (!rec.el.isConnected) { rec.cleanup(); live.delete(rec); continue; }
    rec.cleanup(); rec.el.innerHTML = ''; rec.run();
  }
}
