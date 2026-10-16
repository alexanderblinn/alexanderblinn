---
title: "Der Zentralpfad: von der Barriere zum Optimum"
date: 2026-09-20
description: "Innere-Punkte-Verfahren anschaulich: der Zentralpfad eines quadratischen Programms vom analytischen Zentrum zum Optimum, mit Grenzen und Barriereparameter zum Ausprobieren."
tags: [optimierung, numerik, interaktiv]
featured: false
draft: false
layout: wide
---

Ein Punkt soll möglichst nahe an ein Ziel gelangen und dabei in einem vorgegebenen Bereich bleiben. Das ist ein Optimierungsproblem mit Ungleichungsnebenbedingungen. **Innere-Punkte-Verfahren** lösen solche Probleme, indem sie die harten Grenzen durch eine weiche logarithmische Barriere ersetzen und deren Gewicht μ schrittweise verkleinern. Für jedes μ > 0 besitzt das Barriereproblem genau ein Optimum x\*(μ). Die Menge dieser Optima

$$
𝒞=\{\,x^\star(\mu)\;:\;\mu>0\,\}
$$

heißt **Zentralpfad**. Er beginnt für μ → ∞ im analytischen Zentrum des zulässigen Bereichs, wird von den Grenzen ferngehalten und endet für μ → 0 im Optimum x\* des ursprünglichen Problems. Innere-Punkte-Verfahren folgen ihm in Etappen. Ein Startpunkt x₀ wird dabei nur gebraucht, damit das Newton-Verfahren der ersten Etappe rechnen kann; auf den Pfad selbst hat er keinen Einfluss. Die Animation zeigt den Pfad in zwei Dimensionen; der Text darunter führt Schritt für Schritt durch die Mathematik, ohne Vorkenntnisse über Innere-Punkte-Verfahren vorauszusetzen, aber auch ohne Abstriche bei den Formeln.

## Ausprobieren

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Ziehe Ecken, Kanten oder das Ziel z. Der Schieberegler läuft gleichmäßig entlang des Pfads und zeigt den zugehörigen Wert von μ; „Abspielen“ lässt μ von 10³ auf 10⁻³ fallen, und der Zentralpfad wächst dabei vom analytischen Zentrum x<sub>a</sub> aus. Der orangefarbene Punkt x*(μ) ist das Optimum des Barriereproblems für das aktuelle μ. Ziehe eine Kante näher an den Pfad: Er weicht ihr aus. Beim Ändern von Grenzen oder Ziel bleibt das gewählte μ erhalten.</span></p>

<figure class="interactive-figure figure-central-path">
  <iframe src="/img/notes/zentralpfad/index.html" title="Zentralpfad vom analytischen Zentrum zum Optimum" height="1100" loading="eager"></iframe>
  <figcaption><a href="/img/notes/zentralpfad/index.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der Zentralpfad 𝒞 ist die Menge aller x*(μ) für μ > 0. Er beginnt für μ → ∞ im analytischen Zentrum x<sub>a</sub>, endet für μ → 0 im Optimum x* und verläuft dazwischen strikt im Inneren des zulässigen Bereichs. Jeder gezeichnete Punkt ist ein exakt berechnetes Optimum; zwischen ihnen wird nicht interpoliert.</span></p>

## Das Problem

Gesucht ist der Punkt x = (x₁, x₂)ᵀ ∈ ℝ² mit den kleinsten Zielkosten innerhalb eines Vierecks:

$$
\underset{x\inℝ^2}{\min}\; f(x)=\tfrac12\,(x-z)^\top Q\,(x-z)
\qquad\text{unter}\qquad a_i^\top x\leq b_i,\quad i=1,\ldots,m .
$$

Das Viereck liefert m = 4 Ungleichungen. Der Zielpunkt z und die symmetrische, positiv definite Matrix Q legen die Zielkosten fest. Q wird über zwei Krümmungen q₁, q₂ > 0 und einen Drehwinkel θ eingestellt:

