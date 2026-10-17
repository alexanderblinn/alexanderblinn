---
title: "Innere-Punkte-Verfahren: von den KKT-Bedingungen zum Zentralpfad"
date: 2026-09-20
description: "Innere-Punkte-Verfahren anschaulich: von den KKT-Bedingungen über die logarithmische Barriere zum Zentralpfad eines quadratischen Programms, mit Grenzen und Barriereparameter zum Ausprobieren."
tags: [optimierung, numerik, interaktiv]
featured: false
draft: false
---

Ein Punkt soll möglichst nahe an ein Ziel gelangen und dabei in einem vorgegebenen Bereich bleiben. Das ist ein Optimierungsproblem mit Ungleichungsnebenbedingungen. **Innere-Punkte-Verfahren** lösen solche Probleme, indem sie die harten Grenzen durch eine weiche Barriere ersetzen, deren Gewicht $\mu$ schrittweise sinkt. Für jedes $\mu$ gibt es genau eine Lösung $x^\star(\mu)$, und zusammen bilden diese Lösungen eine Kurve, den **Zentralpfad**. Er beginnt in der Mitte des zulässigen Bereichs, fern aller Grenzen, und endet für $\mu\to0$ im gesuchten Optimum $x^\star$. Innere-Punkte-Verfahren folgen ihm in Etappen.

Die Animation zeigt den Pfad in zwei Dimensionen. Der Text darunter führt von den Optimalitätsbedingungen über die Barriere zum Zentralpfad und zu dem Verfahren, das ihm folgt; eine Umsetzung in Python und MATLAB schließt sich an.

## Ausprobieren

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Ziehe Ecken, Kanten oder das Ziel $x_\mathrm{ref}$; das Viereck bleibt dabei konvex. Der Schieberegler läuft gleichmäßig entlang des Pfads und zeigt den zugehörigen Wert von $\mu$; „Abspielen“ lässt $\mu$ von $10^3$ auf $10^{-3}$ fallen. Der orangefarbene Punkt ist die Lösung $x^\star(\mu)$ für das gewählte $\mu$. Ziehe eine Kante näher an den Pfad: Er weicht ihr aus, und auch sein Anfangspunkt $x_\mathrm{a}$ wandert mit den Grenzen.</span></p>

<p class="figure-takeaway"><span class="figure-symbol" role="img" aria-label="Kernaussage">!</span><span>Eine Barriere hält die Lösung von den Grenzen fern. Wird ihr Gewicht $\mu$ kleiner, wandert die Lösung $x^\star(\mu)$ entlang des Zentralpfads ins Optimum.</span></p>

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

Die Höhenlinien von $f$ sind Ellipsen um $x_\mathrm{ref}$, deren Halbachsen proportional zu $1/\sqrt{q_1}$ und $1/\sqrt{q_2}$ sind und die um $\theta$ gedreht liegen. Jede Zeile $a_i^\top$ von $A$ gehört zu einer Kante: Die Kanten des Vierecks werden durch die Geraden $a_i^\top x=b_i$ getragen, wobei $a_i$ jeweils den nach außen gerichteten Einheitsnormalenvektor der entsprechenden Randgeraden bezeichnet. Die Ecken heißen wie in der Animation A, B, C und D. Damit sind zulässige Menge und Inneres

$$
\mathcal{X}=\{\,x\in\mathbb{R}^2\;:\;Ax\leq b\,\},
\qquad
\operatorname{int}\mathcal{X}=\{\,x\in\mathbb{R}^2\;:\;Ax<b\,\}.
$$

Weil $f$ strikt konvex und $\mathcal{X}$ kompakt und konvex ist, hat das Problem genau eine Lösung $x^\star$. Liegt $x_\mathrm{ref}$ in $\mathcal{X}$, ist $x^\star=x_\mathrm{ref}$; sonst liegt $x^\star$ auf dem Rand.

