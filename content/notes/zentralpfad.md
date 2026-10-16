---
title: "Der Zentralpfad: von der Barriere zum Optimum"
date: 2026-09-20
description: "Innere-Punkte-Verfahren anschaulich: der Zentralpfad eines quadratischen Programms vom analytischen Zentrum zum Optimum, mit Grenzen und Barriereparameter zum Ausprobieren."
tags: [optimierung, numerik, interaktiv]
featured: false
draft: false
---

Ein Punkt soll möglichst nahe an ein Ziel gelangen und dabei in einem vorgegebenen Bereich bleiben. Das ist ein Optimierungsproblem mit Ungleichungsnebenbedingungen. **Innere-Punkte-Verfahren** lösen solche Probleme, indem sie die harten Grenzen durch eine weiche logarithmische Barriere ersetzen und deren Gewicht $\mu$ schrittweise verkleinern. Für jedes $\mu>0$ besitzt das Barriereproblem genau ein Optimum $x^\star(\mu)$. Die Menge dieser Optima

$$
\mathcal{C}=\{\,x^\star(\mu)\;:\;\mu>0\,\}
$$

heißt **Zentralpfad**. Er beginnt für $\mu\to\infty$ im analytischen Zentrum des zulässigen Bereichs, wird von den Grenzen ferngehalten und endet für $\mu\to0$ im Optimum $x^\star$ des ursprünglichen Problems. Innere-Punkte-Verfahren folgen ihm in Etappen.

Die Animation zeigt den Pfad in zwei Dimensionen; der Text darunter führt Schritt für Schritt durch die Theorie, die Berechnung und die Visualisierung. Die Umsetzung in Python und MATLAB ist am Ende abgetrennt.

## Ausprobieren

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Ziehe Ecken, Kanten oder das Ziel $x_\mathrm{ref}$. Der Schieberegler läuft gleichmäßig entlang des Pfads und zeigt den zugehörigen Wert von $\mu$; „Abspielen“ lässt $\mu$ von $10^3$ auf $10^{-3}$ fallen, und der Zentralpfad wächst dabei vom analytischen Zentrum $x_\mathrm{a}$ aus. Der orangefarbene Punkt $x^\star(\mu)$ ist das Optimum des Barriereproblems für das aktuelle $\mu$. Ziehe eine Kante näher an den Pfad: Er weicht ihr aus. Beim Ändern von Grenzen oder Ziel bleibt das gewählte $\mu$ erhalten.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Der Zentralpfad $\mathcal{C}$ ist die Menge aller $x^\star(\mu)$ für $\mu>0$. Er beginnt für $\mu\to\infty$ im analytischen Zentrum $x_\mathrm{a}$, endet für $\mu\to0$ im Optimum $x^\star$ und verläuft dazwischen strikt im Inneren des zulässigen Bereichs.</span></p>

<figure class="interactive-figure figure-central-path">
  <iframe src="/img/notes/zentralpfad/index.html" title="Zentralpfad vom analytischen Zentrum zum Optimum" height="940" loading="eager"></iframe>
  <figcaption><a href="/img/notes/zentralpfad/index.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

## Das Problem

Gesucht ist der Punkt $x=(x_1,x_2)^\top\in\mathbb{R}^2$ mit den kleinsten Zielkosten innerhalb der zulässigen Menge, die durch ein Viereck (allgemein: ein konvexes Polygon) beschrieben wird:

$$
\begin{align*}
\underset{x\in\mathbb{R}^2}{\min}\quad&f(x)=\tfrac12\,(x-x_\mathrm{ref})^\top Q\,(x-x_\mathrm{ref})\\
\text{unter}\quad&Ax\leq b .
\end{align*}
$$

Das Viereck liefert $m=4$ Ungleichungen, zusammengefasst in der Matrix $A\in\mathbb{R}^{m\times2}$ und dem Vektor $b\in\mathbb{R}^m$; die Ungleichung $Ax\leq b$ gilt komponentenweise. Der Zielpunkt $x_\mathrm{ref}$ und die symmetrische, positiv definite Matrix $Q$ legen die Zielkosten fest. $Q$ wird über zwei Krümmungen $q_1,q_2>0$ und einen Drehwinkel $\theta$ eingestellt:

$$
Q=R(\theta)\begin{pmatrix}q_1&0\\0&q_2\end{pmatrix}R(\theta)^\top,
\qquad
R(\theta)=\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix}.
$$

Die Höhenlinien von $f$ sind Ellipsen um $x_\mathrm{ref}$, deren Halbachsen proportional zu $1/\sqrt{q_1}$ und $1/\sqrt{q_2}$ sind und die um $\theta$ gedreht liegen. Jede Zeile $a_i^\top$ von $A$ gehört zu einer Kante: Die Kanten des Vierecks werden durch die Geraden $a_i^\top x=b_i$ getragen, wobei $a_i$ jeweils den nach außen gerichteten Einheitsnormalenvektor der entsprechenden Randgeraden bezeichnet. Damit sind zulässige Menge und Inneres

$$
\mathcal{X}=\{\,x\in\mathbb{R}^2\;:\;Ax\leq b\,\},
\qquad
\operatorname{int}\mathcal{X}=\{\,x\in\mathbb{R}^2\;:\;Ax<b\,\}.
$$

