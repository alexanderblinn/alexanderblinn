import { dot, sub, add, scale, multiply, objective, constraints, slacks, validPolygon } from './math.mjs';

// Phi(x, mu; x0) = f(x) - mu * sum log s_i(x) + mu^2/2 * |x - x0|^2.
// Three scales: for large mu the proximal term keeps the solution at x0, for medium mu the
// log barrier pushes it away from the edges, for small mu the objective leads it to the optimum.
// Values, gradients and Hessians are scaled by 1/max(1, mu^2) so that one tolerance fits all mu.
export function barrierDerivatives(x, x0, q, z, limits, mu) {
  const s = slacks(x, limits);
  if (s.some(v => !(v > 0))) return null;
  const weight = 1 / Math.max(1, mu * mu);
  const e = sub(x, z), qe = multiply(q, e), d = sub(x, x0);
  let value = 0.5 * dot(e, qe) + 0.5 * mu * mu * dot(d, d);
  const g = add(qe, scale(d, mu * mu)), h = [q[0] + mu * mu, q[1], q[2] + mu * mu];
  limits.forEach(({ a }, i) => {
    value -= mu * Math.log(s[i]);
    const first = mu / s[i], second = first / s[i];
    g[0] += first * a[0]; g[1] += first * a[1];
    h[0] += second * a[0] * a[0]; h[1] += second * a[0] * a[1]; h[2] += second * a[1] * a[1];
  });
  return { value: value * weight, g: scale(g, weight), h: h.map(v => v * weight), s };
}

function newtonStep(h, g) {
  const determinant = h[0] * h[2] - h[1] * h[1];
  if (!(determinant > 0)) throw new Error('Das Newton-System ist nicht positiv definit.');
  return [-(h[2] * g[0] - h[1] * g[1]) / determinant, -(h[0] * g[1] - h[1] * g[0]) / determinant];
}

// Damped Newton method; every iterate stays strictly inside the polygon.
export function barrierOptimum(limits, q, z, x0, mu, guess = x0) {
  if (!(mu > 0) || !Number.isFinite(mu)) throw new Error('Ungültiger Barriereparameter.');
  let x = [...guess];
  for (let iteration = 0; iteration < 100; iteration++) {
    const current = barrierDerivatives(x, x0, q, z, limits, mu);
    if (!current) throw new Error('Der Startwert muss strikt zulässig sein.');
    const step = newtonStep(current.h, current.g), descent = dot(current.g, step);
    if (Math.max(Math.abs(current.g[0]), Math.abs(current.g[1])) < 1e-10 || -descent < 1e-20) return x;
    let alpha = 1;
    limits.forEach(({ a }, i) => {
      const towardEdge = dot(a, step);
      if (towardEdge > 0) alpha = Math.min(alpha, 0.995 * current.s[i] / towardEdge);
    });
    let accepted = false;
    for (let backtrack = 0; backtrack < 60; backtrack++) {
      const trial = add(x, scale(step, alpha));
      const next = barrierDerivatives(trial, x0, q, z, limits, mu);
      if (next && next.value <= current.value + 1e-4 * alpha * descent + 1e-14 * (1 + Math.abs(current.value))) {
        x = trial; accepted = true; break;
      }
      alpha *= 0.5;
    }
    if (!accepted) throw new Error('Das Barriereproblem konnte nicht gelöst werden.');
  }
  throw new Error('Das Barriereproblem ist noch nicht genau genug gelöst.');
}

// Exact optimum of the quadratic program: z if feasible, otherwise the best of the four
// vertices and of the minima of f along the four edges.
export function constrainedOptimum(vertices, q, z) {
  if (slacks(z, constraints(vertices)).every(v => v >= 0)) return [...z];
  const candidates = vertices.map(v => [...v]);
  vertices.forEach((v, i) => {
    const d = sub(vertices[(i + 1) % 4], v);
    const t = dot(d, multiply(q, sub(z, v))) / dot(d, multiply(q, d));
    if (t > 0 && t < 1) candidates.push(add(v, scale(d, t)));
  });
  return candidates.reduce((best, x) => objective(x, q, z) < objective(best, q, z) ? x : best);
}

function validate(vertices, q, z, x0) {
  if (!validPolygon(vertices)) throw new Error('Das Viereck muss strikt konvex bleiben.');
  if (!Array.isArray(x0) || x0.length !== 2 || !x0.every(Number.isFinite)
      || slacks(x0, constraints(vertices)).some(v => v <= 0)) {
    throw new Error('Der Anfangspunkt muss strikt im Inneren liegen.');
  }
  if (q.length !== 3 || !q.every(Number.isFinite) || !(q[0] > 0 && q[0] * q[2] > q[1] ** 2)
      || z.length !== 2 || !z.every(Number.isFinite)) throw new Error('Ungültige Modellparameter.');
}

// The central path for mu from 10^3 down to 10^-3, fifty values per decade.
export function centralPath(vertices, q, z, x0, { count = 301 } = {}) {
  validate(vertices, q, z, x0);
  if (!Number.isInteger(count) || count < 2) throw new Error('Mindestens zwei Werte für μ sind erforderlich.');
  const limits = constraints(vertices);
  let guess = [...x0];
  const points = Array.from({ length: count }, (_, i) => {
    const mu = 10 ** (3 - 6 * i / (count - 1));
    const x = barrierOptimum(limits, q, z, x0, mu, guess);
    guess = x;
    return { x, mu };
  });
  return { points, limits, optimum: constrainedOptimum(vertices, q, z) };
}
