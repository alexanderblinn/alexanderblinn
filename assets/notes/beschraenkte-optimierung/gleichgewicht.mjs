// Figure 4: weight the gradients of the two active constraints at the corner x* = (1.6, 1.2) of the
// running example by hand until their sum equals -grad f(x*). If -grad f leaves the cone of the two
// gradients, no weights lambda >= 0 work; the smallest remaining rest is then a feasible descent
// direction d (Farkas, chapter 4 of the note).
import { CONSTRAINTS, cornerBalance } from './beispiel.mjs';
import { coneProjection } from './geometry.mjs';
import { el, fitFrame, label } from './zeichnung.mjs';
import { add, scale, sub } from '../zentralpfad/math.mjs';

const $ = id => document.getElementById(id);
const S = 120, X0 = -0.3, Y1 = 4.1, WIDTH = 680, HEIGHT = 450;
const X = x => (x - X0) * S, Y = y => (Y1 - y) * S;
const BALANCED = 0.03, LONGEST = 3.4;
const number = (v, digits = 2) => v.toFixed(digits).replace('.', ',').replace('-', '−');
const vector = v => `(${number(v[0])}; ${number(v[1])})`;
const COLOURS = { target: '#8a5979', green: '#426f6b', orange: '#b95a28', blue: '#173fbe' };
const sub2 = s => `<tspan dy="4" font-size="11">${s}</tspan><tspan dy="-4"></tspan>`;

const { corner, normals: [a1, a3], pull: defaultPull } = cornerBalance();
let pull = [...defaultPull];

function arrow(from, to, colour, parent, extra = {}) {
  if (Math.hypot(...sub(to, from)) < 1e-3) return null;
  return el('line', { x1: X(from[0]), y1: Y(from[1]), x2: X(to[0]), y2: Y(to[1]), stroke: COLOURS[colour],
    'stroke-width': 3, 'marker-end': `url(#arrow-${colour})`, 'stroke-linecap': 'round', ...extra }, parent);
}
const at = (p, content, colour, parent, anchor = 'start', weight = 'bold') => label(parent, X(p[0]), Y(p[1]), content, colour, anchor, weight);

function drawStatic() {
  for (let x = 0; x <= 5; x++) el('line', { x1: X(x), x2: X(x), y1: 0, y2: HEIGHT }, $('grid'));
  for (let y = 1; y <= 4; y++) el('line', { x1: 0, x2: WIDTH, y1: Y(y), y2: Y(y) }, $('grid'));
  const group = $('static');
  // the feasible set near the corner: inside the circle c1 = 0 and below the line c3 = 0
  const radius = CONSTRAINTS[0].radius, bottom = Y1 - HEIGHT / S;
  const arc = [];
  for (let t = Math.asin(1.2 / radius); t >= Math.asin(bottom / radius) - 1e-9; t -= 0.01) arc.push([radius * Math.cos(t), radius * Math.sin(t)]);
  $('feasible').setAttribute('points', [[X0, 1.2], ...arc, [radius * Math.cos(Math.asin(bottom / radius)), bottom], [X0, bottom]].map(p => `${X(p[0])},${Y(p[1])}`).join(' '));
  const far = 9;
  $('cone').setAttribute('points', [corner, add(corner, scale(a1, far)), add(corner, scale(add(a1, a3), far)), add(corner, scale(a3, far))]
    .map(p => `${X(p[0])},${Y(p[1])}`).join(' '));
  for (const a of [a1, a3]) el('line', { x1: X(corner[0]), y1: Y(corner[1]), x2: X(corner[0] + far * a[0]), y2: Y(corner[1] + far * a[1]), stroke: '#8a5979', 'stroke-opacity': 0.35, 'stroke-dasharray': '4 4' }, group);
  // the two active boundaries, beyond the corner faint
  const circlePath = (from, to) => Array.from({ length: 80 }, (_, k) => from + (k * (to - from)) / 79).map((t, k) => `${k ? 'L' : 'M'}${X(radius * Math.cos(t))} ${Y(radius * Math.sin(t))}`).join('');
  const cornerAngle = Math.atan2(corner[1], corner[0]);
  el('path', { d: circlePath(cornerAngle, 1.5), fill: 'none', stroke: '#9fb7b3', 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }, group);
  el('line', { x1: X(corner[0]), y1: Y(1.2), x2: WIDTH, y2: Y(1.2), stroke: '#9fb7b3', 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }, group);
  el('path', { d: circlePath(Math.asin(bottom / radius), cornerAngle), fill: 'none', stroke: '#426f6b', 'stroke-width': 2.6 }, group);
  el('line', { x1: X(X0), y1: Y(1.2), x2: X(corner[0]), y2: Y(1.2), stroke: '#426f6b', 'stroke-width': 2.6 }, group);
  at([0.1, 0.85], 'Ω', '#426f6b', group, 'start', 'normal');
  at([0.1, 1.32], `c${sub2('3')}(x) = 0`, '#426f6b', group);
  at([2.05, 0.55], `c${sub2('1')}(x) = 0`, '#426f6b', group);
  at([4.55, 3.82], 'Kegel', '#8a5979', group, 'end');
  at([5.2, 3.05], `Richtung ∇c${sub2('1')}(x*)`, '#8a5979', group, 'end', 'normal');
  at([1.72, 3.82], `Richtung ∇c${sub2('3')}(x*)`, '#8a5979', group, 'start', 'normal');
}