Weil $f$ strikt konvex und $\mathcal{X}$ kompakt und konvex ist, hat das Problem genau eine Lösung $x^\star$. Liegt $x_\mathrm{ref}$ in $\mathcal{X}$, ist $x^\star=x_\mathrm{ref}$; sonst liegt $x^\star$ auf dem Rand.

### Lagrange-Funktion und Dualität

Liegt $x^\star$ auf dem Rand, ist $\nabla f(x^\star)$ im Allgemeinen nicht null; die Optimalitätsbedingung $\nabla f(x)=0$ des unbeschränkten Problems reicht also nicht mehr aus. Ein Verfahren, das die Nebenbedingungen getrennt von der Zielfunktion behandelt, müsste zudem nach jedem Schritt prüfen, ob der neue Punkt noch in $\mathcal{X}$ liegt, und ihn andernfalls zurückholen. Stattdessen bezieht man die Nebenbedingungen in die Zielfunktion ein: als gewichtete Summe der Ausdrücke $a_i^\top x-b_i$, die für zulässiges $x$ nicht positiv sind. Die Gewichte $\lambda_i\geq0$ heißen **Lagrange-Multiplikatoren** und bilden den Vektor $\lambda\in\mathbb{R}^m$. Das ergibt die Lagrange-Funktion

$$
\mathcal{L}(x,\lambda)=f(x)+\lambda^\top(Ax-b)=f(x)+\sum_{i=1}^{m}\lambda_i\,\bigl(a_i^\top x-b_i\bigr),
\qquad
\lambda\geq0 .
$$

Jedes $\lambda_i$ lässt sich als Preis lesen, der je Einheit Verletzung der $i$-ten Nebenbedingung fällig wird. Solange $x$ zulässig ist, sind alle Summanden höchstens null, und es gilt $\mathcal{L}(x,\lambda)\leq f(x)$. Verletzt $x$ dagegen eine Nebenbedingung, ist der zugehörige Summand positiv und wird mit wachsendem $\lambda_i$ beliebig groß. Das Supremum über die Multiplikatoren gibt daher genau das ursprüngliche Problem wieder:

$$
\underset{\lambda\geq0}{\sup}\;\mathcal{L}(x,\lambda)=\begin{cases}f(x),&Ax\leq b,\\+\infty,&\text{sonst.}\end{cases}
$$

Das beschränkte Problem ist also gleichwertig mit dem Problem $p^\star=\min_x\sup_{\lambda\geq0}\mathcal{L}(x,\lambda)$, in dem $x$ keinen Nebenbedingungen mehr unterliegt; diese stecken vollständig in $\mathcal{L}$. Vertauscht man die Reihenfolge von Minimum und Supremum, entsteht das **duale Problem**. Seine Zielfunktion ist die duale Funktion

$$
g(\lambda)=\underset{x\in\mathbb{R}^2}{\min}\;\mathcal{L}(x,\lambda),
\qquad
\lambda\geq0 .
$$

Für jedes $\lambda\geq0$ gilt $g(\lambda)\leq\mathcal{L}(x^\star,\lambda)\leq f(x^\star)$: Jeder Multiplikatorvektor liefert eine untere Schranke für den Optimalwert $p^\star=f(x^\star)$, so wie jeder zulässige Punkt $x$ mit $f(x)$ eine obere liefert. Dass jede untere Schranke unter jeder oberen liegt, ist die **schwache Dualität**; die Differenz $f(x)-g(\lambda)\geq0$ heißt **Dualitätslücke**. Das primale Problem sucht die kleinste obere Schranke, das duale Problem $d^\star=\max_{\lambda\geq0}g(\lambda)$ die größte untere. Stimmen beide überein, $d^\star=p^\star$, spricht man von **starker Dualität**. Hinreichend dafür ist die **Slater-Bedingung**: Das Problem ist konvex, also $f$ konvex und die Nebenbedingungen affin, und es gibt einen strikt zulässigen Punkt mit $Ax<b$, also $\operatorname{int}\mathcal{X}\neq\emptyset$. Bei rein affinen Nebenbedingungen genügt sogar $\mathcal{X}\neq\emptyset$. Hier ist beides erfüllt; ein nichtleeres Inneres braucht später ohnehin die Barriere.

### Optimalitätsbedingungen

Aus der starken Dualität folgen die Optimalitätsbedingungen. Ist $\lambda^\star$ eine Lösung des dualen Problems, gilt

$$
\begin{align*}
f(x^\star)=g(\lambda^\star)&=\underset{x\in\mathbb{R}^2}{\min}\;\mathcal{L}(x,\lambda^\star)\\
&\leq\mathcal{L}(x^\star,\lambda^\star)=f(x^\star)+\sum_{i=1}^{m}\lambda_i^\star\,\bigl(a_i^\top x^\star-b_i\bigr)\\
&\leq f(x^\star).
\end{align*}
$$