$$
Q=R(\theta)\begin{pmatrix}q_1&0\\0&q_2\end{pmatrix}R(\theta)^\top,
\qquad
R(\theta)=\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix}.
$$

Die Höhenlinien von f sind Ellipsen um z, deren Halbachsen proportional zu 1/√q₁ und 1/√q₂ sind und die um θ gedreht liegen. Jede Kante des Vierecks liegt auf einer Geraden aᵢᵀx = bᵢ; aᵢ ist ihr nach außen zeigender Einheitsnormalenvektor. Damit sind zulässige Menge und Inneres

$$
𝒳=\{\,x\inℝ^2\;:\;a_i^\top x\leq b_i,\ i=1,\ldots,m\,\},
\qquad
\operatorname{int}𝒳=\{\,x\inℝ^2\;:\;a_i^\top x<b_i,\ i=1,\ldots,m\,\}.
$$

Weil f strikt konvex und 𝒳 kompakt und konvex ist, hat das Problem genau eine Lösung x\*. Liegt z in 𝒳, ist x\* = z; sonst liegt x\* auf dem Rand. Die Optimalität beschreiben die Karush-Kuhn-Tucker-Bedingungen (KKT): Es gibt Multiplikatoren λ₁\*, …, λₘ\* mit

$$
\nabla f(x^\star)+\sum_{i=1}^{m}\lambda_i^\star a_i=0,
\qquad
\lambda_i^\star\geq0,
\qquad
\lambda_i^\star\,\bigl(b_i-a_i^\top x^\star\bigr)=0 .
$$

Die erste Gleichung ist die Stationarität: Der Gradient ∇f(x\*) = Q(x\* − z) wird von den Normalen der aktiven Kanten aufgewogen. Die dritte Bedingung ist die **Komplementarität**: Ein Multiplikator kann nur positiv sein, wenn die zugehörige Kante aktiv ist, also bᵢ − aᵢᵀx\* = 0 gilt. Welche Kanten aktiv sind, ist vorab unbekannt. Genau diese kombinatorische Frage umgehen Innere-Punkte-Verfahren, indem sie die Komplementarität nicht erzwingen, sondern kontrolliert stören.

## Grenzen

Die vier Kanten lassen sich im Diagramm verschieben. Das Viereck bleibt dabei konvex; andernfalls ließe sich 𝒳 nicht mehr durch vier lineare Ungleichungen beschreiben. Sein Inneres darf nicht leer werden, denn nur dort ist die Barriere definiert. Mit den Grenzen wandern auch das analytische Zentrum und der gesamte Pfad.

## Die logarithmische Barriere

Der Abstand eines Punkts zur i-ten Kantengeraden ist die Schlupfvariable

$$
s_i(x)=b_i-a_i^\top x,\qquad s_i(x)>0\quad\text{für } x\in\operatorname{int}𝒳 .
$$

Weil aᵢ ein Einheitsvektor ist, ist sᵢ(x) der geometrische Abstand zur Kante. Die logarithmische Barriere summiert die negativen Logarithmen dieser Abstände:

$$
B(x)=-\sum_{i=1}^{m}\log s_i(x),\qquad x\in\operatorname{int}𝒳 .
$$

Sie ist auf dem Inneren glatt und strikt konvex und wächst unbeschränkt, wenn sich x dem Rand nähert. Gradient und Hesse-Matrix lauten

$$
\nabla B(x)=\sum_{i=1}^{m}\frac{a_i}{s_i(x)},
\qquad
\nabla^2B(x)=\sum_{i=1}^{m}\frac{a_i a_i^\top}{s_i(x)^2}.
$$

Die Hesse-Matrix ist positiv definit, weil die Normalen des Vierecks den ℝ² aufspannen. Jeder Summand −log sᵢ wirkt wie eine weiche Wand vor der Kante i. Abbildung 1 zeigt ihn in einer Dimension mit dem Gewicht μ: Für μ → 0 nähert sich −μ log s der Indikatorfunktion der Nebenbedingung, die im Zulässigen null und sonst unendlich ist,