Alle Abbildungen und der Code unten rechnen mit demselben **Beispiel**, der Ausgangsstellung der Animation: dem Viereck mit den Ecken $A=(-2.6,\,-1.9)^\top$, $B=(2.1,\,-1.7)^\top$, $C=(2.6,\,2.1)^\top$ und $D=(-1.8,\,2.4)^\top$, dem Zielpunkt $x_\mathrm{ref}=(2.8,\,1.2)^\top$ und $q_1=1$, $q_2=3$, $\theta=-25^\circ$. Der Zielpunkt liegt dort rechts außerhalb des Vierecks, das Optimum $x^\star$ auf der Kante BC.

## Dualität und KKT-Bedingungen

### Lagrange-Funktion

Liegt $x^\star$ auf dem Rand, ist $\nabla f(x^\star)$ im Allgemeinen nicht null; die Optimalitätsbedingung $\nabla f(x)=0$ des unbeschränkten Problems reicht also nicht mehr aus. Ein Verfahren, das die Nebenbedingungen getrennt von der Zielfunktion behandelt, müsste zudem nach jedem Schritt prüfen, ob der neue Punkt noch in $\mathcal{X}$ liegt, und ihn andernfalls zurückholen. Stattdessen bezieht man die Nebenbedingungen in die Zielfunktion ein: als gewichtete Summe der Ausdrücke $a_i^\top x-b_i$. Bei einem zulässigen Punkt $x$ ist jeder dieser Ausdrücke kleiner oder gleich null. Die Gewichte $\lambda_i\geq0$ heißen **Lagrange-Multiplikatoren** und bilden den Vektor $\lambda\in\mathbb{R}^m$. Das ergibt die Lagrange-Funktion

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

Für konvexe Probleme sind diese vier Bedingungen auch hinreichend: Jedes Paar $(x,\lambda)$, das sie erfüllt, besteht aus der Lösung $x^\star$ und einer dualen Lösung. Sie beschreiben das Optimum also vollständig.

Die erste Gleichung beschreibt die **Stationarität**: Der Gradient der Lagrange-Funktion bezüglich der Primalvariablen $x$ verschwindet im Optimum, $\nabla_x\mathcal{L}(x^\star,\lambda^\star)=\nabla f(x^\star)+\sum_i\lambda_i^\star a_i=0$. Dabei wird der Gradient $\nabla f(x^\star)=Q\,(x^\star-x_\mathrm{ref})$ durch die gewichteten Normalen der aktiven Nebenbedingungen ausgeglichen: Der Zug $-\nabla f(x^\star)$ in Richtung fallender Zielkosten zeigt aus $\mathcal{X}$ hinaus, und die aktiven Kanten halten mit den Gewichten $\lambda_i^\star$ dagegen. Geometrisch bedeutet dies, dass keine zulässige Abstiegsrichtung mehr existiert: Jede Richtung $d$, die an keiner aktiven Kante nach außen zeigt, also $a_i^\top d\leq0$ erfüllt, ergibt $\nabla f(x^\star)^\top d=-\sum_{i}\lambda_i^\star\,a_i^\top d\geq0$, denn nur aktive Kanten haben ein positives $\lambda_i^\star$.

Die Multiplikatoren sind dabei keine bloßen Hilfsgrößen, sondern **Schattenpreise**: Sie geben an, wie stark der Optimalwert auf eine Lockerung der Nebenbedingungen reagiert,

$$
\frac{\partial p^\star}{\partial b_i}=-\lambda_i^\star .
$$