Am Anfang und am Ende der Kette steht derselbe Wert, also gilt überall Gleichheit. Aus der ersten Ungleichung folgt, dass $x^\star$ auch $\mathcal{L}(\cdot,\lambda^\star)$ minimiert; der Gradient nach $x$ verschwindet dort. Aus der zweiten folgt, dass die Summe der nichtpositiven Summanden null ist, also jeder einzelne Summand. Zusammen mit der Zulässigkeit von $x^\star$ und $\lambda^\star$ ergeben sich die **Karush-Kuhn-Tucker-Bedingungen** (KKT):

$$
\begin{align*}
\nabla f(x^\star)+A^\top\lambda^\star&=0&&\text{Stationarität,}\\
Ax^\star&\leq b&&\text{primale Zulässigkeit,}\\
\lambda^\star&\geq0&&\text{duale Zulässigkeit,}\\
\lambda_i^\star\,\bigl(b_i-a_i^\top x^\star\bigr)&=0,\quad i=1,\ldots,m,&&\text{Komplementarität.}
\end{align*}
$$

Für konvexe Probleme sind diese vier Bedingungen auch hinreichend: Jedes Paar $(x,\lambda)$, das sie erfüllt, besteht aus einer Lösung $x=x^\star$ und einer dualen Lösung $\lambda$. Sie beschreiben das Optimum also vollständig.

Die erste Gleichung beschreibt die **Stationarität**: Der Gradient der Lagrange-Funktion bezüglich der Primalvariablen $x$ verschwindet im Optimum,

$$
\nabla_x\mathcal{L}(x^\star,\lambda^\star)=\nabla f(x^\star)+\sum_{i=1}^{m}\lambda_i^\star a_i=0 .
$$

Dabei wird der Gradient $\nabla f(x^\star)=Q\,(x^\star-x_\mathrm{ref})$ durch die gewichteten Normalen der aktiven Nebenbedingungen ausgeglichen: Der Zug $-\nabla f(x^\star)$ in Richtung fallender Zielkosten zeigt aus $\mathcal{X}$ hinaus, und die aktiven Kanten halten mit den Gewichten $\lambda_i^\star$ dagegen. Geometrisch bedeutet dies, dass keine zulässige Abstiegsrichtung mehr existiert: Jede Richtung $d$, die an keiner aktiven Kante nach außen zeigt, also $a_i^\top d\leq0$ erfüllt, ergibt $\nabla f(x^\star)^\top d=-\sum_{i}\lambda_i^\star\,a_i^\top d\geq0$, denn nur aktive Kanten haben ein positives $\lambda_i^\star$.

Die Multiplikatoren sind dabei keine bloßen Hilfsgrößen, sondern **Schattenpreise**: Sie geben an, wie stark der Optimalwert auf eine Lockerung der Nebenbedingungen reagiert,

$$
\frac{\partial p^\star}{\partial b_i}=-\lambda_i^\star .
$$

Weil $a_i$ ein Einheitsvektor ist, schiebt eine Erhöhung von $b_i$ um $\delta$ die Kante $i$ um genau die Strecke $\delta$ nach außen, und die optimalen Zielkosten sinken um etwa $\lambda_i^\star\delta$. $\lambda_i^\star$ ist also der Preis, den die Kante $i$ dem Optimum je Längeneinheit abverlangt. In der Animation lässt sich das beobachten: Verschiebt man bei kleinem $\mu$ eine Kante, an der das Optimum liegt, ändert sich der Zielfunktionswert; bei einer Kante abseits des Optimums bleibt er nahezu gleich.

Die **Komplementarität** sagt genau das: Ist $b_i-a_i^\top x^\star>0$, liegt das Optimum nicht auf der Kante $i$, eine kleine Verschiebung ändert nichts, und es gilt $\lambda_i^\star=0$. Ein positiver Preis $\lambda_i^\star>0$ ist nur möglich, wenn die Kante aktiv ist, also $b_i-a_i^\top x^\star=0$ gilt. Welche Kanten aktiv sind, ist vorab unbekannt. Genau diese kombinatorische Frage umgehen Innere-Punkte-Verfahren, indem sie die Komplementarität nicht erzwingen, sondern kontrolliert stören.

## Grenzen

Die vier Kanten lassen sich im Diagramm verschieben. Das Viereck bleibt dabei konvex; andernfalls ließe sich $\mathcal{X}$ nicht mehr durch vier lineare Ungleichungen $Ax\leq b$ beschreiben. Sein Inneres darf nicht leer werden, denn nur dort ist die Barriere definiert. Mit den Grenzen wandern auch das analytische Zentrum und der gesamte Pfad.

## Die logarithmische Barriere

Der Abstand eines Punkts zur $i$-ten Kantengeraden ist die Schlupfvariable

$$
s_i(x)=b_i-a_i^\top x,
\qquad
s(x)=b-Ax,
\qquad
s(x)>0\quad\text{für } x\in\operatorname{int}\mathcal{X} .
$$

Weil $a_i$ ein Einheitsvektor ist, ist $s_i(x)$ der geometrische Abstand zur Kante. Die logarithmische Barriere summiert die negativen Logarithmen dieser Abstände:

$$
B(x)=-\sum_{i=1}^{m}\log s_i(x),\qquad x\in\operatorname{int}\mathcal{X} .
$$