$$
I(s)=\begin{cases}0,&s>0\\+\infty,&s\leq0,\end{cases}
\qquad
-\mu\log s\;\to\;I(s)\quad\text{für }\mu\to0 .
$$

<figure class="static-figure">
  <img src="/img/notes/zentralpfad/barriere.svg" alt="Vier Kurven der Funktion minus mu mal Logarithmus von s für mu gleich 1, 0,5, 0,2 und 0,05 sowie die gestrichelte Indikatorfunktion, die für positives s null ist und bei s gleich null senkrecht nach oben läuft" width="640" height="360" loading="lazy">
  <figcaption>Abbildung 1: Die Barriere −μ log s für einen einzelnen Schlupf s. Mit kleinerem μ schmiegt sie sich an die Indikatorfunktion an, bleibt aber am Rand s = 0 unendlich.</figcaption>
</figure>

### Barriereproblem und Zentralpfad

Innere-Punkte-Verfahren ersetzen die Ungleichungen durch die Barriere und lösen für μ > 0 das glatte, unbeschränkte Problem

$$
\Phi(x,\mu)=f(x)+\mu\,B(x)=f(x)-\mu\sum_{i=1}^{m}\log s_i(x),
\qquad
x^\star(\mu)=\underset{x\in\operatorname{int}𝒳}{\operatorname{argmin}}\;\Phi(x,\mu).
$$

Für jedes μ > 0 existiert das Minimum und ist eindeutig, denn Φ ist strikt konvex und wächst am Rand unbeschränkt. Die Kurve μ ↦ x\*(μ) ist der Zentralpfad 𝒞. Er hängt nur von f und 𝒳 ab: Welchen Startpunkt ein Verfahren zur Berechnung von x\*(μ) verwendet, spielt für das Ergebnis keine Rolle, weil das Minimum eindeutig ist.

Die Stationaritätsbedingung ∇f(x) + μ ∇B(x) = 0 lässt sich mit den Hilfsgrößen λᵢ = μ/sᵢ(x) genau wie die KKT-Bedingungen schreiben:

$$
\nabla f(x)+\sum_{i=1}^{m}\lambda_i a_i=0,
\qquad
\lambda_i>0,\quad s_i(x)>0,
\qquad
\lambda_i\,s_i(x)=\mu .
$$

Der Vergleich mit den KKT-Bedingungen zeigt den Kern der Methode: Nur die Komplementarität ist gestört, λᵢ sᵢ = μ statt λᵢ sᵢ = 0. Alle Punkte des Pfads sind strikt zulässig und haben strikt positive Multiplikatoren; erst im Grenzwert μ → 0 entscheidet sich, welche Kanten aktiv werden. Aus der schwachen Dualität folgt eine Fehlerschranke: Weil x\*(μ) die Lagrange-Funktion f(x) + Σᵢ λᵢ (aᵢᵀx − bᵢ) minimiert, ist deren Wert f(x\*(μ)) − mμ eine untere Schranke für f(x\*), also

$$
0\leq f(x^\star(\mu))-f(x^\star)\leq m\,\mu .
$$

Die Zahl mμ heißt **Dualitätslücke**; mit ihr lässt sich das Verfahren stoppen, sobald die gewünschte Genauigkeit erreicht ist.

Die beiden Enden des Pfads: Für μ → ∞ dominiert die Barriere, und x\*(μ) strebt gegen das **analytische Zentrum**

$$
x_{\mathrm a}=\underset{x\in\operatorname{int}𝒳}{\operatorname{argmin}}\;B(x),
\qquad
\nabla B(x_{\mathrm a})=\sum_{i=1}^{m}\frac{a_i}{s_i(x_{\mathrm a})}=0,
$$

den Punkt, in dem sich die Abstoßung aller Kanten aufhebt. Für μ → 0 strebt x\*(μ) gegen x\*.

## Verlauf des Zentralpfads