Weil $a_i$ ein Einheitsvektor ist, schiebt eine Erhöhung von $b_i$ um $\delta$ die Kante $i$ um genau die Strecke $\delta$ nach außen, und die optimalen Zielkosten sinken um etwa $\lambda_i^\star\delta$. $\lambda_i^\star$ ist also der Preis, den die Kante $i$ dem Optimum je Längeneinheit abverlangt. Im Beispiel liegt das Optimum auf der Kante BC, mit $\lambda^\star\approx0.34$. Abbildung 1 zeigt dort links das Kräftegleichgewicht und rechts den Optimalwert $p^\star(\delta)$ beim Verschieben dieser Kante; seine Steigung bei $\delta=0$ ist genau $-\lambda^\star$.

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/kkt.svg" alt="Links ein Ausschnitt um das Optimum auf der Kante BC: Eine Höhenellipse der Zielfunktion berührt die Kante, ein Pfeil minus Gradient zeigt nach außen zum Ziel, ein gleich langer Pfeil minus lambda mal a zeigt nach innen. Rechts der Optimalwert über der Verschiebung delta der Kante, eine fallende Parabel mit gestrichelter Tangente der Steigung minus 0.34 bei delta gleich null" width="640" height="320" loading="lazy">
  <figcaption>Abbildung 1: Links das Optimum $x^\star$ des Beispiels auf der Kante BC. Die Höhenlinie von $f$ durch $x^\star$ berührt die Kante, und der Zug $-\nabla f(x^\star)$ wird von der Gegenkraft $-\lambda^\star a$ der Kante genau aufgehoben (beide Pfeile zur besseren Sichtbarkeit verlängert dargestellt). Rechts der Optimalwert $p^\star(\delta)$, wenn die Kante BC um $\delta$ nach außen rückt; seine Tangente bei $\delta=0$ hat die Steigung $-\lambda^\star$. Ab $\delta\approx0.32$ liegt $x_\mathrm{ref}$ im Viereck und $p^\star=0$.</figcaption>
</figure>

Die **Komplementarität** sagt genau das: Ist $b_i-a_i^\top x^\star>0$, liegt das Optimum nicht auf der Kante $i$, eine kleine Verschiebung ändert nichts, und es gilt $\lambda_i^\star=0$. Ein positiver Preis $\lambda_i^\star>0$ ist nur möglich, wenn die Kante aktiv ist, also $b_i-a_i^\top x^\star=0$ gilt. Welche Kanten aktiv sind, ist vorab unbekannt. Genau diese kombinatorische Frage umgehen Innere-Punkte-Verfahren, indem sie die Komplementarität nicht erzwingen, sondern kontrolliert stören.

## Logarithmische Barriere und Zentralpfad

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

Sie ist auf dem Inneren glatt und strikt konvex und wächst unbeschränkt, wenn sich $x$ dem Rand nähert: Jeder Summand $-\log s_i$ wirkt wie eine weiche Wand vor der Kante $i$. Abbildung 2 zeigt ihn in einer Dimension mit dem Gewicht $\mu$. Für $\mu\to0$ nähert sich $-\mu\log s$ im Inneren der Indikatorfunktion der Nebenbedingung $s\geq0$, die im Zulässigen null und sonst unendlich ist:

$$
I(s)=\begin{cases}0,&s\geq0\\+\infty,&s<0,\end{cases}
\qquad
-\mu\log s\;\to\;0=I(s)\quad\text{für }\mu\to0\text{ und jedes }s>0 .
$$

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/barriere.svg" alt="Vier Kurven der Funktion minus mu mal Logarithmus von s für mu gleich 1, 0.5, 0.2 und 0.05 sowie die gestrichelte Indikatorfunktion, die im zulässigen Bereich null ist und bei s gleich null senkrecht nach oben läuft" width="640" height="360" loading="lazy">
  <figcaption>Abbildung 2: Die Barriere $-\mu\log s$ für einen einzelnen Schlupf $s$. Mit kleinerem $\mu$ schmiegt sie sich an die Indikatorfunktion an, bleibt aber am Rand $s=0$ unendlich.</figcaption>
</figure>

### Barriereproblem

Mit der Indikatorfunktion lässt sich das ursprüngliche Problem exakt ohne Nebenbedingungen schreiben: Man addiert für jede Kante $I\bigl(s_i(x)\bigr)$ zur Zielfunktion,