Sie ist auf dem Inneren glatt und strikt konvex und wächst unbeschränkt, wenn sich $x$ dem Rand nähert. Mit der Diagonalmatrix $S(x)=\operatorname{diag}\bigl(s_1(x),\ldots,s_m(x)\bigr)$ und dem Einsvektor $\mathbf{1}\in\mathbb{R}^m$ lauten Gradient und Hesse-Matrix

$$
\begin{align*}
\nabla B(x)&=\sum_{i=1}^{m}\frac{a_i}{s_i(x)}=A^\top S(x)^{-1}\mathbf{1},\\
\nabla^2B(x)&=\sum_{i=1}^{m}\frac{a_i a_i^\top}{s_i(x)^2}=A^\top S(x)^{-2}A .
\end{align*}
$$

Die Hesse-Matrix ist positiv definit, weil $A$ vollen Spaltenrang hat: Die Normalen des Vierecks spannen den $\mathbb{R}^2$ auf. Jeder Summand $-\log s_i$ wirkt wie eine weiche Wand vor der Kante $i$. Abbildung 1 zeigt ihn in einer Dimension mit dem Gewicht $\mu$: Für $\mu\to0$ nähert sich $-\mu\log s$ der Indikatorfunktion der Nebenbedingung, die im Zulässigen null und sonst unendlich ist,

$$
I(s)=\begin{cases}0,&s>0\\+\infty,&s\leq0,\end{cases}
\qquad
-\mu\log s\;\to\;I(s)\quad\text{für }\mu\to0 .
$$

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/barriere.svg" alt="Vier Kurven der Funktion minus mu mal Logarithmus von s für mu gleich 1, 0,5, 0,2 und 0,05 sowie die gestrichelte Indikatorfunktion, die für positives s null ist und bei s gleich null senkrecht nach oben läuft" width="640" height="360" loading="lazy">
  <figcaption>Abbildung 1: Die Barriere $-\mu\log s$ für einen einzelnen Schlupf $s$. Mit kleinerem $\mu$ schmiegt sie sich an die Indikatorfunktion an, bleibt aber am Rand $s=0$ unendlich.</figcaption>
</figure>

### Barriereproblem und Zentralpfad

Innere-Punkte-Verfahren ersetzen die Ungleichungen durch die Barriere und lösen für $\mu>0$ das glatte, unbeschränkte Problem

$$
\begin{align*}
\Phi(x,\mu)&=f(x)+\mu\,B(x)=f(x)-\mu\sum_{i=1}^{m}\log s_i(x),\\
x^\star(\mu)&=\underset{x\in\operatorname{int}\mathcal{X}}{\operatorname{argmin}}\;\Phi(x,\mu).
\end{align*}
$$

Wie die Lagrange-Funktion nimmt $\Phi$ die Nebenbedingungen in die Zielfunktion auf, aber so, dass jeder Punkt mit endlichem Wert strikt zulässig ist: Ein Verfahren, das $\Phi$ verkleinert, kann $\mathcal{X}$ nicht verlassen. Für jedes $\mu>0$ existiert das Minimum und ist eindeutig, denn $\Phi$ ist strikt konvex und wächst am Rand unbeschränkt. Die Kurve $\mu\mapsto x^\star(\mu)$ ist der Zentralpfad $\mathcal{C}$. Er hängt nur von $f$ und $\mathcal{X}$ ab: Welchen Startpunkt ein Verfahren zur Berechnung von $x^\star(\mu)$ verwendet, spielt für das Ergebnis keine Rolle, weil das Minimum eindeutig ist.

Die Stationaritätsbedingung $\nabla f(x)+\mu\,\nabla B(x)=0$ lässt sich mit den Hilfsgrößen $\lambda_i=\mu/s_i(x)$ genau wie die KKT-Bedingungen schreiben:

$$
\begin{align*}
\nabla f(x)+A^\top\lambda&=0&&\text{Stationarität,}\\
s(x)=b-Ax&>0&&\text{strikte primale Zulässigkeit,}\\
\lambda&>0&&\text{strikte duale Zulässigkeit,}\\
\lambda_i\,s_i(x)&=\mu,\quad i=1,\ldots,m,&&\text{gestörte Komplementarität.}
\end{align*}
$$

Der Vergleich mit den KKT-Bedingungen zeigt den Kern der Methode: Nur die Komplementarität ist gestört, $\lambda_i s_i=\mu$ statt $\lambda_i s_i=0$. Alle Punkte des Pfads sind strikt zulässig und haben strikt positive Multiplikatoren; erst im Grenzwert $\mu\to0$ entscheidet sich, welche Kanten aktiv werden. Aus der schwachen Dualität folgt eine Fehlerschranke: Mit den Multiplikatoren $\lambda_i(\mu)=\mu/s_i(x^\star(\mu))$ besagt die erste Gleichung, dass $x^\star(\mu)$ die Lagrange-Funktion $\mathcal{L}(\cdot,\lambda(\mu))$ minimiert. Deren Minimalwert $g(\lambda(\mu))=f(x^\star(\mu))-\sum_i\lambda_i(\mu)\,s_i(x^\star(\mu))=f(x^\star(\mu))-m\mu$ ist eine untere Schranke für $f(x^\star)$, also

$$
0\leq f(x^\star(\mu))-f(x^\star)\leq m\,\mu .
$$

