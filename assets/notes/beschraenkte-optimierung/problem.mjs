// Figure 1: the running example. The level ellipses of f sit around the unconstrained minimum
// x_ref, which can be dragged; the black diamond is the minimum x* of f over the feasible set.
// Inside the set x* = x_ref; outside, the smallest level ellipse that still reaches the set
// touches it at x*, on an edge or in a corner, and around the bite of c2 x* can jump.
import { TARGET, constrainedMinimum, ellipseAxes, f } from './beispiel.mjs';
import { drawFeasibleSet, el, fitFrame, highlight, label } from './zeichnung.mjs';

const $ = id => document.getElementById(id);
const VIEW = { S: 92, X0: -3.4, Y1: 2.55, width: 680, height: 470 };
const number = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('.', ',').replace('-', '−');
const vector = v => `(${number(v[0])}; ${number(v[1])})`;
const LEVELS = [0.5, 1.5, 3, 5, 8, 12, 17, 23];
let target = [...TARGET];

for (let x = -3; x <= 4; x++) el('line', { x1: (x - VIEW.X0) * VIEW.S, x2: (x - VIEW.X0) * VIEW.S, y1: 0, y2: VIEW.height, class: x === 0 ? 'zero' : '' }, $('grid'));
for (let y = -2; y <= 2; y++) el('line', { x1: 0, x2: VIEW.width, y1: (VIEW.Y1 - y) * VIEW.S, y2: (VIEW.Y1 - y) * VIEW.S, class: y === 0 ? 'zero' : '' }, $('grid'));
const { X, Y, groups } = drawFeasibleSet($('plot'), $('omega'), VIEW);
label($('labels'), X(1.5), Y(-1.62), 'c₁', '#426f6b');
label($('labels'), X(-2.2), Y(-2.5), 'c₂', '#426f6b', 'end');
label($('labels'), X(-2.75), Y(1.3), 'c₃', '#426f6b', 'end');
label($('labels'), X(-0.2), Y(0.1), 'Ω', '#426f6b', 'middle').style.fontSize = '26px';
const contours = LEVELS.map(() => el('ellipse', { fill: 'none', stroke: '#647e83', 'stroke-opacity': 0.4, 'stroke-width': 1 }, $('contours')));

function render() {
  const { point, active } = constrainedMinimum(target);
  const inside = active.length === 0 && point === target;
  contours.forEach((ellipse, k) => {
    const [a, b] = ellipseAxes(LEVELS[k]);
    for (const [key, value] of Object.entries({ cx: X(target[0]), cy: Y(target[1]), rx: a * VIEW.S, ry: b * VIEW.S })) ellipse.setAttribute(key, value);
  });
  const [a, b] = ellipseAxes(f(point, target));
  for (const [key, value] of Object.entries({ cx: X(target[0]), cy: Y(target[1]), rx: a * VIEW.S, ry: b * VIEW.S })) $('level').setAttribute(key, value);
  $('level').style.display = inside ? 'none' : '';
  $('link').setAttribute('d', inside ? '' : `M${X(target[0])} ${Y(target[1])}L${X(point[0])} ${Y(point[1])}`);
  highlight(groups, active);
  $('optimum').setAttribute('transform', `translate(${X(point[0])} ${Y(point[1])})`);
  // the label of x* sits on the side away from the target
  const away = inside ? [1, -1] : [point[0] - target[0], point[1] - target[1]];
  const length = Math.hypot(...away) || 1;
  $('optimum-label').setAttribute('x', X(point[0]) + 22 * away[0] / length - 8);
  $('optimum-label').setAttribute('y', Y(point[1]) - 22 * away[1] / length + 5);
  $('target').setAttribute('transform', `translate(${X(target[0])} ${Y(target[1])})`);
  $('target-label').setAttribute('x', X(target[0]) + 14);
  $('target-label').setAttribute('y', Y(target[1]) - 14);
  const state = inside ? 'x* = x_ref, keine Nebenbedingung aktiv' : `x* = ${vector(point)} · aktiv: c${active.map(i => '₀₁₂₃'[i]).join(', c')}`;
  $('live-state').textContent = state;
  $('target').setAttribute('aria-valuetext', `x_ref = ${vector(target)}, ${state}`);
  $('status').textContent = `x_ref = ${vector(target)}. ${state}.`;
}

function toModel(event) {
  const local = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  const x = VIEW.X0 + local.x / VIEW.S, y = VIEW.Y1 - local.y / VIEW.S;
  return [Math.min(Math.max(x, VIEW.X0 + 0.15), VIEW.X0 + VIEW.width / VIEW.S - 0.15), Math.min(Math.max(y, VIEW.Y1 - VIEW.height / VIEW.S + 0.15), VIEW.Y1 - 0.15)];
}

$('plot').addEventListener('pointerdown', event => {
  target = toModel(event);
  render();
  const handle = $('target');
  handle.setPointerCapture(event.pointerId);
  handle.focus({ preventScroll: true });
  const move = e => { target = toModel(e); render(); };
  const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});
$('target').addEventListener('keydown', event => {
  const step = event.shiftKey ? 0.25 : 0.05;
  const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[event.key];
  if (!delta) return;
  event.preventDefault();
  target = [target[0] + delta[0], target[1] + delta[1]];
  render();
});
$('reset').addEventListener('click', () => { target = [...TARGET]; render(); });

render();
fitFrame($('experiment'));