$$
\underset{x\in\mathbb{R}^2}{\min}\;f(x)+\sum_{i=1}^{m}I\bigl(s_i(x)\bigr).
$$

Ein unzulässiger Punkt kostet unendlich viel, ein zulässiger nichts zusätzlich; das Minimum ist also genau $x^\star$. Rechnen lässt sich mit dieser Form aber nicht, denn $I$ springt am Rand von null auf unendlich und liefert keine brauchbaren Ableitungen. Innere-Punkte-Verfahren ersetzen deshalb jede Indikatorfunktion durch ihre glatte Näherung $-\mu\log s_i$. Zur ursprünglichen Zielfunktion $f$ kommt so die mit dem **Barriereparameter** $\mu>0$ gewichtete Barriere $B$ hinzu, und es entsteht das **Barriereproblem**

$$
\underset{x\in\operatorname{int}\mathcal{X}}{\min}\;\Phi(x,\mu),
\qquad
\Phi(x,\mu)=f(x)+\mu\,B(x)=f(x)-\mu\sum_{i=1}^{m}\log s_i(x).
$$

**Keine Nebenbedingungen mehr.** Formal bleibt nur das Innere $\operatorname{int}\mathcal{X}$ als Definitionsbereich, und den verlässt kein sinnvoller Schritt: $\Phi$ ist dort glatt und wird am Rand unendlich, ein Verfahren, das $\Phi$ verkleinert, bleibt also von selbst im Inneren. Es muss keine Punkte zurückholen und kann mit Gradient und Hesse-Matrix arbeiten, etwa mit dem Newton-Verfahren.

**Ein Parameter statt vieler Multiplikatoren.** Die Lagrange-Funktion gewichtet jede Nebenbedingung mit einem eigenen Multiplikator $\lambda_i$, der selbst unbekannt ist. Die Barriere gewichtet alle Kanten mit demselben, frei gewählten $\mu$. Wie die Multiplikatoren trotzdem wieder auftauchen, zeigt der nächste Abschnitt.

**Eine Näherung, die genauer wird.** $\Phi$ ist strikt konvex, für jedes $\mu>0$ gibt es also genau ein Minimum $x^\star(\mu)$. Diese Minima bilden den **Zentralpfad**

$$
\mathcal{C}=\{\,x^\star(\mu)\;:\;\mu>0\,\}.
$$

Der Parameter $\mu$ regelt den Kompromiss. Bei großem $\mu$ zählt fast nur die Barriere, und $x^\star(\mu)$ liegt nahe dem **analytischen Zentrum** $x_\mathrm{a}$, dem Minimum von $B$ allein, in dem sich die Abstoßung aller Kanten aufhebt. Mit fallendem $\mu$ gewinnt die Zielfunktion $f$ an Gewicht: Der Pfad verlässt das Zentrum, weicht nahen Kanten aus und erreicht für $\mu\to0$ das Optimum $x^\star$.

### Gestörte Komplementarität

Woher die Multiplikatoren im Barriereproblem kommen, zeigt dessen Lagrange-Funktion. Dazu wird der Schlupf zur eigenen Variablen: Statt $s(x)=b-Ax$ einzusetzen, verlangt man die Gleichung $Ax+s=b$ mit $s>0$ und gibt ihr einen Multiplikator $\lambda\in\mathbb{R}^m$. Die **Barriere-Lagrange-Funktion** lautet dann

$$
\mathcal{L}_\mu(x,s,\lambda)=f(x)-\mu\sum_{i=1}^{m}\log s_i+\lambda^\top(Ax+s-b).
$$

Im Optimum verschwinden ihre Ableitungen. Die Ableitung nach $\lambda$ gibt die Gleichung $Ax+s=b$ zurück, die nach $x$ die Stationarität der KKT-Bedingungen, $\nabla f(x)+A^\top\lambda=0$. Neu ist nur die Ableitung nach dem Schlupf $s_i$:

