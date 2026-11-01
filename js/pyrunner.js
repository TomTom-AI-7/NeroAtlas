// Optional in-browser Python via Pyodide, loaded lazily from the jsDelivr CDN on first use.
const PYODIDE_VERSION = '0.26.4';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
let loading = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = Object.assign(document.createElement('script'), { src, async: true });
    s.onload = resolve; s.onerror = () => reject(new Error('Could not load Pyodide (offline?)'));
    document.head.appendChild(s);
  });
}

async function getPyodide() {
  if (!loading) loading = (async () => { await loadScript(BASE + 'pyodide.js'); return globalThis.loadPyodide({ indexURL: BASE }); })();
  try { return await loading; } catch (e) { loading = null; throw e; }
}

/** Run code; returns combined stdout/stderr text. */
export async function runPython(code, packages = []) {
  const py = await getPyodide();
  const pk = packages.map(p => (p === 'scikit-learn' ? 'scikit-learn' : p));
  if (pk.length) await py.loadPackage(pk);
  let out = '';
  py.setStdout({ batched: s => { out += s + '\n'; } });
  py.setStderr({ batched: s => { out += s + '\n'; } });
  try { await py.runPythonAsync(code); }
  catch (e) { out += String(e.message || e); }
  return out.trim() || '(no output)';
}
