import { matrix, constraints, slacks, objective, safePolygonMove, safeInitialMove, validInitial, pathFractions, indexAt, add, sub, scale } from './math.mjs';
import { centralPath } from './barrier.mjs';

const $ = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
const vertices0 = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const initial0 = [-1, -0.8];
const presets = {
  edge: { z: [2.8, 1.2], k1: 1, k2: 3, angle: -25 },
  corner: { z: [3.4, 3.3], k1: 2, k2: 1, angle: 20 },
  inside: { z: [0.8, -0.6], k1: 1, k2: 4.5, angle: 35 }
};
const defaults = () => ({ ...structuredClone(presets.edge), vertices: structuredClone(vertices0), initial: [...initial0] });
let state = defaults();
// progress in [0, 1] is the share of the path length drawn, so playback moves evenly along the
// path. It selects one of the computed barrier optima: 0 is mu = 10^3 at x0, 1 is mu = 10^-3.
let solution, q, progress = 0;
let playing = false, lastTime = 0, drag = null, scheduled = false, animationFrame = null;
const bounds = 4.1, unit = 602 / (2 * bounds);
const point = p => [42 + (p[0] + bounds) * unit, 24 + (bounds - p[1]) * unit];
const pair = p => point(p).map(v => v.toFixed(3)).join(',');
const pathData = points => points.map((p, i) => `${i ? 'L' : 'M'}${pair(p)}`).join(' ');
const clamp = v => Math.max(-3.65, Math.min(3.65, v));
const compact = v => Math.abs(v) < 0.001 && v !== 0 ? v.toExponential(2) : v.toFixed(3);
const move = (id, p) => $(id).setAttribute('transform', `translate(${pair(p)})`);
// Node 0 of the drawn polyline is x0 itself; node k + 1 is the optimum for the k-th mu.
const frameIndex = () => Math.max(0, indexAt(solution.fractions, progress) - 1);
function element(tag, attributes = {}, parent) {
  const el = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
  if (parent) parent.append(el);
  return el;
}

// The plot uses identical scales on both axes, including on narrow screens.
for (let value = -4; value <= 4; value++) {
  const [x] = point([value, 0]), [, y] = point([0, value]);
  element('line', { x1: x, x2: x, y1: 24, y2: 626, class: value === 0 ? 'zero' : '' }, $('grid'));
  element('line', { y1: y, y2: y, x1: 42, x2: 644, class: value === 0 ? 'zero' : '' }, $('grid'));
  element('text', { x, y: 646, 'text-anchor': 'middle' }, $('grid')).textContent = value;
  element('text', { x: 31, y: y + 4, 'text-anchor': 'end' }, $('grid')).textContent = value;
}
for (let i = 0; i < 4; i++) {
  element('line', { id: `edge-line-${i}` }, $('edges'));
  for (const kind of ['vertex', 'edge']) {
    const name = kind === 'vertex' ? `Ecke ${'ABCD'[i]}` : `Kante ${'ABCD'[i]}${'ABCD'[(i + 1) % 4]}`;
    const handle = element('g', { id: `${kind}-${i}`, class: 'handle', tabindex: 0, role: 'button', 'aria-label': `${name} mit Pfeiltasten verschieben`, 'data-kind': kind, 'data-index': i }, $('handles'));
    element('circle', { r: 20, class: 'hit-area' }, handle);
    element(kind === 'vertex' ? 'circle' : 'rect', kind === 'vertex'
      ? { r: 6.5, class: 'grip' } : { x: -4, y: -4, width: 8, height: 8, class: 'grip' }, handle);
    if (kind === 'vertex') element('text', { x: -15, y: -13 }, handle).textContent = 'ABCD'[i];
  }
}

