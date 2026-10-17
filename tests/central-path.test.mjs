import test from 'node:test';
import assert from 'node:assert/strict';
import { matrix, constraints, slacks, objective, safePolygonMove, validPolygon, centroid, pathFractions, indexAt, add, sub, scale, multiply, dot } from '../assets/notes/zentralpfad/math.mjs';
import { barrierDerivatives, barrierOptimum, analyticCentre, centralPath, constrainedOptimum } from '../assets/notes/zentralpfad/barrier.mjs';

const polygon = [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]];
const q = matrix(1, 3, -25), z = [2.8, 1.2];
const close = (a, b, tol = 1e-7) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let seed = 173;
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
// Barrier B and its gradient, written independently of the solver.
const barrier = (x, limits) => -slacks(x, limits).reduce((sum, s) => sum + Math.log(s), 0);
const barrierGradient = (x, limits) => slacks(x, limits).reduce((sum, s, k) => add(sum, scale(limits[k].a, 1 / s)), [0, 0]);
const randomProblem = () => {
  const vertices = safePolygonMove(polygon, polygon.map(p => p.map(v => v + random() - .5)));
  const curvature = matrix(.4 + 5.6 * random(), .4 + 5.6 * random(), 180 * random() - 90);
  const target = [7.2 * random() - 3.6, 7.2 * random() - 3.6];
  return { vertices, curvature, target };
};
// Index of a barrier parameter in the computed path: mu = 10^(3 - i / 50).
const at = mu => Math.round(50 * (3 - Math.log10(mu)));

test('the central path samples mu from 10^3 to 10^-3, starts at the analytic centre and ends at the optimum', () => {
  const path = centralPath(polygon, q, z);
  assert.equal(path.points.length, 301);
  close(path.points[0].mu, 1e3, 1e-9);
  close(path.points.at(-1).mu, 1e-3, 1e-15);
  for (let i = 1; i < path.points.length; i++) close(path.points[i].mu / path.points[i - 1].mu, 10 ** (-1 / 50), 1e-12);
  // The analytic centre is the stationary point of the barrier alone.
  assert.ok(Math.hypot(...barrierGradient(path.centre, path.limits)) < 1e-9);
  assert.ok(distance(path.points[0].x, path.centre) < 5e-2);
  assert.ok(distance(path.points.at(-1).x, path.optimum) < 1e-2);
});

test('every path point is strictly feasible and stationary; f falls and B grows as mu falls', () => {
  for (let trial = 0; trial < 14; trial++) {
    const { vertices, curvature, target } = randomProblem();
    const path = centralPath(vertices, curvature, target);
    let previousCost = Infinity, previousBarrier = -Infinity;
    for (const { x, mu } of path.points) {
      assert.ok(slacks(x, path.limits).every(v => v > 0));
      const d = barrierDerivatives(x, curvature, target, path.limits, mu);
      assert.ok(Math.max(Math.abs(d.g[0]), Math.abs(d.g[1])) < 1e-8);
      const cost = objective(x, curvature, target), wall = barrier(x, path.limits);
      assert.ok(cost <= previousCost + 1e-9);
      assert.ok(wall >= previousBarrier - 1e-9);
      previousCost = cost; previousBarrier = wall;
    }
    assert.ok(distance(path.points[0].x, path.centre) < .25);
    assert.ok(distance(path.points.at(-1).x, path.optimum) < 2e-2);
  }
});

test('the Newton start point does not change the optimum: the central path is independent of x0', () => {
  const path = centralPath(polygon, q, z);
  const starts = [centroid(polygon), [-1, -.8], [1.5, 1.5], [-1.5, 1.8], [2, -1.5]];
  for (const index of [0, 50, 150, 250, 300]) {
    const { x, mu } = path.points[index];
    for (const start of starts) close(distance(barrierOptimum(path.limits, q, z, mu, start), x), 0, 1e-7);
  }
  for (const start of starts) close(distance(analyticCentre(path.limits, start), path.centre), 0, 1e-9);
});

test('gradient and Hessian of Phi agree with finite differences', () => {
  const limits = constraints(polygon), eps = 1e-6;
  for (const [x, mu] of [[[.3, .4], .35], [[-1.5, 1.8], 25], [[1.9, -1], 1e-3]]) {
    const actual = barrierDerivatives(x, q, z, limits, mu);
    for (let j = 0; j < 2; j++) {
      const plus = [...x], minus = [...x]; plus[j] += eps; minus[j] -= eps;
      const a = barrierDerivatives(plus, q, z, limits, mu), b = barrierDerivatives(minus, q, z, limits, mu);
      close((a.value - b.value) / (2 * eps), actual.g[j], 1e-5);
      close((a.g[0] - b.g[0]) / (2 * eps), actual.h[j === 0 ? 0 : 1], 1e-4);
      close((a.g[1] - b.g[1]) / (2 * eps), actual.h[j === 0 ? 1 : 2], 1e-4);
    }
  }
});

