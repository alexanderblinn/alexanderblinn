// Geometry of the two interactive figures of the note on constrained convex optimisation.
// Pure functions without DOM access; tests/beschraenkte-optimierung.test.mjs checks them.
// The example is the quadrilateral ABCD and the objective of the Zentralpfad note.
import { add, constraints, dot, matrix, multiply, scale, sub } from '../zentralpfad/math.mjs';

export const VERTICES = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
export const CORNER_NAMES = ['A', 'B', 'C', 'D'];
export const Q = matrix(1, 3, -25);
// Target whose constrained optimum is the corner C, where the edges BC and CD are active.
export const CORNER_TARGET = [3.4, 2.3];
export const LIMITS = constraints(VERTICES);

export const satisfies = (x, limits) => limits.every(({ a, b }) => dot(a, x) <= b + 1e-12);

// The part of a convex polygon (counter-clockwise list of points) with a^T x <= b.
export function clipHalfPlane(polygon, a, b) {
  const result = [];
  polygon.forEach((p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    const fp = dot(a, p) - b, fq = dot(a, q) - b;
    if (fp <= 0) result.push(p);
    if (fp * fq < 0) result.push(add(p, scale(sub(q, p), fp / (fp - fq))));
  });
  return result;
}

// Intersection of a rectangle [x0, x1] x [y0, y1] with the first k half-planes.
export function intersection(rect, limits, k = limits.length) {
  const [x0, x1, y0, y1] = rect;
  return limits.slice(0, k).reduce((polygon, { a, b }) => clipHalfPlane(polygon, a, b), [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
}

// Checks a segment by sampling it, independently of the convexity argument it illustrates.
export function segmentInside(p, q, limits, samples = 24) {
  for (let i = 0; i <= samples; i++) {
    if (!satisfies(add(p, scale(sub(q, p), i / samples)), limits)) return false;
  }
  return true;
}

// Small deterministic generator (mulberry32), so the figure starts with the same points every time.
export function random(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Points spread over the rectangle: `inside` of them in the polygon, `outside` outside of it,
// none closer than `gap` to another point.
export function scatter(seed, rect, limits, inside, outside, gap = 0.55) {
  const next = random(seed), points = [];
  let wantedIn = inside, wantedOut = outside, tries = 0;
  while ((wantedIn > 0 || wantedOut > 0) && tries++ < 20000) {
    const p = [rect[0] + 0.3 + next() * (rect[1] - rect[0] - 0.6), rect[2] + 0.3 + next() * (rect[3] - rect[2] - 0.6)];
    if (points.some(q => Math.hypot(...sub(p, q)) < gap)) continue;
    const isIn = satisfies(p, limits);
    if (isIn && wantedIn > 0) { points.push(p); wantedIn--; }
    else if (!isIn && wantedOut > 0) { points.push(p); wantedOut--; }
  }
  return points;
}

// Writes v as a combination l1 a1 + l2 a2 of two independent vectors (Cramer's rule).
export function combination(v, a1, a2) {
  const det = a1[0] * a2[1] - a1[1] * a2[0];
  return [(v[0] * a2[1] - v[1] * a2[0]) / det, (a1[0] * v[1] - a1[1] * v[0]) / det];
}

// Closest point of the cone {l1 a1 + l2 a2 : l1, l2 >= 0} to v. Inside the cone that is v itself;
// otherwise it lies on one of the two rays or at the apex. The residual d = v - k then satisfies
// a1^T d <= 0, a2^T d <= 0 and v^T d = |d|^2 (Farkas): with v = -grad f, d is a feasible descent direction.
export function coneProjection(v, a1, a2) {
  const [l1, l2] = combination(v, a1, a2);
  if (l1 >= 0 && l2 >= 0) return { lambda: [l1, l2], inside: true, residual: [0, 0] };
  const candidates = [[0, 0]];
  const t1 = dot(v, a1) / dot(a1, a1), t2 = dot(v, a2) / dot(a2, a2);
  if (t1 > 0) candidates.push([t1, 0]);
  if (t2 > 0) candidates.push([0, t2]);
  const residualOf = ([m1, m2]) => sub(v, add(scale(a1, m1), scale(a2, m2)));
  const lambda = candidates.reduce((best, c) => Math.hypot(...residualOf(c)) < Math.hypot(...residualOf(best)) ? c : best);
  return { lambda, inside: false, residual: residualOf(lambda) };
}

// The corner example: optimum C, its two active outward normals and the pull -grad f(C).
export function cornerExample(target = CORNER_TARGET) {
  const corner = VERTICES[2];
  return {
    corner,
    normals: [LIMITS[1].a, LIMITS[2].a],
    pull: scale(multiply(Q, sub(corner, target)), -1),
  };
}
