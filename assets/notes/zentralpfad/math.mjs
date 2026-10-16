// Geometry and quadratic costs for the central path demo.
// Pure functions: the visualisation and numerical checks share this implementation.
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const scale = (a, s) => [a[0] * s, a[1] * s];
export const multiply = (q, x) => [q[0] * x[0] + q[1] * x[1], q[1] * x[0] + q[2] * x[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

export function matrix(k1, k2, angle) {
  const c = Math.cos(angle * Math.PI / 180), s = Math.sin(angle * Math.PI / 180);
  return [k1 * c * c + k2 * s * s, (k1 - k2) * s * c, k1 * s * s + k2 * c * c];
}

export function validPolygon(vertices) {
  if (vertices.length !== 4 || vertices.some(p => p.some(v => !Number.isFinite(v)))) return false;
  return vertices.every((v, i) => {
    const edge = sub(vertices[(i + 1) % 4], v);
    const next = sub(vertices[(i + 2) % 4], vertices[(i + 1) % 4]);
    return Math.hypot(...edge) > 0.45 && cross(edge, next) > 0.35;
  });
}

export function constraints(vertices) {
  return vertices.map((v, i) => {
    const edge = sub(vertices[(i + 1) % 4], v), length = Math.hypot(...edge);
    const a = [edge[1] / length, -edge[0] / length];
    return { a, b: dot(a, v) };
  });
}
export const slacks = (x, limits) => limits.map(({ a, b }) => b - dot(a, x));
export const objective = (x, q, z) => 0.5 * dot(sub(x, z), multiply(q, sub(x, z)));
export const centroid = vertices => scale(vertices.reduce(add, [0, 0]), 1 / vertices.length);

// Share of the total length of a polyline reached at each node; uniform if the polyline has no length.
export function pathFractions(nodes) {
  let total = 0;
  const cumulative = nodes.map((p, i) => (total += i ? Math.hypot(...sub(p, nodes[i - 1])) : 0));
  return cumulative.map((v, i) => total > 0 ? v / total : i / Math.max(1, nodes.length - 1));
}
// Largest node index whose fraction does not exceed the progress.
export function indexAt(fractions, progress) {
  let k = 0;
  while (k + 1 < fractions.length && fractions[k + 1] <= progress) k++;
  return k;
}

// Restrict a drag to convex, non-degenerate quadrilaterals instead of changing vertex order.
export function safePolygonMove(before, desired) {
  if (!validPolygon(before)) throw new Error('Das Ausgangsviereck ist nicht zulässig.');
  if (validPolygon(desired)) return desired;
  let low = 0, high = 1;
  for (let i = 0; i < 25; i++) {
    const t = (low + high) / 2;
    const trial = before.map((p, j) => add(p, scale(sub(desired[j], p), t)));
    if (validPolygon(trial)) low = t; else high = t;
  }
  return before.map((p, j) => add(p, scale(sub(desired[j], p), low)));
}