test('the duality gap bound f(x*(mu)) - f* <= m mu holds along the path', () => {
  for (const target of [z, [3.4, 3.3], [.8, -.6], [-3, 0]]) {
    const path = centralPath(polygon, q, target);
    const best = objective(path.optimum, q, target);
    for (const { x, mu } of path.points) {
      const gap = objective(x, q, target) - best;
      assert.ok(gap >= -1e-9 && gap <= 4 * mu + 1e-9, `${mu}: ${gap}`);
    }
  }
});

test('an edge moved towards the path pushes the path and the analytic centre away from it', () => {
  const raised = [[-2.6, -.95], [2.1, -.95], [2.6, 2.1], [-1.8, 2.4]];
  const before = centralPath(polygon, q, z), after = centralPath(raised, q, z);
  const outward = after.limits[0].a;
  assert.ok(dot(sub(after.centre, before.centre), outward) < -1e-3);
  for (const mu of [100, 10, 1]) {
    const index = at(mu);
    assert.ok(dot(sub(after.points[index].x, before.points[index].x), outward) < -1e-3);
    assert.ok(slacks(after.points[index].x, after.limits)[0] > .1);
  }
});

test('for large mu the path leaves the analytic centre along -(grad^2 B)^-1 grad f', () => {
  const path = centralPath(polygon, q, z), limits = path.limits, centre = path.centre;
  const s = slacks(centre, limits), h = [0, 0, 0];
  limits.forEach(({ a }, k) => { h[0] += a[0] * a[0] / s[k] ** 2; h[1] += a[0] * a[1] / s[k] ** 2; h[2] += a[1] * a[1] / s[k] ** 2; });
  const g = multiply(q, sub(centre, z)), det = h[0] * h[2] - h[1] * h[1];
  const direction = [-(h[2] * g[0] - h[1] * g[1]) / det, -(h[0] * g[1] - h[1] * g[0]) / det];
  const deviation = mu => distance(barrierOptimum(limits, q, z, mu, centre), add(centre, scale(direction, 1 / mu)));
  // The first-order term is O(1/mu), so the remaining error must shrink like 1/mu^2.
  assert.ok(deviation(1e3) < 2e-3, `${deviation(1e3)}`);
  assert.ok(deviation(1e4) < deviation(1e3) / 25, `${deviation(1e4)} vs ${deviation(1e3)}`);
  for (const mu of [1e4, 1e3]) assert.ok(distance(barrierOptimum(limits, q, z, mu, centre), centre) > 0.5 * Math.hypot(...direction) / mu);
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
  const path = centralPath(polygon, q, z);
  const nodes = [path.centre, ...path.points.map(p => p.x)], fractions = pathFractions(nodes);
  assert.equal(fractions.length, 302);
  assert.equal(fractions[0], 0); close(fractions.at(-1), 1, 1e-12);
  for (let i = 1; i < fractions.length; i++) assert.ok(fractions[i] >= fractions[i - 1]);
  const half = indexAt(fractions, .5);
  const total = nodes.reduce((sum, p, i) => sum + (i ? distance(p, nodes[i - 1]) : 0), 0);
  close(nodes.slice(0, half + 1).reduce((sum, p, i) => sum + (i ? distance(p, nodes[i - 1]) : 0), 0) / total, .5, .01);
  assert.equal(indexAt(fractions, 0), 0);
  assert.equal(indexAt(fractions, 1), 301);
  for (const index of [1, 75, 150, 225, 300]) assert.equal(indexAt(fractions, fractions[index + 1]), index + 1);
  assert.deepEqual(pathFractions([[0, 0], [0, 0], [0, 0]]), [0, .5, 1]);
});

test('moving a boundary changes the path; invalid inputs are rejected', () => {
  const box = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const moved = safePolygonMove(box, [[-1, -1], [0, -1], [0, 1], [-1, 1]]);
  assert.ok(validPolygon(moved));
  const before = centralPath(box, matrix(1, 2, 20), [2, 1]), after = centralPath(moved, matrix(1, 2, 20), [2, 1]);
  assert.ok(distance(before.centre, after.centre) > .1);
  assert.ok(distance(before.points[150].x, after.points[150].x) > .01);
  assert.throws(() => centralPath([[0, 0], [1, 0], [1, 1], [0.5, 0.5]], matrix(1, 1, 0), [2, 0]));
  assert.throws(() => centralPath(box, [1, 2, 1], [2, 0]));
  assert.throws(() => centralPath(box, matrix(1, 1, 0), [2, 0], { count: 1 }));
  assert.throws(() => barrierOptimum(constraints(box), matrix(1, 1, 0), [2, 0], 0, [0, 0]));
  assert.throws(() => barrierOptimum(constraints(box), matrix(1, 1, 0), [2, 0], 1, [2, 2]));
});