Die Zahl $m\mu$ ist die **Dualitätslücke** zwischen der oberen Schranke $f(x^\star(\mu))$ und der unteren Schranke $g(\lambda(\mu))$; mit ihr lässt sich das Verfahren stoppen, sobald die gewünschte Genauigkeit erreicht ist.

Die beiden Enden des Pfads: Für $\mu\to\infty$ dominiert die Barriere, und $x^\star(\mu)$ strebt gegen das **analytische Zentrum**

$$
x_\mathrm{a}=\underset{x\in\operatorname{int}\mathcal{X}}{\operatorname{argmin}}\;B(x),
\qquad
\nabla B(x_\mathrm{a})=A^\top S(x_\mathrm{a})^{-1}\mathbf{1}=0,
$$

den Punkt, in dem sich die Abstoßung aller Kanten aufhebt. Für $\mu\to0$ strebt $x^\star(\mu)$ gegen $x^\star$.

## Verlauf des Zentralpfads

**Monotonie.** Für $\mu_1>\mu_2$ liefert die Optimalität von $x^\star(\mu_1)$ für $\Phi(\cdot,\mu_1)$ und von $x^\star(\mu_2)$ für $\Phi(\cdot,\mu_2)$ zwei Ungleichungen; ihre Summe ergibt $(\mu_1-\mu_2)\bigl(B(x^\star(\mu_1))-B(x^\star(\mu_2))\bigr)\leq0$, und Einsetzen in die zweite Ungleichung, $f(x^\star(\mu_2))+\mu_2B(x^\star(\mu_2))\leq f(x^\star(\mu_1))+\mu_2B(x^\star(\mu_1))$, liefert

$$
B(x^\star(\mu_1))\leq B(x^\star(\mu_2)),
\qquad
f(x^\star(\mu_2))\leq f(x^\star(\mu_1))
\qquad\text{für }\mu_1>\mu_2 .
$$

Mit fallendem $\mu$ fallen also die Zielkosten, während die Barriere wächst: Der Pfad bewegt sich vom Zentrum weg auf den Rand zu, aber nie über ihn hinaus.

**Start im analytischen Zentrum.** Für großes $\mu$ liefert die Stationarität mit $\nabla B(x_\mathrm{a})=0$ und $\nabla B(x)\approx\nabla^2B(x_\mathrm{a})\,(x-x_\mathrm{a})$ die Entwicklung

$$
x^\star(\mu)=x_\mathrm{a}-\frac1\mu\,\nabla^2B(x_\mathrm{a})^{-1}\,\nabla f(x_\mathrm{a})+O\!\left(\frac1{\mu^2}\right).
$$

Der Pfad verlässt das Zentrum in Richtung des negativen Gradienten von $f$, gemessen in der Metrik der Barriere: Kanten in der Nähe bremsen die Bewegung in ihre Richtung.

**Ausweichen.** Rückt eine Kante näher, wächst der Term $\mu\,a_i/s_i(x)$ in der Stationarität, und die Lösung weicht aus; zugleich wandert das analytische Zentrum von der Kante weg. Das lässt sich in der Animation direkt beobachten.

**Startpunkt des Verfahrens.** Abbildung 2 zeigt den Pfad zusammen mit den Iterierten der Barrieremethode aus dem nächsten Abschnitt: Vom Startpunkt $x_0$ führen einige Newton-Schritte zum ersten Zentrum $x^\star(\mu^{(0)})$; von dort springt das Verfahren von Zentrum zu Zentrum entlang des Pfads. Der Startpunkt $x_0$ entscheidet nur über den Weg der ersten Zentrierung, nicht über den Pfad.

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/pfadverfolgung.svg" alt="Viereck mit Höhenlinien der Zielfunktion und dem orangefarbenen Zentralpfad vom analytischen Zentrum zum Optimum auf dem rechten Rand; graue gepunktete Newton-Iterierte führen vom Startpunkt x0 zum ersten Zentrum bei mu gleich 100, weitere blaue Zentren für mu gleich 10, 1, 0,1, 0,01 und 0,001 liegen auf dem Pfad" width="640" height="560" loading="lazy">
  <figcaption>Abbildung 2: Zentralpfad (orange) und Barrieremethode mit $\kappa=10$. Vom Startpunkt $x_0$ führen die Newton-Iterierten der ersten Zentrierung (grau) zum Zentrum $x^\star(10^2)$; die weiteren Zentren (blau) liegen auf dem Pfad. Der Pfad selbst beginnt im analytischen Zentrum $x_\mathrm{a}$ und hängt nicht von $x_0$ ab.</figcaption>
</figure>

