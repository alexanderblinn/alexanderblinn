// Checks the exact model behind the Frozen Lake policy editor against the numbers in the note.
// Run with: node --test tests/frozen-lake-policy.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { transitions, valueIteration, greedy, evaluate, deviations, terminal } from '../assets/notes/frozen-lake/model.mjs';
import { PRESETS } from '../assets/notes/frozen-lake/presets.mjs';

const round = x => Math.round(x * 100) / 100;
const optimal = greedy(valueIteration(0.99));

test('slippery transitions: intended and both perpendicular directions, walls stop the move', () => {
  assert.deepEqual(transitions(14, 2).map(([, s]) => s), [14, 15, 10]);
  assert.deepEqual(transitions(0, 0).map(([, s]) => s), [0, 0, 4]);
  for (let s = 0; s < 16; s++) for (let a = 0; a < 4; a++) {
    assert.equal(transitions(s, a).reduce((t, [p]) => t + p, 0), 1);
  }
});

test('optimal policy: success 0.74 within 100 steps, 0.82 without limit, v*(s0) = 0.54', () => {
  assert.equal(round(evaluate(optimal, { horizon: 100 })[0]), 0.74);
  assert.equal(round(evaluate(optimal)[0]), 0.82);
  assert.equal(round(Math.max(...valueIteration(0.99)[0])), 0.54);
  assert.equal(round(evaluate(optimal, { gamma: 0.99 })[0]), 0.54);
});

test('learned policies reproduce the comparison table of the note', () => {
  const table = {
    'Q-Learning': [0.55, 0.82, [0]],
    'Double Q-Learning': [0.21, 0.21, [0, 2, 8, 14]],
    SARSA: [0.73, 0.78, [2]],
    'SARSA(λ)': [0.51, 0.52, [0, 2]],
    'Monte Carlo': [0.67, 0.70, [1, 2, 3, 6]],
  };
  for (const [label, [within, unlimited, differing]] of Object.entries(table)) {
    const policy = PRESETS.find(p => p.label === label).policy;
    assert.equal(round(evaluate(policy, { horizon: 100 })[0]), within, label);
    assert.equal(round(evaluate(policy)[0]), unlimited, label);
    assert.deepEqual(deviations(policy, optimal), differing, label);
  }
});

test('terminal states have value zero and no deviations', () => {
  const values = evaluate(optimal);
  for (const s of [5, 7, 11, 12, 15]) {
    assert.ok(terminal(s));
    assert.equal(values[s], 0);
  }
});
