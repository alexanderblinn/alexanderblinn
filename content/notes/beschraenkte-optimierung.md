---
title: "Optimierung unter Nebenbedingungen – Lagrange-Dualität und KKT-Bedingungen"
date: 2026-11-08
description: "Ein Kurs über Optimierung unter Nebenbedingungen im allgemeinen, auch nichtkonvexen Fall: zulässiger Bereich, aktive Menge und das Gleichgewicht der Gradienten, erzählt von Lambda und mit Abbildungen zum Ausprobieren."
tags: [optimierung, dualität, interaktiv]
featured: false
draft: false
styles: [/assets/site/course.css, /assets/notes/beschraenkte-optimierung/narrator.css]
scripts: [/assets/site/course.js, /assets/notes/beschraenkte-optimierung/narrator.js]
---

## Grundlagen und Motivation

### Das Problem

Stellen wir uns vor, wir möchten eine Zielfunktion möglichst klein machen, dürfen die Entscheidungsvariablen dabei aber nicht beliebig verändern. Vielleicht ist eine Leistung begrenzt, eine Kapazität darf nicht überschritten werden oder bestimmte Kombinationen von Variablen sind unzulässig. Wir suchen also nicht einfach den kleinsten Wert der Zielfunktion, sondern den kleinsten Wert, den wir unter Einhaltung aller Nebenbedingungen tatsächlich erreichen können.

<div class="narrator" role="note" data-pose="zeigt">
<p>Hallo, ich bin Lambda, genauer gesagt einer der Lagrange-Multiplikatoren $\lambda_i$, um die es hier geht. Offiziell trete ich erst auf, wenn klar ist, warum ein Optimum am Rand liegen kann. Bis dahin führe ich durch den Kurs und sage Bescheid, sobald ich gebraucht werde.</p>
</div>

Allgemein schreiben wir ein solches Problem als

$$
\begin{align*}
\underset{x\in\mathbb{R}^n}{\min}\quad&f(x)\\
\text{unter}\quad&c_i(x)=0,\quad i\in\mathcal{E},\\
&c_i(x)\le0,\quad i\in\mathcal{I}.
\end{align*}
$$

Der Vektor $x\in\mathbb{R}^n$ enthält die Entscheidungsvariablen, $f:\mathbb{R}^n\to\mathbb{R}$ ist die Zielfunktion, und jede Nebenbedingung wird durch eine Funktion $c_i:\mathbb{R}^n\to\mathbb{R}$ beschrieben. Die Indexmenge $\mathcal{E}$ sammelt die Gleichungen, die Indexmenge $\mathcal{I}$ die Ungleichungen.

Andere Probleme lassen sich in diese Form bringen:

- Aus $\max f(x)$ wird $\min\,(-f(x))$.
- Aus $c(x)\ge0$ wird $-c(x)\le0$.
- Aus $c(x)\le d$ wird $c(x)-d\le0$.

Lehrbücher wie das von Nocedal und Wright schreiben Ungleichungen als $c_i(x)\ge0$. Das ist dieselbe Theorie mit umgekehrten Vorzeichen; wir bleiben bei „$\le0$“ wie in der Notiz zum [Zentralpfad](/notes/zentralpfad.html).

Wir setzen voraus, dass $f$ und alle $c_i$ stetig differenzierbar sind. Dann besitzen sie überall Gradienten, und kleine Schritte lassen sich mit Taylorentwicklungen beschreiben. Konvexität verlangen wir dagegen nicht, weder von $f$ noch von den Nebenbedingungen.

Als Beispiel dient uns in diesem Kapitel die Zielfunktion $f(x)=\tfrac12(x_1-3{,}2)^2+\tfrac32(x_2-2)^2$ mit den drei Ungleichungen

$$
\begin{align*}
c_1(x)&=x_1^2+x_2^2-4\le0,\\
c_2(x)&=1-(x_1+1{,}3)^2-(x_2+1{,}9)^2\le0,\\
c_3(x)&=x_2-1{,}2\le0.
\end{align*}
$$

Die erste hält $x$ in der Kreisscheibe vom Radius 2, die zweite außerhalb des Einheitskreises um $(-1{,}3;\,-1{,}9)$ und die dritte unterhalb der Geraden $x_2=1{,}2$. Ohne Nebenbedingungen läge das Minimum bei $x_\mathrm{ref}=(3{,}2;\,2)$.

