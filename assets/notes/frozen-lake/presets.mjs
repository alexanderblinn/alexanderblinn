// Greedy policies of the tables learned in the note (seed 42, 100 000 episodes each), action per
// state 0 to 15: 0 links, 1 unten, 2 rechts, 3 oben. Entries of terminal states do not matter.
export const PRESETS = [
  { label: 'Q-Learning', policy: [1, 3, 3, 3, 0, 0, 0, 0, 3, 1, 0, 0, 0, 2, 1, 0] },
  { label: 'Double Q-Learning', policy: [2, 3, 1, 3, 0, 0, 0, 0, 2, 1, 0, 0, 0, 2, 2, 0] },
  { label: 'SARSA', policy: [0, 3, 1, 3, 0, 0, 0, 0, 3, 1, 0, 0, 0, 2, 1, 0] },
  { label: 'SARSA(λ)', policy: [2, 3, 0, 3, 0, 0, 0, 0, 3, 1, 0, 0, 0, 2, 1, 0] },
  { label: 'Monte Carlo', policy: [0, 2, 2, 0, 0, 0, 1, 0, 3, 1, 0, 0, 0, 2, 1, 0] },
];
