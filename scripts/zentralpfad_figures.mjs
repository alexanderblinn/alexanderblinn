// Generates the static SVG figures of content/notes/zentralpfad.md from the demo's own solver.
// Run from the project root with Node.js 22 or newer: node scripts/zentralpfad_figures.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matrix, constraints, slacks, objective, add, sub, scale, multiply, dot } from '../assets/notes/zentralpfad/math.mjs';
import { centralPath, barrierOptimum, barrierDerivatives, constrainedOptimum } from '../assets/notes/zentralpfad/barrier.mjs';

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
const subscriptRef = 'x<tspan dy="4" font-size="10">ref</tspan>';
const superscript = e => String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
const arrowMarkers = names => `<defs>${names.map(name => `<marker id="arrow-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${colour[name]}"/></marker>`).join('')}</defs>`;
const edgeNames = ['AB', 'BC', 'CD', 'DA'];

// Default problem of the demo and the Newton start used in the note's code example.
const vertices = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const q = matrix(1, 3, -25), xRef = [2.8, 1.2], x0 = [-1, -0.8];
const limits = constraints(vertices);

// Damped Newton iterates of one centering, for the figure of the barrier method.
function newtonIterates(mu, start) {
  const iterates = [start];
  let x = start;
  for (let iteration = 0; iteration < 60; iteration++) {
    const current = barrierDerivatives(x, q, xRef, limits, mu);
    const det = current.h[0] * current.h[2] - current.h[1] * current.h[1];
    const step = [-(current.h[2] * current.g[0] - current.h[1] * current.g[1]) / det, -(current.h[0] * current.g[1] - current.h[1] * current.g[0]) / det];
    const descent = dot(current.g, step);
    if (Math.max(Math.abs(current.g[0]), Math.abs(current.g[1])) < 1e-10 || -descent < 1e-20) break;
    let alpha = 1;
    limits.forEach(({ a }, i) => { const toward = dot(a, step); if (toward > 0) alpha = Math.min(alpha, 0.995 * current.s[i] / toward); });
    for (let backtrack = 0; backtrack < 60; backtrack++) {
      const trial = add(x, scale(step, alpha)), next = barrierDerivatives(trial, q, xRef, limits, mu);
      if (next && next.value <= current.value + 1e-4 * alpha * descent + 1e-14 * (1 + Math.abs(current.value))) { x = trial; break; }
      alpha *= 0.5;
    }
    iterates.push(x);
  }
  return iterates;
}

// Barrier figure: the one-dimensional barrier -mu log s for several mu and the indicator function.
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
  body += text(W - right, H - 8, 'Schlupf s = bᵢ − aᵢᵀx', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, '−μ log s', `fill="${colour.muted}"`);
  return svg(W, H, body);
}

// Method figure: the central path and the barrier method following it from a start point x0.
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
  const [cx, cy] = point(xRef);
  for (const level of [0.15, 0.35, 0.7, 1.3, 2.4, 4.2, 7, 11, 17, 25, 38, 56]) {
    body += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(Math.sqrt(2 * level / 1) * unit)}" ry="${n(Math.sqrt(2 * level / 3) * unit)}" transform="rotate(25 ${n(cx)} ${n(cy)})" fill="none" stroke="${colour.contour}" stroke-width="1" opacity="0.3"/>`;
  }
  const path = centralPath(vertices, q, xRef);
  body += polyline([path.centre, ...path.points.map(p => p.x)].map(point), `stroke="${colour.orange}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`);
  // Barrier method: Newton iterates of the first centering from x0, then centres for kappa = 10.
  const iterates = newtonIterates(100, x0);
  body += polyline(iterates.map(point), `stroke="${colour.grey}" stroke-width="1.6" stroke-dasharray="3 4"`);
  iterates.slice(1, -1).forEach(p => { const [ix, iy] = point(p); body += `<circle cx="${n(ix)}" cy="${n(iy)}" r="3" fill="${colour.grey}"/>`; });
  let guess = iterates.at(-1);
  const centres = [100, 10, 1, 0.1, 0.01, 0.001].map(mu => { guess = barrierOptimum(limits, q, xRef, mu, guess); return { mu, x: guess }; });
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
  body += text(cx + 14, cy - 10, subscriptRef, `fill="${colour.target}" font-weight="bold"`);
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
  body += `<circle cx="${left + 14}" cy="${ly + 76}" r="6" fill="none" stroke="${colour.target}" stroke-width="1.7"/>` + text(left + 36, ly + 81, `Ziel ${subscriptRef}`, `fill="${colour.muted}"`);
  return svg(W, H, body);
}