$$
\frac{\partial\mathcal{L}_\mu}{\partial s_i}=-\frac{\mu}{s_i}+\lambda_i=0
\qquad\Longrightarrow\qquad
\lambda_i\,s_i=\mu,\quad i=1,\ldots,m .
$$

Weil $s_i>0$ ist, folgt daraus auch $\lambda_i=\mu/s_i>0$. Für $\mu\to0$ ergibt sich die gewöhnliche Komplementarität der KKT-Bedingungen, $\lambda_i s_i=0$.

Die Punkte des Zentralpfads lösen also die KKT-Bedingungen mit **gestörter Komplementarität**: $\lambda_i s_i=\mu$ statt $\lambda_i s_i=0$. Kein Paar $(s_i,\lambda_i)$ muss sich zwischen „Kante aktiv“ und „Multiplikator null“ entscheiden; beide bleiben positiv, ihr Produkt ist $\mu$. Erst im Grenzwert $\mu\to0$ entscheidet sich, welche Kanten aktiv werden. Dabei können auch $s_i=0$ und $\lambda_i=0$ zugleich gelten, wenn eine Kante berührt wird, ohne zum Gleichgewicht beizutragen, etwa wenn $x_\mathrm{ref}$ genau auf ihr liegt. Strikte Komplementarität, bei der stets genau einer der beiden Faktoren verschwindet, ist also nicht garantiert.

Abbildung 3 zeigt das für das Beispiel: Das Paar $(s_i,\lambda_i)$ jeder Kante liegt auf der Hyperbel $\lambda_i s_i=\mu$. Mit fallendem $\mu$ wandert das Paar der aktiven Kante BC an die $\lambda$-Achse, mit $s\to0$ und $\lambda\to\lambda^\star\approx0.34$; die Multiplikatoren der drei anderen Kanten verschwinden, ihre Paare wandern an die $s$-Achse. Im Grenzwert erfüllen alle Paare die exakte Komplementarität.

<figure class="static-figure full-width">
  <img src="/img/notes/zentralpfad/komplementaritaet.svg" alt="Diagramm mit dem Schlupf auf der waagerechten und dem Multiplikator auf der senkrechten Achse: vier Hyperbeln lambda mal s gleich mu, darüber die Wege der vier Kanten für fallendes mu. Die aktive Kante BC endet auf der senkrechten Achse bei etwa 0.34, die Kanten AB, CD und DA enden auf der waagerechten Achse" width="640" height="360" loading="lazy">
  <figcaption>Abbildung 3: Schlupf $s_i$ und Multiplikator $\lambda_i=\mu/s_i$ der vier Kanten entlang des Pfads im Beispiel, von $\mu=1$ (Kreis) bis $\mu=10^{-3}$ (Punkt). Die Hyperbeln $\lambda s=\mu$, blasser für kleineres $\mu$, schmiegen sich an den gestrichelten Winkel der exakten Komplementarität an, so wie die Barriere in Abbildung 2 an die Indikatorfunktion.</figcaption>
</figure>

Summiert über alle Kanten ergibt die gestörte Komplementarität die Dualitätslücke: $f\bigl(x^\star(\mu)\bigr)-g(\lambda)=\lambda^\top s=m\mu$. Um höchstens diesen Betrag liegen die Zielkosten eines Pfadpunkts über dem Optimum, $f(x^\star(\mu))-f(x^\star)\leq m\mu$. Damit lässt sich ein Verfahren stoppen, sobald die gewünschte Genauigkeit erreicht ist.

## Dem Pfad folgen

