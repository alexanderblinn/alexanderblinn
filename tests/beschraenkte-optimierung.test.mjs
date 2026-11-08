// Checks the running example behind the interactive figures of content/notes/beschraenkte-optimierung.md
// and the numbers the note quotes. Run with Node.js 22 or newer: node --test tests/beschraenkte-optimierung.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CONSTRAINTS, CORNERS, OPTIMUM, TARGET, activeSet, boundaryPieces, circleStationary, constrainedMinimum, cornerBalance,
  f, feasible, gradient, snap,
} from '../assets/notes/beschraenkte-optimierung/beispiel.mjs';
import { LIMITS, VERTICES, coneProjection, intersection, satisfies, scatter, segmentInside } from '../assets/notes/beschraenkte-optimierung/geometry.mjs';
import { add, dot, scale, sub } from '../assets/notes/zentralpfad/math.mjs';

const note = readFileSync(new URL('../content/notes/beschraenkte-optimierung.md', import.meta.url), 'utf8');
const close = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const german = (value, digits = 2) => value.toFixed(digits).replace('.', '{,}');
const point = p => `(${german(p[0])};\\,${german(p[1])})`;

// brute force over a grid: the smallest f in the feasible set
function gridMinimum(target, step = 0.005) {
  let best = { value: Infinity };
  for (let x = -2; x <= 2; x += step) {
    for (let y = -2; y <= 1.2; y += step) {
      if (feasible([x, y]) && f([x, y], target) < best.value) best = { point: [x, y], value: f([x, y], target) };
    }
  }
  return best;
}

test('figure 1: the minimum over the feasible set is the corner (1.6, 1.2), as quoted', () => {
  const { point: x, active } = constrainedMinimum(TARGET);
  close(x[0], OPTIMUM[0], 1e-7);
  close(x[1], OPTIMUM[1], 1e-7);
  assert.deepEqual(active, [1, 3]);
  const grid = gridMinimum(TARGET);
  assert.ok(f(OPTIMUM) <= grid.value + 1e-12);
  assert.ok(note.includes('x^\\star=(1{,}6;\\,1{,}2)'));
  assert.ok(note.includes('x_\\mathrm{ref}=(3{,}2;\\,2)'));
  // a target inside the set is its own minimum
  assert.deepEqual(constrainedMinimum([0.3, 0.2]).point, [0.3, 0.2]);
});

test('figure 1: dragged through the bite of c2, x* jumps between the corners of the bite', () => {
  const [left, bottom] = [CORNERS.find(c => c.point[0] < -1.5 && c.pair.includes(2)).point, CORNERS.find(c => c.point[0] > -1 && c.pair.includes(2)).point];
  let jumps = 0, last = null;
  for (let x = -3.2; x <= 1; x += 0.05) {
    const p = constrainedMinimum([x, -1.9]).point;
    if (last && Math.hypot(...sub(p, last)) > 0.5) {
      jumps++;
      assert.ok(Math.hypot(...sub(last, left)) < 1e-6);
      assert.ok(Math.abs(p[0] - bottom[0]) < 0.1);
    }
    last = p;
  }
  assert.equal(jumps, 1);
  for (const target of [[-1.2, -2.4], [2.5, -0.3], [0, 3]]) {
    const exact = constrainedMinimum(target).point, grid = gridMinimum(target);
    assert.ok(f(exact, target) <= grid.value + 1e-9, `target ${target}`);
  }
});

test('figure 2: four corners, snapping makes constraints exactly active', () => {
  assert.equal(CORNERS.length, 4);
  for (const { point: p, pair } of CORNERS) {
    assert.ok(feasible(p));
    assert.deepEqual(activeSet(p), pair);
    assert.deepEqual(snap(add(p, [0.03, -0.02]), 0.1), p);
  }
  assert.deepEqual(activeSet(snap([1.0, 1.25], 0.13)), [3]);
  assert.deepEqual(activeSet(snap([2.05, 0.1], 0.13)), [1]);
  assert.deepEqual(activeSet(snap([-0.5, 0.1], 0.13)), []);
  // the boundary of the set consists of four arcs and segments that end in the corners
  const pieces = CONSTRAINTS.flatMap((_, i) => boundaryPieces(i));
  assert.equal(pieces.length, 4);
  for (const piece of pieces) {
    for (const end of [piece[0], piece.at(-1)]) assert.ok(CORNERS.some(c => Math.hypot(...sub(c.point, end)) < 1e-12));
  }
  assert.deepEqual(activeSet(OPTIMUM), [1, 3]);
});

