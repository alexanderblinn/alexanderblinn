import test from 'node:test';
import assert from 'node:assert/strict';
import { matrix, constraints, slacks, objective, safePolygonMove, validPolygon, validInitial, safeInitialMove, centroid, pathFractions, indexAt, add, sub, scale, dot, multiply } from '../assets/notes/zentralpfad/math.mjs';
import { barrierDerivatives, barrierOptimum, centralPath, constrainedOptimum } from '../assets/notes/zentralpfad/barrier.mjs';

const polygon = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const q = matrix(1, 3, -25), z = [2.8, 1.2], x0 = [-1, -.8];
const close = (a, b, tol = 1e-7) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let seed = 173;
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
// Gradient of the plain log barrier, written independently of the solver.
const barrierGradient = (x, limits) => slacks(x, limits).reduce((sum, s, k) => add(sum, scale(limits[k].a, 1 / s)), [0, 0]);
const randomProblem = () => {
  const vertices = safePolygonMove(polygon, polygon.map(p => p.map(v => v + random() - .5)));
  const curvature = matrix(.4 + 5.6 * random(), .4 + 5.6 * random(), 180 * random() - 90);
  const target = [7.2 * random() - 3.6, 7.2 * random() - 3.6];
  return { vertices, curvature, target };
};
// Index of a barrier parameter in the computed path: mu = 10^(3 - i / 50).
const at = mu => Math.round(50 * (3 - Math.log10(mu)));

test('the central path samples mu from 10^3 to 10^-3, starts in x0 and ends in the optimum', () => {
  const saved = [...x0];
  const path = centralPath(polygon, q, z, x0);
  assert.equal(path.points.length, 301);
  close(path.points[0].mu, 1e3, 1e-9);
  close(path.points.at(-1).mu, 1e-3, 1e-15);
  for (let i = 1; i < path.points.length; i++) close(path.points[i].mu / path.points[i - 1].mu, 10 ** (-1 / 50), 1e-12);
  assert.ok(distance(path.points[0].x, x0) < 2e-3);
  assert.ok(distance(path.points.at(-1).x, path.optimum) < 1e-2);
  assert.deepEqual(x0, saved);
});

test('every path point is strictly feasible and stationary; the path leaves x0 away from the near edges', () => {
  let checked = 0;
  for (let trial = 0; trial < 16; trial++) {
    const { vertices, curvature, target } = randomProblem();
    const start = add(centroid(vertices), [random() - .5, random() - .5]);
    if (!validInitial(vertices, start)) continue;
    const path = centralPath(vertices, curvature, target, start);
    for (const { x, mu } of path.points) {
      assert.ok(slacks(x, path.limits).every(v => v > 0));
      const d = barrierDerivatives(x, start, curvature, target, path.limits, mu);
      assert.ok(Math.max(Math.abs(d.g[0]), Math.abs(d.g[1])) < 1e-8);
    }
    assert.ok(distance(path.points[0].x, start) < 1e-2);
    assert.ok(distance(path.points.at(-1).x, path.optimum) < 2e-2);
    // For large mu the displacement from x0 is -g0 / mu to first order, g0 the barrier gradient in x0.
    const far = barrierOptimum(path.limits, curvature, target, start, 1e4, start), g0 = barrierGradient(start, path.limits);
    assert.ok(distance(far, start) < 5e-3);
    if (Math.hypot(...g0) > .1) assert.ok(dot(sub(far, start), g0) < 0);
    checked++;
  }
  assert.ok(checked >= 10);
});

test('a cold start from the centroid gives the same optimum as the warm-started path', () => {
  const path = centralPath(polygon, q, z, x0);
  for (const index of [0, 50, 150, 250, 300]) {
    const { x, mu } = path.points[index];
    const cold = barrierOptimum(path.limits, q, z, x0, mu, centroid(polygon));
    close(distance(cold, x), 0, 1e-7);
  }
});