**Abstände.** Abbildung 3 zeigt die Abstände entlang des Pfads der Voreinstellung: Für großes $\mu$ fällt $\lVert x^\star(\mu)-x_\mathrm{a}\rVert$ wie $1/\mu$, für kleines $\mu$ fallen $\lVert x^\star(\mu)-x^\star\rVert$ und die Zielkostendifferenz proportional zu $\mu$, wie es die Dualitätslücke verlangt.

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/abstaende.svg" alt="Doppelt logarithmisches Diagramm über dem fallenden Barriereparameter mu: der Abstand zum analytischen Zentrum wächst und sättigt, der Abstand zum Optimum und die Zielkostendifferenz fallen für kleines mu linear in mu, die gestrichelte Dualitätslücke liegt darüber" width="640" height="380" loading="lazy">
  <figcaption>Abbildung 3: Abstände und Zielkostendifferenz entlang des Pfads der Voreinstellung, beide Achsen logarithmisch, $\mu$ fallend von links nach rechts. Links liegt die Lösung beim analytischen Zentrum $x_\mathrm{a}$, rechts konvergiert sie gegen $x^\star$. Die gestrichelte Dualitätslücke $m\mu$ liegt stets über der Zielkostendifferenz.</figcaption>
</figure>

## Innere-Punkte-Verfahren

Der Zentralpfad ist keine bloße Veranschaulichung, sondern das Konstruktionsprinzip der Barrieremethode. Sie folgt dem Pfad in Etappen:

1. Einen strikt zulässigen Startpunkt $x^{(0)}\in\operatorname{int}\mathcal{X}$ und einen großen Barriereparameter $\mu^{(0)}$ wählen. Jeder innere Punkt ist geeignet, etwa der Schwerpunkt des Vierecks; im Code unten ist es $x_0=(-1,\,-0{,}8)^\top$.
2. Zentrierung: Das Barriereproblem für $\mu^{(k)}$ mit dem Newton-Verfahren lösen, gestartet in der Lösung der vorherigen Etappe. Das Ergebnis ist der Pfadpunkt $x^\star(\mu^{(k)})$.
3. Abbruch, sobald die Dualitätslücke $m\mu^{(k)}$ unter der gewünschten Genauigkeit $\varepsilon$ liegt.
4. Verkleinern: $\mu^{(k+1)}=\mu^{(k)}/\kappa$ mit einem Faktor $\kappa>1$, dann zurück zu Schritt 2.

Jede Zentrierung ist ein glattes, unbeschränktes Problem. Der Newton-Schritt verwendet Gradient und Hesse-Matrix von $\Phi$,

$$
\begin{align*}
\nabla\Phi(x,\mu)&=Q\,(x-x_\mathrm{ref})+\mu\,A^\top S(x)^{-1}\mathbf{1},\\
\nabla^2\Phi(x,\mu)&=Q+\mu\,A^\top S(x)^{-2}A,\\
\Delta x&=-\nabla^2\Phi(x,\mu)^{-1}\,\nabla\Phi(x,\mu),
\end{align*}
$$

und wird so verkürzt, dass alle Iterierten strikt im Inneren bleiben. Der Startpunkt $x^{(0)}$ beeinflusst nur die Newton-Iterierten der ersten Zentrierung; ihr Ergebnis $x^\star(\mu^{(0)})$ ist davon unabhängig, und ab der zweiten Etappe ist der Pfad selbst der Startwert. Weil der Pfad glatt ist, liegt die vorherige Lösung nahe an der nächsten; das Newton-Verfahren konvergiert von dort quadratisch. Darauf beruht die Theorie der Pfadverfolgung: Für selbstkonkordante Barrieren, zu denen die logarithmische Barriere gehört, zeigen Nesterov und Nemirovskii, dass bei einem Faktor $\kappa$ nahe eins eine beschränkte Zahl von Newton-Schritten je Etappe genügt und die Gesamtzahl der Schritte nur wie $\sqrt{m}\,\log(1/\varepsilon)$ wächst. In der Praxis wählt man $\kappa$ zwischen 10 und 100 und nimmt dafür einige Newton-Schritte mehr je Etappe in Kauf.

Primal-duale Verfahren behandeln $x$, $\lambda$ und $s$ gemeinsam: Sie machen Newton-Schritte direkt auf dem gestörten KKT-System mit $\lambda_i s_i=\mu$ und verkleinern $\mu$ in jedem Schritt. Sie sind heute die Arbeitspferde für lineare, quadratische und konische Programme. Der Unterschied zu Aktive-Mengen-Verfahren ist anschaulich: Diese wandern am Rand von $\mathcal{X}$ entlang und probieren aktive Kanten aus; Innere-Punkte-Verfahren bleiben im Inneren und nähern sich dem Rand nur dort, wo Kanten im Optimum aktiv sind. Die Zahl ihrer Iterationen wächst dabei nur langsam mit der Problemgröße. In der modellprädiktiven Regelung dient die Lösung des vorigen Zeitschritts als Startpunkt $x^{(0)}$; sie verkürzt die erste Zentrierung, ändert aber nichts am Zentralpfad des neuen Problems.

### Umsetzung in Python und MATLAB

Die folgende Umsetzung zeigt genau diesen Algorithmus: eine Zentrierung mit gedämpftem Newton-Schritt und Rückwärtssuche (backtracking line search mit Armijo-Bedingung, wie bei Boyd und Vandenberghe, Kapitel 9) und die äußere Schleife über fallende $\mu$. Viereck und Ziel stimmen mit der Voreinstellung der Animation oben überein, sodass sich der berechnete Pfad direkt mit der gezeichneten Kurve vergleichen lässt. Der Zeichenteil ist am Ende abgetrennt.