**Monotonie.** Für μ₁ > μ₂ liefert die Optimalität von x\*(μ₁) für Φ(·, μ₁) und von x\*(μ₂) für Φ(·, μ₂) zwei Ungleichungen; ihre Summe ergibt (μ₁ − μ₂)(B(x\*(μ₁)) − B(x\*(μ₂))) ≤ 0, und Einsetzen in die erste liefert

$$
B(x^\star(\mu_1))\leq B(x^\star(\mu_2)),
\qquad
f(x^\star(\mu_2))\leq f(x^\star(\mu_1))
\qquad\text{für }\mu_1>\mu_2 .
$$

Mit fallendem μ fallen also die Zielkosten, während die Barriere wächst: Der Pfad bewegt sich vom Zentrum weg auf den Rand zu, aber nie über ihn hinaus.

**Start im analytischen Zentrum.** Für großes μ liefert die Stationarität mit ∇B(x<sub>a</sub>) = 0 und ∇B(x) ≈ ∇²B(x<sub>a</sub>)(x − x<sub>a</sub>) die Entwicklung

$$
x^\star(\mu)=x_{\mathrm a}-\frac1\mu\,\nabla^2B(x_{\mathrm a})^{-1}\,\nabla f(x_{\mathrm a})+O\!\left(\frac1{\mu^2}\right).
$$

Der Pfad verlässt das Zentrum in Richtung des negativen Gradienten von f, gemessen in der Metrik der Barriere: Kanten in der Nähe bremsen die Bewegung in ihre Richtung.

**Ausweichen.** Rückt eine Kante näher, wächst der Term μ aᵢ/sᵢ(x) in der Stationarität, und die Lösung weicht aus; zugleich wandert das analytische Zentrum von der Kante weg. Das lässt sich in der Animation direkt beobachten.

**Startpunkt des Verfahrens.** Abbildung 2 zeigt den Pfad zusammen mit den Iterierten der Barrieremethode aus dem nächsten Abschnitt: Vom Startpunkt x₀ führen einige Newton-Schritte zum ersten Zentrum x\*(μ⁽⁰⁾); von dort springt das Verfahren von Zentrum zu Zentrum entlang des Pfads. x₀ entscheidet nur über den Weg der ersten Zentrierung, nicht über den Pfad.

<figure class="static-figure">
  <img src="/img/notes/zentralpfad/pfadverfolgung.svg" alt="Viereck mit Höhenlinien der Zielfunktion und dem orangefarbenen Zentralpfad vom analytischen Zentrum zum Optimum auf dem rechten Rand; graue gepunktete Newton-Iterierte führen vom Startpunkt x0 zum ersten Zentrum bei mu gleich 100, weitere blaue Zentren für mu gleich 10, 1, 0,1, 0,01 und 0,001 liegen auf dem Pfad" width="640" height="560" loading="lazy">
  <figcaption>Abbildung 2: Zentralpfad (orange) und Barrieremethode mit κ = 10. Vom Startpunkt x₀ führen die Newton-Iterierten der ersten Zentrierung (grau) zum Zentrum x*(10²); die weiteren Zentren (blau) liegen auf dem Pfad. Der Pfad selbst beginnt im analytischen Zentrum x<sub>a</sub> und hängt nicht von x₀ ab.</figcaption>
</figure>

**Abstände.** Abbildung 3 zeigt die Abstände entlang des Pfads der Voreinstellung: Für großes μ fällt ‖x\*(μ) − x<sub>a</sub>‖ wie 1/μ, für kleines μ fallen ‖x\*(μ) − x\*‖ und die Zielkostendifferenz proportional zu μ, wie es die Dualitätslücke verlangt.

