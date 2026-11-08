// Figure 3: weight the outward normals of the two active edges at the corner C by hand until
// their sum equals -grad f(x*). If -grad f leaves the normal cone, no weights lambda >= 0 work;
// the smallest remaining rest is then a feasible descent direction (Farkas).
import { VERTICES, cornerExample, coneProjection } from './geometry.mjs';
import { add, scale, sub } from '../zentralpfad/math.mjs';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const S = 130, X0 = 0.5, Y1 = 3.93;
const X = x => (x - X0) * S, Y = y => (Y1 - y) * S;
const BALANCED = 0.03;
const number = (v, digits = 2) => v.toFixed(digits).replace('.', ',').replace('-', '−');
const vector = v => `(${number(v[0])}; ${number(v[1])})`;

const { corner, normals: [a1, a2], pull: defaultPull } = cornerExample();
let pull = [...defaultPull];

function el(tag, attributes, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}
function arrow(from, to, colour, parent, extra = {}) {
  if (Math.hypot(...sub(to, from)) < 1e-3) return null;
  return el('line', { x1: X(from[0]), y1: Y(from[1]), x2: X(to[0]), y2: Y(to[1]), stroke: { target: '#8a5979', green: '#426f6b', light: '#7da49e', orange: '#b95a28', blue: '#173fbe' }[colour],
    'stroke-width': 3, 'marker-end': `url(#arrow-${colour})`, 'stroke-linecap': 'round', ...extra }, parent);
}
function label(at, content, colour, parent, anchor = 'start') {
  const text = el('text', { x: X(at[0]), y: Y(at[1]), 'text-anchor': anchor, style: `fill:${colour};font-weight:bold;paint-order:stroke;stroke:#faf9f6;stroke-width:4px` }, parent);
  text.innerHTML = content;
  return text;
}
const sub2 = s => `<tspan dy="4" font-size="11">${s}</tspan><tspan dy="-4"></tspan>`;

function drawStatic() {
  for (let x = 1; x <= 5; x++) el('line', { x1: X(x), x2: X(x), y1: 0, y2: 440 }, $('grid'));
  for (let y = 1; y <= 3; y++) el('line', { x1: 0, x2: 680, y1: Y(y), y2: Y(y) }, $('grid'));
  $('feasible').setAttribute('points', VERTICES.map(p => `${X(p[0])},${Y(p[1])}`).join(' '));
  const far = 8;
  $('cone').setAttribute('points', [corner, add(corner, scale(a1, far)), add(corner, scale(add(a1, a2), far)), add(corner, scale(a2, far))]
    .map(p => `${X(p[0])},${Y(p[1])}`).join(' '));
  const group = $('static');
  for (const a of [a1, a2]) el('line', { x1: X(corner[0]), y1: Y(corner[1]), x2: X(corner[0] + far * a[0]), y2: Y(corner[1] + far * a[1]), stroke: '#8a5979', 'stroke-opacity': 0.35, 'stroke-dasharray': '4 4' }, group);
  // edges BC and CD
  for (const [p, q] of [[VERTICES[1], VERTICES[2]], [VERTICES[2], VERTICES[3]]]) {
    el('line', { x1: X(p[0]), y1: Y(p[1]), x2: X(q[0]), y2: Y(q[1]), stroke: '#426f6b', 'stroke-width': 2.6 }, group);
  }
  label([2.47, 0.95], 'Kante BC', '#426f6b', group, 'end');
  label([1.05, 2.33], 'Kante CD', '#426f6b', group);
  label([0.62, 1.2], 'zulässig', '#426f6b', group).style.fontWeight = 'normal';
  label([4.3, 2.5], 'Normalenkegel', '#8a5979', group);
  // the rays of the cone point along the outward normals a_BC and a_CD
  label([5.05, 1.62], `Richtung a${sub2('BC')}`, '#8a5979', group, 'end').style.fontWeight = 'normal';
  label([2.92, 3.62], `Richtung a${sub2('CD')}`, '#8a5979', group).style.fontWeight = 'normal';
}