const controls = [
  ['target-x', () => state.z[0], v => { state.z[0] = v; }],
  ['target-y', () => state.z[1], v => { state.z[1] = v; }],
  ['curvature-one', () => state.k1, v => { state.k1 = v; }],
  ['curvature-two', () => state.k2, v => { state.k2 = v; }],
  ['angle', () => state.angle, v => { state.angle = v; }]
];
function syncControls() {
  controls.forEach(([id, get]) => {
    $(id).value = get();
    $(`${id}-value`).value = id === 'angle' ? `${get().toFixed(0)}°` : get().toFixed(2);
  });
  $('initial-x').value = state.initial[0].toFixed(3);
  $('initial-y').value = state.initial[1].toFixed(3);
}
function drawGeometry() {
  const polygon = state.vertices.map(pair).join(' ');
  $('feasible').setAttribute('points', polygon);
  $('clip-polygon').setAttribute('points', polygon);
  state.vertices.forEach((p, i) => {
    const next = state.vertices[(i + 1) % 4], [x1, y1] = point(p), [x2, y2] = point(next);
    Object.entries({ x1, y1, x2, y2 }).forEach(([key, value]) => $(`edge-line-${i}`).setAttribute(key, value));
    move(`vertex-${i}`, p); move(`edge-${i}`, scale(add(p, next), 0.5));
    $(`vertex-${i}`).setAttribute('aria-label', `Ecke ${'ABCD'[i]}: ${p[0].toFixed(2)}, ${p[1].toFixed(2)}. Mit Pfeiltasten verschieben.`);
  });
  move('target-handle', state.z);
  move('initial-handle', state.initial);
  $('initial-handle').setAttribute('aria-label', `Anfangspunkt x₀: ${state.initial[0].toFixed(3)}, ${state.initial[1].toFixed(3)}. Mit Pfeiltasten verschieben.`);
  $('target-handle').setAttribute('aria-label', `Zielpunkt z: ${state.z[0].toFixed(2)}, ${state.z[1].toFixed(2)}. Mit Pfeiltasten verschieben.`);
  for (const id of ['contours-outside', 'contours-inside']) {
    const group = $(id); group.replaceChildren();
    const [cx, cy] = point(state.z);
    for (const level of [0.15, 0.35, 0.7, 1.3, 2.4, 4.2, 7, 11, 17, 25, 38, 56, 82]) {
      element('ellipse', { cx, cy, rx: Math.sqrt(2 * level / state.k1) * unit, ry: Math.sqrt(2 * level / state.k2) * unit, transform: `rotate(${-state.angle} ${cx} ${cy})` }, group);
    }
  }
  move('optimum-marker', solution.optimum);
}
// The path grows with falling mu: from x0 up to the exact barrier optimum for the selected mu.
function draw() {
  if (!solution) return;
  const last = solution.points.length - 1, index = frameIndex();
  const { x, mu } = solution.points[index];
  $('central-path').setAttribute('d', pathData([state.initial, ...solution.points.slice(0, index + 1).map(p => p.x)]));
  move('current-marker', x);
  const [cx, cy] = point(x); $('glow').setAttribute('cx', cx); $('glow').setAttribute('cy', cy);
  // The label moves to the left near the target so that it never covers the label of z.
  const textToLeft = x[0] > 2.5 || Math.hypot(...sub(x, state.z)) < 1.1;
  $('current-label').setAttribute('x', textToLeft ? -13 : 13);
  $('current-label').setAttribute('text-anchor', textToLeft ? 'end' : 'start');
  $('progress').value = Math.round(progress * 1000);
  $('progress').setAttribute('aria-valuetext', `Barriereparameter ${mu.toPrecision(3)}`);
  $('mu-value').value = `μ = ${mu.toExponential(2)}`;
  $('position-value').value = `(${x[0].toFixed(3)}, ${x[1].toFixed(3)})`;
  $('cost-value').value = compact(objective(x, q, state.z));
  $('distance-value').value = compact(Math.hypot(...sub(x, solution.optimum)));
  $('slack-value').value = compact(Math.min(...slacks(x, solution.limits)));
  $('live-state').textContent = playing ? 'Animation läuft' : index === last ? 'μ = 10⁻³ · Ende' : 'Parameter veränderbar';
}
function recalculate() {
  // The current mu survives a change of the problem; only its position on the slider moves.
  const index = solution ? frameIndex() : 0;
  try {
    q = matrix(state.k1, state.k2, state.angle);
    solution = centralPath(state.vertices, q, state.z, state.initial);
    solution.fractions = pathFractions([state.initial, ...solution.points.map(p => p.x)]);
    progress = index === 0 ? 0 : solution.fractions[index + 1];
    syncControls(); drawGeometry(); draw();
    $('experiment').dataset.ready = 'true';
  } catch (error) {
    setPlaying(false); $('feedback').textContent = error.message;
    $('experiment').dataset.ready = 'false';
  }
}
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; recalculate(); });
}
function setPlaying(value) {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  playing = value; lastTime = 0;
  $('play').textContent = value ? 'Ⅱ Pause' : '▶ Abspielen';
  $('play').setAttribute('aria-pressed', String(value));
  $('live-state').textContent = value ? 'Animation läuft' : 'Pausiert';
  if (playing) animationFrame = requestAnimationFrame(animate);
}
function animate(time) {
  if (playing) {
    if (lastTime) {
      const elapsed = Math.min(time - lastTime, 100) * Number($('speed').value);
      progress = Math.min(1, progress + elapsed / 10000);
    }
    lastTime = time;
    draw();
    if (progress === 1) setPlaying(false);
  }
  if (playing) animationFrame = requestAnimationFrame(animate);
}
controls.forEach(([id, , set]) => $(id).addEventListener('input', () => {
  set(Number($(id).value)); $('feedback').textContent = ''; schedule();
}));
for (const [id, index] of [['initial-x', 0], ['initial-y', 1]]) {
  $(id).addEventListener('change', () => {
    const desired = [...state.initial]; desired[index] = $(id).valueAsNumber;
    if (!validInitial(state.vertices, desired) || desired.some(v => Math.abs(v) > 3.6)) {
      $('initial-feedback').textContent = 'Bitte einen Punkt im Viereck mit mindestens 0,05 Abstand zum Rand eingeben.';
      syncControls(); return;
    }
    setPlaying(false); state.initial = desired; $('initial-feedback').textContent = ''; recalculate();
  });
}
$('progress').addEventListener('input', () => {
  setPlaying(false); progress = $('progress').valueAsNumber / 1000; draw();
});
$('play').addEventListener('click', () => { if (progress === 1) progress = 0; setPlaying(!playing); });
$('rewind').addEventListener('click', () => { setPlaying(false); progress = 0; draw(); });
$('preset').addEventListener('change', () => {
  setPlaying(false); state = { ...state, ...structuredClone(presets[$('preset').value]) };
  $('feedback').textContent = ''; recalculate();
});
$('reset').addEventListener('click', () => {
  setPlaying(false); state = defaults(); progress = 0;
  $('preset').value = 'edge'; $('feedback').textContent = ''; $('initial-feedback').textContent = ''; recalculate();
});
$('reset-polygon').addEventListener('click', () => {
  if (!validInitial(vertices0, state.initial)) {
    $('feedback').textContent = 'Der Anfangspunkt liegt außerhalb des ursprünglichen Vierecks. Verschiebe zuerst x₀ oder setze alles zurück.';
    return;
  }
  state.vertices = structuredClone(vertices0); $('feedback').textContent = ''; recalculate();
});

