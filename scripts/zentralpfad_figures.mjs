// Generates the static SVG figures of content/notes/zentralpfad.md from the demo's own solver.
// Run from the project root with Node.js 22 or newer: node scripts/zentralpfad_figures.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matrix, constraints, slacks, objective, add, sub, scale, multiply, dot } from '../assets/notes/zentralpfad/math.mjs';
import { centralPath, barrierOptimum, barrierDerivatives } from '../assets/notes/zentralpfad/barrier.mjs';

const target = join(dirname(fileURLToPath(import.meta.url)), '../public/img/notes/zentralpfad');
const colour = { paper: '#faf9f6', ink: '#252525', muted: '#65635d', grid: '#e6e3db', line: '#c9c6be', orange: '#b95a28', blue: '#173fbe', green: '#426f6b', area: '#e5eeeb', purple: '#685d94', target: '#8a5979', contour: '#647e83', grey: '#8d8a82' };
const n = v => Number(v.toFixed(2));
const german = v => String(v).replace('.', ',');
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="Courier New, Courier, monospace" font-size="13" fill="${colour.ink}">
<rect width="${width}" height="${height}" fill="${colour.paper}"/>
${body}
</svg>
`;
const text = (x, y, content, attributes = '') => `<text x="${n(x)}" y="${n(y)}" ${attributes}>${content}</text>`;
const line = (x1, y1, x2, y2, attributes) => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${attributes}/>`;
const polyline = (points, attributes) => `<polyline points="${points.map(p => `${n(p[0])},${n(p[1])}`).join(' ')}" fill="none" ${attributes}/>`;
const subscriptA = 'x<tspan dy="4" font-size="10">a</tspan>';

// Default problem of the demo and the Newton start used in the note's code example.
const vertices = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const q = matrix(1, 3, -25), z = [2.8, 1.2], x0 = [-1, -0.8];
const limits = constraints(vertices);

// Damped Newton iterates of one centering, for the figure of the barrier method.
function newtonIterates(mu, start) {
  const iterates = [start];
  let x = start;
  for (let iteration = 0; iteration < 60; iteration++) {
    const current = barrierDerivatives(x, q, z, limits, mu);
    const det = current.h[0] * current.h[2] - current.h[1] * current.h[1];
    const step = [-(current.h[2] * current.g[0] - current.h[1] * current.g[1]) / det, -(current.h[0] * current.g[1] - current.h[1] * current.g[0]) / det];
    const descent = dot(current.g, step);
    if (Math.max(Math.abs(current.g[0]), Math.abs(current.g[1])) < 1e-10 || -descent < 1e-20) break;
    let alpha = 1;
    limits.forEach(({ a }, i) => { const toward = dot(a, step); if (toward > 0) alpha = Math.min(alpha, 0.995 * current.s[i] / toward); });
    for (let backtrack = 0; backtrack < 60; backtrack++) {
      const trial = add(x, scale(step, alpha)), next = barrierDerivatives(trial, q, z, limits, mu);
      if (next && next.value <= current.value + 1e-4 * alpha * descent + 1e-14 * (1 + Math.abs(current.value))) { x = trial; break; }
      alpha *= 0.5;
    }
    iterates.push(x);
  }
  return iterates;
}