// Distances figure: distances and objective gap along the path, both axes logarithmic.
function distancesFigure() {
  const W = 640, H = 380, left = 62, right = 24, top = 22, bottom = 48;
  const lMin = -3, lMax = 3, vMin = -4, vMax = 3;
  const X = mu => left + (lMax - Math.log10(mu)) / (lMax - lMin) * (W - left - right);
  const Y = v => top + (vMax - Math.log10(v)) / (vMax - vMin) * (H - top - bottom);
  let body = '';
  for (let e = vMin; e <= vMax; e++) {
    body += line(left, Y(10 ** e), W - right, Y(10 ** e), `stroke="${e === 0 ? colour.line : colour.grid}" stroke-width="${e === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(10 ** e) + 4, `10${superscript(e)}`, `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  for (let e = lMax; e >= lMin; e--) {
    body += line(X(10 ** e), top, X(10 ** e), Y(10 ** vMin), `stroke="${e === 0 ? colour.line : colour.grid}" stroke-width="${e === 0 ? 1 : 0.75}"`);
    body += text(X(10 ** e), H - bottom + 18, `10${superscript(e)}`, `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  const path = centralPath(vertices, q, xRef);
  const best = objective(path.optimum, q, xRef);
  const series = [
    [`‖x*(μ) − ${subscriptA}‖`, `stroke="${colour.orange}" stroke-width="2.4"`, p => Math.hypot(...sub(p.x, path.centre))],
    ['‖x*(μ) − x*‖', `stroke="${colour.ink}" stroke-width="2.4"`, p => Math.hypot(...sub(p.x, path.optimum))],
    ['f(x*(μ)) − f(x*)', `stroke="${colour.blue}" stroke-width="2.4"`, p => objective(p.x, q, xRef) - best],
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

// Exact optimal value of the problem with edge BC moved outward by delta (corners recomputed).
function shiftedOptimalValue(delta) {
  const lines = limits.map(({ a, b }, i) => ({ a, b: i === 1 ? b + delta : b }));
  const corners = lines.map((l2, i) => {
    const l1 = lines[(i + 3) % 4], det = l1.a[0] * l2.a[1] - l1.a[1] * l2.a[0];
    return [(l1.b * l2.a[1] - l1.a[1] * l2.b) / det, (l1.a[0] * l2.b - l1.b * l2.a[0]) / det];
  });
  return objective(constrainedOptimum(corners, q, xRef), q, xRef);
}

// KKT figure: force balance at the optimum (left) and the shadow price of edge BC (right).
function kktFigure() {
  const W = 640, H = 320, top = 30;
  const optimum = constrainedOptimum(vertices, q, xRef), best = objective(optimum, q, xRef);
  const pull = multiply(q, sub(xRef, optimum)), lambda = dot(pull, limits[1].a);
  let body = arrowMarkers(['target', 'green']);
  // Left: zoom on the optimum; both forces drawn 2.4 times longer to be visible.
  const size = 270, left = 24, xMin = 1.55, yMax = 2.25, unit = size / 1.8;
  const X = x => left + (x - xMin) * unit, Y = y => top + (yMax - y) * unit, point = p => [X(p[0]), Y(p[1])];
  body += text(left, top - 12, 'Kräftegleichgewicht im Optimum', `fill="${colour.muted}"`);
  body += `<clipPath id="zoom"><rect x="${left}" y="${top}" width="${size}" height="${size}"/></clipPath><g clip-path="url(#zoom)">`;
  body += `<polygon points="${vertices.map(point).map(p => `${n(p[0])},${n(p[1])}`).join(' ')}" fill="${colour.area}" fill-opacity="0.8" stroke="${colour.green}" stroke-width="1.8"/>`;
  const [cx, cy] = point(xRef);
  for (const level of [0.012, best, 0.14, 0.3, 0.55]) {
    const strong = level === best;
    body += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(Math.sqrt(2 * level) * unit)}" ry="${n(Math.sqrt(2 * level / 3) * unit)}" transform="rotate(25 ${n(cx)} ${n(cy)})" fill="none" stroke="${strong ? colour.ink : colour.contour}" stroke-width="${strong ? 1.4 : 1}" opacity="${strong ? 0.7 : 0.35}"/>`;
  }
  const [ox, oy] = point(optimum), stretch = 2.4;
  const [px, py] = point(add(optimum, scale(pull, stretch))), [qx, qy] = point(sub(optimum, scale(pull, stretch)));
  body += line(ox, oy, px, py, `stroke="${colour.target}" stroke-width="2.2" marker-end="url(#arrow-target)"`);
  body += line(ox, oy, qx, qy, `stroke="${colour.green}" stroke-width="2.2" marker-end="url(#arrow-green)"`);
  body += text(px - 6, py - 12, '−∇f(x*)', `text-anchor="end" fill="${colour.target}" font-weight="bold"`);
  body += text(qx + 4, qy - 12, '−λ*·a', `fill="${colour.green}" font-weight="bold"`);
  body += `<circle cx="${n(cx)}" cy="${n(cy)}" r="8" fill="${colour.paper}" stroke="${colour.target}" stroke-width="1.6"/>`;
  body += `<path d="M${n(cx - 4.5)},${n(cy)} H${n(cx + 4.5)} M${n(cx)},${n(cy - 4.5)} V${n(cy + 4.5)}" stroke="${colour.target}" stroke-width="1.6"/>`;
  body += text(cx + 4, cy + 26, subscriptRef, `fill="${colour.target}" font-weight="bold"`);
  body += `<rect x="-5.5" y="-5.5" width="11" height="11" transform="translate(${n(ox)} ${n(oy)}) rotate(45)" fill="${colour.ink}" stroke="${colour.paper}" stroke-width="1.5"/>`;
  body += text(ox - 10, oy + 26, 'x*', `text-anchor="end" font-weight="bold"`);
  const [ex, ey] = point([2.205, 0.5]);
  body += text(ex, ey, 'Kante BC', `fill="${colour.green}" transform="rotate(-82.5 ${n(ex)} ${n(ey)})"`);
  const [vx, vy] = point(vertices[2]);
  body += text(vx + 8, vy + 4, 'C', `fill="${colour.muted}"`);
  body += '</g>';
  body += `<rect x="${left}" y="${top}" width="${size}" height="${size}" fill="none" stroke="${colour.line}"/>`;
  // Right: optimal value when edge BC moves outward by delta; its slope at 0 is -lambda*.
  const pl = 368, pr = 624, pt = top, pb = top + 230, dMin = -0.5, dMax = 0.45, vMax = 0.36;
  const DX = d => pl + (d - dMin) / (dMax - dMin) * (pr - pl), PY = v => pb - v / vMax * (pb - pt);
  body += text(pl, top - 12, 'Schattenpreis der Kante BC', `fill="${colour.muted}"`);
  for (const d of [-0.4, -0.2, 0, 0.2, 0.4]) {
    body += line(DX(d), pt, DX(d), pb, `stroke="${d === 0 ? colour.line : colour.grid}" stroke-width="${d === 0 ? 1 : 0.75}"`);
    body += text(DX(d), pb + 17, german(d), `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  for (const v of [0, 0.1, 0.2, 0.3]) {
    body += line(pl, PY(v), pr, PY(v), `stroke="${v === 0 ? colour.line : colour.grid}" stroke-width="${v === 0 ? 1 : 0.75}"`);
    body += text(pl - 7, PY(v) + 4, german(v), `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  const curve = [];
  for (let d = dMin; d <= dMax + 1e-9; d += 0.005) curve.push([DX(d), PY(shiftedOptimalValue(d))]);
  body += polyline(curve, `stroke="${colour.orange}" stroke-width="2.4"`);
  body += line(DX(-0.3), PY(best + 0.3 * lambda), DX(0.26), PY(best - 0.26 * lambda), `stroke="${colour.blue}" stroke-width="1.6" stroke-dasharray="6 4"`);
  body += `<rect x="-5" y="-5" width="10" height="10" transform="translate(${n(DX(0))} ${n(PY(best))}) rotate(45)" fill="${colour.ink}"/>`;
  body += text(pr - 2, PY(0.12), `Steigung −λ* = −${german(lambda.toFixed(2))}`, `text-anchor="end" fill="${colour.blue}" font-size="12"`);
  body += text(DX(-0.3), PY(0.3), 'p*(δ)', `fill="${colour.orange}" font-weight="bold"`);
  body += text(pr, H - 8, 'Verschiebung δ nach außen', `text-anchor="end" fill="${colour.muted}"`);
  return { svg: svg(W, H, body), lambda };
}

// Perturbed complementarity: the pairs (s_i, lambda_i) of all four edges along the path lie on
// the hyperbola lambda s = mu and approach the corner set lambda s = 0 as mu falls.
function complementarityFigure() {
  const W = 640, H = 360, left = 56, right = 200, top = 22, bottom = 46, sMax = 4.6, lMax = 1.6;
  const X = s => left + s / sMax * (W - left - right), Y = l => top + (lMax - l) / lMax * (H - top - bottom);
  let body = '';
  for (let s = 0; s <= 4; s++) {
    body += line(X(s), top, X(s), Y(0), `stroke="${s === 0 ? colour.line : colour.grid}" stroke-width="${s === 0 ? 1 : 0.75}"`);
    body += text(X(s), H - bottom + 18, s, `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  for (const l of [0, 0.5, 1, 1.5]) {
    body += line(X(0), Y(l), X(sMax), Y(l), `stroke="${l === 0 ? colour.line : colour.grid}" stroke-width="${l === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(l) + 4, german(l), `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  const hyperbolas = [[1, 0.55], [0.5, 0.45], [0.2, 0.35], [0.05, 0.28]];
  for (const [mu, opacity] of hyperbolas) {
    const points = [];
    for (let s = mu / lMax; s <= sMax; s += 0.01) points.push([X(s), Y(mu / s)]);
    body += polyline(points, `stroke="${colour.orange}" stroke-opacity="${opacity}" stroke-width="1.6"`);
  }
  body += `<path d="M${n(X(0))},${n(Y(lMax))} V${n(Y(0))} H${n(X(sMax))}" fill="none" stroke="${colour.ink}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
  const path = centralPath(vertices, q, xRef).points.filter(p => p.mu <= 1 + 1e-9);
  edgeNames.forEach((name, i) => {
    const active = i === 1, stroke = active ? colour.ink : colour.green;
    const pairs = path.map(({ x, mu }) => { const s = slacks(x, limits)[i]; return [s, mu / s]; });
    body += polyline(pairs.map(([s, l]) => [X(s), Y(l)]), `stroke="${stroke}" stroke-width="${active ? 2.6 : 1.8}"`);
    const [s0, l0] = pairs[0], [s1, l1] = pairs.at(-1);
    body += `<circle cx="${n(X(s0))}" cy="${n(Y(l0))}" r="4" fill="${colour.paper}" stroke="${stroke}" stroke-width="1.6"/>`;
    body += `<circle cx="${n(X(s1))}" cy="${n(Y(l1))}" r="4" fill="${stroke}"/>`;
    body += text(X(s0) + 9, Y(l0) - 7, `Kante ${name}${active ? ' (aktiv)' : ''}`, `fill="${stroke}" font-size="12"${active ? ' font-weight="bold"' : ''}`);
  });
  let ly = top + 14;
  const lx = W - right + 24;
  for (const [mu, opacity] of hyperbolas) {
    body += line(lx, ly - 4, lx + 26, ly - 4, `stroke="${colour.orange}" stroke-opacity="${opacity}" stroke-width="1.6"`) + text(lx + 34, ly, `λs = ${german(mu)}`, 'font-size="12"');
    ly += 20;
  }
  body += line(lx, ly - 4, lx + 26, ly - 4, `stroke="${colour.ink}" stroke-width="1.8" stroke-dasharray="5 4"`) + text(lx + 34, ly, 'λs = 0, λ, s ≥ 0', 'font-size="12"');
  ly += 28;
  body += `<circle cx="${lx + 13}" cy="${ly - 4}" r="4" fill="${colour.paper}" stroke="${colour.muted}" stroke-width="1.6"/>` + text(lx + 34, ly, 'μ = 1', 'font-size="12"');
  ly += 20;
  body += `<circle cx="${lx + 13}" cy="${ly - 4}" r="4" fill="${colour.muted}"/>` + text(lx + 34, ly, 'μ = 10⁻³', 'font-size="12"');
  body += text(W - right, H - 8, 'Schlupf sᵢ', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, 'Multiplikator λᵢ = μ/sᵢ', `fill="${colour.muted}"`);
  return svg(W, H, body);
}

// One centering exactly as in the note's code example: damped Newton, Armijo backtracking,
// Phi = +inf outside, stop when half the squared Newton decrement is at most 1e-10.
const phi = (x, mu) => {
  const s = slacks(x, limits);
  return s.some(v => v <= 0) ? Infinity : objective(x, q, xRef) - mu * s.reduce((total, v) => total + Math.log(v), 0);
};
function centering(x, mu) {
  for (let steps = 0; ; steps++) {
    const s = slacks(x, limits);
    const g = limits.reduce((total, { a }, i) => add(total, scale(a, mu / s[i])), multiply(q, sub(x, xRef)));
    const h = limits.reduce((t, { a }, i) => { const w = mu / s[i] ** 2; return [t[0] + w * a[0] * a[0], t[1] + w * a[0] * a[1], t[2] + w * a[1] * a[1]]; }, [...q]);
    const det = h[0] * h[2] - h[1] * h[1], p = [-(h[2] * g[0] - h[1] * g[1]) / det, -(h[0] * g[1] - h[1] * g[0]) / det];
    if (-dot(g, p) / 2 <= 1e-10) return { x, steps };
    let t = 1;
    while (phi(add(x, scale(p, t)), mu) > phi(x, mu) + 0.1 * t * dot(g, p)) t *= 0.5;
    x = add(x, scale(p, t));
  }
}

// Barrier method from x0 with mu0 = 100 until the duality gap m mu is below 1e-6: the gap after
// each centering against the cumulated Newton steps, a staircase per factor kappa.
function convergenceFigure() {
  const W = 640, H = 360, left = 62, right = 24, top = 22, bottom = 48, eMin = -8, eMax = 3, epsilon = 1e-6;
  const runs = [[2, colour.green], [10, colour.blue], [100, colour.orange]].map(([kappa, stroke]) => {
    let x = x0, mu = 100, total = 0, centerings = 0;
    const stairs = [[0, 4 * mu]];
    for (;;) {
      const result = centering(x, mu);
      x = result.x; total += result.steps; centerings++;
      stairs.push([total, 4 * mu]);
      if (4 * mu < epsilon) break;
      mu /= kappa;
      stairs.push([total, 4 * mu]);
    }
    return { kappa, stroke, stairs, total, centerings };
  });
  const nMax = Math.ceil(Math.max(...runs.map(r => r.total)) / 10) * 10;
  const X = k => left + k / nMax * (W - left - right), Y = v => top + (eMax - Math.log10(v)) / (eMax - eMin) * (H - top - bottom);
  let body = '';
  for (let e = eMin; e <= eMax; e++) {
    body += line(left, Y(10 ** e), W - right, Y(10 ** e), `stroke="${e === 0 ? colour.line : colour.grid}" stroke-width="${e === 0 ? 1 : 0.75}"`);
    body += text(left - 8, Y(10 ** e) + 4, `10${superscript(e)}`, `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  for (let k = 0; k <= nMax; k += 10) {
    body += line(X(k), top, X(k), Y(10 ** eMin), `stroke="${k === 0 ? colour.line : colour.grid}" stroke-width="${k === 0 ? 1 : 0.75}"`);
    body += text(X(k), H - bottom + 18, k, `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  body += line(left, Y(epsilon), W - right, Y(epsilon), `stroke="${colour.ink}" stroke-width="1.2" stroke-dasharray="5 4"`);
  body += text(left + 6, Y(epsilon) - 6, 'Genauigkeit ε = 10⁻⁶', `fill="${colour.muted}" font-size="12"`);
  for (const run of runs) body += polyline(run.stairs.map(([k, v]) => [X(k), Y(v)]), `stroke="${run.stroke}" stroke-width="2.2"`);
  let ly = top + 16;
  const lx = W - right - 250;
  for (const run of runs) {
    body += line(lx, ly - 4, lx + 28, ly - 4, `stroke="${run.stroke}" stroke-width="2.2"`);
    body += text(lx + 36, ly, `κ = ${run.kappa}: ${run.centerings} Etappen, ${run.total} Schritte`, 'font-size="12"');
    ly += 19;
  }
  body += text(W - right, H - 8, 'Newton-Schritte insgesamt', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, 'Dualitätslücke mμ', `fill="${colour.muted}"`);
  return { svg: svg(W, H, body), runs };
}

const kkt = kktFigure(), convergence = convergenceFigure();
console.log(`lambda* = ${kkt.lambda.toFixed(4)}`);
for (const run of convergence.runs) console.log(`kappa = ${run.kappa}: ${run.centerings} centerings, ${run.total} Newton steps`);
for (const [name, figure] of [['barriere.svg', barrierFigure], ['pfadverfolgung.svg', methodFigure], ['abstaende.svg', distancesFigure],
  ['kkt.svg', () => kkt.svg], ['komplementaritaet.svg', complementarityFigure], ['konvergenz.svg', () => convergence.svg]]) {
  writeFileSync(join(target, name), figure(), 'utf8');
  console.log('wrote', name);
}