**Warum in Etappen?** Im Prinzip könnte man das Barriereproblem gleich mit sehr kleinem $\mu$ lösen, denn dessen Lösung liegt schon fast im Optimum. Praktisch geht das schlecht: Bei kleinem $\mu$ ist die Barriere fast eine senkrechte Wand (Abbildung 2), $\Phi$ ist am Rand extrem stark gekrümmt, und das Newton-Verfahren kommt von einem weit entfernten Startpunkt nur mit vielen kleinen, gedämpften Schritten voran. Deshalb verkleinert man $\mu$ schrittweise und beginnt jede Rechnung dort, wo die vorige aufgehört hat. Das Lösen des Barriereproblems für das aktuelle $\mu$ heißt **Zentrierung**: Sie führt zurück auf den Zentralpfad, zum Pfadpunkt $x^\star(\mu)$. Weil benachbarte Pfadpunkte nahe beieinander liegen, startet jede Zentrierung schon nahe an ihrem Ziel, wo das Newton-Verfahren quadratisch konvergiert; wenige Schritte genügen.

**Wie weit je Etappe?** Wie stark $\mu$ von Etappe zu Etappe fällt, legt der **Reduktionsfaktor** $\kappa>1$ fest: $\mu^{(k+1)}=\mu^{(k)}/\kappa$. Ein großes $\kappa$ spart Etappen, doch das alte Zentrum liegt dann weiter vom neuen entfernt, und die Zentrierung braucht mehr Schritte. Im Beispiel braucht die Barrieremethode, beginnend bei $\mu=100$, bis zu einer Dualitätslücke unter $\varepsilon=10^{-6}$ mit $\kappa=2$ 30 Etappen und 75 Newton-Schritte, mit $\kappa=100$ nur 6 Etappen und 33 Schritte. Für selbstkonkordante Barrieren wie die logarithmische zeigen Nesterov und Nemirovskii, dass schon mit $\kappa$ nahe eins die Gesamtzahl der Newton-Schritte nur wie $\sqrt{m}\,\log(1/\varepsilon)$ wächst; in der Praxis wählt man $\kappa$ zwischen 10 und 100.

**Ganz oder nur ungefähr auf dem Pfad.** Die **Barrieremethode** zentriert in jeder Etappe vollständig und verkleinert $\mu$ erst, wenn $x^\star(\mu)$ erreicht ist. **Primal-duale Verfahren** behandeln $x$, $\lambda$ und $s$ gemeinsam und machen nur einen Newton-Schritt auf dem gestörten KKT-System, bevor sie $\mu$ verkleinern. Sie bleiben damit nur in der Nähe des Pfads und müssen laufend zu ihm zurückkorrigieren. Das verbreitetste Schema dafür ist das **Prädiktor-Korrektor-Verfahren von Mehrotra**: Ein Prädiktor-Schritt mit $\mu=0$ zielt direkt auf das Optimum und zeigt, wie weit man gehen kann; danach wird das nächste $\mu$ gewählt, und ein Korrektor-Schritt zieht die Iterierte zurück in die Nähe des Pfads. Beide Schritte nutzen dieselbe Zerlegung der Newton-Matrix. So arbeiten die meisten heutigen Löser für lineare, quadratische und konische Programme.

## Umsetzung

Abbildung 4 führt beide Verfahren im Beispiel Schritt für Schritt aus: oben der Weg entlang des Zentralpfads, darunter der Pseudocode mit der gerade ausgeführten Zeile und den aktuellen Werten.

<figure class="interactive-figure figure-method">
  <iframe src="/img/notes/zentralpfad/zentrierung.html" title="Barrieremethode und Prädiktor-Korrektor-Verfahren Schritt für Schritt: Zentralpfad und Pseudocode" height="900" loading="lazy"></iframe>
  <figcaption><span>Abbildung 4: Barrieremethode und Prädiktor-Korrektor-Verfahren im Beispiel, vom Pfadpunkt $x^\star(100)$ bis zum Optimum. Die Barrieremethode führt nach jeder Verkleinerung von $\mu$ mit Newton-Schritten (grau) genau zum neuen Pfadpunkt $x^\star(\mu)$. Verkürzt die Rückwärtssuche einen Schritt, zeigt eine hellgraue, mit $t=1$ beschriftete Linie den verworfenen vollen Newton-Schritt. Beim Prädiktor-Korrektor-Verfahren zielt der Prädiktor (grau gestrichelt) auf das Optimum, der Korrektor (blau) endet nur in der Nähe des Pfads. Die Lupe unten rechts vergrößert die letzten, sehr kleinen Schritte. Aus Darstellungsgründen endet die Abbildung, sobald die Dualitätslücke unter $10^{-2}$ liegt.</span><a href="/img/notes/zentralpfad/zentrierung.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