function render() {
  const l1 = Number($('lambda-1').value), l2 = Number($('lambda-2').value);
  $('lambda-1-value').textContent = number(l1);
  $('lambda-2-value').textContent = number(l2);
  const first = add(corner, scale(a1, l1)), sum = add(first, scale(a2, l2)), tip = add(corner, pull);
  const rest = sub(tip, sum), restLength = Math.hypot(...rest);
  const best = coneProjection(pull, a1, a2);
  const group = $('vectors');
  group.replaceChildren();
  // parallelogram: the other order of the two weighted normals, faint
  el('polyline', { points: [corner, add(corner, scale(a2, l2)), sum].map(p => `${X(p[0])},${Y(p[1])}`).join(' '), fill: 'none', stroke: '#426f6b', 'stroke-opacity': 0.25, 'stroke-dasharray': '3 4' }, group);
  if (!best.inside) {
    arrow(corner, add(corner, best.residual), 'blue', group);
    label(add(add(corner, best.residual), [0.08, -0.12]), 'd', '#173fbe', group);
  }
  arrow(corner, tip, 'target', group);
  label(add(tip, [0.1, 0.06]), '−∇f(x*)', '#8a5979', group);
  arrow(corner, first, 'green', group);
  arrow(first, sum, 'green', group);
  if (l1 > 0.15) label(add(scale(add(corner, first), 0.5), [0.0, -0.22]), `λ${sub2('BC')}a${sub2('BC')}`, '#426f6b', group, 'middle');
  if (l2 > 0.15) label(add(scale(add(first, sum), 0.5), [0.1, 0.0]), `λ${sub2('CD')}a${sub2('CD')}`, '#426f6b', group);
  if (restLength > 0.02) {
    arrow(sum, tip, 'orange', group, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    if (restLength > 0.25) label(add(scale(add(sum, tip), 0.5), [0.1, -0.05]), 'Rest', '#b95a28', group);
  }
  el('rect', { x: -6, y: -6, width: 12, height: 12, transform: `translate(${X(corner[0])} ${Y(corner[1])}) rotate(45)`, fill: '#252525', stroke: '#faf9f6', 'stroke-width': 1.5 }, group);
  label([corner[0] - 0.1, corner[1] - 0.25], 'x* = C', '#252525', group, 'end');
  $('pull-handle').setAttribute('transform', `translate(${X(tip[0])} ${Y(tip[1])})`);
  $('pull-handle').setAttribute('aria-valuetext', `minus Gradient ${vector(pull)}`);

  const status = $('status');
  if (!best.inside) {
    const d = Math.hypot(...best.residual);
    status.innerHTML = `<span class="warn">−∇f(x*) liegt außerhalb des Normalenkegels.</span> Mit λ ≥ 0 bleibt immer ein Rest von mindestens ${number(d)}. `
      + `Dieser kleinste Rest ist der blaue Pfeil d: Er verletzt keine der beiden Kanten und senkt f, denn ∇f(x*)ᵀd = −|d|² &lt; 0. C wäre also nicht optimal.`;
    $('live-state').textContent = 'außerhalb des Kegels';
  } else if (restLength <= BALANCED) {
    status.innerHTML = `<strong>Gleichgewicht:</strong> λ<sub>BC</sub>a<sub>BC</sub> + λ<sub>CD</sub>a<sub>CD</sub> = −∇f(x*) mit λ<sub>BC</sub> = ${number(best.lambda[0])} und λ<sub>CD</sub> = ${number(best.lambda[1])}. Beide Gewichte sind positiv.`;
    $('live-state').textContent = 'im Gleichgewicht';
  } else {
    status.innerHTML = `Rest ${number(restLength)}: Verändere λ<sub>BC</sub> und λ<sub>CD</sub>, bis die grünen Pfeile genau an der Spitze von −∇f(x*) enden.`;
    $('live-state').textContent = `Rest ${number(restLength)}`;
  }
}

function setLambdas([l1, l2]) {
  $('lambda-1').value = Math.min(2.5, Math.max(0, l1)).toFixed(2);
  $('lambda-2').value = Math.min(2.5, Math.max(0, l2)).toFixed(2);
}

// -grad f stays in the visible area and at most 2.2 long.
function setPull(v) {
  const length = Math.hypot(...v);
  const limited = length > 2.2 ? scale(v, 2.2 / length) : v;
  const tip = add(corner, limited);
  const clamped = [Math.min(Math.max(tip[0], X0 + 0.15), X0 + 680 / S - 0.15), Math.min(Math.max(tip[1], Y1 - 440 / S + 0.15), Y1 - 0.15)];
  pull = sub(clamped, corner);
}

for (const id of ['lambda-1', 'lambda-2']) $(id).addEventListener('input', render);
$('solve').addEventListener('click', () => { setLambdas(coneProjection(pull, a1, a2).lambda); render(); });
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

new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil($('experiment').getBoundingClientRect().height + 16)}px`;
}).observe($('experiment'));
