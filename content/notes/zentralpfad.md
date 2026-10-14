---
title: "Der Zentralpfad: von der Barriere zum Optimum"
date: 2026-10-14
description: "Innere-Punkte-Verfahren anschaulich: der Zentralpfad eines quadratischen Programms mit Anfangspunkt, Grenzen und Barriereparameter zum Ausprobieren."
tags: [optimierung, numerik, interaktiv]
featured: false
draft: false
layout: wide
---

Ein Punkt soll möglichst nahe an ein Ziel gelangen und dabei in einem vorgegebenen Bereich bleiben. Sein Anfangspunkt x₀ ist bekannt, beispielsweise aus einer Messung. Das ist ein Optimierungsproblem mit Ungleichungsnebenbedingungen. **Innere-Punkte-Verfahren** lösen solche Probleme, indem sie die harten Grenzen durch eine weiche logarithmische Barriere ersetzen und deren Gewicht μ schrittweise verkleinern. Für jedes μ > 0 besitzt das Barriereproblem genau ein Optimum x\*(μ). Die Menge dieser Optima

$$
𝒞=\{\,x^\star(\mu)\;:\;\mu>0\,\}
$$

heißt **Zentralpfad**. Er ist das Rückgrat des Verfahrens: Statt das beschränkte Problem direkt anzugehen, folgt man dem Pfad von einem inneren Punkt bis zum Optimum x\* des ursprünglichen Problems. In dieser Notiz beginnt der Pfad im Anfangspunkt x₀, wird von den Grenzen weggedrückt und endet in x\*. Die Animation zeigt ihn in zwei Dimensionen; der Text darunter führt Schritt für Schritt durch die Mathematik, ohne Vorkenntnisse über Innere-Punkte-Verfahren vorauszusetzen, aber auch ohne Abstriche bei den Formeln.

## Ausprobieren

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Gib den Anfangspunkt x₀ vor oder ziehe ihn im Diagramm. Der Schieberegler läuft gleichmäßig entlang des Pfads und zeigt den zugehörigen Wert von μ; „Abspielen“ lässt μ von 10³ auf 10⁻³ fallen, und der Zentralpfad wächst dabei von x₀ aus. Der orangefarbene Punkt x*(μ) ist das Optimum des Barriereproblems für das aktuelle μ. Ziehe eine Kante näher an den Pfad: Er weicht ihr aus. Beim Ändern von x₀ bleibt das gewählte μ erhalten.</span></p>

<figure class="interactive-figure figure-central-path">
  <iframe src="/img/notes/zentralpfad/index.html" title="Zentralpfad vom Anfangspunkt x₀ zum Optimum" height="1100" loading="eager"></iframe>
  <figcaption><a href="/img/notes/zentralpfad/index.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der Zentralpfad 𝒞(x₀) ist die Menge aller x*(μ; x₀) für μ > 0. Er beginnt für μ → ∞ in x₀, endet für μ → 0 im Optimum x* und verläuft dazwischen strikt im Inneren des zulässigen Bereichs. Jeder gezeichnete Punkt ist ein exakt berechnetes Optimum; zwischen ihnen wird nicht interpoliert.</span></p>

## Das Problem

Gesucht ist der Punkt x = (x₁, x₂)ᵀ ∈ ℝ² mit den kleinsten Zielkosten innerhalb eines Vierecks:

$$
\min_{x\inℝ^2}\; f(x)=\tfrac12\,(x-z)^\top Q\,(x-z)
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

## Anfangspunkt und Grenzen

Der Anfangspunkt x₀ wird von außen vorgegeben und nicht optimiert. Er muss strikt im Inneren liegen, x₀ ∈ int 𝒳. Für die interaktive Bedienung hält er mindestens 0,05 Abstand zu jeder Kante, und eine Kante stoppt entsprechend vor ihm. Beim Verschieben der Grenzen bleiben seine Koordinaten unverändert. Auch das Viereck bleibt konvex; andernfalls ließe sich 𝒳 nicht mehr durch vier lineare Ungleichungen beschreiben.

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

### Klassisches Barriereproblem und klassischer Zentralpfad

