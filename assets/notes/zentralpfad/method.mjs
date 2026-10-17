// Following the central path: the barrier method (full centering in every stage) and Mehrotra's
// predictor-corrector method (one corrected Newton step per iteration). Used by the interactive
// figure zentrierung.html and the tests (which also check the step counts quoted in the note).
import { matrix, constraints, slacks, objective, multiply, add, sub, scale, dot, centroid } from './math.mjs';
import { barrierOptimum } from './barrier.mjs';

// The example of the note: the initial state of the animation and the Newton start x0.
export const EXAMPLE = {
  vertices: [[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]], q: matrix(1, 3, -25), z: [2.8, 1.2], x0: [-1, -0.8],
};

const inner = (u, v) => u.reduce((total, value, i) => total + value * v[i], 0);
const solve = (h, r) => {
  const det = h[0] * h[2] - h[1] * h[1];
  return [(h[2] * r[0] - h[1] * r[1]) / det, (h[0] * r[1] - h[1] * r[0]) / det];
};

// Barrier method with the numerics of the code in the note: damped Newton with Armijo
// backtracking (alpha = 0.1, beta = 0.5, Phi = +inf outside), centering until half the squared
// Newton decrement is at most 1e-10, stop when the duality gap m mu is below epsilon. The run is a
// list of events: init, newton (one damped Newton step), centred (x = x*(mu)), check, reduce. A
// Newton event also holds the point before the step, the full step (t = 1) and half the squared
// Newton decrement before the step; a centred event holds the decrement that ended the centering.
export function barrierMethod({ vertices, q, z, x0 } = EXAMPLE, { kappa = 10, mu0 = 100, epsilon = 1e-6 } = {}) {
  const limits = constraints(vertices), m = limits.length;
  const phi = (x, mu) => {
    const s = slacks(x, limits);
    return s.some(v => v <= 0) ? Infinity : objective(x, q, z) - mu * s.reduce((total, v) => total + Math.log(v), 0);
  };
  let x = [...x0], mu = mu0, stage = 1, total = 0;
  const events = [{ type: 'init', x, mu, stage, steps: 0, total }];
  for (;;) {
    let steps = 0, decrement;
    for (;;) {
      const s = slacks(x, limits);
      const g = limits.reduce((sum, { a }, i) => add(sum, scale(a, mu / s[i])), multiply(q, sub(x, z)));
      const h = limits.reduce((t, { a }, i) => {
        const w = mu / s[i] ** 2;
        return [t[0] + w * a[0] * a[0], t[1] + w * a[0] * a[1], t[2] + w * a[1] * a[1]];
      }, [...q]);
      const p = scale(solve(h, g), -1);
      decrement = -dot(g, p) / 2;
      if (decrement <= 1e-10) break;
      let t = 1;
      while (phi(add(x, scale(p, t)), mu) > phi(x, mu) + 0.1 * t * dot(g, p)) t *= 0.5;
      const from = x;
      x = add(x, scale(p, t));
      steps++; total++;
      events.push({ type: 'newton', x, from, full: add(from, p), mu, stage, steps, total, t, decrement });
    }
    events.push({ type: 'centred', x, mu, stage, steps, total, decrement });
    const gap = m * mu, stop = gap < epsilon;
    events.push({ type: 'check', x, mu, stage, steps, total, gap, stop });
    if (stop) return { events, limits, stages: stage, total };
    mu /= kappa; stage++;
    events.push({ type: 'reduce', x, mu, stage, steps: 0, total });
  }
}

// The barrier method started on the path in x*(mu0), cut into stages: the first centering in
// x*(mu0) itself, then per stage the division of mu by kappa and the Newton steps (newton events)
// from the previous centre to the new path point, with the decrement and gap that end the stage.
export function barrierTrace(problem = EXAMPLE, { kappa = 10, mu0 = 100, epsilon = 1e-6 } = {}) {
  const limits = constraints(problem.vertices);
  const start = barrierOptimum(limits, problem.q, problem.z, mu0, centroid(problem.vertices));
  const { events } = barrierMethod({ ...problem, x0: start }, { kappa, mu0, epsilon });
  const stages = [];
  let stage = { from: start, muFrom: mu0, mu: mu0, target: start, steps: [] };
  for (const e of events) {
    if (e.type === 'reduce') {
      stage = { from: e.x, muFrom: e.mu * kappa, mu: e.mu, steps: [] };
      stage.target = barrierOptimum(limits, problem.q, problem.z, e.mu, e.x);
    }
    if (e.type === 'newton') stage.steps.push(e);
    if (e.type === 'centred') Object.assign(stage, { centre: e.x, decrement: e.decrement });
    if (e.type === 'check') { Object.assign(stage, { gap: e.gap, stop: e.stop }); stages.push(stage); }
  }
  return stages;
}