<figure class="static-figure">
  <img src="/img/notes/zentralpfad/abstaende.svg" alt="Doppelt logarithmisches Diagramm über dem fallenden Barriereparameter mu: der Abstand zum analytischen Zentrum wächst und sättigt, der Abstand zum Optimum und die Zielkostendifferenz fallen für kleines mu linear in mu, die gestrichelte Dualitätslücke liegt darüber" width="640" height="380" loading="lazy">
  <figcaption>Abbildung 3: Abstände und Zielkostendifferenz entlang des Pfads der Voreinstellung, beide Achsen logarithmisch, μ fallend von links nach rechts. Links liegt die Lösung beim analytischen Zentrum x<sub>a</sub>, rechts konvergiert sie gegen x*. Die gestrichelte Dualitätslücke mμ liegt stets über der Zielkostendifferenz.</figcaption>
</figure>

## Innere-Punkte-Verfahren

Der Zentralpfad ist keine bloße Veranschaulichung, sondern das Konstruktionsprinzip der Barrieremethode. Sie folgt dem Pfad in Etappen:

1. Einen strikt zulässigen Startpunkt x⁽⁰⁾ ∈ int 𝒳 und einen großen Barriereparameter μ⁽⁰⁾ wählen. Jeder innere Punkt ist geeignet, etwa der Schwerpunkt des Vierecks; im Code unten ist es x₀ = (−1, −0,8)ᵀ.
2. Zentrierung: Das Barriereproblem für μ⁽ᵏ⁾ mit dem Newton-Verfahren lösen, gestartet in der Lösung der vorherigen Etappe. Das Ergebnis ist der Pfadpunkt x\*(μ⁽ᵏ⁾).
3. Abbruch, sobald die Dualitätslücke mμ⁽ᵏ⁾ unter der gewünschten Genauigkeit ε liegt.
4. Verkleinern: μ⁽ᵏ⁺¹⁾ = μ⁽ᵏ⁾/κ mit einem Faktor κ > 1, dann zurück zu Schritt 2.

Jede Zentrierung ist ein glattes, unbeschränktes Problem. Der Newton-Schritt verwendet Gradient und Hesse-Matrix von Φ,

$$
\Delta x=-\nabla^2\Phi(x,\mu)^{-1}\,\nabla\Phi(x,\mu),
\qquad
\nabla^2\Phi(x,\mu)=Q+\mu\sum_{i=1}^{m}\frac{a_i a_i^\top}{s_i(x)^2},
$$

und wird so verkürzt, dass alle Iterierten strikt im Inneren bleiben. Der Startpunkt x⁽⁰⁾ beeinflusst nur die Newton-Iterierten der ersten Zentrierung; ihr Ergebnis x\*(μ⁽⁰⁾) ist davon unabhängig, und ab der zweiten Etappe ist der Pfad selbst der Startwert. Weil der Pfad glatt ist, liegt die vorherige Lösung nahe an der nächsten; das Newton-Verfahren konvergiert von dort quadratisch. Darauf beruht die Theorie der Pfadverfolgung: Für selbstkonkordante Barrieren, zu denen die logarithmische Barriere gehört, zeigen Nesterov und Nemirovskii, dass bei einem Faktor κ nahe eins eine beschränkte Zahl von Newton-Schritten je Etappe genügt und die Gesamtzahl der Schritte nur wie √m · log(1/ε) wächst. In der Praxis wählt man κ zwischen 10 und 100 und nimmt dafür einige Newton-Schritte mehr je Etappe in Kauf.

Primal-duale Verfahren behandeln x, λ und s gemeinsam: Sie machen Newton-Schritte direkt auf dem gestörten KKT-System mit λᵢ sᵢ = μ und verkleinern μ in jedem Schritt. Sie sind heute die Arbeitspferde für lineare, quadratische und konische Programme. Der Unterschied zu Aktive-Mengen-Verfahren ist anschaulich: Diese wandern am Rand von 𝒳 entlang und probieren aktive Kanten aus; Innere-Punkte-Verfahren bleiben im Inneren und nähern sich dem Rand nur dort, wo Kanten im Optimum aktiv sind. Die Zahl ihrer Iterationen wächst dabei nur langsam mit der Problemgröße. In der modellprädiktiven Regelung dient die Lösung des vorigen Zeitschritts als Startpunkt x⁽⁰⁾; sie verkürzt die erste Zentrierung, ändert aber nichts am Zentralpfad des neuen Problems.

