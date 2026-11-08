"""Generates the static figures, GIFs and the mascot sprite of content/notes/beschraenkte-optimierung.md.

Needs numpy, matplotlib and Pillow (for example the virtual environment of ReinforcementLearningExamples,
which also renders the Frozen Lake figures):

    <venv>/python scripts/beschraenkte_optimierung_figures.py

The two-dimensional example is the quadrilateral ABCD of the Zentralpfad note with
f(x) = 1/2 (x - x_ref)^T Q (x - x_ref), Q from q1 = 1, q2 = 3, theta = -25 degrees. The one-dimensional
example is f(x) = 1/2 (x - 2)^2 with x <= 1. The script prints the numbers quoted in the note.
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as PolygonPatch
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/img/notes/beschraenkte-optimierung"
PAPER, INK, MUTED, LINE, GRID = "#faf9f6", "#252525", "#65635d", "#c9c6be", "#e6e3db"
ORANGE, BLUE, GREEN, AREA, PURPLE, TARGET, CONTOUR = "#b95a28", "#173fbe", "#426f6b", "#e5eeeb", "#685d94", "#8a5979", "#647e83"
plt.rcParams.update({"font.family": ["Courier New", "DejaVu Sans"], "font.size": 11, "figure.facecolor": PAPER, "axes.facecolor": PAPER,
                     "savefig.facecolor": PAPER, "axes.edgecolor": LINE, "text.color": INK, "axes.labelcolor": MUTED,
                     "xtick.color": MUTED, "ytick.color": MUTED, "figure.dpi": 100, "mathtext.fontset": "custom",
                     "mathtext.rm": "Courier New", "mathtext.it": "Courier New:italic", "mathtext.bf": "Courier New:bold"})


def german(value, digits=2):
    """Number with a decimal comma, as in the note."""
    return f"{value:.{digits}f}".replace("-", "−").replace(".", ",")


# --------------------------------------------------------------------------------------------
# Two-dimensional example (same polygon and objective as the Zentralpfad note)
# --------------------------------------------------------------------------------------------
VERTICES = np.array([[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]])
CORNER_NAMES = "ABCD"
TARGETS = {"inside": np.array([0.2, 0.3]), "edge": np.array([2.8, 1.2]), "corner": np.array([3.4, 2.3])}


def q_matrix(k1, k2, degrees):
    c, s = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    return np.array([[k1 * c * c + k2 * s * s, (k1 - k2) * s * c], [(k1 - k2) * s * c, k1 * s * s + k2 * c * c]])


Q = q_matrix(1, 3, -25)


def constraints(vertices):
    """Rows a_i (unit outward normals) and b_i of the edges i -> i+1."""
    rows, rhs = [], []
    for i, v in enumerate(vertices):
        edge = vertices[(i + 1) % len(vertices)] - v
        a = np.array([edge[1], -edge[0]]) / np.linalg.norm(edge)
        rows.append(a)
        rhs.append(a @ v)
    return np.array(rows), np.array(rhs)


A, B = constraints(VERTICES)


def objective(x, target):
    return 0.5 * (x - target) @ Q @ (x - target)


def optimum(target):
    """Exact optimum of the QP over the polygon: the target itself, an edge point or a corner."""
    if np.all(A @ target <= B + 1e-12):
        return target.copy()
    candidates = [v.copy() for v in VERTICES]
    for i, v in enumerate(VERTICES):
        d = VERTICES[(i + 1) % 4] - v
        t = d @ Q @ (target - v) / (d @ Q @ d)
        if 0 < t < 1:
            candidates.append(v + t * d)
    return min(candidates, key=lambda x: objective(x, target))


def multipliers(x, target):
    """KKT multipliers of the active edges: -grad f = sum lambda_i a_i."""
    active = np.where(B - A @ x < 1e-9)[0]
    lam = np.zeros(4)
    if len(active):
        gradient = Q @ (x - target)
        lam[active] = np.linalg.lstsq(A[active].T, -gradient, rcond=None)[0]
    return lam, active


# --------------------------------------------------------------------------------------------
# Mascot "Lambda": a thick lambda glyph on a 20 x 27 pixel grid with cap, face and poses
# --------------------------------------------------------------------------------------------
SPRITE_W, SPRITE_H = 20, 27
SPRITE_COLOURS = {"o": "#5e2a10", "b": ORANGE, "h": "#dd8a52", "w": "#ffffff", "k": INK, "n": "#2f3e66",
                  "g": "#c99a2e", "p": "#ec9a8a", "s": GREEN, "r": "#7c2d12"}
SPRITE_FRAMES = ["idle", "blink", "talk", "point", "point_talk", "wide", "think", "push"]


def _glyph():
    def distance(px, py, a, b):
        v = (b[0] - a[0], b[1] - a[1])
        t = max(0.0, min(1.0, ((px - a[0]) * v[0] + (py - a[1]) * v[1]) / (v[0] ** 2 + v[1] ** 2)))
        return math.hypot(px - a[0] - t * v[0], py - a[1] - t * v[1]), t

    # long stroke (with the face), short leg, small hook at the top; radius at start and end
    strokes = [((4.6, 5.2), (14.8, 21.4), 3.1, 1.55), ((9.6, 13.2), (3.4, 21.4), 1.45, 1.45), ((2.2, 3.0), (4.6, 5.2), 1.2, 2.6)]
    grid = [["." for _ in range(SPRITE_W)] for _ in range(SPRITE_H)]
    for y in range(1, 24):
        for x in range(18):
            if any(distance(x + 0.5, y + 0.5, a, b)[0] <= r0 + (r1 - r0) * distance(x + 0.5, y + 0.5, a, b)[1] for a, b, r0, r1 in strokes):
                grid[y + 2][x + 1] = "b"
    outlined = [row[:] for row in grid]
    for y in range(SPRITE_H):
        for x in range(SPRITE_W):
            if grid[y][x] == "." and any(0 <= y + dy < SPRITE_H and 0 <= x + dx < SPRITE_W and grid[y + dy][x + dx] == "b"
                                         for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                outlined[y][x] = "o"
    return outlined


def _put(grid, x, y, art):
    """Paint rows separated by '/'; a space keeps the pixel, '_' clears it."""
    for dy, row in enumerate(art.split("/")):
        for dx, ch in enumerate(row):
            if ch != " ":
                grid[y + dy][x + dx] = "." if ch == "_" else ch


def sprite_frame(name):
    grid = [row[:] for row in _glyph()]
    for y in range(4, 18):  # light from the top left
        x = next(i for i, ch in enumerate(grid[y]) if ch == "b")
        grid[y][x] = "h"
    _put(grid, 1, 24, "kkkkk")  # shoes
    _put(grid, 14, 24, "kkkkk")
    _put(grid, 0, 25, "_______")
    _put(grid, 13, 25, "_______")
    _put(grid, 3, 0, "nnnn")  # mortarboard with tassel
    _put(grid, 0, 1, "nnnnnnnnn")
    _put(grid, 2, 2, "nnnnn g")
    _put(grid, 8, 3, "g")
    eyes = {"blink": "  /kk", "push": "  /kk", "wide": "wk/kk", "think": " k/  "}.get(name, " k/ k")
    _put(grid, 4, 7, eyes)
    _put(grid, 7, 7, eyes)
    _put(grid, 3, 9, "p")
    _put(grid, 9, 9, "p")
    mouth = {"talk": " kk/ rr", "point_talk": " kk/ rr", "wide": " kk/ kk", "think": "/ kk", "push": "/kkkk"}.get(name, "k  k/ kk")
    _put(grid, 5, 9, mouth)
    if name in ("point", "point_talk"):
        _put(grid, 12, 10, "   oo/  obbo/ obbo/obbo")
        _put(grid, 17, 7, "  s/ s/s")
    if name == "push":
        _put(grid, 0, 12, "ooooo/obbbbbb/obbbbbbb/ooooooo")
    return grid


def sprite_rgba(name, scale=3):
    grid = sprite_frame(name)
    image = np.zeros((SPRITE_H, SPRITE_W, 4), dtype=np.uint8)
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch in SPRITE_COLOURS:
                colour = SPRITE_COLOURS[ch].lstrip("#")
                image[y, x] = [int(colour[i:i + 2], 16) for i in (0, 2, 4)] + [255]
    return image.repeat(scale, axis=0).repeat(scale, axis=1)


def sprite_sheet():
    """All frames side by side as crisp pixel paths, one path per colour; used as a CSS background."""
    paths = {}
    for f, name in enumerate(SPRITE_FRAMES):
        for y, row in enumerate(sprite_frame(name)):
            x = 0
            while x < SPRITE_W:
                ch = row[x]
                if ch not in SPRITE_COLOURS:
                    x += 1
                    continue
                run = 1
                while x + run < SPRITE_W and row[x + run] == ch:
                    run += 1
                paths.setdefault(ch, []).append(f"M{f * SPRITE_W + x} {y}h{run}v1h-{run}z")
                x += run
    width = SPRITE_W * len(SPRITE_FRAMES)
    body = "".join(f'<path fill="{SPRITE_COLOURS[ch]}" d="{"".join(d)}"/>' for ch, d in paths.items())
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {SPRITE_H}" width="{width}" height="{SPRITE_H}" '
            f'shape-rendering="crispEdges"><!-- Lambda, frames: {", ".join(SPRITE_FRAMES)} -->{body}</svg>\n')


# --------------------------------------------------------------------------------------------
# Hand-written SVG helpers in the style of the Zentralpfad figures
# --------------------------------------------------------------------------------------------
def n(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def svg(width, height, body, markers=()):
    defs = "".join(f'<marker id="arrow-{name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
                   f'<path d="M0 0L10 5L0 10z" fill="{colour}"/></marker>' for name, colour in markers)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
            f'font-family="Courier New, Courier, monospace" font-size="13" fill="{INK}">\n'
            f'<rect width="{width}" height="{height}" fill="{PAPER}"/>\n<defs>{defs}</defs>\n{body}\n</svg>\n')


def text(x, y, content, attributes=""):
    return f'<text x="{n(x)}" y="{n(y)}" {attributes}>{content}</text>'


def line(p, q, attributes):
    return f'<line x1="{n(p[0])}" y1="{n(p[1])}" x2="{n(q[0])}" y2="{n(q[1])}" {attributes}/>'


def arrow(p, q, colour_name, colour, width=2.2, extra=""):
    return line(p, q, f'stroke="{colour}" stroke-width="{width}" marker-end="url(#arrow-{colour_name})" {extra}')


def polygon(points, attributes):
    return f'<polygon points="{" ".join(f"{n(x)},{n(y)}" for x, y in points)}" {attributes}/>'


def polyline(points, attributes):
    return f'<polyline points="{" ".join(f"{n(x)},{n(y)}" for x, y in points)}" fill="none" {attributes}/>'


def diamond(p, size=5.5, fill=INK):
    return (f'<rect x="{-size}" y="{-size}" width="{2 * size}" height="{2 * size}" transform="translate({n(p[0])} {n(p[1])}) rotate(45)" '
            f'fill="{fill}" stroke="{PAPER}" stroke-width="1.5"/>')


def target_mark(p):
    return (f'<circle cx="{n(p[0])}" cy="{n(p[1])}" r="7" fill="{PAPER}" stroke="{TARGET}" stroke-width="1.5"/>'
            f'<path d="M{n(p[0] - 4)},{n(p[1])} H{n(p[0] + 4)} M{n(p[0])},{n(p[1] - 4)} V{n(p[1] + 4)}" stroke="{TARGET}" stroke-width="1.5"/>')


SUB_END = lambda s: f'<tspan dy="4" font-size="10">{s}</tspan>'  # noqa: E731


def clip_halfplane(points, a, b):
    """Sutherland-Hodgman: the part of a polygon with a.x <= b."""
    result = []
    for i, p in enumerate(points):
        q = points[(i + 1) % len(points)]
        fp, fq = a @ p - b, a @ q - b
        if fp <= 0:
            result.append(p)
        if fp * fq < 0:
            result.append(p + (q - p) * fp / (fp - fq))
    return result


# --------------------------------------------------------------------------------------------
# Figure 2: feasible directions at an active and at an inactive constraint
# --------------------------------------------------------------------------------------------
def figure_directions():
    W, H = 790, 330
    body = ""
    # screen coordinates (y down): outward normal to the upper right, boundary from top left to bottom right
    normal = np.array([math.cos(math.radians(-20)), math.sin(math.radians(-20))])
    tangent = np.array([-normal[1], normal[0]])
    unit = lambda v: v / np.linalg.norm(v)  # noqa: E731
    for panel, (title, active) in enumerate([("aktive Nebenbedingung: aᵢᵀx* = bᵢ", True), ("inaktive Nebenbedingung: aᵢᵀx* < bᵢ", False)]):
        ox = 1 + panel * 399
        box = (ox, 40, 390, 274)
        centre = np.array([ox + 235, 40 + 128])
        corners = [np.array(c, dtype=float) for c in [(box[0], box[1]), (box[0] + box[2], box[1]), (box[0] + box[2], box[1] + box[3]), (box[0], box[1] + box[3])]]
        boundary_b = normal @ centre
        body += polygon(clip_halfplane(corners, normal, boundary_b), f'fill="{AREA}" fill-opacity="0.8"')
        body += f'<clipPath id="panel-{panel}"><rect x="{box[0]}" y="{box[1]}" width="{box[2]}" height="{box[3]}"/></clipPath>'
        body += f'<g clip-path="url(#panel-{panel})">' + line(centre - 170 * tangent, centre + 170 * tangent, f'stroke="{GREEN}" stroke-width="1.8"') + "</g>"
        body += f'<rect x="{box[0]}" y="{box[1]}" width="{box[2]}" height="{box[3]}" fill="none" stroke="{LINE}"/>'
        body += text(ox, 24, title.replace("<", "&lt;"), f'fill="{MUTED}"')
        body += text(box[0] + 12, box[1] + 22, "zulässig", f'fill="{GREEN}"')
        body += text(box[0] + box[2] - 10, box[1] + 22, "unzulässig", f'fill="{MUTED}" text-anchor="end"')
        at = centre + 140 * tangent + np.array([12, 0])
        body += text(at[0], at[1], "aᵢᵀx = bᵢ", f'fill="{GREEN}" font-size="12"')
        if active:
            x = centre
            radius = 86
            start, end = x - radius * tangent, x + radius * tangent
            body += (f'<path d="M{n(start[0])},{n(start[1])} A{radius},{radius} 0 0 0 {n(end[0])},{n(end[1])} Z" '
                     f'fill="{BLUE}" fill-opacity="0.07" stroke="{BLUE}" stroke-opacity="0.35" stroke-dasharray="4 3"/>')
            d1, d2, d3 = unit(-normal - 0.8 * tangent), -tangent, unit(normal - 0.9 * tangent)
            for d, name, colour, label, offset in [(d1, "blue", BLUE, "d₁", (-26, 4)), (d2, "blue", BLUE, "d₂", (-24, -2)),
                                                   (d3, "orange", ORANGE, "d₃ ✗", (6, -4))]:
                tip = x + 76 * d
                body += arrow(x, tip, name, colour)
                body += text(tip[0] + offset[0], tip[1] + offset[1], label, f'fill="{colour}" font-weight="bold"')
            tip = x + 60 * normal
            body += arrow(x, tip, "green", GREEN, 2.6)
            body += text(tip[0] + 8, tip[1] + 6, "aᵢ", f'fill="{GREEN}" font-weight="bold"')
            body += diamond(x)
            body += text(x[0] - 12, x[1] + 22, "x*", 'font-weight="bold" text-anchor="end"')
            for k, (row, colour) in enumerate([("aᵢᵀd₁ < 0: nach innen", BLUE), ("aᵢᵀd₂ = 0: entlang der Grenze", BLUE),
                                               ("aᵢᵀd₃ > 0: nach außen", ORANGE)]):
                body += text(box[0] + 12, box[1] + box[3] - 52 + 18 * k, row.replace("<", "&lt;").replace(">", "&gt;"), f'fill="{colour}" font-size="12"')
        else:
            x = centre - 92 * normal - 14 * tangent
            foot = x + (boundary_b - normal @ x) * normal
            body += line(x + 44 * normal, foot, f'stroke="{MUTED}" stroke-width="1" stroke-dasharray="3 3"')
            label_at = foot + np.array([-8, -10])
            body += text(label_at[0], label_at[1], "Abstand &gt; 0", f'fill="{MUTED}" font-size="12" text-anchor="end"')
            radius = 44
            body += f'<circle cx="{n(x[0])}" cy="{n(x[1])}" r="{radius}" fill="{BLUE}" fill-opacity="0.07" stroke="{BLUE}" stroke-opacity="0.35" stroke-dasharray="4 3"/>'
            for k in range(8):
                angle = 2 * math.pi * k / 8 + 0.3
                body += arrow(x, x + 36 * np.array([math.cos(angle), math.sin(angle)]), "blue", BLUE, 1.8)
            body += diamond(x)
            body += text(x[0] - 50, x[1] + 4, "x*", 'font-weight="bold" text-anchor="end"')
            body += text(box[0] + 12, box[1] + box[3] - 34, "Für einen kurzen Schritt εd", f'fill="{BLUE}" font-size="12"')
            body += text(box[0] + 12, box[1] + box[3] - 16, "ist jede Richtung zulässig.", f'fill="{BLUE}" font-size="12"')
    (OUT / "richtungen.svg").write_text(svg(W, H, body, [("blue", BLUE), ("orange", ORANGE), ("green", GREEN)]), encoding="utf-8")


# --------------------------------------------------------------------------------------------
# Figure 4: where the optimum can lie: inside, on an edge, in a corner
# --------------------------------------------------------------------------------------------
def figure_positions():
    W, H, top = 790, 310, 52
    panel_w, panel_h, gap = 250, 221, 20
    view = (-2.72, 4.78, -2.32, 4.3)  # x0, x1, y0, y1
    scale = panel_w / (view[1] - view[0])
    body = ""
    numbers = {}
    for k, key in enumerate(["inside", "edge", "corner"]):
        ox = 1 + k * (panel_w + gap)
        to_screen = lambda p, ox=ox: np.array([ox + (p[0] - view[0]) * scale, top + (view[3] - p[1]) * scale])  # noqa: E731
        target = TARGETS[key]
        x = optimum(target)
        lam, active = multipliers(x, target)
        gradient = Q @ (x - target)
        numbers[key] = (x, lam, objective(x, target))
        body += f'<clipPath id="pos-{k}"><rect x="{ox}" y="{top}" width="{panel_w}" height="{panel_h}"/></clipPath><g clip-path="url(#pos-{k})">'
        screen_polygon = [to_screen(v) for v in VERTICES]
        body += polygon(screen_polygon, f'fill="{AREA}" fill-opacity="0.8"')
        # contour ellipses of f around the target, the one through x* in ink
        eigenvalues, vectors = np.linalg.eigh(Q)
        angle = -math.degrees(math.atan2(vectors[1, 0], vectors[0, 0]))
        level = objective(x, target)
        levels = [0.05, 0.25, 0.7, 1.4, 2.4, 3.8] if key == "inside" else sorted({level * f for f in (0.25, 1, 2.6, 5)} | {level})
        centre = to_screen(target)
        for c in levels:
            rx, ry = (math.sqrt(2 * c / ev) * scale for ev in eigenvalues)
            main = abs(c - level) < 1e-12 and key != "inside"
            body += (f'<ellipse cx="{n(centre[0])}" cy="{n(centre[1])}" rx="{n(rx)}" ry="{n(ry)}" transform="rotate({n(angle)} {n(centre[0])} {n(centre[1])})" '
                     f'fill="none" stroke="{INK if main else CONTOUR}" stroke-width="{1.4 if main else 1}" opacity="{0.75 if main else 0.35}"/>')
        for i in range(4):
            colour = GREEN
            body += line(screen_polygon[i], screen_polygon[(i + 1) % 4], f'stroke="{colour}" stroke-width="{2.6 if i in active else 1.4}"')
        p = to_screen(x)
        if key == "corner":
            # normal cone at C, spanned by the outward normals of BC and CD
            a1, a2 = A[1] * np.array([1, -1]), A[2] * np.array([1, -1])
            cone = [p, p + 52 * a1, p + 52 * (a1 + a2) / np.linalg.norm(a1 + a2) * 1.3, p + 52 * a2]
            body += polygon(cone, f'fill="{TARGET}" fill-opacity="0.1" stroke="none"')
            body += line(p, p + 52 * a1, f'stroke="{TARGET}" stroke-opacity="0.45" stroke-dasharray="3 3"')
            body += line(p, p + 52 * a2, f'stroke="{TARGET}" stroke-opacity="0.45" stroke-dasharray="3 3"')
        if key != "inside":
            length = 36 / np.linalg.norm(gradient)  # -grad f drawn 46 px long, the other arrows to the same scale
            pull = -gradient * length * np.array([1, -1])
            body += arrow(p, p + pull, "target", TARGET)
            for i in active:
                push = -lam[i] * A[i] * length * np.array([1, -1])
                body += arrow(p, p + push, "green", GREEN)
        body += target_mark(centre) if key != "inside" else ""
        body += diamond(p)
        body += "</g>"
        body += f'<rect x="{ox}" y="{top}" width="{panel_w}" height="{panel_h}" fill="none" stroke="{LINE}"/>'
        for i, v in enumerate(VERTICES):
            q = to_screen(v)
            offset = {0: (3, 17), 1: (6, 14), 2: (6, -6), 3: (-14, -6)}[i]
            body += text(q[0] + offset[0], q[1] + offset[1], CORNER_NAMES[i], f'fill="{MUTED}"')
        if key == "inside":
            body += text(p[0] + 10, p[1] - 10, "x* = x" + SUB_END("ref"), 'font-weight="bold"')
            title, subtitle = "Inneres", "∇f(x*) = 0, alle λᵢ = 0"
        elif key == "edge":
            body += text(p[0] - 10, p[1] + 22, "x*", 'font-weight="bold" text-anchor="end"')
            body += text(centre[0] - 6, centre[1] + 24, "x" + SUB_END("ref"), f'fill="{TARGET}" font-weight="bold"')
            title, subtitle = "Kante BC", f"−∇f ∥ a, λ ≈ {german(lam[1])}"
        else:
            body += text(p[0] - 10, p[1] + 28, "x* = C", 'font-weight="bold" text-anchor="end"')
            body += text(centre[0] - 4, centre[1] + 26, "x" + SUB_END("ref"), f'fill="{TARGET}" font-weight="bold"')
            title, subtitle = "Ecke C", f"λ ≈ {german(lam[1])} (BC), {german(lam[2])} (CD)"
        body += text(ox, 20, title, 'font-weight="bold"')
        body += text(ox, 38, subtitle, f'fill="{MUTED}" font-size="12"')
    legend = [(TARGET, "−∇f(x*)"), (GREEN, "−λᵢaᵢ"), (INK, "Höhenlinie durch x*")]
    x0 = 0
    for colour, label in legend:
        body += line((x0, H - 20), (x0 + 24, H - 20), f'stroke="{colour}" stroke-width="2.2"')
        body += text(x0 + 32, H - 16, label, f'fill="{MUTED}" font-size="12"')
        x0 += 70 + 9 * len(label)
    body += f'<rect x="{x0}" y="{H - 27}" width="14" height="14" fill="{TARGET}" fill-opacity="0.12"/>'
    body += text(x0 + 22, H - 16, "Normalenkegel", f'fill="{MUTED}" font-size="12"')
    (OUT / "lagen.svg").write_text(svg(W, H, body, [("target", TARGET), ("green", GREEN)]), encoding="utf-8")
    return numbers


# --------------------------------------------------------------------------------------------
# Figure 6: the dual function as the lower envelope of lines (1-D example)
# --------------------------------------------------------------------------------------------
def lagrangian_1d(x, lam):
    return 0.5 * (x - 2) ** 2 + lam * (x - 1)


def figure_dual():
    W, H = 790, 380
    left, right, top, bottom = 58, 210, 26, 50
    lam0, lam1, y0, y1 = 0.0, 2.5, -0.75, 2.25
    X = lambda v: left + (v - lam0) / (lam1 - lam0) * (W - left - right)  # noqa: E731
    Y = lambda v: top + (y1 - v) / (y1 - y0) * (H - top - bottom)  # noqa: E731
    body = f'<clipPath id="dual-plot"><rect x="{left}" y="{top}" width="{W - left - right}" height="{H - top - bottom}"/></clipPath>'
    for v in np.arange(-0.5, 2.01, 0.5):
        body += line((left, Y(v)), (W - right, Y(v)), f'stroke="{LINE if abs(v) < 1e-9 else GRID}" stroke-width="{1 if abs(v) < 1e-9 else 0.75}"')
        body += text(left - 8, Y(v) + 4, german(v, 1), f'text-anchor="end" fill="{MUTED}" font-size="12"')
    for v in np.arange(0, 2.51, 0.5):
        body += line((X(v), top), (X(v), H - bottom), f'stroke="{LINE if v == 0 else GRID}" stroke-width="{1 if v == 0 else 0.75}"')
        body += text(X(v), H - bottom + 18, german(v, 1), f'text-anchor="middle" fill="{MUTED}" font-size="12"')
    body += '<g clip-path="url(#dual-plot)">'
    lams = np.linspace(lam0, lam1, 2)
    for x in [-0.25, 0.0, 0.25, 0.5, 0.75, 1.25, 1.5, 2.0, 2.5, 3.0]:
        colour = BLUE if x < 1 else ORANGE
        body += polyline([(X(l), Y(lagrangian_1d(x, l))) for l in lams], f'stroke="{colour}" stroke-width="1.3" stroke-opacity="0.55"')
    body += polyline([(X(l), Y(0.5)) for l in lams], f'stroke="{INK}" stroke-width="1.4" stroke-dasharray="6 4"')
    grid = np.linspace(lam0, lam1, 121)
    body += polyline([(X(l), Y(l - l * l / 2)) for l in grid], f'stroke="{INK}" stroke-width="3"')
    body += "</g>"
    # bound at one lambda: g(lambda) <= p*
    lb = 0.3
    body += line((X(lb), Y(lb - lb * lb / 2)), (X(lb), Y(0.5)), f'stroke="{PURPLE}" stroke-width="1.6"')
    body += line((X(lb) - 5, Y(0.5)), (X(lb) + 5, Y(0.5)), f'stroke="{PURPLE}" stroke-width="1.6"')
    body += line((X(lb) - 5, Y(lb - lb * lb / 2)), (X(lb) + 5, Y(lb - lb * lb / 2)), f'stroke="{PURPLE}" stroke-width="1.6"')
    body += text(X(lb) + 10, Y(0.07), "Lücke p* − g(λ)", f'fill="{PURPLE}" font-size="12"')
    body += diamond((X(1), Y(0.5)))
    body += text(X(1) + 10, Y(0.5) - 12, "λ* = 1: g(λ*) = p* = ½", 'font-weight="bold"')
    body += text(X(2.05), Y(2.05 - 2.05 ** 2 / 2) + 22, "g(λ)", 'font-weight="bold"')
    # upper bounds at lambda = 0: f(x) of feasible x
    for x in [0.25, 0.5, 0.75]:
        body += f'<circle cx="{n(X(0))}" cy="{n(Y(0.5 * (x - 2) ** 2))}" r="3.5" fill="{BLUE}"/>'
    body += text(X(0) + 10, Y(1.53) - 6, "f(x) zulässiger x", f'fill="{BLUE}" font-size="12"')
    body += text(W - right, H - 10, "Multiplikator λ", f'text-anchor="end" fill="{MUTED}"')
    body += text(left, top - 10, "ℒ(x, λ) für festes x", f'fill="{MUTED}"')
    lx, ly = W - right + 24, top + 20
    entries = [(BLUE, "1.3", "", "x &lt; 1: fallend", 0.55), (INK, "1.4", 'stroke-dasharray="6 4"', "x = 1: waagerecht", 1),
               (ORANGE, "1.3", "", "x &gt; 1: steigend", 0.55), (INK, "3", "", "untere Hülle", 1)]
    for colour, width, dash, label, opacity in entries:
        body += line((lx, ly - 4), (lx + 26, ly - 4), f'stroke="{colour}" stroke-width="{width}" stroke-opacity="{opacity}" {dash}')
        body += text(lx + 34, ly, label, 'font-size="12"')
        ly += 22
    body += text(lx + 34, ly - 4, "g(λ) = λ − λ²/2", f'fill="{MUTED}" font-size="12"')
    (OUT / "duale-funktion.svg").write_text(svg(W, H, body), encoding="utf-8")


# --------------------------------------------------------------------------------------------
# GIF helpers
# --------------------------------------------------------------------------------------------
def figure_to_array(fig):
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[..., :3].copy()


def save_gif(path, frames, durations, colors=128):
    """One shared palette for all frames, so colours do not flicker between frames."""
    stack = Image.fromarray(np.concatenate(frames[:: max(1, len(frames) // 12)], axis=0))
    palette = stack.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    images = [Image.fromarray(f).quantize(palette=palette, dither=Image.Dither.NONE) for f in frames]
    images[0].save(path, save_all=True, append_images=images[1:], duration=durations, loop=0, disposal=1, optimize=True)
    print(f"wrote {path.name}: {len(images)} frames, {path.stat().st_size / 1024:.0f} kB")


def plain_axes(ax):
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.tick_params(length=3, labelsize=10)
    ax.grid(color=GRID, linewidth=0.75)
    ax.set_axisbelow(True)


def comma_ticks(ax, axis="both", digits=1):
    from matplotlib.ticker import FuncFormatter
    formatter = FuncFormatter(lambda v, _: german(v, digits).replace(",0", "") if abs(v - round(v)) < 1e-9 else german(v, digits))
    if axis in ("x", "both"):
        ax.xaxis.set_major_formatter(formatter)
    if axis in ("y", "both"):
        ax.yaxis.set_major_formatter(formatter)


# --------------------------------------------------------------------------------------------
# Figure 5: the supremum over lambda builds a wall at the boundary (1-D example)
# --------------------------------------------------------------------------------------------
def gif_wall():
    xs = np.linspace(-0.7, 3.2, 400)
    f = 0.5 * (xs - 2) ** 2
    lam_values = [0.0] + list(6 * np.linspace(0.03, 1, 34) ** 2)
    frames, durations = [], []
    for k, lam in enumerate(lam_values + [None]):
        fig = plt.figure(figsize=(7.9, 4.3))
        ax = fig.add_axes([0.07, 0.19, 0.9, 0.72])
        plain_axes(ax)
        comma_ticks(ax)
        ax.set_xlim(-0.7, 3.2)
        ax.set_ylim(-0.3, 3.4)
        ax.axvspan(-0.7, 1, color=AREA, alpha=0.8, linewidth=0)
        ax.text(0.95, 3.3, "zulässig: x ≤ 1", color=GREEN, fontsize=11, va="top", ha="right")
        ax.text(3.12, 3.3, "unzulässig", color=MUTED, fontsize=11, va="top", ha="right")
        ax.axvline(1, color=GREEN, linewidth=1.6)
        for previous in lam_values[: k if lam is not None else len(lam_values)]:
            ax.plot(xs, lagrangian_1d(xs, previous), color=ORANGE, linewidth=0.8, alpha=0.18)
        ax.plot(xs, f, color=MUTED, linewidth=1.4, linestyle=(0, (5, 4)))
        ax.text(2.9, 0.5 * (2.9 - 2) ** 2 + 0.12, "f(x)", color=MUTED, ha="center", va="bottom", fontsize=11)
        if lam is not None:
            current = lagrangian_1d(xs, lam)
            ax.plot(xs, current, color=ORANGE, linewidth=2.4)
            envelope = np.where(xs <= 1, f, current)
            ax.plot(xs, envelope, color=INK, linewidth=2.8)
            title = f"ℒ(x, λ) = ½(x − 2)² + λ(x − 1)   für λ = {german(lam)}"
        else:
            ax.plot(xs[xs <= 1], f[xs <= 1], color=INK, linewidth=2.8)
            ax.annotate("", xy=(1, 3.32), xytext=(1, 0.5), arrowprops=dict(arrowstyle="-|>", color=INK, linewidth=2.8, mutation_scale=16))
            ax.text(1.08, 2.7, "sup über λ ≥ 0:\n+∞ für x > 1", color=INK, fontsize=11, va="top", fontweight="bold")
            title = "sup über λ ≥ 0:  f(x) für x ≤ 1, +∞ sonst"
        ax.plot([1], [0.5], marker="o", markersize=7, markerfacecolor=PAPER, markeredgecolor=INK, markeredgewidth=1.5, zorder=5)
        ax.text(0.92, 0.42, "(1, f(1))", ha="right", va="top", fontsize=10, color=MUTED)
        ax.plot([2], [0], marker="+", markersize=11, markeredgewidth=2, color=TARGET, zorder=5)
        ax.text(2.06, 0.1, r"$x_\mathrm{ref}$", color=TARGET, fontsize=11)
        fig.text(0.07, 0.945, title, fontsize=12, color=INK)
        if lam is not None:
            for x0, (colour, width, label) in zip((0.07, 0.42), [(ORANGE, 2.4, "ℒ(x, λ) beim aktuellen λ"), (INK, 2.8, "größter Wert über alle bisherigen λ")]):
                fig.lines.append(matplotlib.lines.Line2D([x0, x0 + 0.03], [0.04, 0.04], transform=fig.transFigure, color=colour, linewidth=width))
                fig.text(x0 + 0.04, 0.04, label, fontsize=10.5, color=INK, va="center")
        frames.append(figure_to_array(fig))
        plt.close(fig)
        durations.append(1400 if k == 0 else 3200 if lam is None else 110)
    save_gif(OUT / "wand.gif", frames, durations)


# --------------------------------------------------------------------------------------------
# Figure 7: the Lagrangian as a saddle surface, slowly turning (1-D example)
# --------------------------------------------------------------------------------------------
def gif_saddle():
    xs = np.linspace(-0.25, 2.75, 13)
    ls = np.linspace(0.0, 2.0, 9)
    elevation = math.radians(26)

    def project(x, l, z, azimuth):
        X, Y, Z = (x - 1.25) / 1.5, (l - 1.0) / 1.0, (z - 1.2) / 2.8
        X1 = X * math.cos(azimuth) - Y * math.sin(azimuth)
        Y1 = X * math.sin(azimuth) + Y * math.cos(azimuth)
        u, v = X1, Z * math.cos(elevation) + Y1 * math.sin(elevation)
        depth = Y1 * math.cos(elevation) - Z * math.sin(elevation)
        return u, v, depth

    light = np.array([-0.4, -0.6, 0.7]) / np.linalg.norm([-0.4, -0.6, 0.7])
    frames, durations = [], []
    count = 40
    for k in range(count):
        azimuth = math.radians(-62 + 22 * math.sin(2 * math.pi * k / count))
        fig = plt.figure(figsize=(7.9, 4.2))
        ax = fig.add_axes([0.0, 0.0, 0.6, 0.9])
        ax.set_xlim(-1.55, 1.55)
        ax.set_ylim(-1.15, 1.05)
        ax.set_aspect("equal")
        ax.axis("off")
        items = []
        for i in range(len(xs) - 1):
            for j in range(len(ls) - 1):
                corners = [(xs[i], ls[j]), (xs[i + 1], ls[j]), (xs[i + 1], ls[j + 1]), (xs[i], ls[j + 1])]
                points = [project(x, l, lagrangian_1d(x, l), azimuth) for x, l in corners]
                p3 = [np.array([(x - 1.25) / 1.5, (l - 1.0), (lagrangian_1d(x, l) - 1.2) / 2.8]) for x, l in corners]
                normal = np.cross(p3[1] - p3[0], p3[3] - p3[0])
                normal /= np.linalg.norm(normal)
                shade = round(3 * abs(normal @ light)) / 3  # four flat tones compress well
                tone = np.array([0.98, 0.976, 0.965]) * (0.88 + 0.12 * shade)
                items.append((np.mean([p[2] for p in points]), "quad", [(p[0], p[1]) for p in points], tone))
        floor = [project(x, l, -0.05, azimuth) for x, l in [(xs[0], ls[0]), (xs[-1], ls[0]), (xs[-1], ls[-1]), (xs[0], ls[-1])]]
        ax.add_patch(PolygonPatch([(p[0], p[1]) for p in floor], closed=True, facecolor="none", edgecolor=LINE, linewidth=1, linestyle=(0, (3, 3)), zorder=0))
        curves = [([(x, 1.0) for x in np.linspace(-0.25, 2.75, 61)], BLUE, 2.6),
                  ([(1.0, l) for l in np.linspace(0, 2, 41)], ORANGE, 2.6),
                  ([(2 - l, l) for l in np.linspace(0, 2, 41)], PURPLE, 1.8)]
        for points, colour, width in curves:
            projected = [project(x, l, lagrangian_1d(x, l), azimuth) for x, l in points]
            for a, b in zip(projected, projected[1:]):
                items.append(((a[2] + b[2]) / 2 - 0.12, "segment", [(a[0], a[1]), (b[0], b[1])], (colour, width)))
        items.sort(key=lambda item: -item[0])
        for z, (depth, kind, points, style) in enumerate(items):
            if kind == "quad":
                ax.add_patch(PolygonPatch(points, closed=True, facecolor=style, edgecolor=INK, linewidth=0.55, zorder=z + 1))
            else:
                ax.plot(*zip(*points), color=style[0], linewidth=style[1], solid_capstyle="round", zorder=z + 1)
        su, sv, _ = project(1.0, 1.0, 0.5, azimuth)
        ax.plot([su], [sv], marker="D", markersize=8, color=INK, markeredgecolor=PAPER, markeredgewidth=1.5, zorder=len(items) + 2)
        for (x, l, z), label in [((1.25, -0.25, -0.05), "x"), ((3.0, 1.0, -0.05), "λ")]:
            u, v, _ = project(x, l, z, azimuth)
            ax.text(u, v, label, color=MUTED, fontsize=13, ha="center", va="center", fontweight="bold")
        fig.text(0.03, 0.94, "ℒ(x, λ) = ½(x − 2)² + λ(x − 1)", fontsize=12, color=INK)
        legend = [(BLUE, "Schnitt bei λ = λ* = 1:", "Minimum über x bei x* = 1"),
                  (ORANGE, "Schnitt bei x = x* = 1:", "ℒ = ½ für jedes λ"),
                  (PURPLE, "Talsohle g(λ) = min über x:", "höchster Punkt d* = ½ bei λ*")]
        fig.text(0.62, 0.7, "◆ Sattelpunkt (x*, λ*) = (1, 1)", fontsize=10.5, color=INK, va="center")
        for r, (colour, first, second) in enumerate(legend):
            y = 0.57 - r * 0.15
            fig.lines.append(matplotlib.lines.Line2D([0.62, 0.655], [y, y], transform=fig.transFigure, color=colour, linewidth=2.6))
            fig.text(0.665, y, first, fontsize=10.5, color=INK, va="center")
            fig.text(0.665, y - 0.055, second, fontsize=10.5, color=MUTED, va="center")
        frames.append(figure_to_array(fig))
        plt.close(fig)
        durations.append(105)
    save_gif(OUT / "sattel.gif", frames, durations, colors=64)


# --------------------------------------------------------------------------------------------
# Figure 8: shadow price and complementarity while the bound moves (1-D example)
# --------------------------------------------------------------------------------------------
def gif_shadow_price():
    deltas = [0.0] + list(np.linspace(0.04, 1.0, 25)) + list(np.linspace(1.075, 1.6, 8))
    holds = {0: 1700, 25: 2000, len(deltas) - 1: 2600}
    trail = []
    frames, durations = [], []
    sprites = {name: sprite_rgba(name, 3) for name in ("push", "idle", "wide")}
    for k, delta in enumerate(deltas):
        bound = 1 + delta
        x_star = min(bound, 2.0)
        lam = max(0.0, 1 - delta)
        slack = bound - x_star
        value = 0.5 * (x_star - 2) ** 2
        trail.append((slack, lam))
        fig = plt.figure(figsize=(7.9, 5.0))
        # --- mechanics on the number line: the bound is a wall, Lambda holds it from the outside
        ax = fig.add_axes([0.03, 0.57, 0.94, 0.33])
        ax.set_xlim(-0.35, 3.35)
        ax.set_ylim(-0.62, 1.02)
        ax.axis("off")
        ax.axvspan(-0.35, bound, ymin=0.38, ymax=0.97, color=AREA, alpha=0.8, linewidth=0)
        ax.text(-0.3, 0.9, "zulässig", color=GREEN, fontsize=10.5, va="top")
        ax.plot([-0.3, 3.3], [0, 0], color=MUTED, linewidth=1)
        for t in range(4):
            ax.plot([t, t], [-0.04, 0.04], color=MUTED, linewidth=1)
            ax.text(t, -0.1, str(t) if t != 2 else r"$x_\mathrm{ref}$ = 2", ha="center", va="top", color=MUTED if t != 2 else TARGET, fontsize=10)
        ax.plot([2, 2], [0.0, 0.93], color=TARGET, linewidth=1, linestyle=(0, (2, 3)), zorder=1)
        ax.plot([bound, bound], [-0.05, 0.97], color=GREEN, linewidth=3, zorder=3)
        ax.text(bound - 0.05, 0.93, "x ≤ 1 + δ", color=GREEN, ha="right", va="top", fontsize=10.5)
        # forces on x*: the pull of f towards x_ref and the push of the bound, below the line
        if 2 - x_star > 0.02:
            ax.annotate("", xy=(x_star + 0.55 * (2 - x_star), -0.33), xytext=(x_star, -0.33),
                        arrowprops=dict(arrowstyle="-|>", color=TARGET, linewidth=2.2, mutation_scale=14))
            ax.text(x_star + 0.05, -0.52, "−f′(x*)", color=TARGET, fontsize=10, va="center")
            ax.annotate("", xy=(x_star - 0.55 * lam, -0.33), xytext=(x_star, -0.33),
                        arrowprops=dict(arrowstyle="-|>", color=GREEN, linewidth=2.2, mutation_scale=14))
            ax.text(x_star - 0.05, -0.52, "−λ*", color=GREEN, fontsize=10, va="center", ha="right")
        ax.plot([x_star], [0.13], marker="o", markersize=12, color=INK, markeredgecolor=PAPER, markeredgewidth=1.5, zorder=5)
        ax.text(x_star - 0.07, 0.3, "x*", ha="right", fontsize=11, fontweight="bold")
        # Lambda behind the wall: pushing while lambda > 0, surprised in the weakly active case, relaxed after
        pose = "push" if lam > 0.02 else ("wide" if abs(delta - 1) < 1e-9 else "idle")
        x_px = int(ax.transData.transform((bound, 0))[0]) + (3 if pose == "push" else 18)
        y_px = int(ax.transData.transform((0, 0))[1]) + 1
        fig.figimage(sprites[pose], xo=x_px, yo=y_px, zorder=6)
        fig.text(0.03, 0.94, f"δ = {german(delta)}     x* = {german(x_star)}     λ* = {german(lam)}     p* = {german(value, 3)}", fontsize=12)
        # --- optimal value p*(delta) and its tangent
        ax1 = fig.add_axes([0.08, 0.09, 0.38, 0.37])
        plain_axes(ax1)
        comma_ticks(ax1)
        grid = np.linspace(-0.25, 1.65, 200)
        ax1.plot(grid, np.where(grid < 1, 0.5 * (1 - grid) ** 2, 0), color=ORANGE, linewidth=2.2)
        ax1.set_xlim(-0.25, 1.65)
        ax1.set_ylim(-0.08, 0.82)
        span = np.array([-0.32, 0.32])
        ax1.plot(delta + span, value - lam * span, color=BLUE, linewidth=1.6, linestyle=(0, (5, 3)))
        ax1.plot([delta], [value], marker="D", markersize=8, color=INK, markeredgecolor=PAPER, markeredgewidth=1.5, zorder=5)
        ax1.text(0.98, 0.95, f"Steigung −λ* = {german(-lam) if lam > 0 else '0'}", transform=ax1.transAxes, ha="right", va="top", color=BLUE, fontsize=10.5)
        ax1.set_xlabel("Verschiebung δ der Grenze", fontsize=10.5)
        ax1.set_title("Optimalwert p*(δ)", fontsize=11, loc="left", color=INK)
        # --- complementarity: (slack, multiplier)
        ax2 = fig.add_axes([0.58, 0.09, 0.38, 0.37])
        plain_axes(ax2)
        comma_ticks(ax2)
        ax2.set_xlim(-0.06, 0.7)
        ax2.set_ylim(-0.08, 1.15)
        ax2.plot([0, 0], [0, 1.15], color=INK, linewidth=2.6, alpha=0.25)
        ax2.plot([0, 0.7], [0, 0], color=INK, linewidth=2.6, alpha=0.25)
        ax2.plot(*zip(*trail), color=PURPLE, linewidth=1.6, alpha=0.6)
        ax2.plot([slack], [lam], marker="D", markersize=8, color=INK, markeredgecolor=PAPER, markeredgewidth=1.5, zorder=5)
        regime = "stark aktiv" if lam > 1e-9 else ("schwach aktiv" if slack < 1e-9 else "inaktiv")
        for label, xy, ha in [("stark aktiv: s = 0, λ* > 0", (0.03, 1.0), "left"), ("schwach aktiv: s = λ* = 0", (0.03, 0.27), "left"),
                              ("inaktiv: s > 0, λ* = 0", (0.68, 0.07), "right")]:
            active = label.startswith(regime)
            ax2.text(*xy, label, ha=ha, fontsize=10, color=INK if active else MUTED, fontweight="bold" if active else "normal",
                     transform=ax2.transData)
        ax2.set_xlabel("Schlupf s = 1 + δ − x*", fontsize=10.5)
        ax2.set_title("Komplementarität λ*·s = 0", fontsize=11, loc="left", color=INK)
        frames.append(figure_to_array(fig))
        plt.close(fig)
        durations.append(holds.get(k, 110))
    save_gif(OUT / "schattenpreis.gif", frames, durations)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "lambda.svg").write_text(sprite_sheet(), encoding="utf-8")
    figure_directions()
    numbers = figure_positions()
    figure_dual()
    for key, (x, lam, value) in numbers.items():
        print(f"{key:7s} x_ref = {TARGETS[key]}  x* = {np.round(x, 4)}  lambda = {np.round(lam, 4)}  p* = {value:.4f}")
    gif_wall()
    gif_saddle()
    gif_shadow_price()


if __name__ == "__main__":
    main()