<figure class="interactive-figure figure-problem">
  <iframe src="/img/notes/beschraenkte-optimierung/problem.html" title="Das Beispiel: Höhenlinien von f, zulässiger Bereich und beschränktes Minimum, mit verschiebbarem unbeschränktem Minimum" height="650" loading="lazy"></iframe>
  <figcaption><span>Abbildung 1: Die Höhenlinien von $f$ sind Ellipsen um $x_\mathrm{ref}$. Das Minimum über den zulässigen Bereich liegt dort, wo die kleinste Höhenlinie, die den Bereich noch erreicht, ihn berührt, hier in der Ecke $x^\star=(1{,}6;\,1{,}2)$. Zieh $x_\mathrm{ref}$ in den Bereich hinein, an eine Kante oder unter den Biss links unten.</span><a href="/img/notes/beschraenkte-optimierung/problem.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<div class="narrator" role="note" data-pose="staunt">
<p>Zieh $x_\mathrm{ref}$ mal langsam waagerecht von links durch den Biss. Mittendrin springt $x^\star$ von einer Ecke des Bisses zur anderen! Ohne Konvexität kann es mehrere lokale Minima geben, und welches das beste ist, kann plötzlich wechseln.</p>
</div>

<div class="merke">

$$
\underset{x}{\min}\ f(x)\quad\text{unter}\quad\left\{\begin{array}{ll}c_i(x)=0,&i\in\mathcal{E}\\c_i(x)\le0,&i\in\mathcal{I}\end{array}\right.
$$

<p>Maximieren, „$\ge$“ und rechte Seiten ungleich null lassen sich in diese Form umschreiben.</p>
</div>

### Zulässiger Bereich und aktive Menge

Alle Punkte, die sämtliche Nebenbedingungen zugleich erfüllen, bilden den zulässigen Bereich

$$
\Omega=\left\{x\in\mathbb{R}^n\;\middle|\;\begin{array}{ll}c_i(x)=0,&i\in\mathcal{E}\\c_i(x)\le0,&i\in\mathcal{I}\end{array}\right\}.
$$

Im Beispiel ist $\Omega$ die Kreisscheibe vom Radius 2 ohne den Biss von $c_2$ und ohne die Kappe oberhalb von $x_2=1{,}2$. Dieser Bereich ist nicht konvex, denn die Verbindungsstrecke zweier Punkte links und rechts des Bisses verlässt ihn.

Für einen zulässigen Punkt $x$ interessiert uns, welche Nebenbedingungen ihn gerade festhalten. Eine Ungleichung heißt aktiv in $x$, wenn sie mit Gleichheit erfüllt ist, $c_i(x)=0$. Der Punkt liegt dann genau auf ihrer Grenze. Gilt dagegen $c_i(x)<0$, heißt sie inaktiv. Gleichungen sind an jedem zulässigen Punkt aktiv. Die Indizes aller aktiven Nebenbedingungen bilden die aktive Menge

$$
\mathcal{A}(x)=\mathcal{E}\cup\{i\in\mathcal{I}\mid c_i(x)=0\}.
$$

<figure class="interactive-figure figure-active">
  <iframe src="/img/notes/beschraenkte-optimierung/aktiv.html" title="Der zulässige Bereich des Beispiels mit einem verschiebbaren Punkt und seiner aktiven Menge" height="640" loading="lazy"></iframe>
  <figcaption><span>Abbildung 2: Der zulässige Bereich $\Omega$ des Beispiels. Zieh den Punkt $x$ herum; nahe einer Grenze oder Ecke rastet er auf ihr ein. Darunter stehen die Werte $c_i(x)$. Im Inneren ist $\mathcal{A}(x)$ leer, auf einer Grenze enthält sie eine Nebenbedingung, in einer Ecke zwei.</span><a href="/img/notes/beschraenkte-optimierung/aktiv.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

Inaktive Nebenbedingungen spielen in der Nähe von $x$ keine Rolle. Ist $c_i(x)<0$, bleibt $c_i$ wegen der Stetigkeit auch in einer kleinen Umgebung von $x$ negativ. Jeder hinreichend kurze Schritt hält diese Nebenbedingung ein, ganz gleich in welche Richtung er geht. Ob ein kurzer Schritt zulässig ist, entscheiden also allein die aktiven Nebenbedingungen.

<div class="narrator" role="note" data-pose="zeigt">
<p>Die aktive Menge sagt, wer gerade an deinem Punkt drückt. Wer inaktiv ist, hat Pause und merkt von kleinen Schritten nichts. Für die Pausierenden werde ich später einfach null sein.</p>
</div>

<div class="merke">
<p>$\mathcal{A}(x)$ enthält alle Gleichungen und die Ungleichungen mit $c_i(x)=0$. Nur sie schränken kurze Schritte von $x$ aus ein.</p>
</div>

### Zulässige Abstiegsrichtungen

Ohne Nebenbedingungen gilt an einem Minimum $x^\star$ einer differenzierbaren Funktion $\nabla f(x^\star)=0$. In Abbildung 1 trifft das nur zu, solange $x_\mathrm{ref}$ im zulässigen Bereich liegt. Sonst liegt $x^\star$ auf dem Rand, und dort ist $\nabla f(x^\star)\ne0$. Bergab ginge es also noch, nur nicht, ohne $\Omega$ zu verlassen.

Wir gehen deshalb von einem zulässigen Punkt $x$ einen kleinen Schritt $s$ und betrachten die Taylorentwicklung erster Ordnung. Für die Zielfunktion gilt

$$
f(x+s)\approx f(x)+\nabla f(x)^\top s .
$$

Der Schritt senkt $f$, wenn $\nabla f(x)^\top s<0$ ist. Solche Richtungen heißen Abstiegsrichtungen. Für eine aktive Nebenbedingung ist $c_i(x)=0$, und es bleibt

$$
c_i(x+s)\approx\underbrace{c_i(x)}_{=\,0}+\nabla c_i(x)^\top s=\nabla c_i(x)^\top s .
$$

Eine Gleichung bleibt in erster Näherung erfüllt, wenn $\nabla c_i(x)^\top s=0$ ist, wenn $s$ also entlang ihrer Grenze zeigt. Eine aktive Ungleichung bleibt erfüllt, wenn $\nabla c_i(x)^\top s\le0$ ist. Weil $\nabla c_i(x)$ in die Richtung zeigt, in der $c_i$ wächst, zeigt er aus dem zulässigen Bereich hinaus. Erlaubt sind alle Richtungen, die mit ihm mindestens einen rechten Winkel bilden.

Ein lokales Minimum kann $x$ nur sein, wenn keine Richtung zugleich zulässig ist und abwärts führt. Abbildung 3 zeigt das für $c_1$ allein.

<figure class="interactive-figure figure-descent">
  <iframe src="/img/notes/beschraenkte-optimierung/abstieg.html" title="Abstiegsrichtungen und zulässige Richtungen an einem Punkt des Kreises, für eine Gleichung oder eine Ungleichung" height="660" loading="lazy"></iframe>
  <figcaption><span>Abbildung 3: Die Nebenbedingung $c_1$ des Beispiels allein, als Gleichung $c_1(x)=0$ (nur der Kreis) oder als Ungleichung $c_1(x)\le0$ (die Scheibe). Die Rose um $x$ zeigt die Abstiegsrichtungen in Blau, die zulässigen Richtungen in Grün und die Richtungen, die beides sind, in Orange. Schieb $x$ über den Kreis: Wo die gestrichelte Höhenlinie durch $x$ den Kreis berührt, verschwindet Orange.</span><a href="/img/notes/beschraenkte-optimierung/abstieg.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<div class="narrator" role="note" data-pose="denkt">
<p>Schalte auf $c_1(x)=0$ und schieb $x$ nach links unten zu $(-0{,}62;\,-1{,}90)$. Kein Orange, obwohl $f$ dort auf dem ganzen Kreis am größten ist! Die erste Ordnung sieht nur, dass es flach ist, nicht ob Tal oder Gipfel. Das klären wir in Kapitel 5.</p>
</div>

Die Näherung erster Ordnung reicht, solange sich die Nebenbedingungen gutartig verhalten. Wann das garantiert ist, klären die Regularitätsbedingungen in Kapitel 4.

<div class="merke">
<p>Am Minimum gibt es kein $s$, das abwärts führt, $\nabla f^\top s<0$, und zugleich zulässig ist: $\nabla c_i^\top s=0$ für Gleichungen und $\nabla c_i^\top s\le0$ für aktive Ungleichungen.</p>
</div>

### Gleichgewicht der Gradienten

Wann gibt es keine zulässige Abstiegsrichtung? Für eine einzelne Nebenbedingung lässt es sich an Abbildung 3 ablesen.

Bei einer Gleichung sind nur die Richtungen entlang der Grenze zulässig. Keine davon führt abwärts, wenn $\nabla f(x)$ ebenfalls senkrecht auf der Grenze steht. Dann sind $\nabla f(x)$ und $\nabla c_1(x)$ parallel, und es gibt eine Zahl $\lambda_1$ mit

$$
\nabla f(x^\star)+\lambda_1\nabla c_1(x^\star)=0 .
$$

Das Vorzeichen von $\lambda_1$ ist dabei beliebig. Bei einer Ungleichung kommen die Richtungen ins Innere hinzu, etwa $s=-\nabla c_1(x^\star)$. Damit auch diese nicht abwärts führt, muss $-\nabla f(x^\star)$ wie $\nabla c_1(x^\star)$ aus dem zulässigen Bereich hinauszeigen. Das Gleichgewicht bekommt ein Vorzeichen:

$$
\nabla f(x^\star)+\lambda_1\nabla c_1(x^\star)=0,\qquad\lambda_1\ge0 .
$$

In Abbildung 3 gilt das am Berührpunkt $(1{,}42;\,1{,}41)$ mit $\lambda_1\approx0{,}63$. Am Punkt $(-0{,}62;\,-1{,}90)$ ist $\lambda_1\approx-3{,}08$. Für die Gleichung ist er deshalb ein Kandidat, für die Ungleichung nicht.

Sind mehrere Nebenbedingungen aktiv, tritt eine Summe an die Stelle des einzelnen Terms. Im Optimum $x^\star=(1{,}6;\,1{,}2)$ des Beispiels sind $c_1$ und $c_3$ aktiv, mit $\nabla c_1(x^\star)=(3{,}2;\,2{,}4)$ und $\nabla c_3(x^\star)=(0;\,1)$. Der negative Gradient der Zielfunktion setzt sich aus beiden zusammen:

$$
-\nabla f(x^\star)=(1{,}6;\,2{,}4)=0{,}5\,\nabla c_1(x^\star)+1{,}2\,\nabla c_3(x^\star).
$$

<figure class="interactive-figure figure-balance">
  <iframe src="/img/notes/beschraenkte-optimierung/gleichgewicht.html" title="Gewichtete Gradienten der aktiven Nebenbedingungen in der Ecke von Hand gegen den negativen Gradienten abgleichen" height="740" loading="lazy"></iframe>
  <figcaption><span>Abbildung 4: Die Ecke $x^\star$ des Beispiels. Stell $\lambda_1$ und $\lambda_3$ so ein, dass die grünen Pfeile genau an der Spitze von $-\nabla f(x^\star)$ enden; das gelingt nur mit $\lambda_1=0{,}5$ und $\lambda_3=1{,}2$. Ziehst du $-\nabla f(x^\star)$ aus dem schattierten Kegel, bleibt mit $\lambda\ge0$ immer ein Rest, und der blaue Pfeil $d$ zeigt eine Richtung, die zulässig ist und abwärts führt.</span><a href="/img/notes/beschraenkte-optimierung/gleichgewicht.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

<div class="narrator" role="note" data-pose="schiebt">
<p>Da ist mein Name: Lagrange-Multiplikator. Ich stemme mich von außen gegen meine Grenze, damit der Zug von $-\nabla f$ ins Leere geht. Wie fest ich drücke, ist mein Wert $\lambda_i$.</p>
</div>

Alle Fälle passen in eine Gleichung, wenn jede Nebenbedingung einen Multiplikator $\lambda_i$ bekommt und die inaktiven $\lambda_i=0$ erhalten. Die linke Seite ist dann der Gradient nach $x$ der Lagrange-Funktion

$$
\mathcal{L}(x,\lambda)=f(x)+\sum_{i\in\mathcal{E}\cup\mathcal{I}}\lambda_i\,c_i(x).
$$

Aus der Suche am Rand wird so die Suche nach einem Punkt, an dem eine Funktion ohne Nebenbedingungen stationär ist, jedenfalls bezüglich $x$. Was die Multiplikatoren bedeuten, zeigt Kapitel 2. Dass es sie an jedem lokalen Minimum gibt, ist allerdings nur gesichert, wenn die Nebenbedingungen regulär sind, etwa wenn die Gradienten der aktiven Nebenbedingungen linear unabhängig sind. Was sonst schiefgehen kann, zeigt Kapitel 4.

<div class="merke">

$$
\nabla_x\mathcal{L}(x^\star,\lambda^\star)=\nabla f(x^\star)+\sum_i\lambda_i^\star\nabla c_i(x^\star)=0
$$

<p>mit $\lambda_i^\star\ge0$ für Ungleichungen und $\lambda_i^\star=0$ für inaktive Nebenbedingungen.</p>
</div>

## Die Lagrange-Funktion und ihre Multiplikatoren

### Definition der Lagrange-Funktion

### Was die Multiplikatoren bedeuten

### Sensitivität des Optimalwerts

### Stark aktiv, schwach aktiv, inaktiv

## KKT-Bedingungen: Optimalität erster Ordnung

### Stationarität

### Primale Zulässigkeit

### Duale Zulässigkeit

### Komplementarität

### Strikte Komplementarität

## Geometrie der Zulässigkeit und Regularität

### Tangentenkegel und linearisierte Richtungen

### Das Farkas-Lemma

### LICQ und eindeutige Multiplikatoren

### MFCQ und beschränkte Multiplikatoren

### Lineare Nebenbedingungen

### Der Normalenkegel

## Optimalitätsbedingungen zweiter Ordnung

### Der kritische Kegel

### Notwendige Bedingung zweiter Ordnung

### Hinreichende Bedingung zweiter Ordnung

### Die projizierte Hesse-Matrix

## Dualität

### Duale Funktion und duales Problem

### Konkavität der dualen Funktion

### Schwache und starke Dualität

### Wolfe-Dualität

### Schattenpreise