Der folgende Code setzt die Barrieremethode aus Abbildung 4 in Python und MATLAB um; der Zeichenteil ist am Ende abgetrennt.

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

x0 = np.array([-1.0, -0.8])                            # Startpunkt, strikt zulässig
MU0, KAPPA, EPS = 100.0, 10.0, 1e-6                    # Barriereparameter, Reduktionsfaktor, Genauigkeit
ALPHA, BETA, DELTA = 0.1, 0.5, 1e-10                   # Rückwärtssuche, Toleranz der Zentrierung


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
    """Zentrierung: minimiert Phi(., mu) mit gedämpften Newton-Schritten ab x; gibt auch die Iterierten zurück."""
    visited = []
    while True:
        g, H = gradient_hessian(x, mu)
        dx = -np.linalg.solve(H, g)                    # Newton-Schritt
        if -g @ dx / 2 <= DELTA:                       # Newton-Dekrement klein: x = x*(mu)
            return x, visited
        t = 1.0
        while phi(x + t * dx, mu) > phi(x, mu) + ALPHA * t * (g @ dx):
            t *= BETA                                   # Rückwärtssuche (Armijo)
        x = x + t * dx
        visited.append(x)


m = len(b)                                             # Zahl der Nebenbedingungen
x, mu = x0, MU0
iterates, centres = [x0], []
while True:                                            # Etappe
    x, visited = newton(x, mu)                         # Zentrierung, Start im vorigen Zentrum
    iterates += visited
    centres.append(x)                                  # Pfadpunkt x*(mu)
    if m * mu < EPS:                                   # Dualitätslücke klein genug
        break
    mu /= KAPPA
iterates, centres = np.array(iterates), np.array(centres)
print(f"{len(centres)} Etappen, {len(iterates) - 1} Newton-Schritte, x = {x}")

# %% Zeichnen: Höhenlinien von f, Viereck, Newton-Iterierte und Zentren
import matplotlib.pyplot as plt

X1, X2 = np.meshgrid(np.linspace(-3.2, 3.6, 300), np.linspace(-2.5, 3.0, 300))
D = np.stack([X1 - x_ref[0], X2 - x_ref[1]], axis=-1)
F = 0.5 * np.einsum("...i,ij,...j->...", D, Q, D)

fig, ax = plt.subplots()
ax.contour(X1, X2, F, levels=15, colors="#647e83", linewidths=0.6)
ax.plot(*vertices[[0, 1, 2, 3, 0]].T, color="#426f6b", label="zulässige Menge")
ax.plot(*iterates.T, "--", color="#77746c", linewidth=1, label="Newton-Iterierte")
ax.plot(*centres.T, "o", color="#173fbe", markersize=4, label=r"Zentren $x^\star(\mu)$")
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

x0 = [-1; -0.8];                            % Startpunkt, strikt zulässig
MU0 = 100; KAPPA = 10; EPS = 1e-6;          % Barriereparameter, Reduktionsfaktor, Genauigkeit
ALPHA = 0.1; BETA = 0.5; DELTA = 1e-10;     % Rückwärtssuche, Toleranz der Zentrierung