// Figure 1: the one-dimensional barrier -mu log s for several mu and the indicator function.
function barrierFigure() {
  const W = 640, H = 360, left = 56, right = 170, top = 22, bottom = 46;
  const sMax = 2.2, yMin = -1, yMax = 4;
  const X = s => left + s / sMax * (W - left - right), Y = y => top + (yMax - y) / (yMax - yMin) * (H - top - bottom);
  let body = '';
  for (let y = yMin; y <= yMax; y++) {
    body += line(left, Y(y), W - right, Y(y), `stroke="${y === 0 ? colour.line : colour.grid}" stroke-width="${y === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(y) + 4, y, `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  for (let s = 0; s <= 2; s += 0.5) {
    body += line(X(s), top, X(s), Y(yMin), `stroke="${s === 0 ? colour.line : colour.grid}" stroke-width="${s === 0 ? 1 : 0.75}"`);
    body += text(X(s), H - bottom + 18, german(s), `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  body += `<path d="M${n(X(0))},${n(Y(yMax))} V${n(Y(0))} H${n(X(sMax))}" fill="none" stroke="${colour.ink}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  const curves = [[1, 1], [0.5, 0.8], [0.2, 0.62], [0.05, 0.45]];
  for (const [mu, opacity] of curves) {
    const points = [];
    for (let s = 0.003; s <= sMax; s += 0.003) { const y = -mu * Math.log(s); if (y <= yMax) points.push([X(s), Y(y)]); }
    body += polyline(points, `stroke="${colour.orange}" stroke-opacity="${opacity}" stroke-width="2.2"`);
  }
  let ly = top + 14;
  const legendX = W - right + 22;
  for (const [mu, opacity] of curves) {
    body += line(legendX, ly - 4, legendX + 26, ly - 4, `stroke="${colour.orange}" stroke-opacity="${opacity}" stroke-width="2.2"`);
    body += text(legendX + 34, ly, `μ = ${german(mu)}`);
    ly += 22;
  }
  body += line(legendX, ly - 4, legendX + 26, ly - 4, `stroke="${colour.ink}" stroke-width="1.6" stroke-dasharray="5 4"`);
  body += text(legendX + 34, ly, 'Indikator');
  body += text(legendX + 34, ly + 16, 'I(s)', `fill="${colour.muted}" font-size="12"`);
  body += text(W - right, H - 8, 'Schlupf s = b − aᵀx', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, '−μ log s', `fill="${colour.muted}"`);
  return svg(W, H, body);
}

// Figure 2: the central path and the barrier method following it from a start point x0.
function methodFigure() {
  const W = 640, H = 560, left = 44, right = 16, top = 16, bottom = 140;
  const xMin = -3.3, xMax = 3.7, yMin = -2.4, yMax = 2.9;
  const unit = Math.min((W - left - right) / (xMax - xMin), (H - top - bottom) / (yMax - yMin));
  const X = x => left + (x - xMin) * unit, Y = y => top + (yMax - y) * unit;
  const point = p => [X(p[0]), Y(p[1])];
  let body = '';
  for (let v = -3; v <= 3; v++) {
    body += line(X(v), top, X(v), Y(yMin), `stroke="${v === 0 ? colour.line : colour.grid}" stroke-width="${v === 0 ? 1 : 0.75}"`);
    body += text(X(v), Y(yMin) + 18, v, `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  for (let v = -2; v <= 2; v++) {
    body += line(X(xMin), Y(v), X(xMax), Y(v), `stroke="${v === 0 ? colour.line : colour.grid}" stroke-width="${v === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(v) + 4, v, `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  const polygon = vertices.map(point).map(p => `${n(p[0])},${n(p[1])}`).join(' ');
  body += `<clipPath id="plot"><rect x="${left}" y="${top}" width="${n(W - left - right)}" height="${n((yMax - yMin) * unit)}"/></clipPath>`;
  body += `<g clip-path="url(#plot)">`;
  body += `<polygon points="${polygon}" fill="${colour.area}" fill-opacity="0.8" stroke="${colour.green}" stroke-width="1.8"/>`;
  const [cx, cy] = point(z);
  for (const level of [0.15, 0.35, 0.7, 1.3, 2.4, 4.2, 7, 11, 17, 25, 38, 56]) {
    body += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(Math.sqrt(2 * level / 1) * unit)}" ry="${n(Math.sqrt(2 * level / 3) * unit)}" transform="rotate(25 ${n(cx)} ${n(cy)})" fill="none" stroke="${colour.contour}" stroke-width="1" opacity="0.3"/>`;
  }
  const path = centralPath(vertices, q, z);
  body += polyline([path.centre, ...path.points.map(p => p.x)].map(point), `stroke="${colour.orange}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`);
  // Barrier method: Newton iterates of the first centering from x0, then centres for kappa = 10.
  const iterates = newtonIterates(100, x0);
  body += polyline(iterates.map(point), `stroke="${colour.grey}" stroke-width="1.6" stroke-dasharray="3 4"`);
  iterates.slice(1, -1).forEach(p => { const [ix, iy] = point(p); body += `<circle cx="${n(ix)}" cy="${n(iy)}" r="3" fill="${colour.grey}"/>`; });
  let guess = iterates.at(-1);
  const centres = [100, 10, 1, 0.1, 0.01, 0.001].map(mu => { guess = barrierOptimum(limits, q, z, mu, guess); return { mu, x: guess }; });
  centres.forEach(({ mu, x }, i) => {
    const [kx, ky] = point(x);
    body += `<circle cx="${n(kx)}" cy="${n(ky)}" r="5.5" fill="${colour.paper}" stroke="${colour.blue}" stroke-width="2"/>`;
    // Only the first two centres are labelled; the later ones crowd together next to x*.
    if (i < 2) body += text(kx + 10, ky + 18, `μ = ${['10²', '10'][i]}`, `fill="${colour.blue}" font-size="12"`);
  });
  const [sx, sy] = point(x0);
  body += `<rect x="${n(sx - 7)}" y="${n(sy - 7)}" width="14" height="14" rx="2" fill="${colour.paper}" fill-opacity="0.7" stroke="${colour.purple}" stroke-width="2"/>`;
  body += text(sx - 12, sy + 20, 'x₀', `text-anchor="end" fill="${colour.purple}" font-weight="bold"`);
  const [ax, ay] = point(path.centre);
  body += `<circle cx="${n(ax)}" cy="${n(ay)}" r="5" fill="${colour.blue}" stroke="${colour.paper}" stroke-width="1.5"/>`;
  body += text(ax - 11, ay - 11, subscriptA, `text-anchor="end" fill="${colour.blue}" font-weight="bold"`);
  const [ox, oy] = point(path.optimum);
  body += `<rect x="-5.5" y="-5.5" width="11" height="11" transform="translate(${n(ox)} ${n(oy)}) rotate(45)" fill="${colour.ink}" stroke="${colour.paper}" stroke-width="1.5"/>`;
  body += text(ox, oy + 22, 'x*', `text-anchor="middle" font-weight="bold"`);
  body += `<circle cx="${n(cx)}" cy="${n(cy)}" r="9" fill="${colour.paper}" stroke="${colour.target}" stroke-width="1.7"/>`;
  body += `<path d="M${n(cx - 5)},${n(cy)} H${n(cx + 5)} M${n(cx)},${n(cy - 5)} V${n(cy + 5)}" stroke="${colour.target}" stroke-width="1.7"/>`;
  body += text(cx + 14, cy - 10, 'z', `fill="${colour.target}" font-weight="bold"`);
  body += '</g>';
  body += text(X(xMax), Y(yMin) + 36, 'x₁', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 4, 'x₂', `fill="${colour.muted}"`);
  // Legend in two columns.
  const ly = H - 84, col2 = left + 262;
  body += line(left, ly - 4, left + 28, ly - 4, `stroke="${colour.orange}" stroke-width="3"`) + text(left + 36, ly, 'Zentralpfad 𝒞', `fill="${colour.muted}"`);
  body += line(col2, ly - 4, col2 + 28, ly - 4, `stroke="${colour.grey}" stroke-width="1.6" stroke-dasharray="3 4"`) + text(col2 + 36, ly, 'Newton-Iterierte der 1. Zentrierung', `fill="${colour.muted}"`);
  body += `<circle cx="${left + 14}" cy="${ly + 22}" r="5.5" fill="none" stroke="${colour.blue}" stroke-width="2"/>` + text(left + 36, ly + 27, 'Zentren x*(μ⁽ᵏ⁾), κ = 10', `fill="${colour.muted}"`);
  body += `<rect x="${col2 + 8}" y="${ly + 16}" width="12" height="12" rx="2" fill="none" stroke="${colour.purple}" stroke-width="2"/>` + text(col2 + 36, ly + 27, 'Startpunkt x₀', `fill="${colour.muted}"`);
  body += `<circle cx="${left + 14}" cy="${ly + 49}" r="5" fill="${colour.blue}"/>` + text(left + 36, ly + 54, `analytisches Zentrum ${subscriptA}`, `fill="${colour.muted}"`);
  body += `<rect x="-4.5" y="-4.5" width="9" height="9" transform="translate(${col2 + 14} ${ly + 49}) rotate(45)" fill="${colour.ink}"/>` + text(col2 + 36, ly + 54, 'Optimum x*', `fill="${colour.muted}"`);
  body += `<circle cx="${left + 14}" cy="${ly + 76}" r="6" fill="none" stroke="${colour.target}" stroke-width="1.7"/>` + text(left + 36, ly + 81, 'Ziel z', `fill="${colour.muted}"`);
  return svg(W, H, body);
}

// Figure 3: distances and objective gap along the path, both axes logarithmic.
function distancesFigure() {
  const W = 640, H = 380, left = 62, right = 24, top = 22, bottom = 48;
  const lMin = -3, lMax = 3, vMin = -4, vMax = 3;
  const X = mu => left + (lMax - Math.log10(mu)) / (lMax - lMin) * (W - left - right);
  const Y = v => top + (vMax - Math.log10(v)) / (vMax - vMin) * (H - top - bottom);
  const superscript = e => String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  let body = '';
  for (let e = vMin; e <= vMax; e++) {
    body += line(left, Y(10 ** e), W - right, Y(10 ** e), `stroke="${e === 0 ? colour.line : colour.grid}" stroke-width="${e === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(10 ** e) + 4, `10${superscript(e)}`, `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  for (let e = lMax; e >= lMin; e--) {
    body += line(X(10 ** e), top, X(10 ** e), Y(10 ** vMin), `stroke="${e === 0 ? colour.line : colour.grid}" stroke-width="${e === 0 ? 1 : 0.75}"`);
    body += text(X(10 ** e), H - bottom + 18, `10${superscript(e)}`, `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  const path = centralPath(vertices, q, z);
  const best = objective(path.optimum, q, z);
  const series = [
    [`‖x*(μ) − ${subscriptA}‖`, `stroke="${colour.orange}" stroke-width="2.4"`, p => Math.hypot(...sub(p.x, path.centre))],
    ['‖x*(μ) − x*‖', `stroke="${colour.ink}" stroke-width="2.4"`, p => Math.hypot(...sub(p.x, path.optimum))],
    ['f(x*(μ)) − f(x*)', `stroke="${colour.blue}" stroke-width="2.4"`, p => objective(p.x, q, z) - best],
    ['Dualitätslücke mμ', `stroke="${colour.blue}" stroke-width="1.8" stroke-dasharray="6 4"`, p => 4 * p.mu]
  ];
  body += `<clipPath id="area"><rect x="${left}" y="${top}" width="${n(W - left - right)}" height="${n(H - top - bottom)}"/></clipPath><g clip-path="url(#area)">`;
  for (const [, attributes, value] of series) {
    const points = path.points.map(p => [p.mu, value(p)]).filter(([, v]) => v > 10 ** (vMin - 1)).map(([mu, v]) => [X(mu), Y(Math.min(v, 10 ** (vMax + 1)))]);
    body += polyline(points, attributes);
  }
  body += '</g>';
  let ly = top + 16;
  const lx = W - right - 252;
  for (const [label, attributes] of series) {
    body += line(lx, ly - 4, lx + 28, ly - 4, attributes);
    body += text(lx + 36, ly, label, 'font-size="12"');
    ly += 19;
  }
  body += text(W - right, H - 8, 'Barriereparameter μ (fallend)', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, 'Abstand bzw. Zielkostendifferenz', `fill="${colour.muted}"`);
  return svg(W, H, body);
}

for (const [name, figure] of [['barriere.svg', barrierFigure], ['pfadverfolgung.svg', methodFigure], ['abstaende.svg', distancesFigure]]) {
  writeFileSync(join(target, name), figure(), 'utf8');
  console.log('wrote', name);
}