test('the step-by-step barrier method matches the step counts in the note and stays on the path', async () => {
  const { barrierMethod, EXAMPLE } = await import('../assets/notes/zentralpfad/method.mjs');
  const { readFileSync } = await import('node:fs');
  const counts = [2, 10, 100].map(kappa => { const run = barrierMethod(EXAMPLE, { kappa }); return [run.stages, run.total]; });
  assert.deepEqual(counts, [[30, 75], [10, 49], [6, 33]]);
  const note = readFileSync(new URL('../content/notes/zentralpfad.md', import.meta.url), 'utf8');
  assert.ok(note.includes('$\\kappa=2$ 30 Etappen und 75 Newton-Schritte, mit $\\kappa=100$ nur 6 Etappen und 33 Schritte'));
  // The code of the note runs the same method with the same parameters.
  assert.ok(note.includes('MU0, KAPPA, EPS = 100.0, 10.0, 1e-6') && note.includes('MU0 = 100; KAPPA = 10; EPS = 1e-6;'));
  const run = barrierMethod(EXAMPLE, { kappa: 10 });
  assert.equal(run.events[0].type, 'init');
  assert.equal(run.events.at(-1).type, 'check');
  assert.ok(run.events.at(-1).stop && run.events.at(-1).gap < 1e-6);
  // Every centre is the barrier optimum of its mu, independent of the Newton start (the stopping
  // rule of the note's code, Newton decrement <= 1e-10, fixes the position to about 1e-5).
  const limits = constraints(EXAMPLE.vertices);
  for (const e of run.events.filter(e => e.type === 'centred')) {
    const reference = barrierOptimum(limits, EXAMPLE.q, EXAMPLE.z, e.mu, centroid(EXAMPLE.vertices));
    assert.ok(distance(e.x, reference) < 1e-5, `mu = ${e.mu}`);
  }
  // Every iterate is strictly feasible.
  assert.ok(run.events.every(e => slacks(e.x, limits).every(s => s > 0)));
});

test('figure 4: centering stages of the barrier method and the predictor-corrector method', async () => {
  const { barrierTrace, barrierStages, predictorCorrector, EXAMPLE } = await import('../assets/notes/zentralpfad/method.mjs');
  const limits = constraints(EXAMPLE.vertices);
  // The trace starts with the centering in x*(100) itself; every stage ends with a small Newton
  // decrement and the gap m mu, and only the last one stops.
  const trace = barrierTrace(EXAMPLE, { kappa: 10 });
  assert.equal(trace.length, 10);
  assert.ok(trace.every(s => s.decrement <= 1e-10 && s.gap === 4 * s.mu));
  assert.ok(trace.at(-1).stop && trace.slice(0, -1).every(s => !s.stop));
  for (const s of trace) {
    for (const e of s.steps) {
      assert.ok(e.decrement > 1e-10 && e.t > 0 && e.t <= 1);
      close(distance(e.from, e.x), e.t * distance(e.from, e.full), 1e-12);
    }
  }
  // The figure itself stops at a gap of 1e-2: five stages after the start, five Mehrotra iterations.
  assert.equal(barrierTrace(EXAMPLE, { kappa: 10, epsilon: 1e-2 }).length, 6);
  assert.equal(predictorCorrector(EXAMPLE, { epsilon: 1e-2 }).iterations.length, 5);
  // The backtracking shortens at least one step whose full length would leave the polygon.
  assert.ok(trace.some(s => s.steps.some(e => e.t < 1 && slacks(e.full, limits).some(v => v <= 0))));
  const stages = barrierStages(EXAMPLE, { kappa: 10 });
  assert.deepEqual(stages.map(s => s.steps.length), [3, 5, 5, 6, 6, 7, 5, 4, 4]);
  stages.forEach((stage, k) => {
    close(stage.muFrom / stage.mu, 10, 1e-9);
    if (k) assert.deepEqual(stage.from, stages[k - 1].centre);
    assert.deepEqual(stage.centre, stage.steps.at(-1).x);
    assert.ok(distance(stage.centre, stage.target) < 1e-5);
  });
  const { iterations } = predictorCorrector(EXAMPLE);
  assert.equal(iterations.length, 7);
  assert.ok(4 * iterations.at(-1).muNew < 1e-6);
  for (const it of iterations) {
    assert.ok(it.muNew < it.mu / 5);
    assert.ok(it.sigma > 0 && it.sigma < 1 && it.alpha > 0 && it.alpha <= 1);
    assert.ok(slacks(it.x, limits).every(s => s > 0) && slacks(it.predictor, limits).every(s => s >= -1e-12));
    // The corrector ends near the path, not on it: within a tenth of its step.
    assert.ok(it.nearest.distance > 0 && it.nearest.distance < .1 * distance(it.x, it.from));
    assert.ok(it.pathMu > it.muNew);
  }
});
