// Figure 1: the feasible set builds up from four half-planes. Points that violate a new
// inequality drop out; all connections between the remaining points stay inside the set.
import { CORNER_NAMES, LIMITS, VERTICES, clipHalfPlane, intersection, satisfies, scatter, segmentInside } from './geometry.mjs';
import { add, scale } from '../zentralpfad/math.mjs';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const RECT = [-4.9, 4.9, -3.25, 3.35];
const HEIGHT = 458;
const S = 680 / (RECT[1] - RECT[0]);
const X = x => (x - RECT[0]) * S, Y = y => (RECT[3] - y) * S;
const SUBSCRIPT = '₁₂₃₄';
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let stage = 0, points = [], run = 0;

function el(tag, attributes, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}
const pointsAttr = polygon => polygon.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
const rectPolygon = () => [[RECT[0], RECT[2]], [RECT[1], RECT[2]], [RECT[1], RECT[3]], [RECT[0], RECT[3]]];
const inequality = i => `a${SUBSCRIPT[i]}ᵀx ≤ b${SUBSCRIPT[i]}`;
const halfSpace = i => `ℋ${SUBSCRIPT[i]}`;
// ℝ², ℋ₁, ℋ₁ ∩ ℋ₂, … and finally 𝒳 = ℋ₁ ∩ ℋ₂ ∩ ℋ₃ ∩ ℋ₄
const setName = k => k === 0 ? 'ℝ²' : `${k === 4 ? '𝒳 = ' : ''}${Array.from({ length: k }, (_, i) => halfSpace(i)).join(' ∩ ')}`;
const cross = (p, size, parent) => el('path', {
  d: `M${X(p[0]) - size},${Y(p[1]) - size}L${X(p[0]) + size},${Y(p[1]) + size}M${X(p[0]) - size},${Y(p[1]) + size}L${X(p[0]) + size},${Y(p[1]) - size}`,
  stroke: '#b95a28', 'stroke-width': 2.4 }, parent);

function drawGrid() {
  for (let x = Math.ceil(RECT[0]); x <= RECT[1]; x++) el('line', { x1: X(x), x2: X(x), y1: 0, y2: HEIGHT, class: x === 0 ? 'zero' : '' }, $('grid'));
  for (let y = Math.ceil(RECT[2]); y <= RECT[3]; y++) el('line', { x1: 0, x2: 680, y1: Y(y), y2: Y(y), class: y === 0 ? 'zero' : '' }, $('grid'));
}