test('gradient and Hessian of Phi agree with finite differences', () => {
  const limits = constraints(polygon), eps = 1e-6;
  for (const [x, mu] of [[[.3, .4], .35], [[-1.5, 1.8], 25], [[1.9, -1], 1e-3]]) {
    const actual = barrierDerivatives(x, x0, q, z, limits, mu);
    for (let j = 0; j < 2; j++) {
      const plus = [...x], minus = [...x]; plus[j] += eps; minus[j] -= eps;
      const a = barrierDerivatives(plus, x0, q, z, limits, mu), b = barrierDerivatives(minus, x0, q, z, limits, mu);
      close((a.value - b.value) / (2 * eps), actual.g[j], 1e-5);
      close((a.g[0] - b.g[0]) / (2 * eps), actual.h[j === 0 ? 0 : 1], 1e-4);
      close((a.g[1] - b.g[1]) / (2 * eps), actual.h[j === 0 ? 1 : 2], 1e-4);
    }
  }
});

test('the objective obeys the bound 4 mu + mu^2/2 |x* - x0|^2 along the path', () => {
  for (const [start, target] of [[x0, z], [[.8, .8], z], [[-1, -.8], [.8, -.6]], [[1.5, 1.2], [3.4, 3.3]]]) {
    const path = centralPath(polygon, q, target, start);
    const best = objective(path.optimum, q, target), away = distance(path.optimum, start) ** 2;
    for (const { x, mu } of path.points) {
      const gap = objective(x, q, target) - best;
      assert.ok(gap >= -1e-9 && gap <= 4 * mu + mu * mu * away / 2 + 1e-9, `${mu}: ${gap}`);
    }
  }
});

test('an edge moved towards x0 pushes the path away from it', () => {
  const raised = [[-2.6, -.95], [2.1, -.95], [2.6, 2.1], [-1.8, 2.4]];
  const before = centralPath(polygon, q, z, x0), after = centralPath(raised, q, z, x0);
  const outward = after.limits[0].a;
  for (const mu of [31.6, 10, 1]) {
    const index = at(mu);
    assert.ok(dot(sub(after.points[index].x, before.points[index].x), outward) < -1e-3);
    assert.ok(slacks(after.points[index].x, after.limits)[0] > .1);
  }
});

test('for small mu the paths of different starting points join the classical central path', () => {
  const limits = constraints(polygon);
  const classicalValue = (x, mu) => objective(x, q, z) - mu * slacks(x, limits).reduce((sum, s) => sum + Math.log(s), 0);
  // Classical central path point by Newton on f - mu * sum log s_i, independent of the solver.
  const classical = mu => {
    let x = centroid(polygon);
    for (let i = 0; i < 100; i++) {
      const s = slacks(x, limits), g = add(multiply(q, sub(x, z)), scale(barrierGradient(x, limits), mu)), h = [...q];
      if (Math.hypot(...g) < 1e-12) break;
      limits.forEach(({ a }, k) => { h[0] += mu * a[0] * a[0] / s[k] ** 2; h[1] += mu * a[0] * a[1] / s[k] ** 2; h[2] += mu * a[1] * a[1] / s[k] ** 2; });
      const det = h[0] * h[2] - h[1] * h[1], step = [-(h[2] * g[0] - h[1] * g[1]) / det, -(h[0] * g[1] - h[1] * g[0]) / det];
      let t = 1;
      while (t > 1e-12) {
        const trial = add(x, scale(step, t));
        if (slacks(trial, limits).every(v => v > 0) && classicalValue(trial, mu) <= classicalValue(x, mu) + 1e-14) { x = trial; break; }
        t /= 2;
      }
    }
    return x;
  };
  const a = centralPath(polygon, q, z, x0), b = centralPath(polygon, q, z, [.8, .8]);
  for (const mu of [.01, .001]) {
    const index = at(mu), reference = classical(mu);
    // The proximal term shifts the point by at most mu^2 |x - x0| / lambda_min(Q), with lambda_min(Q) = 1 here.
    for (const [path, start] of [[a, x0], [b, [.8, .8]]]) {
      const x = path.points[index].x;
      assert.ok(distance(x, reference) < 2 * mu * mu * distance(x, start) + 1e-9, `${mu}: ${distance(x, reference)}`);
    }
  }
  assert.ok(distance(a.points[300].x, b.points[300].x) < 1e-3);
});