Innere-Punkte-Verfahren ersetzen die Ungleichungen durch die Barriere und lösen für μ > 0 das glatte, unbeschränkte Problem

$$
\Phi_{\mathrm c}(x,\mu)=f(x)+\mu\,B(x),
\qquad
x_{\mathrm c}(\mu)=\underset{x\in\operatorname{int}𝒳}{\operatorname{argmin}}\;\Phi_{\mathrm c}(x,\mu).
$$

Für jedes μ > 0 existiert das Minimum und ist eindeutig, denn Φ_c ist strikt konvex und wächst am Rand unbeschränkt. Die Kurve μ ↦ x_c(μ) ist der klassische Zentralpfad

$$
𝒞_{\mathrm c}=\{\,x_{\mathrm c}(\mu)\;:\;\mu>0\,\}.
$$

Seine Stationaritätsbedingung ∇f(x) + μ ∇B(x) = 0 lässt sich mit den Hilfsgrößen λᵢ = μ/sᵢ(x) genau wie die KKT-Bedingungen schreiben:

$$
\nabla f(x)+\sum_{i=1}^{m}\lambda_i a_i=0,
\qquad
\lambda_i>0,\quad s_i(x)>0,
\qquad
\lambda_i\,s_i(x)=\mu .
$$

Der Vergleich mit den KKT-Bedingungen zeigt den Kern der Methode: Nur die Komplementarität ist gestört, λᵢ sᵢ = μ statt λᵢ sᵢ = 0. Alle Punkte des Pfads sind strikt zulässig und haben strikt positive Multiplikatoren; erst im Grenzwert μ → 0 entscheidet sich, welche Kanten aktiv werden. Aus der schwachen Dualität folgt eine Fehlerschranke: Weil x_c(μ) die Lagrange-Funktion f(x) + Σᵢ λᵢ (aᵢᵀx − bᵢ) minimiert, ist deren Wert f(x_c(μ)) − mμ eine untere Schranke für f(x\*), also

$$
0\leq f(x_{\mathrm c}(\mu))-f(x^\star)\leq m\,\mu .
$$

Die Zahl mμ heißt **Dualitätslücke**; mit ihr lässt sich das Verfahren stoppen, sobald die gewünschte Genauigkeit erreicht ist. Die beiden Enden des klassischen Pfads: Für μ → ∞ dominiert die Barriere, und x_c(μ) strebt gegen das **analytische Zentrum** x<sub>a</sub> = argmin B(x) des Vierecks, den Punkt, in dem sich die Abstoßung aller Kanten aufhebt, ∇B(x<sub>a</sub>) = 0. Für μ → 0 strebt x_c(μ) gegen x\*. Der klassische Pfad hängt damit nur vom Problem ab, nicht von einem Anfangspunkt.

## Zentralpfad mit Anfangspunkt x₀

In der Anwendung ist häufig ein innerer Punkt gegeben, etwa der gemessene aktuelle Zustand oder die Lösung des vorangegangenen Zeitschritts. Ein Pfad, der genau dort beginnt, bleibt von Anfang an zulässig und macht sichtbar, wie sich die Lösung von x₀ aus zum Optimum bewegt. Dazu erhält das Barriereproblem einen Proximalterm, der die Lösung an x₀ bindet:

$$
\Phi(x,\mu;x_0)=f(x)+\mu\,B(x)+\frac{\mu^2}{2}\,\left\lVert x-x_0\right\rVert_2^2 .
$$

Das Optimum und der zugehörige Zentralpfad sind

$$
x^\star(\mu;x_0)=\underset{x\in\operatorname{int}𝒳}{\operatorname{argmin}}\;\Phi(x,\mu;x_0),
\qquad
𝒞(x_0)=\{\,x^\star(\mu;x_0)\;:\;\mu>0\,\}.
$$

Φ ist für jedes μ > 0 strikt konvex, weil f strikt konvex ist und Barriere und Proximalterm konvex sind, und wächst am Rand unbeschränkt; das Minimum existiert also und ist eindeutig. Die drei Terme tragen die Gewichte 1, μ und μ² und wirken deshalb auf drei Skalen.