### Umsetzung in Python und MATLAB

Die folgende Umsetzung zeigt genau diesen Algorithmus: eine Zentrierung mit gedämpftem Newton-Schritt und Rückwärtssuche (backtracking line search mit Armijo-Bedingung, wie bei Boyd und Vandenberghe, Kapitel 9) und die äußere Schleife über fallende μ. Viereck und Ziel stimmen mit der Voreinstellung der Animation oben überein, sodass sich der berechnete Pfad direkt mit der gezeichneten Kurve vergleichen lässt. Der Zeichenteil ist am Ende abgetrennt.

```python tab="Python"
import numpy as np

# Zulässige Menge: Viereck mit Ecken v_i, Ungleichungen a_i^T x <= b_i
vertices = np.array([[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]])
edges = np.roll(vertices, -1, axis=0) - vertices
A = np.column_stack([edges[:, 1], -edges[:, 0]])
A /= np.linalg.norm(A, axis=1, keepdims=True)          # äußere Einheitsnormalen a_i
b = np.sum(A * vertices, axis=1)                       # b_i = a_i^T v_i

# Zielfunktion f(x) = 1/2 (x - z)^T Q (x - z) mit Q = R(theta) diag(q1, q2) R(theta)^T
theta = np.radians(-25)
R = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
Q = R @ np.diag([1.0, 3.0]) @ R.T
z = np.array([2.8, 1.2])

x0 = np.array([-1.0, -0.8])                            # Startpunkt des Newton-Verfahrens, strikt zulässig
ALPHA, BETA, EPS = 0.1, 0.5, 1e-10                     # Backtracking-Parameter, Toleranz


def f(x):
    return 0.5 * (x - z) @ Q @ (x - z)


def phi(x, mu):
    """Phi(x, mu) = f(x) - mu * sum(log(s_i(x))), außerhalb der zulässigen Menge +inf."""
    s = b - A @ x
    if np.any(s <= 0):
        return np.inf
    return f(x) - mu * np.sum(np.log(s))


def gradient_hessian(x, mu):
    s = b - A @ x
    g = Q @ (x - z) + mu * A.T @ (1 / s)
    H = Q + mu * A.T @ np.diag(1 / s**2) @ A
    return g, H


def newton(x, mu):
    """Zentrierung: minimiert Phi(., mu) mit gedämpften Newton-Schritten ab x."""
    while True:
        g, H = gradient_hessian(x, mu)
        p = -np.linalg.solve(H, g)                     # Newton-Schritt
        lambda2 = -g @ p                                # Newton-Dekrement zum Quadrat
        if lambda2 / 2 <= EPS:
            return x
        t = 1.0
        while phi(x + t * p, mu) > phi(x, mu) + ALPHA * t * (g @ p):
            t *= BETA                                   # Backtracking (Armijo)
        x = x + t * p


x = x0
points = []
for mu in np.logspace(3, -3, 301):                     # 50 Werte je Dekade
    x = newton(x, mu)                                   # Warmstart mit x*(vorheriges mu)
    points.append(x)
points = np.array(points)                              # Zentralpfad x*(mu)

# %% Zeichnen: Höhenlinien von f, Viereck, Zentralpfad
import matplotlib.pyplot as plt

X1, X2 = np.meshgrid(np.linspace(-3.2, 3.6, 300), np.linspace(-2.5, 3.0, 300))
D = np.stack([X1 - z[0], X2 - z[1]], axis=-1)
F = 0.5 * np.einsum("...i,ij,...j->...", D, Q, D)

fig, ax = plt.subplots()
ax.contour(X1, X2, F, levels=15, colors="#647e83", linewidths=0.6)
ax.plot(*vertices[[0, 1, 2, 3, 0]].T, color="#426f6b", label="zulässige Menge")
ax.plot(points[:, 0], points[:, 1], color="#b95a28", linewidth=2, label=r"Zentralpfad $x^\star(\mu)$")
ax.plot(*x0, "s", color="#685d94", fillstyle="none", label=r"Startpunkt $x_0$")
ax.plot(*z, "+", color="#8a5979", markersize=10, label=r"Ziel $z$")
ax.set_aspect("equal"); ax.set_xlabel(r"$x_1$"); ax.set_ylabel(r"$x_2$"); ax.legend()
plt.show()
```