test('figure 3: on the circle c1 = 0 grad f and grad c1 are parallel at two points, as quoted', () => {
  const stationary = circleStationary();
  assert.equal(stationary.length, 2);
  const [low, high] = [...stationary].sort((a, b) => a.value - b.value);
  for (const s of stationary) {
    const rest = add(gradient(s.point), scale(CONSTRAINTS[0].gradient(s.point), s.lambda));
    close(Math.hypot(...rest), 0, 1e-9);
  }
  // the minimum of f on the circle has lambda > 0, the maximum lambda < 0
  for (let k = 0; k < 720; k++) {
    const p = [2 * Math.cos(k * Math.PI / 360), 2 * Math.sin(k * Math.PI / 360)];
    assert.ok(f(p) >= low.value - 1e-12 && f(p) <= high.value + 1e-12);
  }
  assert.ok(low.lambda > 0 && high.lambda < 0);
  assert.ok(note.includes(`$${point(low.point)}$ mit $\\lambda_1\\approx${german(low.lambda)}$`));
  assert.ok(note.includes(`$${point(high.point)}$ ist $\\lambda_1\\approx${german(high.lambda)}$`));
});

test('figure 4: at the corner x* the multipliers are 1/2 and 6/5, as quoted', () => {
  const { corner, normals: [a1, a3], pull } = cornerBalance();
  assert.deepEqual(corner, OPTIMUM);
  const { lambda, inside, residual } = coneProjection(pull, a1, a3);
  assert.ok(inside);
  assert.deepEqual(residual, [0, 0]);
  close(lambda[0], 0.5, 1e-12);
  close(lambda[1], 1.2, 1e-12);
  assert.ok(note.includes('-\\nabla f(x^\\star)=(1{,}6;\\,2{,}4)=0{,}5\\,\\nabla c_1(x^\\star)+1{,}2\\,\\nabla c_3(x^\\star)'));
  assert.ok(note.includes('\\nabla c_1(x^\\star)=(3{,}2;\\,2{,}4)'));
  assert.ok(note.includes('das gelingt nur mit $\\lambda_1=0{,}5$ und $\\lambda_3=1{,}2$'));
});

test('figure 4: outside the cone the smallest rest is a feasible descent direction (Farkas)', () => {
  const { normals: [a1, a3] } = cornerBalance();
  let outside = 0;
  for (let k = 0; k < 360; k += 5) {
    const v = [2 * Math.cos(k * Math.PI / 180), 2 * Math.sin(k * Math.PI / 180)];
    const { lambda, inside, residual } = coneProjection(v, a1, a3);
    assert.ok(lambda[0] >= 0 && lambda[1] >= 0);
    if (inside) continue;
    outside++;
    // feasible at the corner: it does not point out of either active boundary
    assert.ok(dot(a1, residual) <= 1e-12 && dot(a3, residual) <= 1e-12);
    // descent: grad f = -v, so grad f^T d = -|d|^2 < 0
    close(dot(v, residual), dot(residual, residual), 1e-12);
    assert.ok(dot(residual, residual) > 1e-6);
  }
  assert.ok(outside > 30);
});

// Material for the later chapters (not yet in the note): the half-plane figure konvex.html and the
// one-dimensional example of the GIFs.
test('konvex.html: half-planes cut out ABCD and every segment between feasible points stays feasible', () => {
  const rect = [-4.9, 4.9, -3.25, 3.35];
  const corners = intersection(rect, LIMITS);
  assert.equal(corners.length, 4);
  for (const v of VERTICES) assert.ok(corners.some(c => Math.hypot(...sub(c, v)) < 1e-9));
  const points = scatter(7, rect, LIMITS, 7, 11);
  assert.equal(points.length, 18);
  assert.equal(points.filter(p => satisfies(p, LIMITS)).length, 7);
  for (let k = 0; k <= 4; k++) {
    const active = LIMITS.slice(0, k), shown = points.filter(p => satisfies(p, active));
    shown.forEach((p, i) => shown.slice(i + 1).forEach(q => assert.ok(segmentInside(p, q, active, 50))));
  }
});

test('GIFs: the one-dimensional example f(x) = (x - 2)^2 / 2 with x <= 1 + delta', () => {
  const grid = Array.from({ length: 40001 }, (_, i) => -8 + i * 0.0005);
  const lagrangian = (x, lambda) => 0.5 * (x - 2) ** 2 + lambda * (x - 1);
  const dual = lambda => Math.min(...grid.map(x => lagrangian(x, lambda)));
  for (const lambda of [0, 0.5, 1, 1.5, 2.5]) close(dual(lambda), lambda - lambda ** 2 / 2, 1e-6);
  close(dual(1), 0.5, 1e-6);  // d* = p* = 1/2 at lambda* = 1
  const optimalValue = delta => 0.5 * (Math.min(2, 1 + delta) - 2) ** 2;  // x* is x_ref = 2 projected onto x <= 1 + delta
  for (const delta of [0, 0.4, 0.8]) {
    const slope = (optimalValue(delta + 0.01) - optimalValue(delta - 0.01)) / 0.02;
    close(slope, -(1 - delta), 2e-3);  // dp*/d delta = -lambda*(delta)
  }
  close(optimalValue(1.6), 0, 1e-12);
});
