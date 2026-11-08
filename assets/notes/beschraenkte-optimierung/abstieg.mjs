// Figure 3: the constraint c1 of the running example alone, either as c1(x) = 0 (the circle) or as
// c1(x) <= 0 (the disk). The point x moves on the circle. Around it a rose of directions shows the
// descent directions (grad f^T s < 0), the feasible directions to first order (grad c1^T s = 0,
// or <= 0) and the directions that are both. Where the level ellipse of f through x touches the
// circle, grad f and grad c1 are parallel and the common directions vanish.
import { TARGET, CONSTRAINTS, circleStationary, ellipseAxes, f, gradient, multiplier, onCircle } from './beispiel.mjs';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const S = 92, X0 = -3.1, Y1 = 2.55, WIDTH = 680, HEIGHT = 460, ROSE = 80, ARROW = 0.95;
const X = x => (x - X0) * S, Y = y => (Y1 - y) * S;
const number = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('.', ',').replace('-', '−');
const SNAP = 3 * Math.PI / 180;
const STATIONARY = circleStationary();
let angle = 10 * Math.PI / 180;
let mode = 'inequality';

function el(tag, attributes, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}
const unit = v => { const n = Math.hypot(...v); return [v[0] / n, v[1] / n]; };
const direction = v => Math.atan2(v[1], v[0]);
// screen point at distance r (pixels) from p in model direction a
const towards = (p, a, r) => [X(p[0]) + r * Math.cos(a), Y(p[1]) - r * Math.sin(a)];
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

function drawStatic() {
  for (let x = -3; x <= 4; x++) el('line', { x1: X(x), x2: X(x), y1: 0, y2: HEIGHT, class: x === 0 ? 'zero' : '' }, $('grid'));
  for (let y = -2; y <= 2; y++) el('line', { x1: 0, x2: WIDTH, y1: Y(y), y2: Y(y), class: y === 0 ? 'zero' : '' }, $('grid'));
  for (const id of ['disk', 'circle']) {
    $(id).setAttribute('cx', X(0));
    $(id).setAttribute('cy', Y(0));
    $(id).setAttribute('r', 2 * S);
  }
  for (const level of [0.4, 1.2, 4, 8, 14, 22, 32]) {
    const [a, b] = ellipseAxes(level);
    el('ellipse', { cx: X(TARGET[0]), cy: Y(TARGET[1]), rx: a * S, ry: b * S, fill: 'none', stroke: '#647e83', 'stroke-opacity': 0.35, 'stroke-width': 1 }, $('contours'));
  }
  const t = TARGET;
  el('path', { d: `M${X(t[0]) - 7} ${Y(t[1])}h14M${X(t[0])} ${Y(t[1]) - 7}v14`, stroke: '#8a5979', 'stroke-width': 2 }, $('static'));
  const label = el('text', { x: X(t[0]) + 10, y: Y(t[1]) - 9, style: 'fill:#8a5979;font-weight:bold' }, $('static'));
  label.innerHTML = 'x<tspan dy="4" font-size="11">ref</tspan>';
}

// Sector of the rose between the model angles from and to (counter-clockwise).
function sector(p, from, to, attributes, parent) {
  const [ax, ay] = towards(p, from, ROSE), [bx, by] = towards(p, to, ROSE);
  const large = to - from > Math.PI ? 1 : 0;
  return el('path', { d: `M${X(p[0])} ${Y(p[1])}L${ax} ${ay}A${ROSE} ${ROSE} 0 ${large} 0 ${bx} ${by}Z`, ...attributes }, parent);
}
function arrow(p, a, length, colour, parent, width = 3) {
  const [x2, y2] = towards(p, a, length);
  return el('line', { x1: X(p[0]), y1: Y(p[1]), x2, y2, stroke: { target: '#8a5979', green: '#426f6b', orange: '#b95a28' }[colour], 'stroke-width': width, 'stroke-linecap': 'round', 'marker-end': `url(#arrow-${colour})` }, parent);
}
function label(p, a, distance, content, colour, parent) {
  const [x, y] = towards(p, a, distance);
  const text = el('text', { x, y: y + 5, 'text-anchor': Math.cos(a) > 0.35 ? 'start' : Math.cos(a) < -0.35 ? 'end' : 'middle', style: `fill:${colour};font-weight:bold;paint-order:stroke;stroke:#faf9f6;stroke-width:4px` }, parent);
  text.textContent = content;
}

