// Dotted wave field for the home hero: a slowly breathing surface of points, drawn on canvas.
// Still frame when the viewer prefers reduced motion; paused when the tab is hidden.
export function mountHeroArt(canvas) {
  const ctx = canvas.getContext('2d');
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const COLS = 54, ROWS = 30;
  let w = 0, h = 0, raf = 0, t0 = performance.now(), last = 0;

  const size = () => {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const rgb = () => getComputedStyle(document.documentElement).getPropertyValue('--hero-dot').trim() || '12, 17, 29';

  function frame(t) {
    const c = rgb();
    ctx.clearRect(0, 0, w, h);
    const time = t / 1000;
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const u = i / (COLS - 1) - 0.5, v = j / (ROWS - 1) - 0.5;
        // two interfering waves — a nod to summed oscillations in EEG
        const z = 0.12 * Math.sin(u * 6 + time * 0.55) * Math.cos(v * 4.5 - time * 0.35) + 0.05 * Math.sin((u + v) * 10 + time * 0.8);
        // tilt the sheet and project with a little perspective
        const y3 = v * 0.9 + z * 0.9, depth = 1.6 + v * 1.1 - z;
        const px = w * 0.56 + (u * w * 1.25) / depth, py = h * 0.5 + (y3 * h * 1.5) / depth;
        if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;
        const near = Math.max(0, Math.min(1, 1.5 - depth * 0.55));
        ctx.fillStyle = `rgba(${c}, ${0.07 + near * 0.42})`;
        ctx.beginPath(); ctx.arc(px, py, 0.45 + near * 0.95, 0, 6.283); ctx.fill();
      }
    }
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (document.hidden || t - last < 33) return; // ~30 fps is plenty for a slow wave
    last = t; frame(t - t0);
  }
  const onResize = () => { size(); frame(performance.now() - t0); };
  size(); frame(2400);
  if (!still) raf = requestAnimationFrame(loop);
  addEventListener('resize', onResize);
  return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
}
