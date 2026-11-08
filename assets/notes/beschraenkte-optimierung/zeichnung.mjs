// Drawing helpers shared by figures 1 and 2: the feasible set of the running example (beispiel.mjs)
// as a shaded area with the curves c_i(x) = 0, faint where they do not bound it.
import { CONSTRAINTS, boundaryPieces, point } from './beispiel.mjs';

const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attributes, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent.append(node);
  return node;
}

// view: { S, X0, Y1, width, height }. Returns the transforms X, Y and the boundary groups
// (one per constraint, attribute data-constraint = 1, 2, 3) for highlight().
export function drawFeasibleSet(svg, parent, view) {
  const { S, X0, Y1, width, height } = view;
  const X = x => (x - X0) * S, Y = y => (Y1 - y) * S;
  const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('');
  const [disk, bite, top] = CONSTRAINTS;
  // the area: the disk minus the small circle, below the line
  const id = `omega-${svg.id}`;
  const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width, height }, el('defs', {}, svg));
  el('rect', { width, height, fill: 'black' }, mask);
  el('circle', { cx: X(disk.centre[0]), cy: Y(disk.centre[1]), r: disk.radius * S, fill: 'white' }, mask);
  el('circle', { cx: X(bite.centre[0]), cy: Y(bite.centre[1]), r: bite.radius * S, fill: 'black' }, mask);
  el('rect', { width, height: Y(top.height), fill: 'black' }, mask);
  el('rect', { width, height, fill: '#e5eeeb', mask: `url(#${id})` }, parent);
  const groups = CONSTRAINTS.map((c, i) => {
    const whole = c.kind === 'line' ? [point(i, X0), point(i, X0 + width / S)] : Array.from({ length: 181 }, (_, k) => point(i, (k * Math.PI) / 90));
    el('path', { d: path(whole), fill: 'none', stroke: '#9fb7b3', 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }, parent);
    const group = el('g', { 'data-constraint': i + 1, stroke: '#426f6b' }, parent);
    for (const piece of boundaryPieces(i, X0, X0 + width / S)) el('path', { d: path(piece), fill: 'none', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, group);
    return group;
  });
  return { X, Y, groups };
}

// The boundaries of the active constraints in orange and thicker.
export function highlight(groups, active) {
  groups.forEach((group, i) => {
    const on = active.includes(i + 1);
    group.setAttribute('stroke', on ? '#b95a28' : '#426f6b');
    group.querySelectorAll('path').forEach(p => p.setAttribute('stroke-width', on ? 4.5 : 2.6));
  });
}

export function label(parent, x, y, content, colour, anchor = 'start', weight = 'bold') {
  const text = el('text', { x, y, 'text-anchor': anchor, style: `fill:${colour};font-weight:${weight};paint-order:stroke;stroke:#faf9f6;stroke-width:4px` }, parent);
  text.innerHTML = content;
  return text;
}

// The frame of an embedded figure grows with its content.
export function fitFrame(element) {
  new ResizeObserver(() => {
    if (window.frameElement) window.frameElement.style.height = `${Math.ceil(element.getBoundingClientRect().height + 16)}px`;
  }).observe(element);
}
