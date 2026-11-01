// Widget registry. To add a visual: export a function (el, props, ctx) => cleanup from a module and list it here.
import { neuron, synchrony, brainmap, electrodes } from './neuro.js';
import { spectrum, sampling, filter, bands, artifacts } from './signal.js';
import { distribution, leakage, imbalance, confound, ci, multiple } from './stats.js';
import { pipeline, imrad } from './diagrams.js';

export const WIDGETS = { neuron, synchrony, brainmap, electrodes, spectrum, sampling, filter, bands, artifacts, distribution, leakage, imbalance, confound, ci, multiple, pipeline, imrad };
export const WIDGET_IDS = Object.keys(WIDGETS);

export function mountWidget(id, el, props, ctx) {
  const fn = WIDGETS[id];
  if (!fn) { el.textContent = `Unknown visual: ${id}`; return () => {}; }
  try { return fn(el, props || {}, ctx) || (() => {}); }
  catch (err) { console.error(err); el.textContent = 'Visual failed to load.'; return () => {}; }
}
