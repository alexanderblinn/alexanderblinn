// The running example of chapter 1 of the note on constrained optimisation (Grundlagen und
// Motivation), shared by the interactive figures 2 to 4 and tests/beschraenkte-optimierung.test.mjs.
// Pure functions without DOM access.
//   f(x)  = 1/2 (x1 - 3.2)^2 + 3/2 (x2 - 2)^2
//   c1(x) = x1^2 + x2^2 - 4                  <= 0   inside the circle of radius 2
//   c2(x) = 1 - (x1 + 1.3)^2 - (x2 + 1.9)^2  <= 0   outside the unit circle around (-1.3, -1.9)
//   c3(x) = x2 - 1.2                         <= 0   below the line x2 = 1.2
// c2 bites a piece out of the disk, so the feasible set is not convex. The optimum is the corner
// x* = (1.6, 1.2), where c1 and c3 are active with the multipliers 1/2 and 6/5.
import { add, dot, scale, sub } from '../zentralpfad/math.mjs';

export const TARGET = [3.2, 2];
// Figure 1 lets the target, the unconstrained minimum x_ref, move.
export const f = (x, target = TARGET) => 0.5 * (x[0] - target[0]) ** 2 + 1.5 * (x[1] - target[1]) ** 2;
export const gradient = (x, target = TARGET) => [x[0] - target[0], 3 * (x[1] - target[1])];
// level set f(x) = level: an ellipse around TARGET with these semi-axes
export const ellipseAxes = level => [Math.sqrt(2 * level), Math.sqrt(2 * level / 3)];

const distance = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

// c(x) = |x - centre|^2 - r^2 (inside) or r^2 - |x - centre|^2 (outside the circle)
function circle(centre, radius, inside) {
  const sign = inside ? 1 : -1;
  return {
    kind: 'circle', centre, radius, inside,
    value: x => sign * (dot(sub(x, centre), sub(x, centre)) - radius ** 2),
    gradient: x => scale(sub(x, centre), 2 * sign),
    project: x => {
      const d = sub(x, centre), length = Math.hypot(...d);
      return length < 1e-12 ? add(centre, [radius, 0]) : add(centre, scale(d, radius / length));
    },
  };
}
// c(x) = x2 - height
function line(height) {
  return { kind: 'line', height, value: x => x[1] - height, gradient: () => [0, 1], project: x => [x[0], height] };
}

export const CONSTRAINTS = [circle([0, 0], 2, true), circle([-1.3, -1.9], 1, false), line(1.2)];
export const OPTIMUM = [1.6, 1.2];

export const values = x => CONSTRAINTS.map(c => c.value(x));
export const feasible = (x, tolerance = 1e-9) => values(x).every(v => v <= tolerance);
// active set A(x) with the numbers 1, 2, 3 of the constraints
export const activeSet = (x, tolerance = 1e-9) => values(x).flatMap((v, i) => (Math.abs(v) <= tolerance ? [i + 1] : []));

// Intersections of two boundaries that belong to the feasible set (its corners).
function crossings(c, d) {
  if (c.kind === 'line') return crossings(d, c);
  if (d.kind === 'line') {
    const h = d.height - c.centre[1], w = c.radius ** 2 - h ** 2;
    return w < 0 ? [] : [[c.centre[0] - Math.sqrt(w), d.height], [c.centre[0] + Math.sqrt(w), d.height]];
  }
  const between = sub(d.centre, c.centre), length = Math.hypot(...between);
  const along = (c.radius ** 2 - d.radius ** 2 + length ** 2) / (2 * length);
  const w = c.radius ** 2 - along ** 2;
  if (w < 0) return [];
  const unit = scale(between, 1 / length), normal = [-unit[1], unit[0]];
  const foot = add(c.centre, scale(unit, along));
  return [add(foot, scale(normal, Math.sqrt(w))), add(foot, scale(normal, -Math.sqrt(w)))];
}
export const CORNERS = CONSTRAINTS.flatMap((c, i) => CONSTRAINTS.slice(i + 1).flatMap((d, k) =>
  crossings(c, d).filter(p => feasible(p, 1e-9)).map(point => ({ point, pair: [i + 1, i + k + 2] }))));

// The boundary c_i(x) = 0 as samples {t, p}: circles by the angle t, the line by t = x1 between
// `from` and `to`. point(i, t) gives the point for any t.
export function point(i, t) {
  const c = CONSTRAINTS[i];
  return c.kind === 'line' ? [t, c.height] : [c.centre[0] + c.radius * Math.cos(t), c.centre[1] + c.radius * Math.sin(t)];
}
function boundarySamples(i, from, to) {
  const n = CONSTRAINTS[i].kind === 'line' ? Math.ceil((to - from) / 0.02) : 720;
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = CONSTRAINTS[i].kind === 'line' ? from + (k * (to - from)) / n : (2 * Math.PI * k) / n;
    return { t, p: point(i, t) };
  });
}
const onOthers = (i, p) => CONSTRAINTS.every((other, k) => k === i || other.value(p) <= 1e-12);