**Großes μ.** Der Proximalterm dominiert, und x\*(μ; x₀) → x₀. Genauer folgt aus der Stationarität ∇f(x) + μ ∇B(x) + μ² (x − x₀) = 0 die Entwicklung

$$
x^\star(\mu;x_0)=x_0-\frac{1}{\mu}\,\nabla B(x_0)+O\!\left(\frac{1}{\mu^2}\right).
$$

Der Pfad verlässt x₀ in Richtung −∇B(x₀), also weg von den nahen Kanten und hin zum analytischen Zentrum. Die Zielfunktion kommt erst in zweiter Ordnung ins Spiel.

**Mittleres μ.** Alle drei Terme wirken zusammen. Die Barriere drückt die Lösung von den Kanten weg, die Zielfunktion zieht sie zum Ziel z, und der Proximalterm hält sie bei x₀, allerdings mit schnell schwindendem Gewicht μ². Rückt eine Kante näher an den Pfad, wächst dort der Term μ aᵢ/sᵢ(x) in der Stationarität, und die Lösung weicht aus.

**Kleines μ.** Der Proximalterm verschwindet wie μ², und der Pfad mündet in den klassischen Zentralpfad. Weil Φ_c strikt konvex mit Modul λ_min(Q) ist und ∇Φ_c(x\*(μ; x₀)) = −μ² (x\*(μ; x₀) − x₀) gilt, folgt aus der starken Monotonie des Gradienten

$$
\left\lVert x^\star(\mu;x_0)-x_{\mathrm c}(\mu)\right\rVert_2
\leq\frac{\mu^2}{\lambda_{\min}(Q)}\,\left\lVert x^\star(\mu;x_0)-x_0\right\rVert_2 .
$$

Für μ → 0 strebt x\*(μ; x₀) daher ebenso wie x_c(μ) gegen x\*.

**Eine Änderung von x₀ verändert das Barriereproblem selbst** und damit den gesamten Pfad, obwohl Ziel und Grenzen gleich bleiben. Abbildung 2 zeigt die Pfade zu drei Anfangspunkten zusammen mit dem klassischen Zentralpfad desselben Problems: Jeder Pfad startet in seinem x₀, verlässt ihn in Richtung des analytischen Zentrums und läuft für kleines μ in den klassischen Pfad hinein, der im analytischen Zentrum beginnt.

<figure class="static-figure">
  <img src="/img/notes/zentralpfad/pfade.svg" alt="Viereck mit Höhenlinien der Zielfunktion, drei orangefarbenen Zentralpfaden von verschiedenen Anfangspunkten und dem blau gestrichelten klassischen Zentralpfad vom analytischen Zentrum zum Optimum auf dem rechten Rand" width="640" height="540" loading="lazy">
  <figcaption>Abbildung 2: Zentralpfade zu drei Anfangspunkten (orange) und der klassische Zentralpfad (blau gestrichelt) vom analytischen Zentrum x<sub>a</sub> zum Optimum x*. Für kleines μ münden alle Pfade in den klassischen.</figcaption>
</figure>

### Optimalitätsbedingungen und Fehlerschranke

Die Stationarität von Φ lautet mit den Multiplikatoren λᵢ = μ/sᵢ(x):

$$
\nabla f(x)+\sum_{i=1}^{m}\lambda_i a_i+\mu^2\,(x-x_0)=0,
\qquad
\lambda_i\,s_i(x)=\mu .
$$

Die gestörte Komplementarität ist dieselbe wie beim klassischen Pfad; der Proximalterm erscheint nur in der Stationarität. Daraus folgt eine Fehlerschranke, die die Dualitätslücke um den Preis des Anfangspunkts ergänzt. Der Punkt x\*(μ; x₀) minimiert die konvexe Lagrange-Funktion

$$
L(x,\lambda)=f(x)+\frac{\mu^2}{2}\,\left\lVert x-x_0\right\rVert_2^2+\sum_{i=1}^{m}\lambda_i\,(a_i^\top x-b_i),
$$

