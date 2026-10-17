// Exact model of FrozenLake-v1 (4 x 4, slippery) and exact evaluation of deterministic policies.
// Pure functions: the policy editor and its tests share this implementation.
export const MAP = ['SFFF', 'FHFH', 'FFFH', 'HFFG'];
export const ACTIONS = ['links', 'unten', 'rechts', 'oben'];
const MOVES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const kind = s => MAP[Math.floor(s / 4)][s % 4];
export const terminal = s => kind(s) === 'H' || kind(s) === 'G';

// As in Gymnasium: the intended direction and both perpendicular ones with 1/3 each; a move
// into the wall leaves the agent where it is.
export function transitions(s, a) {
  return [(a + 3) % 4, a, (a + 1) % 4].map(d => {
    const row = Math.min(3, Math.max(0, Math.floor(s / 4) + MOVES[d][0]));
    const col = Math.min(3, Math.max(0, (s % 4) + MOVES[d][1]));
    return [1 / 3, 4 * row + col];
  });
}

// Expected reward plus discounted value after one step: reward 1 for entering the goal,
// nothing is bootstrapped behind a terminal state.
const backup = (s, a, v, gamma) => transitions(s, a).reduce(
  (total, [p, next]) => total + p * ((kind(next) === 'G' ? 1 : 0) + (terminal(next) ? 0 : gamma * v[next])), 0);

// Optimal action values q* by value iteration.
export function valueIteration(gamma = 0.99, tolerance = 1e-12) {
  let q = Array.from({ length: 16 }, () => [0, 0, 0, 0]);
  for (;;) {
    const v = q.map(row => Math.max(...row));
    const next = q.map((_, s) => [0, 1, 2, 3].map(a => (terminal(s) ? 0 : backup(s, a, v, gamma))));
    const change = Math.max(...next.flat().map((value, i) => Math.abs(value - q.flat()[i])));
    q = next;
    if (change < tolerance) return q;
  }
}

// Greedy policy; ties go to the first action, as with numpy.argmax.
export const greedy = q => q.map(row => row.indexOf(Math.max(...row)));

// Value of a deterministic policy in every state. With gamma = 1 it is the probability of
// reaching the goal, within `horizon` steps or, for horizon = Infinity, at all.
export function evaluate(policy, { gamma = 1, horizon = Infinity } = {}) {
  let v = new Array(16).fill(0);
  const steps = Number.isFinite(horizon) ? horizon : 100000;
  for (let k = 0; k < steps; k++) {
    const next = v.map((_, s) => (terminal(s) ? 0 : backup(s, policy[s], v, gamma)));
    const change = Math.max(...next.map((value, s) => Math.abs(value - v[s])));
    v = next;
    if (!Number.isFinite(horizon) && change < 1e-13) break;
  }
  return v;
}

// States in which a policy differs from a reference policy (terminal states do not count).
export const deviations = (policy, reference) =>
  policy.map((a, s) => s).filter(s => !terminal(s) && policy[s] !== reference[s]);
