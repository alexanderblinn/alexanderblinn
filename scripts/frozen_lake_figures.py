"""Generates the GIFs and figures of content/notes/frozen-lake.md from the original
discrete_tabular.py of the ReinforcementLearningExamples project. Run with that project's
virtual environment (gymnasium, pygame, matplotlib, Pillow, tqdm):

    <venv>/python scripts/frozen_lake_figures.py [path/to/ReinforcementLearningExamples/examples]

Training results are cached in the system temp directory so that the figures can be
re-rendered without retraining (delete the cache to retrain).
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

import numpy as np
import gymnasium as gym
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrow
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/img/notes/frozen-lake"
EXAMPLES = Path(sys.argv[1] if len(sys.argv) > 1 else r"C:\dev\python\2025\ReinforcementLearningExamples\examples")
sys.path.insert(0, str(EXAMPLES))
import discrete_tabular as dt  # noqa: E402  (the note's subject; imported, not copied)

CACHE = Path(tempfile.gettempdir()) / "frozen_lake_note_cache.npz"
PAPER, INK, MUTED, LINE = "#faf9f6", "#252525", "#65635d", "#c9c6be"
ORANGE, BLUE, GREEN, AREA, PURPLE, TARGET, CONTOUR, GREY = "#b95a28", "#173fbe", "#426f6b", "#e5eeeb", "#685d94", "#8a5979", "#647e83", "#8d8a82"
HOLE, GOAL = "#d9d5cb", "#cfe0da"
plt.rcParams.update({"font.family": "Courier New", "font.size": 11, "figure.facecolor": PAPER, "axes.facecolor": PAPER,
                     "savefig.facecolor": PAPER, "svg.fonttype": "none", "axes.edgecolor": LINE, "text.color": INK,
                     "axes.labelcolor": MUTED, "xtick.color": MUTED, "ytick.color": MUTED, "figure.dpi": 100})
QMAP = LinearSegmentedColormap.from_list("q", [PAPER, "#f1d6c2", ORANGE])
TMAP = LinearSegmentedColormap.from_list("trace", [PAPER, "#c7cfe9", BLUE])

ENV_NAME, SEED, GAMMA = "FrozenLake-v1", dt.SEED, dt.GAMMA
DESC = ["SFFF", "FHFH", "FFFH", "HFFG"]
ACTIONS = ["links", "unten", "rechts", "oben"]  # gymnasium: 0 left, 1 down, 2 right, 3 up
# Display widths in the note: normal figures 512 px, wide figures 790 px (the text column).
# Browsers render SVGs at 96 px per inch, the raster frames are drawn at 100 dpi.
NORMAL, WIDE = 512, 790
METHODS = [("single_q", "Q-Learning"), ("double_q", "Double Q-Learning"), ("sarsa", "SARSA"), ("sarsa_lambda", "SARSA(λ)"), ("mc", "Monte Carlo")]


def german(value, digits=2):
    return f"{value:.{digits}f}".replace(".", ",")


# ─────────────────────────── drawing helpers ────────────────────────────
def cell_origin(state):
    row, col = divmod(state, 4)
    return col, 3 - row


def draw_grid(ax, Q=None, values=None, agent=None, traces=None, highlight=None, arrows=True, numbers=True, vmax=None):
    """Grid of the 4x4 lake: four triangles per cell coloured by Q(s, a), the greedy arrow and the state value."""
    ax.set_xlim(0, 4); ax.set_ylim(0, 4); ax.set_aspect("equal"); ax.axis("off")
    scale = Q if traces is None else traces
    top = vmax if vmax is not None else (float(np.max(scale)) if scale is not None and np.max(scale) > 0 else 1.0)
    cmap = QMAP if traces is None else TMAP
    for s in range(16):
        x0, y0 = cell_origin(s)
        letter = DESC[s // 4][s % 4]
        if letter in "HG":
            ax.add_patch(Rectangle((x0, y0), 1, 1, facecolor=HOLE if letter == "H" else GOAL, edgecolor=LINE, linewidth=1))
            ax.text(x0 + 0.5, y0 + 0.5, letter, ha="center", va="center", fontsize=16, color=MUTED if letter == "H" else GREEN, fontweight="bold")
            continue
        ax.add_patch(Rectangle((x0, y0), 1, 1, facecolor=PAPER, edgecolor=LINE, linewidth=1))
        if scale is not None:
            c = (x0 + 0.5, y0 + 0.5)
            corners = {0: [(x0, y0), (x0, y0 + 1)], 2: [(x0 + 1, y0), (x0 + 1, y0 + 1)], 1: [(x0, y0), (x0 + 1, y0)], 3: [(x0, y0 + 1), (x0 + 1, y0 + 1)]}
            for a in range(4):
                shade = cmap(min(1.0, float(scale[s, a]) / top)) if top > 0 else PAPER
                ax.add_patch(Polygon([*corners[a], c], closed=True, facecolor=shade, edgecolor=LINE, linewidth=0.6))
            if highlight is not None and highlight[0] == s:
                ax.add_patch(Polygon([*corners[highlight[1]], c], closed=True, facecolor="none", edgecolor=INK, linewidth=2.2))
            if arrows and Q is not None and np.max(Q[s]) > 0:
                a = int(np.argmax(Q[s]))
                dx, dy = [(-1, 0), (0, -1), (1, 0), (0, 1)][a]
                ax.add_patch(FancyArrow(x0 + 0.5 - 0.17 * dx, y0 + 0.5 - 0.17 * dy, 0.3 * dx, 0.3 * dy, width=0.05, head_width=0.16, head_length=0.1, color=INK, length_includes_head=True))
            if numbers and Q is not None:
                ax.text(x0 + 0.05, y0 + 0.95, german(float(np.max(Q[s]))), ha="left", va="top", fontsize=8, color=MUTED)
        if letter == "S":
            ax.text(x0 + 0.95, y0 + 0.08, "S", ha="right", va="bottom", fontsize=12, color=PURPLE, fontweight="bold")
    if agent is not None:
        x0, y0 = cell_origin(agent)
        ax.add_patch(Circle((x0 + 0.5, y0 + 0.5), 0.17, facecolor=PURPLE, edgecolor=PAPER, linewidth=1.5, zorder=5))


def figure_to_array(fig):
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[..., :3].copy()


def save_gif(path, frames, durations):
    images = [Image.fromarray(f) if isinstance(f, np.ndarray) else f for f in frames]
    images = [im.convert("RGB").quantize(colors=160, method=Image.Quantize.MEDIANCUT) for im in images]
    images[0].save(path, save_all=True, append_images=images[1:], duration=durations, loop=0, disposal=2, optimize=False)
    print(f"wrote {path.name}: {len(images)} frames, {path.stat().st_size / 1024:.0f} kB")


def caption_size(captions, width):
    """One font size per GIF: the largest of 14 … 11 px at which every caption fits on one line."""
    longest = max((" · ".join(text for text, _ in parts) for parts in captions), key=len)
    for size in (14, 13, 12, 11):
        if ImageFont.truetype("C:/Windows/Fonts/courbd.ttf", size).getlength(longest) <= width - 24:
            break
    return size


def captioned(frame, parts, font_size, size=NORMAL):
    """Pygame frame (256 px) doubled pixel for pixel, with a one-line caption below;
    `parts` are (text, bold) segments separated by a middle dot."""
    image = Image.fromarray(frame).resize((size, size), Image.NEAREST)
    canvas = Image.new("RGB", (size, size + 36), PAPER)
    canvas.paste(image, (0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.line([(0, size), (size, size)], fill=LINE, width=1)
    regular = ImageFont.truetype("C:/Windows/Fonts/cour.ttf", font_size)
    bold = ImageFont.truetype("C:/Windows/Fonts/courbd.ttf", font_size)
    x = 12
    for k, (text, is_bold) in enumerate(parts):
        if k:
            draw.text((x, size + 10), " · ", fill=MUTED, font=regular)
            x += regular.getlength(" · ")
        font = bold if is_bold else regular
        draw.text((x, size + 10), text, fill=INK if is_bold else MUTED, font=font)
        x += font.getlength(text)
    return canvas


# ─────────────────────────── training with hooks ────────────────────────────
def q_learning_snapshots(episodes, snapshot_at):
    """train_q_learning with a copy of Q stored at the requested episodes (before that episode)."""
    env = gym.make(ENV_NAME)
    np.random.seed(SEED)
    Q = np.zeros((16, 4), dtype=np.float32)
    env.reset(seed=SEED)
    alphas = dt.decay_schedule(dt.INIT_ALPHA, dt.MIN_ALPHA, dt.ALPHA_DECAY_RATIO, episodes)
    epsilons = dt.decay_schedule(dt.INIT_EPSILON, dt.MIN_EPSILON, dt.EPSILON_DECAY_RATIO, episodes)
    snapshots = {}
    for episode in range(episodes):
        if episode in snapshot_at:
            snapshots[episode] = (Q.copy(), float(epsilons[episode]), float(alphas[episode]))
        done = False
        state, _ = env.reset()
        action = dt.get_action(Q, state, epsilon=epsilons[episode])
        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            target = reward + GAMMA * np.max(Q[next_state]) * (not done)
            Q[state, action] += alphas[episode] * (target - Q[state, action])
            state = next_state
            action = dt.get_action(Q, next_state, epsilon=epsilons[episode])
    snapshots[episodes] = (Q.copy(), float(epsilons[-1]), float(alphas[-1]))
    env.close()
    return snapshots


def q_learning_episode_record(warmup, length_range, max_tries=400):
    """Q-learning for `warmup` episodes, then the first further episode whose length is in range, step by step."""
    env = gym.make(ENV_NAME)
    np.random.seed(SEED)
    Q = np.zeros((16, 4), dtype=np.float32)
    env.reset(seed=SEED)
    total = dt.NUM_EPISODES
    alphas = dt.decay_schedule(dt.INIT_ALPHA, dt.MIN_ALPHA, dt.ALPHA_DECAY_RATIO, total)
    epsilons = dt.decay_schedule(dt.INIT_EPSILON, dt.MIN_EPSILON, dt.EPSILON_DECAY_RATIO, total)
    for episode in range(warmup + max_tries):
        alpha, epsilon = float(alphas[episode]), float(epsilons[episode])
        steps, done = [], False
        state, _ = env.reset()
        action = dt.get_action(Q, state, epsilon=epsilon)
        while not done:
            before = Q.copy()
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            bootstrap = float(np.max(Q[next_state])) * (not done)
            target = reward + GAMMA * bootstrap
            error = target - Q[state, action]
            Q[state, action] += alpha * error
            steps.append(dict(state=state, action=action, reward=float(reward), next_state=next_state, done=done,
                              bootstrap=bootstrap, target=float(target), error=float(error), before=before, after=Q.copy()))
            state = next_state
            action = dt.get_action(Q, next_state, epsilon=epsilon)
        if episode >= warmup and length_range[0] <= len(steps) <= length_range[1]:
            env.close()
            return episode, epsilon, alpha, steps
    raise RuntimeError("no episode of the requested length")


def sarsa_lambda_trace_record(warmup, length_range, max_tries=400, lam=0.9):
    """SARSA(lambda) for `warmup` episodes, then one episode with the eligibility traces after every step."""
    env = gym.make(ENV_NAME)
    np.random.seed(SEED)
    Q = np.zeros((16, 4), dtype=np.float32)
    env.reset(seed=SEED)
    total = dt.NUM_EPISODES
    alphas = dt.decay_schedule(dt.INIT_ALPHA, dt.MIN_ALPHA, dt.ALPHA_DECAY_RATIO, total)
    epsilons = dt.decay_schedule(dt.INIT_EPSILON, dt.MIN_EPSILON, dt.EPSILON_DECAY_RATIO, total)
    for episode in range(warmup + max_tries):
        alpha, epsilon = float(alphas[episode]), float(epsilons[episode])
        steps, done = [], False
        state, _ = env.reset()
        action = dt.get_action(Q, state, epsilon=epsilon)
        trace = np.zeros((16, 4), dtype=np.float32)
        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            next_action = dt.get_action(Q, next_state, epsilon=epsilon)
            done = terminated or truncated
            target = reward + GAMMA * Q[next_state, next_action] * (not done)
            error = target - Q[state, action]
            trace[state, action] = 1.0
            Q += alpha * error * trace
            steps.append(dict(state=state, action=action, next_state=next_state, reward=float(reward), error=float(error), trace=trace.copy(), Q=Q.copy()))
            trace *= GAMMA * lam
            state, action = next_state, next_action
        if episode >= warmup and length_range[0] <= len(steps) <= length_range[1]:
            env.close()
            return episode, epsilon, alpha, steps
    raise RuntimeError("no episode of the requested length")


def value_iteration(env, gamma, tol=1e-12):
    P = env.unwrapped.P
    q = np.zeros((16, 4))
    while True:
        new = np.zeros_like(q)
        for s in range(16):
            for a in range(4):
                new[s, a] = sum(p * (r + gamma * (0.0 if term else np.max(q[s2]))) for p, s2, r, term in P[s][a])
        if np.max(np.abs(new - q)) < tol:
            return new
        q = new


def policy_success(env, policy, horizon=None):
    """Exact probability of reaching the goal from s0 under a deterministic policy (policy
    evaluation with gamma = 1), optionally within the environment's step limit."""
    P = env.unwrapped.P
    v = np.zeros(16)
    for _ in range(horizon or 100_000):
        new = np.zeros(16)
        for s in range(16):
            new[s] = sum(p * (r + (0.0 if term else v[s2])) for p, s2, r, term in P[s][policy[s]])
        if horizon is None and np.max(np.abs(new - v)) < 1e-13:
            return new[0]
        v = new
    return v[0]