denn ihr Gradient bezüglich x ist genau die linke Seite der Stationarität. Für das zulässige x\* gilt L(x\*, λ) ≤ f(x\*) + (μ²/2) ‖x\* − x₀‖², weil alle λᵢ positiv und alle aᵢᵀx\* − bᵢ nicht positiv sind. Andererseits ist L(x\*, λ) ≥ L(x\*(μ; x₀), λ) = f(x\*(μ; x₀)) + (μ²/2) ‖x\*(μ; x₀) − x₀‖² − mμ, denn Σᵢ λᵢ sᵢ = mμ. Zusammen ergibt sich

$$
0\leq f(x^\star(\mu;x_0))-f(x^\star)\leq m\,\mu+\frac{\mu^2}{2}\,\left\lVert x^\star-x_0\right\rVert_2^2 .
$$

Der erste Summand ist die Dualitätslücke des klassischen Verfahrens, der zweite verschwindet wie μ² und ist unterhalb von μ = 1 bereits klein. Abbildung 3 zeigt die Abstände entlang des Pfads der Voreinstellung: Für großes μ fällt ‖x\*(μ; x₀) − x₀‖ wie 1/μ, für kleines μ fallen ‖x\*(μ; x₀) − x\*‖ und die Zielkostendifferenz proportional zu μ, wie es die Schranke verlangt.

<figure class="static-figure">
  <img src="/img/notes/zentralpfad/abstaende.svg" alt="Doppelt logarithmisches Diagramm über dem fallenden Barriereparameter mu: der Abstand zum Anfangspunkt wächst und sättigt, der Abstand zum Optimum und die Zielkostendifferenz fallen für kleines mu linear in mu, die gestrichelte Schranke liegt darüber" width="640" height="380" loading="lazy">
  <figcaption>Abbildung 3: Abstände und Zielkostendifferenz entlang des Pfads der Voreinstellung, beide Achsen logarithmisch, μ fallend von links nach rechts. Links hält der Proximalterm die Lösung bei x₀, rechts konvergiert sie gegen x*. Die gestrichelte Schranke mμ + ½μ²‖x* − x₀‖² liegt stets über der Zielkostendifferenz.</figcaption>
</figure>

## Innere-Punkte-Verfahren

Der Zentralpfad ist keine bloße Veranschaulichung, sondern das Konstruktionsprinzip der Barrieremethode. Sie folgt dem Pfad in Etappen:

1. Einen strikt zulässigen Startpunkt x⁽⁰⁾ ∈ int 𝒳 und einen großen Barriereparameter μ⁽⁰⁾ wählen; in der Demo ist x⁽⁰⁾ = x₀.
2. Zentrierung: Das Barriereproblem für μ⁽ᵏ⁾ mit dem Newton-Verfahren lösen, gestartet in der Lösung der vorherigen Etappe. Das Ergebnis ist der Pfadpunkt x\*(μ⁽ᵏ⁾).
3. Abbruch, sobald die Fehlerschranke, hier mμ⁽ᵏ⁾ + ½(μ⁽ᵏ⁾)²‖x\* − x₀‖², unter der gewünschten Genauigkeit ε liegt.
4. Verkleinern: μ⁽ᵏ⁺¹⁾ = μ⁽ᵏ⁾/κ mit einem Faktor κ > 1, dann zurück zu Schritt 2.

Jede Zentrierung ist ein glattes, unbeschränktes Problem. Der Newton-Schritt verwendet Gradient und Hesse-Matrix von Φ,

$$
\Delta x=-\nabla^2\Phi(x,\mu;x_0)^{-1}\,\nabla\Phi(x,\mu;x_0),
\qquad
\nabla^2\Phi(x,\mu;x_0)=Q+\mu\sum_{i=1}^{m}\frac{a_i a_i^\top}{s_i(x)^2}+\mu^2 I ,
$$

und wird so verkürzt, dass alle Iterierten strikt im Inneren bleiben. Weil der Pfad glatt ist, liegt die vorherige Lösung nahe an der nächsten; das Newton-Verfahren konvergiert von dort quadratisch. Darauf beruht die Theorie der Pfadverfolgung: Für selbstkonkordante Barrieren, zu denen die logarithmische Barriere gehört, zeigen Nesterov und Nemirovskii, dass bei einem Faktor κ nahe eins eine beschränkte Zahl von Newton-Schritten je Etappe genügt und die Gesamtzahl der Schritte nur wie √m · log(1/ε) wächst. In der Praxis wählt man κ zwischen 10 und 100 und nimmt dafür einige Newton-Schritte mehr je Etappe in Kauf.