```python tab="Python"
import numpy as np

# Zulässige Menge: Viereck mit Ecken v_i, Ungleichungen A x <= b
vertices = np.array([[-2.6, -1.9], [2.1, -1.7], [2.6, 2.1], [-1.8, 2.4]])
edges = np.roll(vertices, -1, axis=0) - vertices
A = np.column_stack([edges[:, 1], -edges[:, 0]])
A /= np.linalg.norm(A, axis=1, keepdims=True)          # Zeilen a_i^T: äußere Einheitsnormalen
b = np.sum(A * vertices, axis=1)                       # b_i = a_i^T v_i

# Zielfunktion f(x) = 1/2 (x - x_ref)^T Q (x - x_ref) mit Q = R(theta) diag(q1, q2) R(theta)^T
theta = np.radians(-25)
R = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
Q = R @ np.diag([1.0, 3.0]) @ R.T
x_ref = np.array([2.8, 1.2])

x0 = np.array([-1.0, -0.8])                            # Startpunkt des Newton-Verfahrens, strikt zulässig
ALPHA, BETA, EPS = 0.1, 0.5, 1e-10                     # Backtracking-Parameter, Toleranz


def f(x):
    return 0.5 * (x - x_ref) @ Q @ (x - x_ref)


def phi(x, mu):
    """Phi(x, mu) = f(x) - mu * sum(log(s_i(x))), außerhalb der zulässigen Menge +inf."""
    s = b - A @ x
    if np.any(s <= 0):
        return np.inf
    return f(x) - mu * np.sum(np.log(s))


def gradient_hessian(x, mu):
    s = b - A @ x
    g = Q @ (x - x_ref) + mu * A.T @ (1 / s)
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
D = np.stack([X1 - x_ref[0], X2 - x_ref[1]], axis=-1)
F = 0.5 * np.einsum("...i,ij,...j->...", D, Q, D)

fig, ax = plt.subplots()
ax.contour(X1, X2, F, levels=15, colors="#647e83", linewidths=0.6)
ax.plot(*vertices[[0, 1, 2, 3, 0]].T, color="#426f6b", label="zulässige Menge")
ax.plot(points[:, 0], points[:, 1], color="#b95a28", linewidth=2, label=r"Zentralpfad $x^\star(\mu)$")
ax.plot(*x0, "s", color="#685d94", fillstyle="none", label=r"Startpunkt $x_0$")
ax.plot(*x_ref, "+", color="#8a5979", markersize=10, label=r"Ziel $x_\mathrm{ref}$")
ax.set_aspect("equal"); ax.set_xlabel(r"$x_1$"); ax.set_ylabel(r"$x_2$"); ax.legend()
plt.show()
```

```matlab tab="MATLAB"
% Zulässige Menge: Viereck mit Ecken v_i, Ungleichungen A x <= b
vertices = [-2.6 -1.9; 2.1 -1.7; 2.6 2.1; -1.8 2.4];
edges = circshift(vertices, -1, 1) - vertices;
A = [edges(:,2), -edges(:,1)];
A = A ./ vecnorm(A, 2, 2);                  % Zeilen a_i': äußere Einheitsnormalen
b = sum(A .* vertices, 2);                  % b_i = a_i' v_i

% Zielfunktion f(x) = 1/2 (x - x_ref)' Q (x - x_ref) mit Q = R(theta) diag(q1, q2) R(theta)'
theta = deg2rad(-25);
R = [cos(theta) -sin(theta); sin(theta) cos(theta)];
Q = R * diag([1 3]) * R';
x_ref = [2.8; 1.2];

x0 = [-1; -0.8];                            % Startpunkt des Newton-Verfahrens, strikt zulässig
ALPHA = 0.1; BETA = 0.5; EPS = 1e-10;       % Backtracking-Parameter, Toleranz

x = x0;
mu_values = logspace(3, -3, 301);           % 50 Werte je Dekade
points = zeros(numel(mu_values), 2);
for k = 1:numel(mu_values)
    x = newton(x, mu_values(k), A, b, Q, x_ref, ALPHA, BETA, EPS);   % Warmstart mit x*(vorheriges mu)
    points(k, :) = x';                      % Zentralpfad x*(mu)
end

%% Zeichnen: Höhenlinien von f, Viereck, Zentralpfad
[X1, X2] = meshgrid(linspace(-3.2, 3.6, 300), linspace(-2.5, 3, 300));
D1 = X1 - x_ref(1); D2 = X2 - x_ref(2);
F = 0.5 * (Q(1,1)*D1.^2 + 2*Q(1,2)*D1.*D2 + Q(2,2)*D2.^2);

figure; hold on; axis equal
contour(X1, X2, F, 15, 'LineColor', [0.39 0.49 0.51]);
plot(vertices([1:end 1], 1), vertices([1:end 1], 2), 'Color', [0.26 0.44 0.42], 'LineWidth', 1.5);
plot(points(:,1), points(:,2), 'Color', [0.73 0.35 0.16], 'LineWidth', 2);
plot(x0(1), x0(2), 's', 'Color', [0.41 0.36 0.58], 'MarkerSize', 8);
plot(x_ref(1), x_ref(2), '+', 'Color', [0.54 0.35 0.47], 'MarkerSize', 10);
legend('Höhenlinien von f', 'zulässige Menge', 'Zentralpfad x^*(\mu)', 'Startpunkt x_0', 'Ziel x_{ref}');
xlabel('x_1'); ylabel('x_2');

function value = f(x, Q, x_ref)
    value = 0.5 * (x - x_ref)' * Q * (x - x_ref);
end

function value = phi(x, mu, A, b, Q, x_ref)
    % Phi(x, mu) = f(x) - mu * sum(log(s_i(x))), außerhalb der zulässigen Menge +Inf
    s = b - A * x;
    if any(s <= 0), value = Inf; return, end
    value = f(x, Q, x_ref) - mu * sum(log(s));
end

function [g, H] = gradient_hessian(x, mu, A, b, Q, x_ref)
    s = b - A * x;
    g = Q * (x - x_ref) + mu * A' * (1 ./ s);
    H = Q + mu * A' * diag(1 ./ s.^2) * A;
end

function x = newton(x, mu, A, b, Q, x_ref, ALPHA, BETA, EPS)
    % Zentrierung: minimiert Phi(., mu) mit gedämpften Newton-Schritten ab x.
    while true
        [g, H] = gradient_hessian(x, mu, A, b, Q, x_ref);
        p = -(H \ g);                                     % Newton-Schritt
        lambda2 = -g' * p;                                % Newton-Dekrement zum Quadrat
        if lambda2 / 2 <= EPS, return, end
        t = 1;
        while phi(x + t * p, mu, A, b, Q, x_ref) > phi(x, mu, A, b, Q, x_ref) + ALPHA * t * (g' * p)
            t = BETA * t;                                 % Backtracking (Armijo)
        end
        x = x + t * p;
    end
end
```