// The stages after the first centering: each divides mu by kappa and centres again.
export const barrierStages = (problem, options) => barrierTrace(problem, options).slice(1);

// Mehrotra's predictor-corrector method on the perturbed KKT system
//   Q (x - z) + A^T lambda = 0,  A x + s = b,  s_i lambda_i = sigma mu,
// started on the path in x*(mu0) with lambda_i = mu0 / s_i. Per iteration: the predictor (affine)
// direction with mu = 0 and its longest feasible step, sigma = (mu_aff / mu)^3, then the corrected
// direction with the second-order term ds_aff dlambda_aff, taken with 99 % of the longest step.
export function predictorCorrector(problem = EXAMPLE, { mu0 = 100, epsilon = 1e-6 } = {}) {
  const { vertices, q, z } = problem, limits = constraints(vertices), m = limits.length;
  let x = barrierOptimum(limits, q, z, mu0, centroid(vertices));
  let s = slacks(x, limits), lambda = s.map(v => mu0 / v);
  // Newton direction for the right-hand side rc of the complementarity rows, by elimination of
  // ds and dlambda: (Q + A^T S^-1 Lambda A) dx = -rd + A^T S^-1 (rc - Lambda rp).
  function direction(rc) {
    const rd = limits.reduce((sum, { a }, i) => add(sum, scale(a, lambda[i])), multiply(q, sub(x, z)));
    const rp = limits.map(({ a, b }, i) => dot(a, x) + s[i] - b);
    let h = [...q], r = scale(rd, -1);
    limits.forEach(({ a }, i) => {
      const w = lambda[i] / s[i];
      h = [h[0] + w * a[0] * a[0], h[1] + w * a[0] * a[1], h[2] + w * a[1] * a[1]];
      r = add(r, scale(a, (rc[i] - lambda[i] * rp[i]) / s[i]));
    });
    const dx = solve(h, r);
    const ds = limits.map(({ a }, i) => -rp[i] - dot(a, dx));
    const dl = ds.map((d, i) => (-rc[i] - lambda[i] * d) / s[i]);
    return { dx, ds, dl };
  }
  const longest = (v, dv) => dv.reduce((alpha, d, i) => (d < 0 ? Math.min(alpha, -v[i] / d) : alpha), Infinity);
  const iterations = [];
  for (let k = 0; k < 60 && inner(s, lambda) >= epsilon; k++) {
    const mu = inner(s, lambda) / m, from = x;
    const affine = direction(s.map((v, i) => v * lambda[i]));
    const alphaAffine = Math.min(1, longest(s, affine.ds), longest(lambda, affine.dl));
    const muAffine = inner(s.map((v, i) => v + alphaAffine * affine.ds[i]), lambda.map((v, i) => v + alphaAffine * affine.dl[i])) / m;
    const sigma = (muAffine / mu) ** 3;
    const corrected = direction(s.map((v, i) => v * lambda[i] + affine.ds[i] * affine.dl[i] - sigma * mu));
    const alpha = Math.min(1, 0.99 * Math.min(longest(s, corrected.ds), longest(lambda, corrected.dl)));
    x = add(x, scale(corrected.dx, alpha));
    s = s.map((v, i) => v + alpha * corrected.ds[i]);
    lambda = lambda.map((v, i) => v + alpha * corrected.dl[i]);
    const muNew = inner(s, lambda) / m;
    // Closeness to the path, measured in the plane: the nearest point of the path curve, and the
    // mu of that path point (larger than muNew, the primal point lags behind the duality gap).
    const high = 2 * mu, low = muNew / 2, count = 240;
    const nearest = nearestOnPolyline(x, pathBetween(problem, limits, high, low, count));
    const pathMu = high * (low / high) ** (nearest.position / (count - 1));
    iterations.push({
      from, x, mu, muNew, sigma, alpha, alphaAffine, muAffine, nearest, pathMu,
      predictor: add(from, scale(affine.dx, alphaAffine)),
    });
  }
  return { iterations, limits };
}