m = numel(b);                               % Zahl der Nebenbedingungen
x = x0; mu = MU0;
iterates = x0'; centres = zeros(0, 2);
while true                                  % Etappe
    [x, visited] = newton(x, mu, A, b, Q, x_ref, ALPHA, BETA, DELTA);   % Zentrierung, Start im vorigen Zentrum
    iterates = [iterates; visited];
    centres = [centres; x'];                % Pfadpunkt x*(mu)
    if m * mu < EPS, break, end             % Dualitätslücke klein genug
    mu = mu / KAPPA;
end
fprintf('%d Etappen, %d Newton-Schritte, x = (%.6f, %.6f)\n', size(centres, 1), size(iterates, 1) - 1, x);

%% Zeichnen: Höhenlinien von f, Viereck, Newton-Iterierte und Zentren
[X1, X2] = meshgrid(linspace(-3.2, 3.6, 300), linspace(-2.5, 3, 300));
D1 = X1 - x_ref(1); D2 = X2 - x_ref(2);
F = 0.5 * (Q(1,1)*D1.^2 + 2*Q(1,2)*D1.*D2 + Q(2,2)*D2.^2);

figure; hold on; axis equal
contour(X1, X2, F, 15, 'LineColor', [0.39 0.49 0.51]);
plot(vertices([1:end 1], 1), vertices([1:end 1], 2), 'Color', [0.26 0.44 0.42], 'LineWidth', 1.5);
plot(iterates(:,1), iterates(:,2), '--', 'Color', [0.47 0.45 0.42]);
plot(centres(:,1), centres(:,2), 'o', 'Color', [0.09 0.25 0.75], 'MarkerFaceColor', [0.09 0.25 0.75], 'MarkerSize', 4);
plot(x0(1), x0(2), 's', 'Color', [0.41 0.36 0.58], 'MarkerSize', 8);
plot(x_ref(1), x_ref(2), '+', 'Color', [0.54 0.35 0.47], 'MarkerSize', 10);
legend('Höhenlinien von f', 'zulässige Menge', 'Newton-Iterierte', 'Zentren x^*(\mu)', 'Startpunkt x_0', 'Ziel x_{ref}');
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

function [x, visited] = newton(x, mu, A, b, Q, x_ref, ALPHA, BETA, DELTA)
    % Zentrierung: minimiert Phi(., mu) mit gedämpften Newton-Schritten ab x; visited enthält die Iterierten.
    visited = zeros(0, 2);
    while true
        [g, H] = gradient_hessian(x, mu, A, b, Q, x_ref);
        dx = -(H \ g);                                    % Newton-Schritt
        if -g' * dx / 2 <= DELTA, return, end             % Newton-Dekrement klein: x = x*(mu)
        t = 1;
        while phi(x + t * dx, mu, A, b, Q, x_ref) > phi(x, mu, A, b, Q, x_ref) + ALPHA * t * (g' * dx)
            t = BETA * t;                                 % Rückwärtssuche (Armijo)
        end
        x = x + t * dx;
        visited(end + 1, :) = x';
    end
end
```

## Literatur

Lagrange-Dualität, die KKT-Bedingungen und die Deutung der Multiplikatoren als Schattenpreise behandeln [Boyd und Vandenberghe, *Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/) in Kapitel 5, die logarithmische Barriere, den Zentralpfad und die Dualitätslücke in Kapitel 11; eine kompakte Herleitung enthalten [Vandenberghes Vorlesungsfolien zu Innere-Punkte-Verfahren](https://www.seas.ucla.edu/~vandenbe/ee236b/lectures/barrier.pdf). Die Komplexitätstheorie der Pfadverfolgung stammt aus Nesterov und Nemirovskii, *Interior-Point Polynomial Algorithms in Convex Programming*, SIAM 1994. Primal-duale Verfahren behandelt Wright, *Primal-Dual Interior-Point Methods*, SIAM 1997; das Prädiktor-Korrektor-Verfahren stammt aus Mehrotra, „On the Implementation of a Primal-Dual Interior Point Method“, *SIAM Journal on Optimization* 2(4), 1992; Innere-Punkte-Verfahren für nichtlineare Probleme Nocedal und Wright, *Numerical Optimization*, 2. Auflage, Springer 2006, Kapitel 19.