Die Rückwärtssuche braucht keine eigene Zulässigkeitsprüfung: Weil $\Phi$ außerhalb der zulässigen Menge den Wert $+\infty$ erhält, verletzt ein zu langer Schritt die Armijo-Bedingung automatisch und wird verkürzt. `points` enthält die 301 Pfadpunkte; `points[-1]` (Python) bzw. `points(end,:)` (MATLAB) liegt nahe am Optimum $x^\star$. Ein anderer Startpunkt $x_0$ liefert dieselben Punkte bis auf Rundungsfehler, und gegen eine unabhängige Lösung mit SciPy weicht jeder Pfadpunkt um höchstens $10^{-6}$ ab.

## Berechnung und Anzeige

Ein gedämpftes Newton-Verfahren berechnet 301 Optima für logarithmisch verteilte Werte von $\mu$ zwischen $10^3$ und $10^{-3}$, fünfzig je Dekade. Zuerst wird das analytische Zentrum bestimmt, mit demselben Verfahren für die Barriere allein, gestartet im Schwerpunkt des Vierecks. Von dort aus dient jedes Optimum als Startwert für das nächste $\mu$. Die Schrittweite wird zunächst so verkürzt, dass alle Iterierten strikt zulässig bleiben, und anschließend durch eine Armijo-Bedingung gesichert; abgebrochen wird, wenn der skalierte Gradient unter $10^{-10}$ liegt. Jeder gezeichnete Punkt ist damit ein Optimum des Barriereproblems bis auf Rundungsfehler.

Das Optimum $x^\star$ des beschränkten Problems wird exakt bestimmt: Es ist $x_\mathrm{ref}$, falls $x_\mathrm{ref}$ im Viereck liegt, sonst der beste Kandidat unter den vier Ecken und den Minima von $f$ entlang der vier Kanten. Die gezeichnete Kurve verbindet das analytische Zentrum mit den Optima von $\mu=10^3$ bis zum gewählten $\mu$; beim Abspielen wächst sie bis zum Optimum. Zwischen den berechneten Optima wird nicht interpoliert. Weil sich die Lösung für sehr großes und sehr kleines $\mu$ kaum noch bewegt, ist der Regler nicht logarithmisch in $\mu$ geteilt, sondern gleichmäßig entlang der Bogenlänge des Pfads; der angezeigte Wert von $\mu$ gehört jeweils zum gewählten Optimum. Neu gerechnet wird, sobald sich Ziel, $Q$ oder Grenzen ändern; das gewählte $\mu$ bleibt dabei erhalten.

## Literatur

Lagrange-Dualität, die KKT-Bedingungen und die Deutung der Multiplikatoren als Schattenpreise behandeln [Boyd und Vandenberghe, *Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/) in Kapitel 5, die logarithmische Barriere, den Zentralpfad und die Dualitätslücke in Kapitel 11; eine kompakte Herleitung enthalten [Vandenberghes Vorlesungsfolien zu Innere-Punkte-Verfahren](https://www.seas.ucla.edu/~vandenbe/ee236b/lectures/barrier.pdf). Die Komplexitätstheorie der Pfadverfolgung stammt aus Nesterov und Nemirovskii, *Interior-Point Polynomial Algorithms in Convex Programming*, SIAM 1994. Primal-duale Verfahren behandelt Wright, *Primal-Dual Interior-Point Methods*, SIAM 1997; Innere-Punkte-Verfahren für nichtlineare Probleme Nocedal und Wright, *Numerical Optimization*, 2. Auflage, Springer 2006, Kapitel 19.