function render() {
  const l1 = Number($('lambda-1').value), l3 = Number($('lambda-3').value);
  $('lambda-1-value').textContent = number(l1);
  $('lambda-3-value').textContent = number(l3);
  const first = add(corner, scale(a1, l1)), sum = add(first, scale(a3, l3)), tip = add(corner, pull);
  const rest = sub(tip, sum), restLength = Math.hypot(...rest);
  const best = coneProjection(pull, a1, a3);
  const group = $('vectors');
  group.replaceChildren();
  // parallelogram: the other order of the two weighted gradients, faint
  el('polyline', { points: [corner, add(corner, scale(a3, l3)), sum].map(p => `${X(p[0])},${Y(p[1])}`).join(' '), fill: 'none', stroke: '#426f6b', 'stroke-opacity': 0.25, 'stroke-dasharray': '3 4' }, group);
  if (!best.inside) {
    arrow(corner, add(corner, best.residual), 'blue', group);
    at(add(add(corner, best.residual), [0.08, -0.15]), 'd', '#173fbe', group);
  }
  arrow(corner, tip, 'target', group);
  at(add(tip, [0.12, 0.06]), '−∇f(x*)', '#8a5979', group);
  arrow(corner, first, 'green', group);
  arrow(first, sum, 'green', group);
  if (l1 > 0.08) at(add(scale(add(corner, first), 0.5), [0.12, -0.12]), `λ${sub2('1')}∇c${sub2('1')}`, '#426f6b', group);
  if (l3 > 0.15) at(add(scale(add(first, sum), 0.5), [0.12, 0.0]), `λ${sub2('3')}∇c${sub2('3')}`, '#426f6b', group);
  if (restLength > 0.02) {
    arrow(sum, tip, 'orange', group, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    if (restLength > 0.3) at(add(scale(add(sum, tip), 0.5), [0.1, -0.05]), 'Rest', '#b95a28', group);
  }
  el('rect', { x: -6, y: -6, width: 12, height: 12, transform: `translate(${X(corner[0])} ${Y(corner[1])}) rotate(45)`, fill: '#252525', stroke: '#faf9f6', 'stroke-width': 1.5 }, group);
  at([corner[0] - 0.12, corner[1] + 0.14], 'x*', '#252525', group, 'end');
  $('pull-handle').setAttribute('transform', `translate(${X(tip[0])} ${Y(tip[1])})`);
  $('pull-handle').setAttribute('aria-valuetext', `minus Gradient ${vector(pull)}`);

  let state;
  if (!best.inside) state = '−∇f(x*) liegt außerhalb des Kegels';
  else if (restLength <= BALANCED) state = `Gleichgewicht · λ₁ = ${number(best.lambda[0])} · λ₃ = ${number(best.lambda[1])}`;
  else state = `Rest ${number(restLength)}`;
  $('live-state').textContent = state;
  $('status').textContent = state;
}

function setLambdas([l1, l3]) {
  $('lambda-1').value = Math.min(Number($('lambda-1').max), Math.max(0, l1)).toFixed(2);
  $('lambda-3').value = Math.min(Number($('lambda-3').max), Math.max(0, l3)).toFixed(2);
}

// -grad f stays in the visible area and at most LONGEST long.
function setPull(v) {
  const length = Math.hypot(...v);
  const limited = length > LONGEST ? scale(v, LONGEST / length) : v;
  const tip = add(corner, limited);
  const clamped = [Math.min(Math.max(tip[0], X0 + 0.15), X0 + WIDTH / S - 0.15), Math.min(Math.max(tip[1], Y1 - HEIGHT / S + 0.15), Y1 - 0.15)];
  pull = sub(clamped, corner);
}

for (const id of ['lambda-1', 'lambda-3']) $(id).addEventListener('input', render);
$('solve').addEventListener('click', () => { setLambdas(coneProjection(pull, a1, a3).lambda); render(); });
$('reset').addEventListener('click', () => { pull = [...defaultPull]; setLambdas([0, 0]); render(); });

const handle = $('pull-handle');
handle.addEventListener('pointerdown', event => {
  handle.setPointerCapture(event.pointerId);
  const move = e => {
    const local = new DOMPoint(e.clientX, e.clientY).matrixTransform($('plot').getScreenCTM().inverse());
    setPull(sub([X0 + local.x / S, Y1 - local.y / S], corner));
    render();
  };
  const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});
handle.addEventListener('keydown', event => {
  const step = event.shiftKey ? 0.2 : 0.05;
  const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[event.key];
  if (!delta) return;
  event.preventDefault();
  setPull(add(pull, delta));
  render();
});

drawStatic();
render();
fitFrame($('experiment'));