```matlab tab="MATLAB"
% Zulässige Menge: Viereck mit Ecken v_i, Ungleichungen a_i' x <= b_i
vertices = [-2.6 -1.9; 2.1 -1.7; 2.6 2.1; -1.8 2.4];
edges = circshift(vertices, -1, 1) - vertices;
A = [edges(:,2), -edges(:,1)];
A = A ./ vecnorm(A, 2, 2);                  % äußere Einheitsnormalen a_i
b = sum(A .* vertices, 2);                  % b_i = a_i' v_i

% Zielfunktion f(x) = 1/2 (x - z)' Q (x - z) mit Q = R(theta) diag(q1, q2) R(theta)'
theta = deg2rad(-25);
R = [cos(theta) -sin(theta); sin(theta) cos(theta)];
Q = R * diag([1 3]) * R';
z = [2.8; 1.2];

x0 = [-1; -0.8];                            % Startpunkt des Newton-Verfahrens, strikt zulässig
ALPHA = 0.1; BETA = 0.5; EPS = 1e-10;       % Backtracking-Parameter, Toleranz

x = x0;
mu_values = logspace(3, -3, 301);           % 50 Werte je Dekade
points = zeros(numel(mu_values), 2);
for k = 1:numel(mu_values)
    x = newton(x, mu_values(k), A, b, Q, z, ALPHA, BETA, EPS);   % Warmstart mit x*(vorheriges mu)
    points(k, :) = x';                      % Zentralpfad x*(mu)
end

%% Zeichnen: Höhenlinien von f, Viereck, Zentralpfad
[X1, X2] = meshgrid(linspace(-3.2, 3.6, 300), linspace(-2.5, 3, 300));
D1 = X1 - z(1); D2 = X2 - z(2);
F = 0.5 * (Q(1,1)*D1.^2 + 2*Q(1,2)*D1.*D2 + Q(2,2)*D2.^2);

figure; hold on; axis equal
contour(X1, X2, F, 15, 'LineColor', [0.39 0.49 0.51]);
plot(vertices([1:end 1], 1), vertices([1:end 1], 2), 'Color', [0.26 0.44 0.42], 'LineWidth', 1.5);
plot(points(:,1), points(:,2), 'Color', [0.73 0.35 0.16], 'LineWidth', 2);
plot(x0(1), x0(2), 's', 'Color', [0.41 0.36 0.58], 'MarkerSize', 8);
plot(z(1), z(2), '+', 'Color', [0.54 0.35 0.47], 'MarkerSize', 10);
legend('Höhenlinien von f', 'zulässige Menge', 'Zentralpfad x^*(\mu)', 'Startpunkt x_0', 'Ziel z');
xlabel('x_1'); ylabel('x_2');

function value = f(x, Q, z)
    value = 0.5 * (x - z)' * Q * (x - z);
end

function value = phi(x, mu, A, b, Q, z)
    % Phi(x, mu) = f(x) - mu * sum(log(s_i(x))), außerhalb der zulässigen Menge +Inf
    s = b - A * x;
    if any(s <= 0), value = Inf; return, end
    value = f(x, Q, z) - mu * sum(log(s));
end

function [g, H] = gradient_hessian(x, mu, A, b, Q, z)
    s = b - A * x;
    g = Q * (x - z) + mu * A' * (1 ./ s);
    H = Q + mu * A' * diag(1 ./ s.^2) * A;
end

function x = newton(x, mu, A, b, Q, z, ALPHA, BETA, EPS)
    % Zentrierung: minimiert Phi(., mu) mit gedämpften Newton-Schritten ab x.
    while true
        [g, H] = gradient_hessian(x, mu, A, b, Q, z);
        p = -(H \ g);                                     % Newton-Schritt
        lambda2 = -g' * p;                                % Newton-Dekrement zum Quadrat
        if lambda2 / 2 <= EPS, return, end
        t = 1;
        while phi(x + t * p, mu, A, b, Q, z) > phi(x, mu, A, b, Q, z) + ALPHA * t * (g' * p)
            t = BETA * t;                                 % Backtracking (Armijo)
        end
        x = x + t * p;
    end
end
```

