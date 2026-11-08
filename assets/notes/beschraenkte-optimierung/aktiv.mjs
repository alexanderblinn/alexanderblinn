// Figure 2: the feasible set of the running example and a point x that can be dragged. Near a
// boundary or a corner it snaps onto it, so that constraints can be exactly active; the values
// c_i(x) and the active set A(x) are shown below the drawing.
import { activeSet, snap, values } from './beispiel.mjs';
import { drawFeasibleSet, el, fitFrame, highlight, label } from './zeichnung.mjs';

const $ = id => document.getElementById(id);
const VIEW = { S: 100, X0: -3.4, Y1: 2.25, width: 680, height: 480 };
const number = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('.', ',').replace('-', '−');
const NAMES = ['c₁', 'c₂', 'c₃'];
let point = [0.35, -0.4];  // the point x

for (let x = -3; x <= 3; x++) el('line', { x1: (x - VIEW.X0) * VIEW.S, x2: (x - VIEW.X0) * VIEW.S, y1: 0, y2: VIEW.height, class: x === 0 ? 'zero' : '' }, $('grid'));
for (let y = -2; y <= 2; y++) el('line', { x1: 0, x2: VIEW.width, y1: (VIEW.Y1 - y) * VIEW.S, y2: (VIEW.Y1 - y) * VIEW.S, class: y === 0 ? 'zero' : '' }, $('grid'));
const { X, Y, groups } = drawFeasibleSet($('plot'), $('omega'), VIEW);
label($('labels'), X(1.62), Y(-1.45), 'c₁(x) = 0', '#426f6b');
label($('labels'), X(-1.3), Y(-2.35), 'c₂(x) = 0', '#426f6b', 'middle');
label($('labels'), X(3.3), Y(1.32), 'c₃(x) = 0', '#426f6b', 'end');
label($('labels'), X(-0.25), Y(0.45), 'Ω', '#426f6b', 'middle').style.fontSize = '26px';

function render() {
  const c = values(point), active = activeSet(point), feasibleNow = c.every(v => v <= 1e-9);
  highlight(groups, feasibleNow ? active : []);
  $('point').setAttribute('transform', `translate(${X(point[0])} ${Y(point[1])})`);
  const set = feasibleNow ? `𝒜(x) = {${active.join(', ')}}` : 'x ∉ Ω';
  $('live-state').textContent = set;
  $('readout').replaceChildren(...c.map((v, i) => {
    const state = Math.abs(v) <= 1e-9 ? 'aktiv' : v < 0 ? 'inaktiv' : 'verletzt';
    const chip = document.createElement('span');
    chip.className = `chip ${state}`;
    chip.innerHTML = `${NAMES[i]}(x) = <b>${number(v)}</b> <i>${state}</i>`;
    return chip;
  }));
  const coordinates = `x = (${number(point[0])}; ${number(point[1])})`;
  $('point').setAttribute('aria-valuetext', `${coordinates}, ${set}`);
  $('status').textContent = `${coordinates}. ${set}.`;
}

// Pointer position in model coordinates, limited to the view.
function toModel(event) {
  const local = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  const x = VIEW.X0 + local.x / VIEW.S, y = VIEW.Y1 - local.y / VIEW.S;
  return [Math.min(Math.max(x, VIEW.X0 + 0.1), VIEW.X0 + VIEW.width / VIEW.S - 0.1), Math.min(Math.max(y, VIEW.Y1 - VIEW.height / VIEW.S + 0.1), VIEW.Y1 - 0.1)];
}
const reach = event => (event.pointerType === 'touch' ? 0.2 : 0.13);

$('plot').addEventListener('pointerdown', event => {
  point = snap(toModel(event), reach(event));
  render();
  const handle = $('point');
  handle.setPointerCapture(event.pointerId);
  handle.focus({ preventScroll: true });
  const move = e => { point = snap(toModel(e), reach(e)); render(); };
  const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});
$('point').addEventListener('keydown', event => {
  const step = event.shiftKey ? 0.2 : 0.04;
  const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[event.key];
  if (!delta) return;
  event.preventDefault();
  // half a step: crossing a boundary always lands on it, moving straight away leaves it
  point = snap([point[0] + delta[0], point[1] + delta[1]], step / 2);
  render();
});

render();
fitFrame($('experiment'));