test('the exact constrained optimum beats random feasible samples and equals z when z is feasible', () => {
  for (let trial = 0; trial < 20; trial++) {
    const { vertices, curvature, target } = randomProblem();
    const limits = constraints(vertices), optimum = constrainedOptimum(vertices, curvature, target);
    assert.ok(slacks(optimum, limits).every(v => v >= -1e-12));
    if (slacks(target, limits).every(v => v >= 0)) assert.deepEqual(optimum, target);
    const best = objective(optimum, curvature, target);
    for (let i = 0; i < 400; i++) {
      const weights = [random(), random(), random(), random()], total = weights.reduce((a, b) => a + b);
      const sample = vertices.reduce((sum, v, k) => add(sum, scale(v, weights[k] / total)), [0, 0]);
      assert.ok(objective(sample, curvature, target) >= best - 1e-9);
    }
  }
});

test('slider progress follows the arc length of the path and preserves the selected mu', () => {
  const path = centralPath(polygon, q, z, x0);
  const nodes = [x0, ...path.points.map(p => p.x)], fractions = pathFractions(nodes);
  assert.equal(fractions.length, 302);
  assert.equal(fractions[0], 0); close(fractions.at(-1), 1, 1e-12);
  for (let i = 1; i < fractions.length; i++) assert.ok(fractions[i] >= fractions[i - 1]);
  // Half of the slider is half of the drawn length, not half of the decades of mu.
  const half = indexAt(fractions, .5), partial = pathFractions(nodes.slice(0, half + 1));
  const total = nodes.reduce((sum, p, i) => sum + (i ? distance(p, nodes[i - 1]) : 0), 0);
  close(nodes.slice(0, half + 1).reduce((sum, p, i) => sum + (i ? distance(p, nodes[i - 1]) : 0), 0) / total, .5, .01);
  assert.ok(partial.at(-1) === 1);
  assert.equal(indexAt(fractions, 0), 0);
  assert.equal(indexAt(fractions, 1), 301);
  // Every computed optimum can be re-selected from its own fraction.
  for (const index of [1, 75, 150, 225, 300]) assert.equal(indexAt(fractions, fractions[index + 1]), index + 1);
  // A path without length falls back to a uniform division.
  assert.deepEqual(pathFractions([[0, 0], [0, 0], [0, 0]]), [0, .5, 1]);
});

test('changing x0 changes the path at unchanged mu; moving a boundary keeps x0; invalid inputs are rejected', () => {
  const a = centralPath(polygon, q, z, x0), b = centralPath(polygon, q, z, [.8, .8]);
  for (const index of [0, 50, 100]) {
    assert.equal(a.points[index].mu, b.points[index].mu);
    assert.ok(distance(a.points[index].x, b.points[index].x) > .05);
  }
  assert.deepEqual(a.optimum, b.optimum);
  const box = [[-1, -1], [1, -1], [1, 1], [-1, 1]], start = [.8, .5], saved = [...start];
  const moved = safePolygonMove(box, [[-1, -1], [0, -1], [0, 1], [-1, 1]], start);
  assert.deepEqual(start, saved);
  assert.ok(validPolygon(moved) && validInitial(moved, start));
  const before = centralPath(box, matrix(1, 2, 20), [2, 1], start), after = centralPath(moved, matrix(1, 2, 20), [2, 1], start);
  assert.ok(distance(before.points[150].x, after.points[150].x) > .01);
  for (const desired of [[5, 0], [-5, -5], [0, 5]]) assert.ok(validInitial(box, safeInitialMove(box, [0, 0], desired)));
  assert.throws(() => centralPath(box, matrix(1, 1, 0), [2, 0], [1, 0]));
  assert.throws(() => centralPath(box, matrix(1, 1, 0), [2, 0], [0, 0], { count: 1 }));
  assert.throws(() => barrierOptimum(constraints(box), matrix(1, 1, 0), [2, 0], [0, 0], 0));
});