export function nearestOnPolyline(p, polyline) {
  let best = { point: polyline[0], distance: Infinity, position: 0 };
  for (let i = 1; i < polyline.length; i++) {
    const a = polyline[i - 1], d = sub(polyline[i], a), length2 = dot(d, d);
    const t = length2 > 0 ? Math.max(0, Math.min(1, dot(sub(p, a), d) / length2)) : 0;
    const point = add(a, scale(d, t)), distance = Math.hypot(...sub(p, point));
    if (distance < best.distance) best = { point, distance, position: i - 1 + t };
  }
  return best;
}

// Path points for mu between two values (log-spaced, warm-started), to draw the path in a view.
export function pathBetween(problem, limits, muHigh, muLow, count = 90) {
  let guess = barrierOptimum(limits, problem.q, problem.z, muHigh, centroid(problem.vertices));
  return Array.from({ length: count }, (_, i) => {
    const mu = muHigh * (muLow / muHigh) ** (i / (count - 1));
    guess = barrierOptimum(limits, problem.q, problem.z, mu, guess);
    return guess;
  });
}

if (typeof document !== 'undefined' && document.getElementById('centering')) {
  const $ = id => document.getElementById(id);
  const svgNS = 'http://www.w3.org/2000/svg';
  const problem = EXAMPLE, limits = constraints(problem.vertices), m = limits.length;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWEEP = 85, GLIDE = 340, PLAY = 1250;
  // The figure stops at a duality gap of 1e-2: further stages look the same, only smaller.
  const EPSILON = 1e-2;
  const superscript = e => String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const power = v => {
    const e = Math.floor(Math.log10(v)), mantissa = v / 10 ** e;
    if (Math.abs(mantissa - 1) < 1e-9) return e === 0 ? '1' : e === 1 ? '10' : `10${superscript(e)}`;
    if (v >= 0.01 && v < 1e4) return String(Number(v.toPrecision(3)));
    return `${mantissa.toFixed(1)}·10${superscript(e)}`;
  };
  const element = (tag, attributes, parent, content) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
    if (content !== undefined) el.textContent = content;
    parent.append(el);
    return el;
  };
  const optimumPoint = barrierOptimum(limits, problem.q, problem.z, 1e-12, barrierOptimum(limits, problem.q, problem.z, 1e-3, centroid(problem.vertices)));
  // The whole path from the analytic centre to the optimum, log-spaced in mu. The view also spans
  // x_ref (not drawn), which leaves room beyond the edge BC.
  const MU_HIGH = 1e4, MU_LOW = 1e-7, SAMPLES = 240;
  const path = pathBetween(problem, limits, MU_HIGH, MU_LOW, SAMPLES);
  const extent = [...path, problem.z];
  const pathUpTo = mu => path.slice(0, Math.floor(Math.log(MU_HIGH / Math.max(mu, MU_LOW)) / Math.log(MU_HIGH / MU_LOW) * (SAMPLES - 1)) + 1);

  // States: one per click. Each runs through some lines of the pseudocode (the last one is the
  // current line), may move the point at one of them and shows values next to the lines.
  let states = [], index = 0, timer = null, width = 0, height = 340, v = null, mode = 'barrier', token = 0;

  function barrierStates(kappa) {
    const stages = barrierTrace(problem, { kappa, epsilon: EPSILON }), n = stages.length - 1, list = [];
    stages.forEach((stage, i) => {
      const base = { stages, stage, i, n, kappa };
      if (i === 0) list.push({ ...base, kind: 'init', lines: [1, 2], point: stage.from, hints: { 2: `x = x*(${power(stage.mu)}), μ = ${power(stage.mu)}` } });
      else list.push({ ...base, kind: 'reduce', lines: [12], point: stage.from, hints: { 12: `μ: ${power(stage.muFrom)} → ${power(stage.mu)}` } });
      stage.steps.forEach((step, j) => list.push({
        ...base, kind: 'newton', j, lines: [5, 6, 7, 8, 9, 10], move: 10, from: step.from, point: step.x,
        hints: { 7: `= ${power(step.decrement)} > δ`, 9: `t = ${step.t}` },
      }));
      list.push({
        ...base, kind: 'centred', lines: [5, 6, 7, 11], point: stage.centre,
        hints: { 7: stage.decrement < 1e-15 ? '≈ 0 ≤ δ' : `= ${power(stage.decrement)} ≤ δ`, 11: `mμ = ${power(stage.gap)} ${stage.stop ? '< ε' : '≥ ε'}` },
      });
    });
    return list;
  }

  function mehrotraStates() {
    const { iterations } = predictorCorrector(problem, { epsilon: EPSILON }), n = iterations.length, first = iterations[0], last = iterations.at(-1);
    const list = [{ iterations, i: -1, n, kind: 'init', lines: [1, 2], point: first.from,
      hints: { 1: `x = x*(${power(first.mu)}), λᵢ = μ/sᵢ`, 2: `sᵀλ = ${power(m * first.mu)} ≥ ε` } }];
    iterations.forEach((it, i) => {
      const base = { iterations, it, i, n };
      list.push({
        ...base, kind: 'predictor', lines: i ? [2, 3, 4, 5, 6, 7] : [3, 4, 5, 6, 7], move: 4, point: it.from,
        hints: { 2: `sᵀλ = ${power(m * it.mu)} ≥ ε`, 3: `μ = ${power(it.mu)}`, 5: `α<sub>aff</sub> = ${it.alphaAffine.toFixed(2)}`,
          6: `μ<sub>aff</sub> = ${power(it.muAffine)}`, 7: `σ = ${power(it.sigma)}` },
      });
      list.push({ ...base, kind: 'corrector', lines: [8, 9, 10], move: 10, from: it.from, point: it.x,
        hints: { 9: `α = ${it.alpha.toFixed(2)}`, 10: `sᵀλ/m = ${power(it.muNew)}` } });
    });
    list.push({ iterations, it: last, i: n - 1, n, kind: 'done', lines: [2, 11], point: last.x,
      hints: { 2: `sᵀλ = ${power(m * last.muNew)} < ε` } });
    return list;
  }

  function build() {
    mode = document.querySelector('input[name="mode"]:checked').value;
    $('kappa-label').hidden = mode !== 'barrier';
    document.querySelectorAll('[data-mode]').forEach(el => { el.hidden = el.dataset.mode !== mode; });
    $('skip').textContent = mode === 'barrier' ? 'Etappe ▶▶' : 'Iteration ▶▶';
    states = mode === 'barrier' ? barrierStates(Number($('kappa').value)) : mehrotraStates();
    index = 0;
    show(false);
  }

  // Fixed view: path and target with room for the labels, equal axis scales.
  function fit() {
    const xs = extent.map(p => p[0]), ys = extent.map(p => p[1]);
    const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys);
    v = {
      cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2,
      s: Math.min((width - 2 * 56) / spanX, (height - 2 * 40) / spanY),
    };
  }
  const screen = p => [width / 2 + (p[0] - v.cx) * v.s, height / 2 - (p[1] - v.cy) * v.s];

  function show(animate) {
    animate = animate && !still;
    const state = states[index], my = ++token;
    draw(state, animate, my);
    describe(state);
    // The lines of the state light up one after the other; their values appear with them.
    const lines = [...document.querySelector(`.code[data-mode="${mode}"]`).children];
    lines.forEach(li => { li.classList.remove('active', 'trace'); li.querySelector('.hint').innerHTML = ''; });
    const mark = k => state.lines.slice(0, k + 1).forEach((n, i) => {
      const li = lines[n - 1];
      li.classList.toggle('active', i === k);
      li.classList.toggle('trace', i < k);
      li.querySelector('.hint').innerHTML = state.hints[n] ?? '';
    });
    if (!animate) mark(state.lines.length - 1);
    else state.lines.forEach((_, k) => setTimeout(() => { if (my === token) mark(k); }, k * SWEEP));
    $('back').disabled = $('restart').disabled = index === 0;
    $('step').disabled = $('skip').disabled = index === states.length - 1;
  }

  // Drawing helpers for one view: a group and the map from the plane to its pixels.
  function painter(group, toScreen, scale) {
    const pts = list => list.map(p => toScreen(p).map(c => c.toFixed(2)).join(',')).join(' ');
    const px = (a, b) => Math.hypot(...sub(a, b)) * scale;
    return {
      at: toScreen, px, pts,
      add: (tag, attributes, content) => element(tag, attributes, group, content),
      line: (list, cls) => element('polyline', { points: pts(list), class: cls }, group),
      dot: (p, cls, r) => { const [x, y] = toScreen(p); return element('circle', { cx: x, cy: y, r, class: cls }, group); },
      label: (p, content, dx, dy, cls = '') => { const [x, y] = toScreen(p); return element('text', { x: x + dx, y: y + dy, class: cls }, group, content); },
      cross: (p, cls) => { const [x, y] = toScreen(p); return element('path', { d: `M${x - 5},${y - 5} L${x + 5},${y + 5} M${x - 5},${y + 5} L${x + 5},${y - 5}`, class: cls }, group); },
      arrow: (from, to, cls) => {
        if (px(from, to) < 6) return null;
        const [x1, y1] = toScreen(from), [x2, y2] = toScreen(to);
        return element('line', { x1, y1, x2, y2, class: cls, 'marker-end': `url(#arrow-${cls})` }, group);
      },
      optimum: () => {
        const [x, y] = toScreen(optimumPoint);
        return element('rect', { x: -5.5, y: -5.5, width: 11, height: 11, transform: `translate(${x} ${y}) rotate(45)`, class: 'optimum' }, group);
      },
      current: p => {
        const [x, y] = toScreen(p);
        return [element('circle', { cx: x, cy: y, r: 9, class: 'current-ring' }, group), element('circle', { cx: x, cy: y, r: 4.5, class: 'current' }, group)];
      },
    };
  }

  // What belongs to the current stage or iteration; drawn in the plot and again in the lens.
  function stageScene(P, state, labels, fresh, animate) {
    if (mode === 'barrier') {
      const { stage, i, kind, j } = state;
      P.dot(stage.from, 'centre filled', 3.5);
      if (i > 0) {
        const ring = P.dot(stage.target, kind === 'centred' ? 'centre reached' : 'centre', 8);
        if (kind === 'reduce') fresh(ring);
        if (kind === 'centred' && animate) P.dot(stage.target, 'ripple', 8);
        if (labels && P.px(stage.target, optimumPoint) > 80) P.label(stage.target, `x*(${power(stage.mu)})`, -8, -14, 'end');
      }
      const done = kind === 'newton' ? stage.steps.slice(0, j + 1) : kind === 'centred' ? stage.steps : [];
      if (done.length) {
        const previous = done.slice(0, -1);
        P.line([stage.from, ...previous.map(e => e.x)], 'newton');
        const last = P.line([done.at(-1).from, done.at(-1).x], 'newton');
        if (kind === 'newton') fresh(last);
        previous.forEach((e, k) => {
          P.dot(e.x, 'iterate', 3);
          if (P.px(e.x, stage.target) > 16) P.label(e.x, String(k + 1), 6, -7, 'small');
        });
      }
      // A step shortened by the backtracking: the rejected full Newton step, faded.
      if (kind === 'newton' && stage.steps[j].t < 1) {
        const step = stage.steps[j];
        fresh(P.arrow(step.from, step.full, 'rejected'));
        fresh(P.cross(step.full, 'rejected-mark'));
        fresh(P.label(step.full, 't = 1', 8, 16, 'small'));
      }
    } else {
      const { it, kind } = state;
      if (it) P.dot(it.from, 'trail-point', 3.5);
      if (kind === 'predictor' || kind === 'corrector') {
        const parts = [P.arrow(it.from, it.predictor, 'predictor')];
        if (P.px(it.from, it.predictor) > 12) parts.push(P.cross(it.predictor, 'predictor-mark'));
        const labelled = labels && P.px(it.from, it.predictor) > 60;
        if (labelled) parts.push(P.label(it.predictor, 'Prädiktor', 8, 20, 'predictor-text'));
        if (kind === 'predictor') parts.forEach(fresh);
        if (kind === 'corrector') {
          fresh(P.arrow(it.from, it.x, 'corrector'));
          if (labelled) fresh(P.label(it.x, 'Korrektor', -12, -14, 'end corrector-text'));
        }
      }
    }
  }

  // The lens: only the last stage or iteration, if it spans fewer than 24 pixels, gets an inset in
  // the lower right corner, with one fixed view for all of its steps (1, 2 or 5 times a power of ten).
  function lensView(state) {
    let owner, keys, muHigh, muLow;
    if (mode === 'barrier') {
      const { stages, stage, i } = state;
      if (i === 0 || i !== stages.length - 1) return null;
      owner = stage;
      keys = [stage.from, stage.target, ...stage.steps.map(e => e.x)];
      [muHigh, muLow] = [stage.muFrom * 3, stage.mu / 3];
    } else {
      const { it, i, iterations } = state;
      if (!it || i !== iterations.length - 1) return null;
      owner = it;
      keys = [it.from, it.predictor, it.x];
      [muHigh, muLow] = [(i ? iterations[i - 1].pathMu : it.mu) * 3, Math.min(it.muNew, it.pathMu) / 3];
    }
    const xs = keys.map(p => p[0]), ys = keys.map(p => p[1]);
    const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys), span = Math.hypot(spanX, spanY);
    if (span * v.s >= 24 || span < 1e-14) return null;
    const w = Math.min(250, Math.round(width * 0.34)), h = Math.round(w * 0.62), x = width - w - 12, y = height - h - 12, pad = 24;
    const needed = Math.min((w - 2 * pad) / Math.max(spanX, span / 50), (h - 2 * pad) / Math.max(spanY, span / 50));
    // The largest zoom of the form 1, 2 or 5 times a power of ten that still fits.
    const exponent = Math.floor(Math.log10(needed / v.s)), mantissa = [5, 2, 1].find(f => f * 10 ** exponent <= needed / v.s);
    const zoom = mantissa * 10 ** exponent;
    if (!(zoom >= 10)) return null;
    const s = v.s * zoom, centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    const toScreen = p => [x + w / 2 + (p[0] - centre[0]) * s, y + h / 2 - (p[1] - centre[1]) * s];
    const world = [centre[0] - w / s, centre[0] + w / s, centre[1] - h / s, centre[1] + h / s];
    owner.lensPath ??= pathBetween(problem, limits, muHigh, muLow, 120);
    const inside = p => p[0] > world[0] && p[0] < world[1] && p[1] > world[2] && p[1] < world[3];
    const name = exponent < 2 ? String(zoom) : `${mantissa > 1 ? `${mantissa}·` : ''}10${superscript(exponent)}`;
    return { x, y, w, h, s, zoom, name, centre, toScreen, world, path: owner.lensPath.filter(inside) };
  }

  // The polygon cut to a rectangle [x0, x1, y0, y1] (Sutherland-Hodgman), so that the lens
  // never draws the far corners at huge pixel coordinates.
  function clipPolygon(points, [x0, x1, y0, y1]) {
    const cut = (a, b, k, c) => { const t = (c - a[k]) / (b[k] - a[k]); return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; };
    const sides = [[p => p[0] >= x0, 0, x0], [p => p[0] <= x1, 0, x1], [p => p[1] >= y0, 1, y0], [p => p[1] <= y1, 1, y1]];
    let out = points;
    for (const [inside, k, c] of sides) {
      const input = out;
      out = [];
      input.forEach((p, i) => {
        const q = input[(i + input.length - 1) % input.length];
        if (inside(p)) { if (!inside(q)) out.push(cut(q, p, k, c)); out.push(p); } else if (inside(q)) out.push(cut(q, p, k, c));
      });
      if (!out.length) break;
    }
    return out;
  }

  let lensZoom = '';
  function draw(state, animate, my) {
    const layer = $('layer');
    layer.replaceChildren();
    const delay = animate && state.move ? state.lines.indexOf(state.move) * SWEEP : 0;
    // New elements of a step fade in when the sweep reaches the line that moves the point.
    const fresh = el => { if (el && animate) { el.classList.add('fresh'); el.style.animationDelay = `${delay}ms`; } return el; };
    const P = painter(layer, screen, v.s);
    P.add('polygon', { points: P.pts(problem.vertices), class: 'feasible' });
    P.line(path, 'path');
    if (mode === 'barrier') {
      const { stages, stage, i, kind } = state;
      // The path so far, earlier stages faded.
      const reached = kind === 'centred' ? stage : stages[Math.max(i - 1, 0)];
      P.line([...pathUpTo(reached.mu), reached.centre ?? reached.from], 'path-done');
      stages.slice(0, i).forEach(s => {
        if (s.steps.length) P.line([s.from, ...s.steps.map(e => e.x)], 'newton old');
        P.dot(s.from, 'centre filled', 3.5);
      });
      P.label(stages[0].from, `x*(${power(stages[0].mu)})`, 8, 22);
    } else {
      const { iterations, it, i, kind } = state;
      const trail = [iterations[0].from, ...iterations.slice(0, kind === 'done' ? i + 1 : Math.max(i, 0)).map(e => e.x)];
      const reachedMu = kind === 'corrector' || kind === 'done' ? it.pathMu : i > 0 ? iterations[i - 1].pathMu : iterations[0].mu;
      P.line(pathUpTo(reachedMu), 'path-done');
      P.line(trail, 'trail');
      trail.forEach(p => P.dot(p, 'trail-point', 3.5));
      P.label(trail[0], `x*(${power(iterations[0].mu)})`, 8, 22);
    }
    stageScene(P, state, true, fresh, animate);
    P.optimum();
    P.label(optimumPoint, 'x*', -4, -14, 'end');
    const glides = [[P.current(state.point), P]];
    const lens = lensView(state);
    lensZoom = lens ? lens.name : '';
    if (lens) {
      // A mark around the enlarged spot, a line to the lens, the lens with its own copy of the step.
      const [qx, qy] = screen(lens.centre);
      P.add('rect', { x: qx - 8, y: qy - 8, width: 16, height: 16, class: 'lens-mark' });
      P.add('line', { x1: qx + (lens.x > qx ? 8 : -8), y1: qy + 8, x2: lens.x + lens.w / 2, y2: lens.y, class: 'lens-link' });
      const group = element('g', { class: 'lens' }, layer);
      element('rect', { x: lens.x, y: lens.y, width: lens.w, height: lens.h, class: 'lens-back' }, group);
      $('lens-clip-rect').setAttribute('x', lens.x);
      $('lens-clip-rect').setAttribute('y', lens.y);
      $('lens-clip-rect').setAttribute('width', lens.w);
      $('lens-clip-rect').setAttribute('height', lens.h);
      const L = painter(element('g', { 'clip-path': 'url(#lens-clip)' }, group), lens.toScreen, lens.s);
      const area = clipPolygon(problem.vertices, lens.world);
      if (area.length) L.add('polygon', { points: L.pts(area), class: 'feasible' });
      if (lens.path.length > 1) L.line(lens.path, 'path-done');
      stageScene(L, state, false, fresh, animate);
      const [ox, oy] = lens.toScreen(optimumPoint);
      if (ox > lens.x && ox < lens.x + lens.w && oy > lens.y && oy < lens.y + lens.h) L.optimum();
      glides.push([L.current(state.point), L]);
      element('rect', { x: lens.x, y: lens.y, width: lens.w, height: lens.h, class: 'lens-frame' }, group);
      element('text', { x: lens.x + 8, y: lens.y + 16, class: 'lens-label' }, group, `Lupe ×${lens.name}`);
    }
    // The current point; after a step it glides from the old position once its line is reached.
    if (animate && state.from && state.move) {
      const start = performance.now() + delay;
      const moves = glides.map(([els, view]) => ({ els, from: view.at(state.from), to: view.at(state.point) }));
      const place = e => moves.forEach(({ els, from, to }) => els.forEach(c => {
        c.setAttribute('cx', from[0] + (to[0] - from[0]) * e);
        c.setAttribute('cy', from[1] + (to[1] - from[1]) * e);
      }));
      place(0);
      const frame = now => {
        if (my !== token) return;
        const u = Math.min(1, Math.max(0, (now - start) / GLIDE));
        place(1 - (1 - u) ** 3);
        if (u < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }

  function describe(state) {
    const tiny = () => (lensZoom ? ` Die Lupe unten rechts zeigt den Ausschnitt ${lensZoom}-fach vergrößert.` : '');
    let text, readouts, live;
    if (mode === 'barrier') {
      const { stage, i, n, kind, j, kappa } = state, step = kind === 'newton' ? stage.steps[j] : null;
      const gap = ` Die Lücke mμ = ${power(stage.gap)} ist noch größer als ε, also weiter.`;
      text = {
        init: `Start im Pfadpunkt x*(${power(stage.mu)}) mit μ = ${power(stage.mu)}: Der Startpunkt liegt schon auf dem Zentralpfad.`,
        reduce: `μ wird durch κ = ${kappa} geteilt, von ${power(stage.muFrom)} auf ${power(stage.mu)}. Das Ziel ist jetzt der Pfadpunkt x*(${power(stage.mu)}); das alte Zentrum ist der Startwert.` + tiny(),
        newton: step && `Newton-Schritt ${j + 1}: Richtung Δx aus Gradient und Hesse-Matrix, Schrittweite t = ${step.t}.`
          + (step.t < 1 ? (slacks(step.full, limits).some(s => s <= 0)
            ? ' Der volle Newton-Schritt (hellgrau, t = 1) verließe das Viereck, wo Φ unendlich ist; die Rückwärtssuche verkürzt ihn.'
            : ' Der volle Newton-Schritt (hellgrau, t = 1) senkt Φ nicht genug; die Rückwärtssuche verkürzt ihn.') : '') + tiny(step.from, step.x),
        centred: `Das Newton-Dekrement liegt unter δ: x ist das Zentrum x*(${power(stage.mu)}), zurück auf dem Pfad.`
          + (stage.stop ? ` Die Lücke mμ = ${power(stage.gap)} liegt unter ε = ${power(EPSILON)}: x ist das Ergebnis.` : gap) + tiny(),
      }[kind];
      const toTarget = Math.hypot(...sub(state.point, stage.target));
      readouts = [['μ', power(stage.mu)], ['Newton-Schritt', String(kind === 'newton' ? j + 1 : kind === 'centred' ? stage.steps.length : 0)],
        ['Abstand zu x*(μ)', toTarget < 1e-12 ? '0' : power(toTarget)], ['Lücke mμ', power(m * stage.mu)]];
      live = i === 0 ? 'Start' : `Etappe ${i} von ${n}`;
    } else {
      const { it, i, n, kind } = state;
      text = {
        init: `Start im Pfadpunkt x*(${power(it?.mu ?? state.iterations[0].mu)}) mit λᵢ = μ/sᵢ, also auf dem Zentralpfad.`,
        predictor: it && `Prädiktor: Newton-Schritt mit μ = 0, also direkt auf das Optimum zu. Er verlässt den Pfad; bis zum Rand ginge es mit α_aff = ${it.alphaAffine.toFixed(2)}, μ fiele dabei auf ${power(it.muAffine)}. Daraus folgt σ = (μ_aff/μ)³ = ${power(it.sigma)}.` + tiny(it.from, it.predictor),
        corrector: it && `Korrektor: Der Schritt zielt auf σμ statt auf null und gleicht den Fehler zweiter Ordnung aus. Er endet dicht neben dem Zentralpfad, nicht genau darauf; μ fällt von ${power(it.mu)} auf ${power(it.muNew)}.` + tiny(it.from, it.x),
        done: it && `sᵀλ = ${power(m * it.muNew)} liegt unter ε = ${power(EPSILON)}: fertig nach ${n} Iterationen.`,
      }[kind];
      const mu = kind === 'init' ? state.iterations[0].mu : kind === 'predictor' ? it.mu : it.muNew;
      readouts = [['μ', power(mu)], ['σ', kind === 'init' ? '—' : power(it.sigma)],
        ['Abstand zum Pfad', kind === 'corrector' || kind === 'done' ? power(it.nearest.distance) : '—'], ['Lücke sᵀλ', power(m * mu)]];
      live = kind === 'init' ? 'Start' : kind === 'done' ? 'Fertig' : `Iteration ${i + 1} von ${n}`;
    }
    $('status').textContent = text;
    $('live-state').textContent = live;
    $('readouts').replaceChildren(...readouts.map(([name, value]) => {
      const div = document.createElement('div');
      div.innerHTML = '<span></span><output></output>';
      div.firstChild.textContent = name;
      div.lastChild.textContent = value;
      return div;
    }));
  }

  // Only a new width redraws; a new height of the text below must not cut a running step short.
  function resize() {
    const svg = $('plot'), measured = Math.round(svg.getBoundingClientRect().width) || 760;
    if (measured === width) return;
    width = measured;
    height = Math.max(220, Math.round(width * 0.43));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);
    fit();
    if (states.length) show(false);
  }

  const stop = () => { clearInterval(timer); timer = null; $('play').textContent = '⏵ Abspielen'; $('play').setAttribute('aria-pressed', 'false'); };
  const go = (i, animate = false) => { index = Math.max(0, Math.min(states.length - 1, i)); show(animate); };
  $('step').addEventListener('click', () => { stop(); go(index + 1, true); });
  $('back').addEventListener('click', () => { stop(); go(index - 1); });
  $('restart').addEventListener('click', () => { stop(); go(0); });
  // To the start of the next stage (barrier method) or iteration (predictor-corrector).
  $('skip').addEventListener('click', () => {
    stop();
    const next = states.findIndex((s, k) => k > index && (s.kind === 'reduce' || s.kind === 'predictor' || s.kind === 'done'));
    go(next < 0 ? states.length - 1 : next, true);
  });
  $('play').addEventListener('click', () => {
    if (timer) return stop();
    if (index === states.length - 1) go(0);
    $('play').textContent = '❚❚ Anhalten';
    $('play').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => (index < states.length - 1 ? go(index + 1, true) : stop()), PLAY);
  });
  $('controls').addEventListener('change', () => { stop(); build(); });
  // Embedded, the frame takes the height of the content.
  new ResizeObserver(() => {
    resize();
    if (window.frameElement) window.frameElement.style.height = `${Math.ceil(document.body.getBoundingClientRect().height)}px`;
  }).observe(document.body);
  resize();
  build();
}