function worldPosition(event) {
  const p = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  return [(p.x - 42) / unit - bounds, bounds - (p.y - 24) / unit];
}
function modify(kind, index, delta, before, originalTarget, originalInitial) {
  if (kind === 'initial') {
    const desired = add(originalInitial, delta).map(v => Math.max(-3.6, Math.min(3.6, v)));
    state.initial = safeInitialMove(state.vertices, originalInitial, desired);
    $('initial-feedback').textContent = Math.hypot(...sub(desired, state.initial)) > 1e-4 ? 'x₀ bleibt mit etwas Abstand im Inneren.' : '';
    return;
  }
  if (kind === 'target') {
    state.z = add(originalTarget, delta).map(v => Math.max(-3.6, Math.min(3.6, v)));
    return;
  }
  const desired = before.map(p => [...p]);
  if (kind === 'edge') {
    // Moving an edge handle translates the edge along its outward normal.
    const a = constraints(before)[index].a;
    const distance = delta[0] * a[0] + delta[1] * a[1];
    for (const i of [index, (index + 1) % 4]) desired[i] = add(before[i], scale(a, distance)).map(clamp);
  } else desired[index] = add(before[index], delta).map(clamp);
  state.vertices = safePolygonMove(before, desired, state.initial);
  const limited = state.vertices.some((p, i) => Math.hypot(...sub(p, desired[i])) > 1e-4);
  $('feedback').textContent = limited ? 'Die Grenze ist erreicht: Das Viereck bleibt konvex und x₀ strikt im Inneren. Der Anfangspunkt bleibt unverändert.' : '';
}
$('plot').addEventListener('pointerdown', event => {
  const handle = event.target.closest('.handle');
  if (!handle) return;
  event.preventDefault(); setPlaying(false); handle.focus({ preventScroll: true });
  drag = { kind: handle.dataset.kind, index: Number(handle.dataset.index), start: worldPosition(event), vertices: structuredClone(state.vertices), target: [...state.z], initial: [...state.initial], id: event.pointerId, handle };
  handle.setPointerCapture(event.pointerId);
});
$('plot').addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  modify(drag.kind, drag.index, sub(worldPosition(event), drag.start), drag.vertices, drag.target, drag.initial); schedule();
});
function endDrag() { drag = null; }
$('plot').addEventListener('pointerup', endDrag);
$('plot').addEventListener('pointercancel', endDrag);
$('plot').addEventListener('lostpointercapture', endDrag);
$('plot').addEventListener('keydown', event => {
  const handle = event.target.closest('.handle');
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (!handle || !directions[event.key]) return;
  event.preventDefault(); setPlaying(false);
  modify(handle.dataset.kind, Number(handle.dataset.index), scale(directions[event.key], event.shiftKey ? 0.02 : 0.12), state.vertices, state.z, state.initial);
  recalculate();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
// Only resize this same-origin embed. The standalone demo uses its natural page height.
new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil($('experiment').getBoundingClientRect().height + 16)}px`;
}).observe($('experiment'));
recalculate();