def evaluation_table(results, q_star):
    """The numbers of the comparison table in the note: exact success probabilities of the
    greedy policies with and without the 100-step limit, v(s0) and the deviations from q*."""
    env = gym.make(ENV_NAME)
    optimal = np.argmax(q_star, axis=1)
    rows = [("optimale Politik (q*)", q_star)] + [(label, results[f"Q_{key}"]) for key, label in METHODS]
    print(f"{'policy':22s} {'within 100':>10s} {'no limit':>9s} {'v(s0)':>6s}  deviations from q* (state: chosen vs optimal, q* values)")
    for label, Q in rows:
        policy = np.argmax(Q, axis=1)
        deviations = [f"{s}: {ACTIONS[policy[s]]} statt {ACTIONS[optimal[s]]} ({q_star[s, policy[s]]:.2f} vs {q_star[s, optimal[s]]:.2f})"
                      for s in range(16) if policy[s] != optimal[s] and DESC[s // 4][s % 4] in "SF"]
        print(f"{label:22s} {policy_success(env, policy, 100):10.3f} {policy_success(env, policy):9.3f} {np.max(Q[0]):6.3f}  " + "; ".join(deviations))
    env.close()


def pygame_episode(Q, epsilon, seed, max_steps=100):
    """One episode with gymnasium's own renderer; returns frames and the (state, action, reward) log."""
    env = gym.make(ENV_NAME, render_mode="rgb_array")
    state, _ = env.reset(seed=seed)
    frames, log = [env.render()], []
    rng = np.random.default_rng(seed)
    done = False
    while not done and len(log) < max_steps:
        action = int(rng.integers(4)) if rng.random() < epsilon else int(np.argmax(Q[state]))
        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        log.append((state, action, float(reward), next_state))
        frames.append(env.render())
        state = next_state
    env.close()
    return frames, log


# ─────────────────────────── the figures ────────────────────────────
def train_all():
    if CACHE.exists():
        data = np.load(CACHE, allow_pickle=True)
        return {k: data[k] for k in data.files}
    results = {}
    for key, _ in METHODS:
        env = gym.make(ENV_NAME)
        np.random.seed(SEED)
        Q, rewards = dt.TRAIN_FN_MAP[key](env, GAMMA, dt.INIT_ALPHA, dt.MIN_ALPHA, dt.ALPHA_DECAY_RATIO,
                                          dt.INIT_EPSILON, dt.MIN_EPSILON, dt.EPSILON_DECAY_RATIO, dt.NUM_EPISODES)
        env.close()
        results[f"Q_{key}"] = Q
        results[f"rewards_{key}"] = rewards
    np.savez(CACHE, **results)
    return results


def figure_map():
    fig, ax = plt.subplots(figsize=(NORMAL / 96, NORMAL / 96))
    draw_grid(ax)
    for s in range(16):
        x0, y0 = cell_origin(s)
        letter = DESC[s // 4][s % 4]
        if letter == "F":
            ax.text(x0 + 0.5, y0 + 0.5, str(s), ha="center", va="center", fontsize=13, color=INK)
        else:
            ax.text(x0 + 0.08, y0 + 0.92, str(s), ha="left", va="top", fontsize=10, color=MUTED)
    fig.tight_layout(pad=0.3)
    fig.savefig(OUT / "karte.svg")
    plt.close(fig)


def figure_schedules():
    n = dt.NUM_EPISODES
    eps = dt.decay_schedule(dt.INIT_EPSILON, dt.MIN_EPSILON, dt.EPSILON_DECAY_RATIO, n)
    fig, ax = plt.subplots(figsize=(NORMAL / 96, 2.9))
    ax.plot(np.arange(n) / 1000, eps, color=ORANGE, linewidth=2.2, label="ε (Erkundung) und α (Schrittweite)")
    ax.axvline(dt.EPSILON_DECAY_RATIO * n / 1000, color=LINE, linestyle="--", linewidth=1)
    ax.text(dt.EPSILON_DECAY_RATIO * n / 1000 + 1, 0.55, "90 % der Episoden", color=MUTED, fontsize=9)
    ax.set_xlabel("Episode in Tausend"); ax.set_ylabel("Wert"); ax.set_ylim(0, 1.05); ax.grid(alpha=0.3)
    ax.legend(frameon=False, loc="upper right")
    fig.tight_layout()
    fig.savefig(OUT / "schedules.svg")
    plt.close(fig)


def figure_learning_curves(results):
    window = 2000
    fig, ax = plt.subplots(figsize=(WIDE / 96, 4.0))
    colours = {"single_q": ORANGE, "double_q": "#d9a066", "sarsa": BLUE, "sarsa_lambda": "#6f8ad6", "mc": GREEN}
    for key, label in METHODS:
        rewards = results[f"rewards_{key}"].astype(float)
        smoothed = np.convolve(rewards, np.ones(window) / window, mode="valid")[::50]  # every 50th point keeps the SVG small
        ax.plot((np.arange(len(smoothed)) * 50 + window) / 1000, smoothed, color=colours[key], linewidth=1.8, label=label)
    ax.set_xlabel("Episode in Tausend"); ax.set_ylabel(f"Erfolgsquote (gleitend, {window} Episoden)")
    ax.set_ylim(0, 0.85); ax.grid(alpha=0.3); ax.legend(frameon=False, ncol=2, fontsize=9)
    fig.tight_layout()
    fig.savefig(OUT / "lernkurven.svg")
    plt.close(fig)


def figure_policies(results, q_star):
    fig, axes = plt.subplots(2, 3, figsize=(WIDE / 96, 5.92))
    panels = [(f"Q_{key}", label) for key, label in METHODS] + [("q_star", "q* (Wertiteration)")]
    for ax, (key, label) in zip(axes.flat, panels):
        Q = q_star if key == "q_star" else results[key]
        draw_grid(ax, Q, vmax=float(np.max(q_star)))
        ax.set_title(label, fontsize=11, color=INK)
    fig.tight_layout()
    fig.savefig(OUT / "politiken.svg")
    plt.close(fig)


def gif_q_table():
    marks = [0, 1, 2, 3, 5, 8, 12, 20, 30, 50, 80, 120, 200, 300, 500, 800, 1200, 2000, 3000, 5000, 8000, 12000, 20000, 30000, 50000, 70000, 90000]
    snapshots = q_learning_snapshots(dt.NUM_EPISODES, set(marks))
    frames, durations = [], []
    for episode in [*marks, dt.NUM_EPISODES]:
        Q, epsilon, alpha = snapshots[episode]
        fig, ax = plt.subplots(figsize=(NORMAL / 100, 5.76))
        draw_grid(ax, Q, vmax=1.0)
        ax.set_title(f"Q-Learning · Episode {episode:>6d}\nε = {german(epsilon)}   α = {german(alpha)}", fontsize=12, color=INK, loc="left")
        # Fixed layout: the grid fills the width, the two title lines keep their room in every frame.
        fig.subplots_adjust(left=0, right=1, top=0.9, bottom=0.01)
        frames.append(figure_to_array(fig)); plt.close(fig)
        durations.append(2500 if episode in (0, dt.NUM_EPISODES) else 450)
    save_gif(OUT / "q-tabelle.gif", frames, durations)


def gif_update_step():
    episode, epsilon, alpha, steps = q_learning_episode_record(warmup=1500, length_range=(6, 12))
    frames, durations = [], []
    vmax = max(1e-3, max(float(np.max(step["after"])) for step in steps))
    for k, step in enumerate(steps, start=1):
        for phase in ("vor", "nach"):
            fig, (left, right) = plt.subplots(1, 2, figsize=(WIDE / 100, 4.65), gridspec_kw={"width_ratios": [1, 1.2]})
            Q = step["before"] if phase == "vor" else step["after"]
            agent = step["state"] if phase == "vor" else step["next_state"]
            draw_grid(left, Q, agent=agent, highlight=(step["state"], step["action"]), vmax=vmax)
            left.set_title(f"Episode {episode} · Schritt {k} · ε = {german(epsilon)}", fontsize=10, loc="left", color=INK)
            right.imshow(Q, cmap=QMAP, vmin=0, vmax=vmax, aspect="auto")
            right.set_xticks(range(4), ACTIONS, fontsize=9); right.set_yticks(range(16), [f"s = {s}" for s in range(16)], fontsize=7.5)
            right.add_patch(Rectangle((step["action"] - 0.5, step["state"] - 0.5), 1, 1, fill=False, edgecolor=INK, linewidth=2.2))
            for s in range(16):
                for a in range(4):
                    if Q[s, a] > 0.004:
                        right.text(a, s, german(float(Q[s, a])), ha="center", va="center", fontsize=7, color=INK if Q[s, a] < 0.6 * vmax else PAPER)
            s, a, r, s2 = step["state"], step["action"], step["reward"], step["next_state"]
            if phase == "vor":
                text = f"in s = {s}: Aktion a = {ACTIONS[a]} ({a})\n\n\nQ(s, a) = {german(float(step['before'][s, a]), 3)}"
            else:
                ende = " (Ende der Episode)" if step["done"] else ""
                text = (f"s' = {s2}, r = {german(r, 0)}{ende}\n"
                        f"Zielwert  r + γ·max Q(s',·) = {german(step['target'], 3)}\n"
                        f"Fehler δ  = Ziel − Q(s, a) = {german(step['error'], 3)}\n"
                        f"Q(s, a) ← Q(s, a) + α·δ = {german(float(step['after'][s, a]), 3)}   (α = {german(alpha)})")
            right.set_title(text, fontsize=9, loc="left", color=INK, family="Courier New")
            # Fixed layout: both text blocks have four lines, and the axes never move between frames.
            fig.subplots_adjust(left=0.02, right=0.985, top=0.80, bottom=0.075, wspace=0.26)
            frames.append(figure_to_array(fig)); plt.close(fig)
            durations.append(1100 if phase == "vor" else 2300)
    durations[-1] = 3500
    save_gif(OUT / "update-schritt.gif", frames, durations)


def gif_traces():
    episode, epsilon, alpha, steps = sarsa_lambda_trace_record(warmup=3000, length_range=(8, 18))
    frames, durations = [], []
    for k, step in enumerate(steps, start=1):
        fig, (left, right) = plt.subplots(1, 2, figsize=(WIDE / 100, 4.44))
        draw_grid(left, step["Q"], agent=step["next_state"], vmax=max(1e-3, float(np.max(step["Q"]))))
        left.set_title(f"SARSA(λ) · Episode {episode} · Schritt {k}\nQ(s, a) und gierige Aktionen", fontsize=10, loc="left", color=INK)
        draw_grid(right, None, traces=step["trace"], agent=step["next_state"], highlight=(step["state"], step["action"]), arrows=False, numbers=False, vmax=1.0)
        right.set_title(f"Spuren e(s, a) nach e(s, a) ← 1\nδ = {german(step['error'], 3)}, danach e ← γλ·e", fontsize=10, loc="left", color=INK)
        fig.tight_layout(pad=0.6)
        frames.append(figure_to_array(fig)); plt.close(fig)
        durations.append(900)
    durations[-1] = 3000
    save_gif(OUT / "spuren.gif", frames, durations)


def gif_exploration():
    Q = np.zeros((16, 4), dtype=np.float32)
    for seed in range(SEED, SEED + 40):
        episode_frames, log = pygame_episode(Q, epsilon=1.0, seed=seed)
        if 5 <= len(log) <= 12:
            break
    captions = [[("Episode 1", True), ("ε = 1: jede Aktion zufällig", False), ("Start in s = 0", False)]]
    for k, (s, a, r, s2) in enumerate(log, start=1):
        outcome = "Ziel erreicht, r = 1" if r > 0 else ("ins Loch gerutscht" if k == len(log) and DESC[s2 // 4][s2 % 4] == "H" else "r = 0")
        captions.append([(f"Schritt {k}", True), (f"{ACTIONS[a]}: s = {s} → s' = {s2}", True), (outcome, False)])
    font_size = caption_size(captions, NORMAL)
    frames = [captioned(frame, parts, font_size) for frame, parts in zip(episode_frames, captions)]
    durations = [1400] + [900] * (len(frames) - 2) + [3000]
    save_gif(OUT / "erkundung.gif", frames, durations)


def gif_greedy(Q):
    chosen = {}
    for seed in range(SEED, SEED + 60):
        episode_frames, log = pygame_episode(Q, epsilon=0.0, seed=seed)
        key = "Erfolg" if log[-1][2] > 0 else "Loch"
        if key not in chosen and 6 <= len(log) <= 24:
            chosen[key] = (episode_frames, log)
        if len(chosen) == 2:
            break
    captions, all_frames, durations = [], [], []
    for number, key in enumerate([key for key in ("Erfolg", "Loch") if key in chosen], start=1):
        episode_frames, log = chosen[key]
        captions.append([(f"Testlauf {number}", True), ("gierige Politik, ε = 0", False), ("Start in s = 0", False)])
        for k, (s, a, r, s2) in enumerate(log, start=1):
            intended = {0: s - 1, 1: s + 4, 2: s + 1, 3: s - 4}[a]
            slipped = s2 != intended and s2 != s
            outcome = "Ziel erreicht, r = 1" if r > 0 else ("ins Loch gerutscht" if k == len(log) else ("gerutscht" if slipped else "r = 0"))
            captions.append([(f"Schritt {k}", True), (f"{ACTIONS[a]}: s = {s} → s' = {s2}", True), (outcome, False)])
        all_frames.extend(episode_frames)
        durations.extend([1400] + [800] * (len(log) - 1) + [3000])
    font_size = caption_size(captions, NORMAL)
    frames = [captioned(frame, parts, font_size) for frame, parts in zip(all_frames, captions)]
    save_gif(OUT / "gieriger-lauf.gif", frames, durations)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = train_all()
    env = gym.make(ENV_NAME)
    q_star = value_iteration(env, GAMMA)
    env.close()
    print(f"v*(s0) with gamma = {GAMMA}: {np.max(q_star[0]):.4f}")
    evaluation_table(results, q_star)
    figure_map()
    figure_schedules()
    figure_learning_curves(results)
    figure_policies(results, q_star)
    gif_q_table()
    gif_update_step()
    gif_traces()
    gif_exploration()
    gif_greedy(results["Q_single_q"])


if __name__ == "__main__":
    main()