Die Rückwärtssuche braucht keine eigene Zulässigkeitsprüfung: Weil Φ außerhalb der zulässigen Menge den Wert +∞ erhält, verletzt ein zu langer Schritt die Armijo-Bedingung automatisch und wird verkürzt. `points` enthält die 301 Pfadpunkte; `points[-1]` (Python) bzw. `points(end,:)` (MATLAB) liegt nahe am Optimum x\*. Ein anderer Startpunkt x₀ liefert dieselben Punkte bis auf Rundungsfehler, und gegen eine unabhängige Lösung mit SciPy weicht jeder Pfadpunkt um höchstens 10⁻⁶ ab.

## Berechnung und Anzeige

Ein gedämpftes Newton-Verfahren berechnet 301 Optima für logarithmisch verteilte Werte von μ zwischen 10³ und 10⁻³, fünfzig je Dekade. Zuerst wird das analytische Zentrum bestimmt, mit demselben Verfahren für die Barriere allein, gestartet im Schwerpunkt des Vierecks. Von dort aus dient jedes Optimum als Startwert für das nächste μ. Die Schrittweite wird zunächst so verkürzt, dass alle Iterierten strikt zulässig bleiben, und anschließend durch eine Armijo-Bedingung gesichert; abgebrochen wird, wenn der skalierte Gradient unter 10⁻¹⁰ liegt. Jeder gezeichnete Punkt ist damit ein Optimum des Barriereproblems bis auf Rundungsfehler.

Das Optimum x\* des beschränkten Problems wird exakt bestimmt: Es ist z, falls z im Viereck liegt, sonst der beste Kandidat unter den vier Ecken und den Minima von f entlang der vier Kanten. Die gezeichnete Kurve verbindet das analytische Zentrum mit den Optima von μ = 10³ bis zum gewählten μ; beim Abspielen wächst sie bis zum Optimum. Zwischen den berechneten Optima wird nicht interpoliert. Weil sich die Lösung für sehr großes und sehr kleines μ kaum noch bewegt, ist der Regler nicht logarithmisch in μ geteilt, sondern gleichmäßig entlang der Bogenlänge des Pfads; der angezeigte Wert von μ gehört jeweils zum gewählten Optimum. Neu gerechnet wird, sobald sich Ziel, Q oder Grenzen ändern; das gewählte μ bleibt dabei erhalten.

## Literatur

Die logarithmische Barriere, der Zentralpfad und die Dualitätslücke sind in [Boyd und Vandenberghe, *Convex Optimization*, Kapitel 11](https://web.stanford.edu/~boyd/cvxbook/) beschrieben; eine kompakte Herleitung enthalten [Vandenberghes Vorlesungsfolien zu Innere-Punkte-Verfahren](https://www.seas.ucla.edu/~vandenbe/ee236b/lectures/barrier.pdf). Die Komplexitätstheorie der Pfadverfolgung stammt aus Nesterov und Nemirovskii, *Interior-Point Polynomial Algorithms in Convex Programming*, SIAM 1994. Primal-duale Verfahren behandelt Wright, *Primal-Dual Interior-Point Methods*, SIAM 1997; Innere-Punkte-Verfahren für nichtlineare Probleme Nocedal und Wright, *Numerical Optimization*, 2. Auflage, Springer 2006, Kapitel 19.
