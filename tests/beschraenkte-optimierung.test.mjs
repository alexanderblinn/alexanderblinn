// Checks the geometry behind the interactive figures of content/notes/beschraenkte-optimierung.md
// and the numbers the note quotes. Run with Node.js 22 or newer: node --test tests/beschraenkte-optimierung.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CORNER_TARGET, LIMITS, Q, VERTICES, coneProjection, cornerExample, intersection, satisfies, scatter, segmentInside } from '../assets/notes/beschraenkte-optimierung/geometry.mjs';
import { constrainedOptimum } from '../assets/notes/zentralpfad/barrier.mjs';
import { add, dot, multiply, scale, sub } from '../assets/notes/zentralpfad/math.mjs';

const note = readFileSync(new URL('../content/notes/beschraenkte-optimierung.md', import.meta.url), 'utf8');
const close = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const german = (value, digits = 2) => value.toFixed(digits).replace('.', '{,}');
const RECT = [-4.9, 4.9, -3.25, 3.35];  // view of figure 1 (konvex.mjs)

test('figure 3: the corner C is optimal and both multipliers are positive, as quoted', () => {
  const { corner, normals, pull } = cornerExample();
  const optimum = constrainedOptimum(VERTICES, Q, CORNER_TARGET);
  close(optimum[0], corner[0]);
  close(optimum[1], corner[1]);
  const { lambda, inside, residual } = coneProjection(pull, ...normals);
  assert.ok(inside);
  assert.deepEqual(residual, [0, 0]);
  const rebuilt = add(scale(normals[0], lambda[0]), scale(normals[1], lambda[1]));
  close(rebuilt[0], pull[0], 1e-12);
  close(rebuilt[1], pull[1], 1e-12);
  assert.ok(note.includes(`\\lambda_{BC}\\approx${german(lambda[0])}`), 'lambda_BC in the note');
  assert.ok(note.includes(`\\lambda_{CD}\\approx${german(lambda[1])}`), 'lambda_CD in the note');
});

test('figure 4: on the edge BC the multiplier is 0.34, as quoted', () => {
  const target = [2.8, 1.2];
  const x = constrainedOptimum(VERTICES, Q, target);
  const gradient = multiply(Q, sub(x, target));
  close(LIMITS[1].b - dot(LIMITS[1].a, x), 0, 1e-12);
  const lambda = -dot(gradient, LIMITS[1].a);
  const rest = add(gradient, scale(LIMITS[1].a, lambda));  // gradient parallel to the unit normal
  close(Math.hypot(...rest), 0, 1e-12);
  assert.equal(german(lambda), '0{,}34');
  assert.ok(note.includes('\\lambda_{BC}\\approx0{,}34'));
  assert.ok(note.includes('\\lambda^\\star=0{,}34'));
});

test('figure 3: outside the normal cone the smallest rest is a feasible descent direction (Farkas)', () => {
  const { normals: [a1, a2] } = cornerExample();
  let outside = 0;
  for (let k = 0; k < 360; k += 5) {
    const v = [2 * Math.cos(k * Math.PI / 180), 2 * Math.sin(k * Math.PI / 180)];
    const { lambda, inside, residual } = coneProjection(v, a1, a2);
    assert.ok(lambda[0] >= 0 && lambda[1] >= 0);
    if (inside) continue;
    outside++;
    // feasible at the corner: it does not point out of either active edge
    assert.ok(dot(a1, residual) <= 1e-12 && dot(a2, residual) <= 1e-12);
    // descent: grad f = -v, so grad f^T d = -|d|^2 < 0
    close(dot(v, residual), dot(residual, residual), 1e-12);
    assert.ok(dot(residual, residual) > 1e-6);
  }
  assert.ok(outside > 30);
});

test('figure 1: half-planes cut out ABCD and every segment between feasible points stays feasible', () => {
  const corners = intersection(RECT, LIMITS);
  assert.equal(corners.length, 4);
  for (const v of VERTICES) assert.ok(corners.some(c => Math.hypot(...sub(c, v)) < 1e-9));
  const points = scatter(7, RECT, LIMITS, 7, 11);
  assert.equal(points.length, 18);
  assert.equal(points.filter(p => satisfies(p, LIMITS)).length, 7);
  for (let k = 0; k <= 4; k++) {
    const active = LIMITS.slice(0, k), shown = points.filter(p => satisfies(p, active));
    shown.forEach((p, i) => shown.slice(i + 1).forEach(q => assert.ok(segmentInside(p, q, active, 50))));
  }
});

test('figures 5 to 8: the one-dimensional example f(x) = (x - 2)^2 / 2 with x <= 1 + delta', () => {
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