Primal-duale Verfahren behandeln x, λ und s gemeinsam: Sie machen Newton-Schritte direkt auf dem gestörten KKT-System mit λᵢ sᵢ = μ und verkleinern μ in jedem Schritt. Sie sind heute die Arbeitspferde für lineare, quadratische und konische Programme. Der Unterschied zu Aktive-Mengen-Verfahren ist anschaulich: Diese wandern am Rand von 𝒳 entlang und probieren aktive Kanten aus; Innere-Punkte-Verfahren bleiben im Inneren und nähern sich dem Rand nur dort, wo Kanten im Optimum aktiv sind. Die Zahl ihrer Iterationen wächst dabei nur langsam mit der Problemgröße.

Der Anfangspunkt x₀ dieser Notiz ist die kontinuierliche Fassung eines Warmstarts: Für μ → ∞ ist die Lösung x₀ selbst, wie die erste Iterierte des Verfahrens; für kleines μ ist der Proximalterm verschwunden, und es bleibt der klassische Pfad. In der modellprädiktiven Regelung liefert jeder Zeitschritt einen neuen Anfangspunkt nahe der alten Lösung; der Pfad von dort zum neuen Optimum ist kurz, und wenige Zentrierungen genügen.

## Berechnung und Anzeige

Ein gedämpftes Newton-Verfahren berechnet 301 Optima für logarithmisch verteilte Werte von μ zwischen 10³ und 10⁻³, fünfzig je Dekade. Das vorherige Optimum dient jeweils als Startwert für das nächste μ; der erste Startwert ist x₀. Die Schrittweite wird zunächst so verkürzt, dass alle Iterierten strikt zulässig bleiben, und anschließend durch eine Armijo-Bedingung gesichert; abgebrochen wird, wenn der skalierte Gradient unter 10⁻¹⁰ liegt. Jeder gezeichnete Punkt ist damit ein Optimum des Barriereproblems bis auf Rundungsfehler.

Das Optimum x\* des beschränkten Problems wird exakt bestimmt: Es ist z, falls z im Viereck liegt, sonst der beste Kandidat unter den vier Ecken und den Minima von f entlang der vier Kanten. Die gezeichnete Kurve verbindet x₀ mit den Optima von μ = 10³ bis zum gewählten μ; beim Abspielen wächst sie bis zum Optimum. Zwischen den berechneten Optima wird nicht interpoliert. Weil sich die Lösung für sehr großes und sehr kleines μ kaum noch bewegt, ist der Regler nicht logarithmisch in μ geteilt, sondern gleichmäßig entlang der Bogenlänge des Pfads; der angezeigte Wert von μ gehört jeweils zum gewählten Optimum. Neu gerechnet wird, sobald sich Ziel, Q, Grenzen oder Anfangspunkt ändern; das gewählte μ bleibt dabei erhalten.

## Literatur

Die logarithmische Barriere, der klassische Zentralpfad und die Dualitätslücke sind in [Boyd und Vandenberghe, *Convex Optimization*, Kapitel 11](https://web.stanford.edu/~boyd/cvxbook/) beschrieben; eine kompakte Herleitung enthalten [Vandenberghes Vorlesungsfolien zu Innere-Punkte-Verfahren](https://www.seas.ucla.edu/~vandenbe/ee236b/lectures/barrier.pdf). Die Komplexitätstheorie der Pfadverfolgung stammt aus Nesterov und Nemirovskii, *Interior-Point Polynomial Algorithms in Convex Programming*, SIAM 1994. Primal-duale Verfahren behandelt Wright, *Primal-Dual Interior-Point Methods*, SIAM 1997; Innere-Punkte-Verfahren für nichtlineare Probleme Nocedal und Wright, *Numerical Optimization*, 2. Auflage, Springer 2006, Kapitel 19.