// Hatched outside, boundary line, outward normal a_i at the edge of ABCD and the inequality.
function drawBound(i, fresh) {
  const { a, b } = LIMITS[i];
  const group = el('g', { opacity: fresh && !still ? 0 : 1 }, $('bounds'));
  const hatch = el('polygon', { points: pointsAttr(clipHalfPlane(rectPolygon(), [-a[0], -a[1]], -b)), fill: 'url(#hatch)', opacity: fresh && !still ? 0 : 0.55 }, $('cuts'));
  const onLine = clipHalfPlane(rectPolygon(), a, b).filter(p => Math.abs(a[0] * p[0] + a[1] * p[1] - b) < 1e-9);
  const [p, q] = [onLine[0], onLine[onLine.length - 1]];
  el('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(q[0]), y2: Y(q[1]), stroke: '#426f6b', 'stroke-width': 1.8 }, group);
  const mid = scale(add(VERTICES[i], VERTICES[(i + 1) % 4]), 0.5), tip = add(mid, scale(a, 0.62));
  el('line', { x1: X(mid[0]), y1: Y(mid[1]), x2: X(tip[0]), y2: Y(tip[1]), stroke: '#426f6b', 'stroke-width': 2.2, 'marker-end': 'url(#arrow-green)' }, group);
  // beside the arrow tip for a sideways normal, beyond it for an upward or downward one
  const sideways = Math.abs(a[0]) > Math.abs(a[1]);
  const at = add(tip, scale(a, sideways ? 0.14 : 0.34));
  const anchor = sideways ? (a[0] > 0 ? 'start' : 'end') : 'middle';
  el('text', { x: X(at[0]), y: Y(at[1]) + 5, 'text-anchor': anchor, style: 'fill:#426f6b;font-weight:bold;paint-order:stroke;stroke:#faf9f6;stroke-width:3px' }, group)
    .textContent = inequality(i);
  if (fresh && !still) {
    for (const node of [group, hatch]) node.style.transition = 'opacity .5s';
    requestAnimationFrame(() => requestAnimationFrame(() => { group.setAttribute('opacity', 1); hatch.setAttribute('opacity', 0.55); }));
  }
}

const visible = () => points.filter(p => satisfies(p, LIMITS.slice(0, stage)));

// Draws the set after `stage` inequalities; with `preview` the next inequality is shown as well
// and the points it removes are crossed out.
function render(preview = null) {
  $('cuts').replaceChildren();
  $('bounds').replaceChildren();
  for (let i = 0; i < stage; i++) drawBound(i, false);
  if (preview !== null) drawBound(preview, true);
  $('feasible').setAttribute('points', pointsAttr(intersection(RECT, LIMITS, stage)));
  const shown = visible(), active = LIMITS.slice(0, stage);
  const doomed = new Set(preview === null ? [] : shown.filter(p => !satisfies(p, [LIMITS[preview]])));
  $('segments').replaceChildren();
  $('points').replaceChildren();
  let inside = 0, total = 0;
  shown.forEach((p, i) => shown.slice(i + 1).forEach(q => {
    const ok = segmentInside(p, q, active), leaving = doomed.has(p) || doomed.has(q);
    total++;
    if (ok) inside++;
    el('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(q[0]), y2: Y(q[1]), stroke: ok && !leaving ? '#173fbe' : '#b95a28',
      'stroke-width': 1.1, 'stroke-opacity': leaving ? 0.3 : 0.42, 'stroke-dasharray': leaving ? '3 3' : 'none' }, $('segments'));
  }));
  for (const p of shown) {
    if (doomed.has(p)) cross(p, 6, $('points'));
    else el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5, fill: '#173fbe', stroke: '#faf9f6', 'stroke-width': 1.5 }, $('points'));
  }
  $('corners').replaceChildren();
  if (stage === 4) {
    VERTICES.forEach((v, i) => {
      const [dx, dy] = [[-16, 18], [8, 18], [8, -8], [-16, -8]][i];
      el('text', { x: X(v[0]) + dx, y: Y(v[1]) + dy, style: 'fill:#252525;font-weight:bold' }, $('corners')).textContent = CORNER_NAMES[i];
    });
  }
  document.querySelectorAll('.steps button').forEach(button => {
    if (Number(button.dataset.step) === stage) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('live-state').textContent = `Schritt ${stage} von 4`;
  $('set-label').textContent = setName(stage);
  // only for screen readers; the drawing itself carries no explanatory text
  $('status').textContent = preview !== null
    ? `${halfSpace(preview)} kommt hinzu, ${doomed.size} Punkte fallen weg.`
    : `${setName(stage)}: ${shown.length} Punkte, ${inside} von ${total} Verbindungen in der Menge.`;
}

async function play() {
  const token = ++run;
  $('play').setAttribute('aria-pressed', 'true');
  $('play').textContent = '■ Anhalten';
  if (stage === 4) { stage = 0; render(); if (!still) await sleep(900); }
  while (stage < 4 && token === run) {
    render(stage);
    if (!still) await sleep(1200);
    if (token !== run) return;
    stage++;
    render();
    if (!still) await sleep(1400);
  }
  if (token === run) stop();
}

function stop() {
  run++;
  $('play').setAttribute('aria-pressed', 'false');
  $('play').textContent = '▶ Aufbau abspielen';
}

$('play').addEventListener('click', () => {
  if ($('play').getAttribute('aria-pressed') === 'true') { stop(); render(); } else play();
});
document.querySelectorAll('.steps button').forEach(button => button.addEventListener('click', () => {
  stop();
  stage = Number(button.dataset.step);
  render();
}));
$('shuffle').addEventListener('click', () => { stop(); points = scatter(Date.now(), RECT, LIMITS, 7, 11); render(); });
$('clear').addEventListener('click', () => { stop(); points = []; render(); });

$('plot').addEventListener('click', event => {
  const local = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  const p = [RECT[0] + local.x / S, RECT[3] - local.y / S];
  stop();
  const active = LIMITS.slice(0, stage);
  if (satisfies(p, active)) {
    if (points.length < 40) points.push(p);
    render();
    return;
  }
  render();
  // an infeasible click shows a cross and the half-space it misses, e.g. "∉ ℋ₂"
  const violated = active.findIndex(limit => !satisfies(p, [limit]));
  const mark = el('g', {}, $('points'));
  cross(p, 7, mark);
  el('text', { x: X(p[0]) + 12, y: Y(p[1]) - 10, style: 'fill:#b95a28;font-weight:bold;paint-order:stroke;stroke:#faf9f6;stroke-width:3px' }, mark)
    .textContent = `∉ ${halfSpace(violated)}`;
  $('status').textContent = `Der Punkt liegt nicht in ${halfSpace(violated)}, er verletzt ${inequality(violated)}.`;
  setTimeout(() => mark.remove(), 1800);
});

drawGrid();
points = scatter(7, RECT, LIMITS, 7, 11);
if (still) stage = 4;
render();
if (!still) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); play(); }
  }, { threshold: 0.45 });
  observer.observe($('plot'));
}

new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil($('experiment').getBoundingClientRect().height + 16)}px`;
}).observe($('experiment'));