function render() {
  const x = onCircle(angle);
  const g = gradient(x), c = CONSTRAINTS[0].gradient(x);
  const down = direction(scale(g, -1)), out = direction(c), tangent = out + Math.PI / 2;
  const equality = mode === 'equality';
  $('disk').style.display = equality ? 'none' : '';
  $('circle').setAttribute('stroke-width', equality ? 4 : 2.6);
  // level ellipse of f through x
  const [a, b] = ellipseAxes(f(x));
  for (const [key, value] of Object.entries({ cx: X(TARGET[0]), cy: Y(TARGET[1]), rx: a * S, ry: b * S })) $('level').setAttribute(key, value);

  const rose = $('rose'), vectors = $('vectors');
  rose.replaceChildren();
  vectors.replaceChildren();
  el('circle', { cx: X(x[0]), cy: Y(x[1]), r: ROSE, fill: '#faf9f6', 'fill-opacity': 0.75, stroke: '#bebbb3', 'stroke-dasharray': '2 3' }, rose);
  // descent directions: the open half-plane around -grad f
  sector(x, down - Math.PI / 2, down + Math.PI / 2, { fill: '#173fbe', 'fill-opacity': 0.16, stroke: '#173fbe', 'stroke-opacity': 0.6 }, rose);
  // the common directions: an arc of 180 degrees minus the angle between -grad f and -grad c1
  const delta = wrap(out + Math.PI - down);  // angle from -grad f to -grad c1
  const parallel = Math.abs(Math.abs(delta) - Math.PI) < 1e-6 || Math.abs(delta) < 1e-6;
  let common = false;
  if (equality) {
    el('line', { x1: towards(x, tangent, -ROSE)[0], y1: towards(x, tangent, -ROSE)[1], x2: towards(x, tangent, ROSE)[0], y2: towards(x, tangent, ROSE)[1], stroke: '#426f6b', 'stroke-width': 7, 'stroke-opacity': 0.55 }, rose);
    const along = Math.cos(tangent - down);  // > 0: the tangent t goes downhill, < 0: -t does
    if (!parallel && Math.abs(along) > 1e-9) {
      arrow(x, along > 0 ? tangent : tangent + Math.PI, ROSE, 'orange', rose, 5);
      common = true;
    }
  } else {
    sector(x, out + Math.PI / 2, out + 3 * Math.PI / 2, { fill: '#426f6b', 'fill-opacity': 0.32, stroke: '#426f6b', 'stroke-opacity': 0.7 }, rose);
    if (!(Math.abs(Math.abs(delta) - Math.PI) < 1e-6)) {
      const from = down + Math.max(-Math.PI / 2, delta - Math.PI / 2), to = down + Math.min(Math.PI / 2, delta + Math.PI / 2);
      sector(x, from, to, { fill: '#b95a28', 'fill-opacity': 0.7, stroke: '#b95a28', 'stroke-width': 1.5 }, rose);
      common = true;
    }
  }
  arrow(x, down, ARROW * S, 'target', vectors);
  label(x, down, ARROW * S + 16, '−∇f(x)', '#8a5979', vectors);
  arrow(x, out, ARROW * S, 'green', vectors);
  label(x, out, ARROW * S + 16, '∇c₁(x)', '#426f6b', vectors);
  $('point').setAttribute('transform', `translate(${X(x[0])} ${Y(x[1])})`);

  const stationary = STATIONARY.find(s => Math.abs(wrap(s.angle - angle)) < 1e-9);
  const state = common ? 'zulässiger Abstieg möglich' : `kein zulässiger Abstieg · λ₁ = ${number(stationary?.lambda ?? multiplier(x))}`;
  $('live-state').textContent = state;
  const degrees = Math.round(((angle * 180 / Math.PI) % 360 + 360) % 360);
  $('point').setAttribute('aria-valuenow', degrees);
  $('point').setAttribute('aria-valuetext', `x = (${number(x[0])}; ${number(x[1])}), ${state}`);
  $('status').textContent = `${equality ? 'c₁(x) = 0' : 'c₁(x) ≤ 0'}, x = (${number(x[0])}; ${number(x[1])}): ${state}.`;
}
const scale = (v, s) => [v[0] * s, v[1] * s];

// Angles close to a point where grad f and grad c1 are parallel snap onto it.
function setAngle(a, snap = SNAP) {
  const hit = STATIONARY.find(s => Math.abs(wrap(s.angle - a)) < snap);
  angle = hit ? hit.angle : a;
  render();
}
const angleOf = event => {
  const local = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  return Math.atan2(Y1 - local.y / S, X0 + local.x / S);
};

$('point').addEventListener('pointerdown', event => {
  const handle = $('point');
  handle.setPointerCapture(event.pointerId);
  const move = e => setAngle(angleOf(e));
  const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});
// a click on the circle or next to it moves x there
$('plot').addEventListener('click', event => {
  if (event.target.closest('#point')) return;
  setAngle(angleOf(event));
});
$('point').addEventListener('keydown', event => {
  const step = (event.shiftKey ? 5 : 1) * Math.PI / 180;
  const delta = { ArrowLeft: step, ArrowUp: step, ArrowRight: -step, ArrowDown: -step }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  setAngle(angle + delta, step / 2);
});
for (const button of document.querySelectorAll('.switch button')) {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    document.querySelectorAll('.switch button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  });
}

drawStatic();
render();

new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil($('experiment').getBoundingClientRect().height + 16)}px`;
}).observe($('experiment'));
