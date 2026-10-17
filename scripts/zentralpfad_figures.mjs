// Generates the static SVG figures of content/notes/zentralpfad.md from the demo's own solver;
// centering and correction are the interactive figure zentrierung.html (method.mjs).
// Run from the project root with Node.js 22 or newer: node scripts/zentralpfad_figures.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matrix, constraints, slacks, objective, add, sub, scale, multiply, dot } from '../assets/notes/zentralpfad/math.mjs';
import { centralPath, constrainedOptimum } from '../assets/notes/zentralpfad/barrier.mjs';

const target = join(dirname(fileURLToPath(import.meta.url)), '../public/img/notes/zentralpfad');
const colour = { paper: '#faf9f6', ink: '#252525', muted: '#65635d', grid: '#e6e3db', line: '#c9c6be', orange: '#b95a28', blue: '#173fbe', green: '#426f6b', area: '#e5eeeb', purple: '#685d94', target: '#8a5979', contour: '#647e83', grey: '#8d8a82' };
const n = v => Number(v.toFixed(2));
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="Courier New, Courier, monospace" font-size="13" fill="${colour.ink}">
<rect width="${width}" height="${height}" fill="${colour.paper}"/>
${body}
</svg>
`;
const text = (x, y, content, attributes = '') => `<text x="${n(x)}" y="${n(y)}" ${attributes}>${content}</text>`;
const line = (x1, y1, x2, y2, attributes) => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${attributes}/>`;
const polyline = (points, attributes) => `<polyline points="${points.map(p => `${n(p[0])},${n(p[1])}`).join(' ')}" fill="none" ${attributes}/>`;
const subscriptRef = 'x<tspan dy="4" font-size="10">ref</tspan>';
const arrowMarkers = names => `<defs>${names.map(name => `<marker id="arrow-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${colour[name]}"/></marker>`).join('')}</defs>`;
const edgeNames = ['AB', 'BC', 'CD', 'DA'];

// Default problem of the demo.
const vertices = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const q = matrix(1, 3, -25), xRef = [2.8, 1.2];
const limits = constraints(vertices);

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
    body += text(X(s), H - bottom + 18, String(s), `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
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
    body += text(legendX + 34, ly, `μ = ${String(mu)}`);
    ly += 22;
  }
  body += line(legendX, ly - 4, legendX + 26, ly - 4, `stroke="${colour.ink}" stroke-width="1.6" stroke-dasharray="5 4"`);
  body += text(legendX + 34, ly, 'Indikator');
  body += text(legendX + 34, ly + 16, 'I(s)', `fill="${colour.muted}" font-size="12"`);
  body += text(W - right, H - 8, 'Schlupf s = bᵢ − aᵢᵀx', `text-anchor="end" fill="${colour.muted}"`);
  body += text(left, top - 8, '−μ log s', `fill="${colour.muted}"`);
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
    body += text(DX(d), pb + 17, String(d), `text-anchor="middle" fill="${colour.muted}" font-size="12"`);
  }
  for (const v of [0, 0.1, 0.2, 0.3]) {
    body += line(pl, PY(v), pr, PY(v), `stroke="${v === 0 ? colour.line : colour.grid}" stroke-width="${v === 0 ? 1 : 0.75}"`);
    body += text(pl - 7, PY(v) + 4, String(v), `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  const curve = [];
  for (let d = dMin; d <= dMax + 1e-9; d += 0.005) curve.push([DX(d), PY(shiftedOptimalValue(d))]);
  body += polyline(curve, `stroke="${colour.orange}" stroke-width="2.4"`);
  body += line(DX(-0.3), PY(best + 0.3 * lambda), DX(0.26), PY(best - 0.26 * lambda), `stroke="${colour.blue}" stroke-width="1.6" stroke-dasharray="6 4"`);
  body += `<rect x="-5" y="-5" width="10" height="10" transform="translate(${n(DX(0))} ${n(PY(best))}) rotate(45)" fill="${colour.ink}"/>`;
  body += text(pr - 2, PY(0.12), `Steigung −λ* = −${String(lambda.toFixed(2))}`, `text-anchor="end" fill="${colour.blue}" font-size="12"`);
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
    body += text(left - 8, Y(l) + 4, String(l), `text-anchor="end" fill="${colour.muted}" font-size="12"`);
  }
  // Hyperbolas from saturated to pale orange as mu falls.
  const hyperbolas = [[1, '#b95a28'], [0.5, '#cd7e4f'], [0.2, '#dfa47f'], [0.05, '#edc9b1']];
  for (const [mu, stroke] of hyperbolas) {
    const points = [];
    for (let s = mu / lMax; s <= sMax; s += 0.01) points.push([X(s), Y(mu / s)]);
    body += polyline(points, `stroke="${stroke}" stroke-width="2"`);
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
  for (const [mu, stroke] of hyperbolas) {
    body += line(lx, ly - 4, lx + 26, ly - 4, `stroke="${stroke}" stroke-width="2"`) + text(lx + 34, ly, `λs = ${String(mu)}`, 'font-size="12"');
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

const kkt = kktFigure();
console.log(`lambda* = ${kkt.lambda.toFixed(4)}`);
for (const [name, figure] of [['barriere.svg', barrierFigure], ['kkt.svg', () => kkt.svg],
  ['komplementaritaet.svg', complementarityFigure]]) {
  writeFileSync(join(target, name), figure(), 'utf8');
  console.log('wrote', name);
}
