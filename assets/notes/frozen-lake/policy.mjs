// Frozen Lake policy editor: choose an action per field and see the exact success probability
// of the resulting deterministic policy, within the 100-step limit and without it.
import { MAP, ACTIONS, kind, terminal, valueIteration, greedy, evaluate, deviations } from './model.mjs';
import { PRESETS } from './presets.mjs';

const $ = id => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';
const optimal = greedy(valueIteration(0.99));
const policies = { optimal, ...Object.fromEntries(PRESETS.map((p, i) => [`preset-${i}`, p.policy])) };
let policy = [...optimal];

const german = x => x.toFixed(2).replace('.', ',');
const element = (name, attributes, parent) => {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent?.append(node);
  return node;
};
// Probability 0 is paper, 0.5 light orange, 1 orange, as in the note's table figures.
const stops = [[250, 249, 246], [241, 214, 194], [221, 154, 114]];
function shade(p) {
  const t = Math.min(1, Math.max(0, p)) * 2, i = Math.min(1, Math.floor(t)), f = t - i;
  return `rgb(${stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f)).join(',')})`;
}

for (const [i, preset] of PRESETS.entries()) {
  $('preset').insertBefore(new Option(`${preset.label} (gelernt)`, `preset-${i}`), $('preset').lastElementChild);
}

// One group per field; the arrow is drawn pointing right and rotated to the action.
const angle = [180, 90, 0, -90];
const cells = MAP.join('').split('').map((letter, s) => {
  const g = element('g', { class: 'cell', transform: `translate(${(s % 4) * 100} ${Math.floor(s / 4) * 100})` }, $('board'));
  const field = element('rect', { class: 'field', width: 100, height: 100 }, g);
  element('text', { class: 'index', x: 10, y: 21 }, g).textContent = s;
  if (terminal(s)) {
    field.setAttribute('fill', letter === 'G' ? '#cfe0da' : '#d9d5cb');
    element('text', { class: 'letter', x: 50, y: 60 }, g).textContent = letter;
    return { g };
  }
  if (letter === 'S') element('text', { class: 'index', x: 90, y: 21, 'text-anchor': 'end' }, g).textContent = 'S';
  g.classList.add('editable');
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  const deviation = element('rect', { class: 'deviation', x: 3, y: 3, width: 94, height: 94 }, g);
  const arrow = element('path', { class: 'arrow', d: 'M-17,0 H15 M5,-10 L15,0 L5,10' }, g);
  const probability = element('text', { class: 'probability', x: 50, y: 84 }, g);
  return { g, field, deviation, arrow, probability };
});

function render() {
  const unlimited = evaluate(policy), differing = new Set(deviations(policy, optimal));
  cells.forEach(({ g, field, deviation, arrow, probability }, s) => {
    if (terminal(s)) return;
    field.setAttribute('fill', shade(unlimited[s]));
    arrow.setAttribute('transform', `translate(50 42) rotate(${angle[policy[s]]})`);
    probability.textContent = german(unlimited[s]);
    deviation.style.display = differing.has(s) ? '' : 'none';
    g.setAttribute('aria-label', `Feld ${s}: Aktion ${ACTIONS[policy[s]]}, Erfolg ${german(unlimited[s])}${differing.has(s) ? ', anders als q*' : ''}. Klicken oder Pfeiltaste zum Ändern.`);
  });
  $('within').value = german(evaluate(policy, { horizon: 100 })[0]);
  $('unlimited').value = german(unlimited[0]);
  $('value').value = german(evaluate(policy, { gamma: 0.99 })[0]);
  $('live-state').textContent = differing.size === 0 ? 'Entspricht q*' : `Weicht in ${differing.size} ${differing.size === 1 ? 'Feld' : 'Feldern'} von q* ab`;
}

function setAction(s, action) {
  policy[s] = action;
  $('preset').value = 'custom';
  render();
}

cells.forEach(({ g }, s) => {
  if (terminal(s)) return;
  // A click turns the arrow clockwise: links, oben, rechts, unten.
  g.addEventListener('click', () => setAction(s, (policy[s] + 3) % 4));
  g.addEventListener('keydown', event => {
    const direct = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, ArrowUp: 3 }[event.key];
    if (direct !== undefined) { event.preventDefault(); setAction(s, direct); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setAction(s, (policy[s] + 3) % 4); }
  });
});

$('preset').addEventListener('change', () => {
  if ($('preset').value === 'custom') return;
  policy = [...policies[$('preset').value]];
  render();
});

// Only resize this same-origin embed. The standalone page uses its natural height.
new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil($('experiment').getBoundingClientRect().height + 16)}px`;
}).observe($('experiment'));
render();