// The pieces of c_i(x) = 0 that belong to the boundary of the feasible set, ending in its corners.
export function boundaryPieces(i, from = -4, to = 4) {
  const samples = boundarySamples(i, from, to);
  const inside = samples.map(({ p }) => onOthers(i, p));
  const pieces = [];
  let piece = null;
  samples.forEach((s, k) => {
    if (inside[k]) (piece ??= []).push(s);
    else if (piece) { pieces.push(piece); piece = null; }
  });
  if (piece) pieces.push(piece);
  // a closed circle: the pieces at the angles 0 and 2 pi are one
  if (CONSTRAINTS[i].kind === 'circle' && pieces.length > 1 && inside[0] && inside.at(-1)) {
    const last = pieces.pop().map(({ t, p }) => ({ t: t - 2 * Math.PI, p }));
    pieces[0] = [...last, ...pieces[0]];
  }
  const near = p => CORNERS.find(({ point: q, pair }) => pair.includes(i + 1) && distance(p, q) < 0.05)?.point;
  return pieces.map(piece => [near(piece[0].p) ?? piece[0].p, ...piece.map(s => s.p), near(piece.at(-1).p) ?? piece.at(-1).p]);
}

// Global minimum of f over the feasible set for any target: the target itself if it is feasible,
// otherwise the best boundary point (f is strictly convex). Every boundary piece is sampled and
// the best sample refined by a golden-section search on its parameter; corners are candidates too.
export function constrainedMinimum(target = TARGET) {
  if (feasible(target)) return { point: target, active: [] };
  let best = null;
  const consider = p => {
    if (!feasible(p, 1e-9)) return;
    const value = f(p, target);
    if (!best || value < best.value) best = { point: p, value };
  };
  CORNERS.forEach(({ point: p }) => consider(p));
  CONSTRAINTS.forEach((_, i) => {
    const samples = boundarySamples(i, -2.5, 2.5), closed = CONSTRAINTS[i].kind === 'circle';
    const n = closed ? samples.length - 1 : samples.length;  // a circle repeats its first sample at the end
    const step = samples[1].t - samples[0].t;
    const value = k => {
      if (k < 0 || k >= n) return closed ? value((k + n) % n) : Infinity;
      return onOthers(i, samples[k].p) ? f(samples[k].p, target) : Infinity;
    };
    for (let k = 0; k < n; k++) {
      if (value(k) === Infinity || value(k) > value(k - 1) || value(k) > value(k + 1)) continue;
      let a = samples[k].t - step, b = samples[k].t + step;
      const g = (Math.sqrt(5) - 1) / 2;
      const h = t => (onOthers(i, point(i, t)) ? f(point(i, t), target) : Infinity);
      for (let n = 0; n < 60; n++) {
        const u = b - g * (b - a), v = a + g * (b - a);
        if (h(u) <= h(v)) b = v; else a = u;
      }
      consider(point(i, (a + b) / 2));
    }
  });
  return { point: best.point, active: activeSet(best.point, 1e-7) };
}

// The point figure 2 shows for the pointer at p: a corner or a boundary point of the feasible
// set if p is closer than `reach`, otherwise p itself. On a boundary the constraint is then active.
export function snap(p, reach) {
  const corner = CORNERS.find(({ point }) => distance(p, point) < 1.4 * reach);
  if (corner) return corner.point;
  let best = null;
  CONSTRAINTS.forEach((c, i) => {
    const q = c.project(p), d = distance(p, q);
    const onBoundary = CONSTRAINTS.every((other, k) => k === i || other.value(q) <= 1e-9);
    if (d < reach && onBoundary && (!best || d < best.d)) best = { q, d };
  });
  return best ? best.q : p;
}

// Figure 3: the constraint c1 alone, as c1(x) = 0 (the circle) or c1(x) <= 0 (the disk).
// The point x = 2 (cos t, sin t) lies on the circle; grad f(x) + lambda grad c1(x) = 0 holds
// exactly where the level ellipse of f touches the circle.
export const onCircle = angle => [2 * Math.cos(angle), 2 * Math.sin(angle)];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
export const tangentialPull = angle => cross(gradient(onCircle(angle)), onCircle(angle));
// lambda with the smallest |grad f + lambda grad c1| at x
export const multiplier = x => -dot(gradient(x), CONSTRAINTS[0].gradient(x)) / dot(CONSTRAINTS[0].gradient(x), CONSTRAINTS[0].gradient(x));
export function circleStationary() {
  const result = [], steps = 3600;
  for (let k = 0; k < steps; k++) {
    let a = (2 * Math.PI * k) / steps, b = (2 * Math.PI * (k + 1)) / steps;
    if (Math.sign(tangentialPull(a)) === Math.sign(tangentialPull(b))) continue;
    for (let n = 0; n < 60; n++) {
      const m = (a + b) / 2;
      if (Math.sign(tangentialPull(m)) === Math.sign(tangentialPull(a))) a = m; else b = m;
    }
    const point = onCircle((a + b) / 2);
    result.push({ angle: (a + b) / 2, point, lambda: multiplier(point), value: f(point) });
  }
  return result;
}

// Figure 4: the corner x*, the gradients of the two active constraints and the pull -grad f(x*).
export function cornerBalance() {
  return {
    corner: OPTIMUM,
    normals: [CONSTRAINTS[0].gradient(OPTIMUM), CONSTRAINTS[2].gradient(OPTIMUM)],
    pull: scale(gradient(OPTIMUM), -1),
  };
}
