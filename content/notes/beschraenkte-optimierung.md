---
title: "Konvexe Optimierung unter Nebenbedingungen – Lagrange-Dualität und KKT-Bedingungen"
date: 2026-11-08
description: "Lagrange-Multiplikatoren anschaulich: vom Kräftegleichgewicht am Rand über die duale Funktion zu den KKT-Bedingungen und Schattenpreisen, erzählt von Lambda und mit Abbildungen zum Ausprobieren."
tags: [optimierung, dualität, interaktiv]
featured: false
draft: false
styles: [/assets/site/course.css, /assets/notes/beschraenkte-optimierung/narrator.css]
scripts: [/assets/site/course.js, /assets/notes/beschraenkte-optimierung/narrator.js]
---

## Das Problem

Stellen wir uns vor, wir möchten eine Zielfunktion möglichst klein machen, dürfen die Entscheidungsvariablen dabei aber nicht beliebig verändern. Vielleicht ist eine Leistung begrenzt, eine Kapazität darf nicht überschritten werden oder bestimmte Kombinationen von Variablen sind unzulässig. Wir suchen also nicht einfach den kleinsten Wert der Zielfunktion, sondern den kleinsten Wert, den wir unter Einhaltung aller Nebenbedingungen tatsächlich erreichen können.

<div class="narrator" role="note" data-pose="zeigt">
<p>Hallo, ich bin Lambda, genauer gesagt einer der Lagrange-Multiplikatoren $\lambda_i$, um die es hier geht. Offiziell trete ich erst auf, wenn klar ist, warum ein Optimum am Rand liegen kann. Bis dahin führe ich durch die Notiz und sage Bescheid, sobald ich gebraucht werde.</p>
</div>

Mathematisch betrachten wir zunächst das Optimierungsproblem

$$
\begin{align*}
\underset{x\in\mathbb{R}^n}{\min}\quad &f(x)\\
\text{unter}\quad &Ax\le b,
\end{align*}
$$

wobei $x\in\mathbb{R}^n$ die Entscheidungsvariablen enthält und die Matrix $A\in\mathbb{R}^{m\times n}$ zusammen mit dem Vektor $b\in\mathbb{R}^m$ die $m$ Nebenbedingungen festlegt. Einzeln lauten sie $a_i^\top x\le b_i$ für $i=1,\dots,m$, wobei $a_i^\top$ die $i$-te Zeile von $A$ und $b_i$ der $i$-te Eintrag von $b$ ist. Die Menge aller Punkte, die diese Bedingungen erfüllen, bezeichnen wir als zulässige Menge

$$
\mathcal{X}=\{x\in\mathbb{R}^n\mid Ax\le b\}.
$$

Wir nehmen an, dass $f$ stetig differenzierbar und konvex ist. Auch die zulässige Menge ist konvex, denn jede affine Ungleichung beschreibt einen Halbraum, und der Schnitt solcher Halbräume bleibt konvex. Das ist eine entscheidende Eigenschaft.

Eine Menge $\mathcal{M}\subseteq\mathbb{R}^n$ heißt konvex, wenn sie mit zwei beliebigen Punkten $x^{(1)}$ und $x^{(2)}$ auch deren gesamte Verbindungsstrecke enthält. Formal lautet die Definition

$$
x^{(1)},x^{(2)}\in\mathcal{M},\quad\theta\in[0,1]
\quad\Longrightarrow\quad
\theta x^{(1)}+(1-\theta)x^{(2)}\in\mathcal{M}.
$$

Für $\theta=1$ ergibt sich $x^{(1)}$, für $\theta=0$ ergibt sich $x^{(2)}$, und die Werte dazwischen durchlaufen die Strecke.

Ein einzelner Halbraum $\mathcal{H}_i=\{x\mid a_i^\top x\le b_i\}$ ist konvex. Seien $x^{(1)},x^{(2)}\in\mathcal{H}_i$ und $\tilde x=\theta x^{(1)}+(1-\theta)x^{(2)}$ ein Punkt ihrer Verbindungsstrecke. Setzen wir $\tilde x$ in die linke Seite der Ungleichung ein, erhalten wir

$$
a_i^\top\tilde x
=\theta\,\underbrace{a_i^\top x^{(1)}}_{\le\,b_i}+(1-\theta)\,\underbrace{a_i^\top x^{(2)}}_{\le\,b_i}
\le\theta\,b_i+(1-\theta)\,b_i=b_i ,
$$

also $\tilde x\in\mathcal{H}_i$. Die Abschätzung gilt, weil $\theta\ge0$ und $1-\theta\ge0$ sind.

Die zulässige Menge ist der Schnitt der $m$ Halbräume, $\mathcal{X}=\mathcal{H}_1\cap\mathcal{H}_2\cap\dots\cap\mathcal{H}_m$. Liegen $x^{(1)}$ und $x^{(2)}$ in $\mathcal{X}$, liegen sie in jedem $\mathcal{H}_i$. Nach der eben gezeigten Rechnung liegt dann auch ihre Verbindungsstrecke in jedem $\mathcal{H}_i$ und damit in $\mathcal{X}$. Die zulässige Menge ist also konvex.

<div class="narrator" role="note" data-pose="zeigt">
<p>Probier es aus: Punkte auf der falschen Seite fliegen mitsamt ihren Verbindungen raus, alle übrigen Verbindungen bleiben drin. Klick selbst Punkte in die Fläche. Zwei zulässige Punkte, deren Strecke hinausführt, wirst du nicht finden.</p>
</div>

<figure class="interactive-figure figure-convex">
  <iframe src="/img/notes/beschraenkte-optimierung/konvex.html" title="Die zulässige Menge als Schnitt von vier Halbräumen, mit Punkten und ihren Verbindungsstrecken" height="720" loading="lazy"></iframe>
  <figcaption><span>Abbildung 1: Die vier Halbräume $\mathcal{H}_i$ des Beispiels werden nacheinander geschnitten, bis $\mathcal{X}=\mathcal{H}_1\cap\dots\cap\mathcal{H}_4$ übrig bleibt, das Viereck ABCD der folgenden Abbildungen. Schraffiert ist jeweils die unzulässige Seite.</span><a href="/img/notes/beschraenkte-optimierung/konvex.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

Bei einem konvexen Optimierungsproblem ist jedes lokale Minimum zugleich ein globales Minimum. Wenn wir also einen Punkt finden, an dem keine zulässige Verbesserung mehr möglich ist, haben wir bereits eine global optimale Lösung gefunden. Ist die Zielfunktion darüber hinaus strikt konvex, ist diese Lösung, sofern sie existiert, sogar eindeutig.

## Zulässige Richtungen

Weshalb sind die Nebenbedingungen bei der Suche nach dem Optimum überhaupt ein Problem? Ohne Nebenbedingungen könnten wir einfach den Gradienten der Zielfunktion betrachten. An einem Minimum $x^\star$ einer differenzierbaren Funktion auf $\mathbb{R}^n$ muss

$$
\nabla f(x^\star)=0
$$

gelten. Der Gradient zeigt in die Richtung des stärksten lokalen Anstiegs, während der negative Gradient $-\nabla f(x)$ in die Richtung des stärksten lokalen Abstiegs zeigt. Ist der Gradient nicht null, lässt sich die Zielfunktion also durch eine hinreichend kleine Bewegung in Richtung des negativen Gradienten verringern.

Sobald Nebenbedingungen hinzukommen, stimmt diese Überlegung nur noch eingeschränkt. Das Optimum kann beispielsweise auf dem Rand der zulässigen Menge liegen. Dort muss der Gradient keineswegs verschwinden. Es kann durchaus eine Richtung geben, in der die Zielfunktion weiter sinken würde. Wenn diese Richtung allerdings aus der zulässigen Menge hinausführt, dürfen wir ihr nicht folgen.

Genau darin liegt der Unterschied zwischen beschränkter und unbeschränkter Optimierung. Wir suchen nicht mehr nach einem Punkt, an dem überhaupt keine Abstiegsrichtung existiert, sondern nach einem Punkt, an dem keine zulässige Abstiegsrichtung mehr existiert.

<div class="narrator" role="note" data-pose="denkt">
<p>Merk dir das Wort <em>zulässig</em>. Ab hier fragen wir nicht mehr „Geht es noch bergab?“, sondern „Geht es noch bergab, ohne über den Zaun zu steigen?“</p>
</div>

Um diese Aussage mathematisch zu fassen, betrachten wir einen zulässigen Punkt $x^\star$ und eine kleine Bewegung in Richtung $d$, sodass

$$
x=x^\star+\varepsilon d,\qquad \varepsilon>0
$$

gilt. Eine Nebenbedingung heißt aktiv, wenn sie am betrachteten Punkt mit Gleichheit erfüllt ist, also $a_i^\top x^\star=b_i$ gilt. Geometrisch liegt der Punkt dann genau auf der entsprechenden Begrenzung.

Der Vektor $a_i$ steht senkrecht auf dieser Begrenzung und zeigt nach außen in den unzulässigen Bereich. Das ist keine zusätzliche Annahme, sondern folgt aus der Richtung des Ungleichheitszeichens in $a_i^\top x\le b_i$. Der Vektor $a_i$ ist der Gradient der linken Seite $a_i^\top x$ und zeigt deshalb in die Richtung, in der dieser Ausdruck am schnellsten wächst. Wachsende Werte von $a_i^\top x$ führen aber über die Schranke $b_i$ hinaus. Hätten wir dieselbe Begrenzung als $-a_i^\top x\ge-b_i$ geschrieben, wäre der Gradient der linken Seite $-a_i$, und er würde nach innen zeigen. Wir schreiben deshalb alle Nebenbedingungen in der Form „$\le$“.

Damit wir bei einer aktiven Nebenbedingung nicht in den unzulässigen Bereich gelangen, muss für die Bewegung

$$
a_i^\top(x^\star+\varepsilon d)\le b_i
$$

gelten. Multiplizieren wir die Klammer aus, steht dort $a_i^\top x^\star+\varepsilon\,a_i^\top d\le b_i$. Da der Ausgangspunkt bereits auf der Begrenzung liegt, gilt $a_i^\top x^\star=b_i$. Ziehen wir diese Zahl auf beiden Seiten ab, bleibt

$$
\varepsilon\,a_i^\top d\le0 .
$$

Nun teilen wir beide Seiten durch $\varepsilon$. Eine Ungleichung behält ihre Richtung, wenn beide Seiten durch dieselbe positive Zahl geteilt werden; nur bei einer negativen Zahl müsste das Ungleichheitszeichen umgedreht werden. Wegen $\varepsilon>0$ dürfen wir also teilen, und rechts wird aus $0/\varepsilon$ wieder $0$:

$$
\frac{\varepsilon\,a_i^\top d}{\varepsilon}\le\frac{0}{\varepsilon}
\quad\Longleftrightarrow\quad
a_i^\top d\le0 .
$$

Für diese eine aktive Nebenbedingung fällt die Schrittweite heraus, weil sie affin ist: Ob sie verletzt wird, entscheidet allein das Vorzeichen von $a_i^\top d$. Wie weit wir in Richtung $d$ gehen dürfen, begrenzen die übrigen Nebenbedingungen.

<figure class="static-figure full-width">
  <img src="/img/notes/beschraenkte-optimierung/richtungen.svg" alt="Zwei Felder mit derselben schrägen Grenze, links zulässig, rechts unzulässig. Links liegt der Punkt x Stern auf der Grenze; die Normale a i zeigt nach außen, ein gestrichelter Halbkreis markiert die zulässigen Richtungen. Die Richtung d1 zeigt nach innen, d2 entlang der Grenze, d3 nach außen und ist durchgestrichen. Rechts liegt der Punkt mit positivem Abstand vor der Grenze, ein kleiner Kreis von Pfeilen in alle Richtungen ist vollständig zulässig." width="790" height="330" loading="lazy">
  <figcaption>Abbildung 2: Links eine aktive Nebenbedingung. Zulässig sind genau die Richtungen mit $a_i^\top d\le0$, also der Halbkreis auf der Seite der zulässigen Menge, einschließlich der Richtungen entlang der Grenze. Rechts eine inaktive Nebenbedingung: Für einen hinreichend kurzen Schritt ist jede Richtung zulässig.</figcaption>
</figure>

Der Ausdruck $a_i^\top d$ beschreibt also, ob die gewählte Richtung nach außen, nach innen oder entlang der Begrenzung zeigt. Eine positive Zahl würde bedeuten, dass wir die aktive Nebenbedingung verletzen. Eine nichtpositive Zahl bedeutet dagegen, dass wir bezüglich dieser Nebenbedingung im zulässigen Bereich bleiben.

Bei einer inaktiven Nebenbedingung gilt $a_i^\top x^\star<b_i$. Der Punkt besitzt dann noch einen positiven Abstand zur Begrenzung. Solange wir nur einen hinreichend kleinen Schritt ausführen, schränkt diese Nebenbedingung die Richtung der Bewegung zunächst nicht ein.

Nun müssen wir noch feststellen, ob eine zulässige Bewegung die Zielfunktion verbessert. Für eine kleine Schrittweite $\varepsilon$ können wir die Zielfunktion durch eine Taylorentwicklung erster Ordnung beschreiben, sodass

$$
f(x^\star+\varepsilon d)
=
f(x^\star)
+\varepsilon\nabla f(x^\star)^\top d
+o(\varepsilon)
$$

gilt. Entscheidend ist das Skalarprodukt $\nabla f(x^\star)^\top d$. Ist es negativ, verringert sich die Zielfunktion für hinreichend kleine positive Schritte. Am Optimum darf dies in keiner zulässigen Richtung möglich sein. Deshalb muss dort

$$
\boxed{
\nabla f(x^\star)^\top d\ge0
\quad
\text{für alle zulässigen Richtungen }d
}
$$

gelten.

Diese Bedingung beschreibt bereits, was wir eigentlich suchen. Sie ist allerdings noch nicht besonders praktisch, weil wir dafür sämtliche zulässigen Richtungen untersuchen müssten. Eleganter wäre eine Gleichung, die direkt mit den Gradienten der Zielfunktion und der Nebenbedingungen arbeitet.

## Der Normalenkegel

Eine solche Gleichung liefert uns die Geometrie der zulässigen Menge. Jede aktive Nebenbedingung besitzt mit $a_i$ einen nach außen gerichteten Normalenvektor. Die zulässigen Richtungen dürfen mit diesen Normalen kein positives Skalarprodukt bilden.

Wenn nun am Optimum keine zulässige Abstiegsrichtung mehr existiert, muss der negative Zielfunktionsgradient durch eine nichtnegative Kombination der aktiven Randnormalen darstellbar sein. Für affine Nebenbedingungen folgt dies aus dem Farkas-Lemma.

Das ist keine Definition, sondern eine Folgerung, die sich begründen lässt. Am einfachsten sieht man sie bei einer einzigen aktiven Nebenbedingung. Die zulässigen Richtungen bilden dann den Halbraum $a_i^\top d\le0$ aus Abbildung 2. Zu ihm gehören insbesondere zwei entgegengesetzte Richtungen $t$ und $-t$ entlang der Grenze, für die $a_i^\top t=0$ gilt. Am Optimum muss sowohl $\nabla f(x^\star)^\top t\ge0$ als auch $\nabla f(x^\star)^\top(-t)\ge0$ gelten, also $\nabla f(x^\star)^\top t=0$. Der Gradient steht damit senkrecht auf der Grenze und ist parallel zu ihrer Normalen, sodass $-\nabla f(x^\star)=\lambda_i a_i$ für eine Zahl $\lambda_i$ gilt. Auch die Richtung $d=-a_i$, die senkrecht nach innen zeigt, ist zulässig. Aus $\nabla f(x^\star)^\top(-a_i)=\lambda_i\,a_i^\top a_i\ge0$ folgt wegen $a_i^\top a_i>0$ schließlich $\lambda_i\ge0$.

Bei mehreren aktiven Nebenbedingungen argumentieren wir umgekehrt. Bezeichnen wir die Menge der aktiven Nebenbedingungen mit $\mathcal{A}(x^\star)$, bilden alle nichtnegativen Kombinationen ihrer Normalen einen Kegel, den Normalenkegel

$$
K=\left\{\sum_{i\in\mathcal{A}(x^\star)}\lambda_i a_i\;\middle|\;\lambda_i\ge0\right\}.
$$

Angenommen, $-\nabla f(x^\star)$ läge nicht in $K$. Dann gibt es in $K$ einen Punkt $k$, der $-\nabla f(x^\star)$ am nächsten liegt, und wir betrachten die Differenz

$$
d=-\nabla f(x^\star)-k\ne0 .
$$

Diese Richtung ist zulässig. Wäre nämlich $a_i^\top d>0$ für eine aktive Normale, käme der Kegelpunkt $k+\tau a_i$ für ein kleines $\tau>0$ noch näher an $-\nabla f(x^\star)$ heran, im Widerspruch zur Wahl von $k$. Aus demselben Grund gilt $k^\top d=0$, denn auch die gestreckten oder gestauchten Punkte $(1+\tau)k$ liegen für kleine $\tau$ beider Vorzeichen im Kegel. Damit erhalten wir

$$
\nabla f(x^\star)^\top d=-(k+d)^\top d=-k^\top d-\|d\|^2=-\|d\|^2<0 .
$$

Die Richtung $d$ wäre also eine zulässige Abstiegsrichtung, und $x^\star$ könnte nicht optimal sein. Am Optimum muss $-\nabla f(x^\star)$ deshalb im Normalenkegel liegen. Umgekehrt schließt eine solche Darstellung jede zulässige Abstiegsrichtung aus, denn für jede zulässige Richtung $d$ ist dann $\nabla f(x^\star)^\top d=-\sum_i\lambda_i\,a_i^\top d\ge0$. Genau diese Gleichwertigkeit besagt das Farkas-Lemma für affine Nebenbedingungen. In Abbildung 3 lässt sie sich ausprobieren.

<div class="narrator" role="note" data-pose="staunt">
<p>Gemerkt? Die Zahlen $\lambda_i$ in diesem Beweis, das sind wir. Einen Namen bekommen wir im nächsten Teil.</p>
</div>

Für die aktiven Nebenbedingungen erhalten wir damit

$$
\boxed{
-\nabla f(x^\star)
=
\sum_{i\in\mathcal{A}(x^\star)}
\lambda_i^\star a_i,
\qquad
\lambda_i^\star\ge0.
}
$$

Die Zahlen $\lambda_i^\star$ sind zunächst einfach Gewichte. Sie bestimmen, wie stark die Normalen der einzelnen aktiven Begrenzungen zur Darstellung des negativen Zielfunktionsgradienten beitragen.

## Das Kräftegleichgewicht

Die Gleichung $-\nabla f(x^\star)=\sum_{i\in\mathcal{A}(x^\star)}\lambda_i^\star a_i$ macht die geometrische Situation verständlich. Der negative Gradient $-\nabla f(x^\star)$ zeigt in die Richtung, in der die Zielfunktion am stärksten abnehmen würde. Im Randoptimum zeigt diese Richtung, sofern der Gradient nicht null ist, aus der zulässigen Menge hinaus. Die aktiven Begrenzungen verhindern, dass wir dieser Richtung folgen. Ihre nach außen gerichteten Normalen lassen sich so gewichten, dass ihre Summe genau den negativen Zielfunktionsgradienten ergibt.

<div class="narrator" role="note" data-pose="zeigt">
<p>Jetzt bist du dran: In Abbildung 3 liegt das Optimum in der Ecke C, die Kanten BC und CD sind aktiv. Stell mit den beiden Reglern unsere Gewichte ein. Die grünen Pfeile werden aneinandergesetzt, und wenn ihre Spitze genau auf der von $-\nabla f(x^\star)$ landet, verschwindet der orangefarbene Rest. Ziehst du $-\nabla f(x^\star)$ aus dem schattierten Kegel heraus, gelingt das mit $\lambda\ge0$ nicht mehr, und der blaue Pfeil zeigt, wo es noch zulässig bergab ginge.</p>
</div>

<figure class="interactive-figure figure-balance">
  <iframe src="/img/notes/beschraenkte-optimierung/gleichgewicht.html" title="Gewichtete Randnormalen in der Ecke C von Hand gegen den negativen Gradienten abgleichen" height="805" loading="lazy"></iframe>
  <figcaption><span>Abbildung 3: Die Ecke C des Vierecks aus Abbildung 1 mit den aktiven Kanten BC und CD. Mit $\lambda_{BC}\approx1{,}16$ und $\lambda_{CD}\approx1{,}30$ ergeben die gewichteten Normalen genau $-\nabla f(x^\star)$. Die Gewichte sind eindeutig, weil die beiden Normalen linear unabhängig sind.</span><a href="/img/notes/beschraenkte-optimierung/gleichgewicht.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

Stellen wir die Gleichung um, wird daraus

$$
\boxed{
\nabla f(x^\star)
+
\sum_{i\in\mathcal{A}(x^\star)}
\lambda_i^\star a_i=0.
}
$$

Wir können uns das als Kräftegleichgewicht vorstellen. Die Richtung $-\nabla f(x^\star)$ entspricht dem Zug zu kleineren Zielfunktionswerten. Die Begrenzungen halten diesem Zug mit den entgegengesetzt gerichteten Vektoren $-\lambda_i^\star a_i$ entgegen. Im Optimum sind diese Beiträge genau so groß, dass sich alle Vektoren ausgleichen.

Dabei ist wichtig, dass die Begrenzungen keine tatsächlichen mechanischen Kräfte ausüben. Das Kräftegleichgewicht ist eine geometrische Interpretation der Optimalitätsbedingung. Die Zahlen $\lambda_i^\star$ beschreiben, wie stark die jeweilige Randnormale mathematisch gewichtet werden muss, damit dieses Gleichgewicht entsteht.

Diese Gewichte nennen wir Lagrange-Multiplikatoren. Sie entstehen also nicht aus einer willkürlichen Umformung der Zielfunktion, sondern unmittelbar aus der Frage, weshalb ein Randpunkt trotz eines von null verschiedenen Zielfunktionsgradienten optimal sein kann.

<div class="narrator" role="note" data-pose="schiebt">
<p>Da ist mein Name: Lagrange-Multiplikator. Am liebsten stelle ich mir vor, dass ich mich von außen gegen meine Grenze stemme, damit der Zug von $-\nabla f$ ins Leere geht. Wie fest ich drücke, ist mein Wert $\lambda_i$.</p>
</div>

Ein einfaches geometrisches Bild hilft dabei. Nehmen wir an, die Zielfunktion sei quadratisch, beispielsweise

$$
f(x)=\frac12(x-x_{\mathrm{ref}})^\top Q(x-x_{\mathrm{ref}}),
\qquad Q\succ0.
$$

Ihr unbeschränkter Minimierer ist $x_{\mathrm{ref}}$, und der Gradient lautet

$$
\nabla f(x)=Q(x-x_{\mathrm{ref}}).
$$

In zwei Dimensionen bilden die Höhenlinien einer solchen Zielfunktion Ellipsen um $x_{\mathrm{ref}}$. Liegt $x_{\mathrm{ref}}$ außerhalb der zulässigen Menge, können wir ihn nicht erreichen. Stattdessen wird das Optimum dort liegen, wo die kleinste noch erreichbare Höhenellipse die zulässige Menge berührt. An einer einzelnen aktiven Kante ist der Gradient der Zielfunktion dann parallel zur Normalen dieser Kante.

Liegt das Optimum dagegen in einer Ecke, können mehrere Nebenbedingungen gleichzeitig aktiv sein. Der Zielfunktionsgradient muss dann nicht zu einer einzelnen Randnormalen parallel sein. Entscheidend ist vielmehr, dass er durch eine nichtnegative Kombination der aktiven Normalen ausgeglichen werden kann. Genau dies beschreibt unsere Gleichung.

<figure class="static-figure full-width">
  <img src="/img/notes/beschraenkte-optimierung/lagen.svg" alt="Drei Bilder des Vierecks ABCD mit Höhenellipsen der Zielfunktion. Links liegt das Ziel im Inneren und ist selbst das Optimum. In der Mitte liegt das Ziel rechts außerhalb, die kleinste erreichbare Ellipse berührt die Kante BC, und zwei gleich lange Pfeile minus Gradient nach außen und minus lambda mal a nach innen heben sich auf. Rechts liegt das Ziel rechts oben außerhalb, das Optimum ist die Ecke C; minus Gradient zeigt in den schattierten Normalenkegel, zwei grüne Pfeile zeigen nach innen." width="790" height="310" loading="lazy">
  <figcaption>Abbildung 4: Das Viereck ABCD mit $f(x)=\tfrac12(x-x_\mathrm{ref})^\top Q(x-x_\mathrm{ref})$, wobei $Q$ die Eigenwerte $1$ und $3$ hat und um $-25^\circ$ gedreht ist, für drei Ziele. Links liegt $x_\mathrm{ref}=(0{,}2;\,0{,}3)$ im Inneren, das Optimum ist $x_\mathrm{ref}$ selbst, und alle Multiplikatoren sind null. In der Mitte, $x_\mathrm{ref}=(2{,}8;\,1{,}2)$, berührt die Höhenellipse durch $x^\star$ die Kante BC; $-\nabla f(x^\star)$ steht senkrecht auf ihr und wird von $-\lambda_{BC}a_{BC}$ mit $\lambda_{BC}\approx0{,}34$ aufgehoben. Rechts, $x_\mathrm{ref}=(3{,}4;\,2{,}3)$, liegt das Optimum in der Ecke C. Dort zeigt $-\nabla f(x^\star)$ in den Normalenkegel der Kanten BC und CD, ohne zu einer der beiden Normalen parallel zu sein, und beide Multiplikatoren sind positiv. Die Pfeile sind in jedem Bild so skaliert, dass $-\nabla f(x^\star)$ gleich lang erscheint.</figcaption>
</figure>

## Die Lagrange-Funktion

Damit stellt sich die nächste Frage. Können wir dieses Gleichgewicht direkt in die Optimierung einbauen, ohne die aktiven Nebenbedingungen vorher kennen zu müssen?

Die Idee ist, rückwärts zu denken. Die Gleichgewichtsbedingung $\nabla f(x^\star)+\sum_i\lambda_i^\star a_i=0$ sieht aus wie die Bedingung „Gradient gleich null“ der unbeschränkten Optimierung, nur eben für eine Funktion, deren Gradient $\nabla f(x)+\sum_i\lambda_i a_i$ lautet. Gibt es eine solche Funktion, können wir ihren Gradienten einfach null setzen.

Um sie zu finden, brauchen wir nur zwei Rechenregeln. Erstens ist der Gradient einer Summe die Summe der Gradienten, und ein konstanter Faktor wie $\lambda_i$ bleibt beim Ableiten stehen. Zweitens besitzt jeder Nebenbedingungsausdruck einen konstanten Gradienten, da er affin ist,

$$
\nabla_x(a_i^\top x-b_i)=a_i .
$$

Das Absolutglied $b_i$ fällt beim Ableiten weg. Multiplizieren wir also jeden Nebenbedingungsausdruck $a_i^\top x-b_i$ mit seinem Gewicht $\lambda_i$ und addieren alles zur Zielfunktion, ergibt sich

$$
\nabla_x\Bigl(f(x)+\sum_{i}\lambda_i(a_i^\top x-b_i)\Bigr)
=\nabla f(x)+\sum_{i}\lambda_i\,\nabla_x(a_i^\top x-b_i)
=\nabla f(x)+\sum_{i}\lambda_i a_i .
$$

Jeder Summand $\lambda_i(a_i^\top x-b_i)$ steuert genau den Beitrag $\lambda_i a_i$ zum Gradienten bei. Der Gradient der neuen Funktion ist damit exakt die linke Seite unserer Gleichgewichtsbedingung. Wir haben die Funktion gewissermaßen aus dem Gradienten zurückgewonnen, den sie haben soll.

Zwei Dinge fallen dabei auf. Die Summe läuft jetzt über alle $m$ Nebenbedingungen und nicht nur über die aktiven. Das passt zur Gleichgewichtsbedingung, solange die Multiplikatoren der inaktiven Nebenbedingungen null sind; weshalb das am Optimum automatisch so ist, zeigt der Teil „Komplementarität“. Außerdem hätten wir $b_i$ für den Gradienten gar nicht gebraucht. Wir behalten es trotzdem, weil der Ausdruck $a_i^\top x-b_i$ dann anzeigt, auf welcher Seite der Begrenzung ein Punkt liegt. Das wird im nächsten Teil wichtig.

Wir definieren die Lagrange-Funktion

$$
\boxed{
\mathcal{L}(x,\lambda)
=
f(x)+\sum_{i=1}^m\lambda_i(a_i^\top x-b_i)
=
f(x)+\lambda^\top(Ax-b),
\qquad\lambda\ge0.
}
$$

Ihr Gradient bezüglich der Entscheidungsvariablen ist

$$
\nabla_x\mathcal{L}(x,\lambda)
=
\nabla f(x)+A^\top\lambda.
$$

Damit können wir unsere geometrische Bedingung sehr kompakt als

$$
\boxed{
\nabla_x\mathcal{L}(x^\star,\lambda^\star)=0
}
$$

schreiben.

## Die Wand aus Multiplikatoren

Der Vorteil der Lagrange-Funktion liegt auf der Hand. Anstatt die Zielfunktion und die einzelnen Begrenzungen getrennt zu behandeln, betrachten wir eine einzige Funktion, in der ihre Gradienten gemeinsam auftreten. Allerdings ist damit noch nicht erklärt, warum diese Funktion die Nebenbedingungen tatsächlich berücksichtigt. Es wäre schließlich denkbar, dass wir die Lagrange-Funktion minimieren und dadurch einen unzulässigen Punkt erhalten.

Um das zu verstehen, sehen wir uns an, welche Rolle ein einzelner Multiplikator außerhalb der Gleichgewichtsbedingung spielt. Zur Nebenbedingung $a_i^\top x\le b_i$ gehört in der Lagrange-Funktion der Term

$$
\lambda_i(a_i^\top x-b_i).
$$

Der Ausdruck $a_i^\top x-b_i$ verrät uns, ob die Nebenbedingung erfüllt ist. Ist er negativ, liegt der Punkt auf der zulässigen Seite der Begrenzung. Ist er null, liegt der Punkt direkt auf der Begrenzung. Ist er positiv, wird die Nebenbedingung verletzt.

Der Multiplikator bestimmt nun, mit welchem Gewicht dieser Ausdruck in die Lagrange-Funktion eingeht. Bei einer Verletzung ist der Term positiv und wächst mit $\lambda_i$. Man kann $\lambda_i$ deshalb zunächst als einen Preis verstehen, der je Einheit Nebenbedingungsverletzung berücksichtigt wird.

Diese Interpretation verlangt allerdings etwas Vorsicht. Für zulässige Punkte sind die Nebenbedingungsausdrücke nichtpositiv. Deshalb gilt dort

$$
\mathcal{L}(x,\lambda)\le f(x).
$$

Die Lagrange-Funktion ist für ein festes $\lambda$ also keine gewöhnliche Strafkostenfunktion, bei der jede Abweichung von einer Vorgabe zu zusätzlichen positiven Kosten führt. Zulässige Punkte können durch die Nebenbedingungsterme vielmehr einen kleineren Wert als die ursprüngliche Zielfunktion erhalten.

Die eigentliche Durchsetzung der Nebenbedingungen entsteht erst dann, wenn wir die Multiplikatoren nicht fest vorgeben, sondern selbst optimieren. Dazu halten wir zunächst $x$ fest und betrachten

$$
\underset{\lambda\ge0}{\sup}\mathcal{L}(x,\lambda).
$$

Ist $x$ zulässig, sind sämtliche Nebenbedingungsausdrücke nichtpositiv. Eine Vergrößerung der Multiplikatoren kann die Lagrange-Funktion dann nicht erhöhen. Der größte Wert wird beispielsweise bei $\lambda=0$ erreicht und entspricht genau $f(x)$.

Verletzt $x$ dagegen mindestens eine Nebenbedingung, ist der zugehörige Ausdruck positiv. Wir können dessen Multiplikator beliebig vergrößern und dadurch den Wert der Lagrange-Funktion unbegrenzt steigen lassen. Zusammen ergibt sich

$$
\boxed{
\underset{\lambda\ge0}{\sup}\mathcal{L}(x,\lambda)
=
\begin{cases}
f(x),&Ax\le b,\\
+\infty,&\text{sonst}.
\end{cases}
}
$$

Das ist der entscheidende Zusammenhang. Die Maximierung über die Multiplikatoren sorgt dafür, dass zulässige Punkte mit ihrem ursprünglichen Zielfunktionswert bewertet werden, während unzulässige Punkte einen unendlich großen Wert erhalten. Die Nebenbedingungen werden dadurch exakt erzwungen, obwohl sie nicht mehr ausdrücklich bei der Minimierung über $x$ stehen müssen.

Wir können das ursprüngliche Optimierungsproblem daher gleichwertig durch

$$
\boxed{
p^\star
=
\underset{x\in\mathbb{R}^n}{\min}
\underset{\lambda\ge0}{\sup}\mathcal{L}(x,\lambda)
}
$$

beschreiben, sofern das Minimum angenommen wird. Der optimale Zielfunktionswert wird mit $p^\star$ bezeichnet.

<div class="narrator" role="note" data-pose="zeigt">
<p>Für die nächsten Bilder nehme ich das kleinste Beispiel, das ich kenne: eine Variable, eine Grenze $x\le1$ und $f(x)=\tfrac12(x-2)^2$. Im Teil „Ein Beispiel zum Nachrechnen“ rechnen wir es vollständig durch. In Abbildung 5 drehe ich langsam an $\lambda$, und rechts der Grenze wächst eine Wand.</p>
</div>

<figure class="static-figure">
  <img src="/img/notes/beschraenkte-optimierung/wand.gif" alt="Animation: Über der x-Achse steht die gestrichelte Parabel f; links von x gleich 1 ist der zulässige Bereich grün. Mit wachsendem lambda drehen sich die orangefarbenen Kurven der Lagrange-Funktion um den Punkt bei x gleich 1. Ihr Maximum, schwarz, bleibt links gleich f und steigt rechts immer steiler an, bis am Ende eine senkrechte Wand mit dem Hinweis plus unendlich steht." width="790" height="430" loading="lazy">
  <figcaption>Abbildung 5: $\mathcal{L}(x,\lambda)=\tfrac12(x-2)^2+\lambda(x-1)$ für wachsendes $\lambda$. Alle Kurven gehen durch den Punkt $(1,f(1))$, weil der Nebenbedingungsausdruck dort null ist. Links davon liegen sie unter $f$, rechts darüber. Das Maximum über alle $\lambda\ge0$ (schwarz) ist deshalb $f$ im zulässigen Bereich und $+\infty$ dahinter.</figcaption>
</figure>

## Die duale Funktion

Bis hierhin haben wir durch die Lagrange-Funktion zwei Dinge erreicht. Einerseits steckt in ihrem Gradienten das geometrische Gleichgewicht zwischen Zielfunktion und Nebenbedingungen. Andererseits können wir mithilfe der Maximierung über die Multiplikatoren die Zulässigkeit exakt darstellen. Damit lässt sich das beschränkte Problem als Optimierung über eine Funktion auffassen, in der sowohl $x$ als auch $\lambda$ auftreten.

<div class="narrator" role="note" data-pose="denkt">
<p>Bisher war ich der strenge Aufpasser, der unzulässige Punkte unendlich teuer macht. Jetzt wechsle ich die Seite und suche selbst etwas: die beste untere Schranke für den Optimalwert.</p>
</div>

Interessant wird es, wenn wir die Reihenfolge dieser beiden Optimierungen verändern. Bisher wurde für jeden Punkt $x$ zuerst das Supremum über die Multiplikatoren bestimmt und anschließend über $x$ minimiert. Wir können aber auch zunächst die Lagrange-Funktion für einen festen Multiplikatorenvektor über $x$ minimieren.

Dazu definieren wir die duale Funktion

$$
\boxed{
g(\lambda)
=
\underset{x\in\mathbb{R}^n}{\inf}\mathcal{L}(x,\lambda),
\qquad\lambda\ge0.
}
$$

Die Entscheidungsvariablen $x$ müssen bei dieser Minimierung die ursprünglichen Nebenbedingungen nicht erfüllen. Wir suchen schlicht den kleinsten Wert, den die Lagrange-Funktion bei den vorgegebenen Multiplikatoren annehmen kann. Je nach Problem kann dieses Infimum auch $-\infty$ sein.

Warum ist dieser Wert für das ursprüngliche Optimierungsproblem nützlich? Weil er uns eine untere Schranke für den optimalen Zielfunktionswert liefert.

Für jeden Punkt $x$ gilt aufgrund der Definition des Infimums

$$
g(\lambda)\le\mathcal{L}(x,\lambda).
$$

Ist $x$ zusätzlich zulässig, wissen wir bereits, dass $\mathcal{L}(x,\lambda)\le f(x)$ gilt. Damit erhalten wir

$$
g(\lambda)\le\mathcal{L}(x,\lambda)\le f(x).
$$

Insbesondere gilt diese Beziehung auch für den optimalen Punkt $x^\star$, sodass

$$
\boxed{
g(\lambda)\le f(x^\star)=p^\star
}
$$

folgt.

Jeder nichtnegative Multiplikatorenvektor liefert somit eine untere Schranke für den optimalen Zielfunktionswert. Wie gut diese Schranke ist, hängt von der Wahl der Multiplikatoren ab.

Hier zeigt sich eine weitere Bedeutung der Lagrange-Multiplikatoren. Wir können sie nicht nur als Gewichte interpretieren, die den Einfluss der Nebenbedingungen auf den Gradienten bestimmen, sondern auch als Variablen, mit denen wir versuchen, den tatsächlichen Optimalwert möglichst genau von unten abzuschätzen.

Ein zulässiger Punkt $x$ liefert uns mit $f(x)$ immer eine obere Schranke für das gesuchte Minimum, denn der optimale Wert kann nicht größer sein als der Wert eines beliebigen zulässigen Punkts. Der Multiplikatorenvektor $\lambda$ liefert dagegen mit $g(\lambda)$ eine untere Schranke. Der optimale Wert liegt also zwischen beiden,

$$
\boxed{
g(\lambda)\le p^\star\le f(x).
}
$$

Wenn wir die möglichst beste untere Schranke finden möchten, müssen wir die duale Funktion über alle nichtnegativen Multiplikatoren maximieren. Auf diese Weise entsteht das duale Optimierungsproblem

$$
\boxed{
d^\star
=
\underset{\lambda\ge0}{\sup}g(\lambda)
=
\underset{\lambda\ge0}{\sup}
\underset{x\in\mathbb{R}^n}{\inf}\mathcal{L}(x,\lambda).
}
$$

Das ursprüngliche Optimierungsproblem nennen wir im Unterschied dazu das primale Problem. Das primale Problem sucht den kleinsten zulässigen Zielfunktionswert, während das duale Problem die größte untere Schranke für genau diesen Wert sucht.

Dabei ist die duale Funktion stets konkav. Der Grund ist, dass die Lagrange-Funktion für ein festes $x$ affin von $\lambda$ abhängt und $g(\lambda)$ das punktweise Infimum dieser affinen Funktionen ist. Die Maximierung von $g$ über die konvexe Menge $\lambda\ge0$ besitzt deshalb selbst die Struktur eines konvexen Optimierungsproblems.

Da jeder duale Wert eine untere Schranke für den primalen Optimalwert liefert, muss immer

$$
\boxed{d^\star\le p^\star}
$$

gelten. Diese Beziehung heißt schwache Dualität. Sie ist keine besondere Eigenschaft konvexer Probleme, sondern folgt direkt aus der Konstruktion der Lagrange-Funktion.

<figure class="static-figure full-width">
  <img src="/img/notes/beschraenkte-optimierung/duale-funktion.svg" alt="Diagramm über dem Multiplikator lambda von 0 bis 2,5: mehrere blaue fallende und orangefarbene steigende Geraden sowie eine gestrichelte waagerechte Gerade auf Höhe einhalb. Darunter verläuft die schwarze, nach unten geöffnete Parabel g von lambda, die untere Hülle aller Geraden. Sie berührt die waagerechte Gerade bei lambda gleich 1. Ein violetter Abstand bei lambda gleich 0,3 markiert die Lücke zwischen p Stern und g." width="790" height="380" loading="lazy">
  <figcaption>Abbildung 6: Das Beispiel aus Abbildung 5, $f(x)=\tfrac12(x-2)^2$ mit $x\le1$, von der anderen Seite. Bei festem $x$ ist $\mathcal{L}(x,\lambda)$ eine Gerade in $\lambda$ mit der Steigung $x-1$: fallend für zulässige $x<1$, steigend für unzulässige $x>1$ und waagerecht für $x=1$. Die duale Funktion $g(\lambda)=\lambda-\tfrac12\lambda^2$ ist das punktweise Minimum all dieser Geraden, ihre untere Hülle, und deshalb konkav. Die waagerechte Gerade gehört zum Optimum $x^\star=1$ und liegt auf der Höhe $p^\star=\tfrac12$. $g$ bleibt überall darunter, das ist die schwache Dualität, und berührt sie bei $\lambda^\star=1$.</figcaption>
</figure>

## Dualitätslücke und starke Dualität

Die Differenz

$$
\Delta^\star=p^\star-d^\star\ge0
$$

wird als optimale Dualitätslücke bezeichnet. Für einen beliebigen zulässigen Punkt $x$ und einen nichtnegativen Multiplikatorenvektor $\lambda$ betrachten wir entsprechend die primal-duale Lücke

$$
\Delta(x,\lambda)=f(x)-g(\lambda)\ge0.
$$

Sie zeigt, wie weit die aktuelle obere und untere Schranke voneinander entfernt sind. Ist diese Lücke klein, wissen wir bereits, dass unsere Lösung nahe am optimalen Zielfunktionswert liegt. Wir müssen den tatsächlichen Optimalwert dafür nicht einmal kennen.

Besonders interessant ist der Fall, in dem die beste untere Schranke den primalen Optimalwert tatsächlich erreicht. Wenn

$$
\boxed{d^\star=p^\star}
$$

gilt, sprechen wir von starker Dualität. Die optimale Dualitätslücke verschwindet dann vollständig.

Für konvexe Optimierungsprobleme lässt sich starke Dualität unter geeigneten Voraussetzungen sicherstellen. Eine wichtige hinreichende Bedingung ist die Slater-Bedingung. Bei konvexer Zielfunktion und affinen Ungleichungsnebenbedingungen verlangt sie einen strikt zulässigen Punkt $\bar x$, der sämtliche Nebenbedingungen mit echtem Abstand zur Begrenzung erfüllt, sodass

$$
A\bar x<b
$$

gilt.

Bei ausschließlich affinen Nebenbedingungen und einer auf ganz $\mathbb{R}^n$ endlichwertigen, konvexen Zielfunktion ist diese Voraussetzung sogar stärker als nötig. Ist die zulässige Menge nichtleer und der primale Optimalwert endlich, gilt bereits starke Dualität, und das duale Optimum wird angenommen. Ein strikt zulässiger Punkt ist dafür nicht zwingend erforderlich.

## Die KKT-Bedingungen

Wir nehmen im Folgenden außerdem an, dass eine primale Optimallösung $x^\star$ existiert. Damit stehen uns nicht nur die beiden gleichen Optimalwerte zur Verfügung, sondern auch konkrete optimale Vektoren $x^\star$ und $\lambda^\star$. Genau aus ihrer Beziehung lassen sich nun die Bedingungen herleiten, die eine optimale Lösung erfüllen muss.

Aus der starken Dualität wissen wir, dass

$$
f(x^\star)=p^\star=d^\star=g(\lambda^\star)
$$

gilt. Nach Definition der dualen Funktion ist $g(\lambda^\star)$ der kleinste Wert der Lagrange-Funktion bei festem $\lambda^\star$. Gleichzeitig wissen wir, dass die Lagrange-Funktion an jedem zulässigen Punkt höchstens so groß wie die ursprüngliche Zielfunktion ist. Setzen wir diese beiden Aussagen zusammen, ergibt sich

$$
\boxed{
\begin{align*}
f(x^\star)
&=g(\lambda^\star)\\
&=\underset{x}{\inf}\mathcal{L}(x,\lambda^\star)\\
&\le\mathcal{L}(x^\star,\lambda^\star)\\
&=f(x^\star)
+{\lambda^\star}^\top(Ax^\star-b)\\
&\le f(x^\star).
\end{align*}
}
$$

An dieser Stelle lohnt es sich, die Ungleichungskette genau anzusehen. Wir beginnen mit $f(x^\star)$ und enden bei genau demselben Wert. Dazwischen stehen ausschließlich Beziehungen mit „kleiner oder gleich“. Das ist nur möglich, wenn tatsächlich überall Gleichheit gilt.

Was bedeutet das für die optimale Lösung?

Zunächst folgt aus der ersten Ungleichung, dass

$$
\mathcal{L}(x^\star,\lambda^\star)
=
\underset{x}{\inf}\mathcal{L}(x,\lambda^\star)
$$

gelten muss. Der optimale Punkt $x^\star$ minimiert also auch die Lagrange-Funktion, wenn wir die Multiplikatoren auf ihre optimalen Werte $\lambda^\star$ festlegen. Da diese Funktion bezüglich $x$ differenzierbar ist, muss ihr Gradient dort verschwinden. Wir erhalten

$$
\boxed{
\nabla_x\mathcal{L}(x^\star,\lambda^\star)
=
\nabla f(x^\star)+A^\top\lambda^\star=0.
}
$$

Das ist genau die Gleichung, die wir im Teil „Der Normalenkegel“ aus der Geometrie der zulässigen Menge hergeleitet haben. Der Gradient der Zielfunktion wird durch die gewichteten Normalen der aktiven Nebenbedingungen ausgeglichen. Diese Forderung nennen wir Stationarität.

Aus der zweiten Ungleichung der Kette erhalten wir eine weitere Bedingung. Weil die Lagrange-Funktion am Optimum denselben Wert wie die ursprüngliche Zielfunktion besitzen muss, gilt

$$
{\lambda^\star}^\top(Ax^\star-b)=0.
$$

Schreiben wir das Skalarprodukt aus, erhalten wir

$$
\sum_{i=1}^{m}
\lambda_i^\star(a_i^\top x^\star-b_i)=0.
$$

Hier wissen wir bereits etwas über das Vorzeichen jedes einzelnen Summanden. Da $x^\star$ zulässig ist, sind alle Ausdrücke $a_i^\top x^\star-b_i$ nichtpositiv. Gleichzeitig sind sämtliche Multiplikatoren nichtnegativ. Jeder Summand ist also kleiner oder gleich null.

Damit ihre Summe genau null ergibt, muss jeder Summand einzeln verschwinden. Deshalb gilt für jede Nebenbedingung

$$
\boxed{
\lambda_i^\star(b_i-a_i^\top x^\star)=0.
}
$$

Diese Beziehung heißt Komplementarität. Sie klingt zunächst wie eine zusätzliche technische Bedingung, hat aber eine sehr konkrete Bedeutung. Sie stellt sicher, dass eine Nebenbedingung nur dann einen positiven Multiplikator besitzen kann, wenn das Optimum tatsächlich auf ihrer Begrenzung liegt.

Zusammen mit der ursprünglichen Zulässigkeit von $x^\star$ und der Nichtnegativität der Multiplikatoren erhalten wir die vier Karush-Kuhn-Tucker-Bedingungen, kurz KKT-Bedingungen,

$$
\boxed{
\begin{align*}
\nabla f(x^\star)+A^\top\lambda^\star&=0
&&\text{Stationarität},\\
Ax^\star&\le b
&&\text{primale Zulässigkeit},\\
\lambda^\star&\ge0
&&\text{duale Zulässigkeit},\\
\lambda_i^\star(b_i-a_i^\top x^\star)&=0
&&\text{Komplementarität}.
\end{align*}
}
$$

Jede dieser Bedingungen erfüllt eine andere Aufgabe. Die primale Zulässigkeit garantiert, dass die berechnete Lösung alle ursprünglichen Grenzen einhält. Die duale Zulässigkeit verhindert negative Gewichte, die nicht zu unserer gewählten Ungleichungsrichtung passen würden. Die Stationarität beschreibt das Gleichgewicht zwischen Zielfunktionsgradient und Randnormalen. Die Komplementarität stellt schließlich die Verbindung zwischen den Multiplikatoren und den tatsächlich aktiven Nebenbedingungen her.

## Komplementarität

Warum ist gerade die Komplementarität so wichtig?

Dazu führen wir für jede Nebenbedingung den Abstand

$$
s_i=b_i-a_i^\top x^\star\ge0
$$

ein. Dieser Ausdruck wird auch als Schlupfvariable beziehungsweise Slack bezeichnet. Ist $s_i>0$, liegt das Optimum auf der zulässigen Seite der Begrenzung und besitzt noch einen positiven Abstand. Ist dagegen $s_i=0$, liegt das Optimum genau auf der Begrenzung.

Die Komplementarität lautet damit besonders einfach

$$
\boxed{\lambda_i^\star s_i=0.}
$$

<div class="narrator" role="note">
<p>Das ist meine Arbeitsregel: Hat meine Grenze Luft, mache ich Pause. Arbeite ich, liegt der Punkt genau auf ihr. Beides zugleich gibt es nicht, nur beide null ist erlaubt.</p>
</div>

Weil sowohl $\lambda_i^\star$ als auch $s_i$ nichtnegativ sind, können wir die möglichen Situationen unmittelbar unterscheiden.

Ist die Nebenbedingung inaktiv, gilt $s_i>0$. Damit das Produkt null wird, muss zwangsläufig $\lambda_i^\star=0$ gelten. Die Nebenbedingung besitzt also keinen Einfluss auf das Kräftegleichgewicht. Sie begrenzt die optimale Lösung momentan nicht.

Ist die Nebenbedingung aktiv, gilt dagegen $s_i=0$. In diesem Fall ist die Komplementarität unabhängig vom Wert des Multiplikators erfüllt. Der Multiplikator darf positiv sein, muss es aber nicht.

Eine aktive Nebenbedingung mit $\lambda_i^\star>0$ bezeichnet man als stark aktiv. Sie trägt tatsächlich zum Gleichgewicht der Gradienten bei. Ist die Nebenbedingung aktiv, obwohl $\lambda_i^\star=0$ gilt, spricht man von einer schwach aktiven Nebenbedingung. Der optimale Punkt liegt dann zwar auf ihrer Begrenzung, die betreffende Randnormale wird aber für das Gleichgewicht nicht benötigt.

Damit erhalten wir die wichtige Unterscheidung

$$
\boxed{
\lambda_i^\star>0
\ \Longrightarrow\ 
s_i=0,
\qquad
s_i=0
\ \not\Longrightarrow\ 
\lambda_i^\star>0.
}
$$

Ein positiver Multiplikator bedeutet also immer, dass die entsprechende Nebenbedingung aktiv ist. Umgekehrt bedeutet eine aktive Nebenbedingung nicht automatisch, dass ihr Multiplikator positiv sein muss.

Falls bei jeder Ungleichungsnebenbedingung genau eine der Größen $s_i$ und $\lambda_i^\star$ null ist, spricht man von strikter Komplementarität. Dann besitzt jede aktive Nebenbedingung einen positiven Multiplikator. Diese zusätzliche Eigenschaft ist allerdings nicht allgemein garantiert und auch nicht erforderlich, damit die gewöhnlichen KKT-Bedingungen gelten.

Vielleicht entsteht an dieser Stelle die Frage, warum wir die Komplementaritätsbedingung überhaupt brauchen. Wenn eine Nebenbedingung aktiv ist, ist ihr Abstand schließlich ohnehin null. Das Produkt $\lambda_i^\star s_i$ verschwindet dann ganz automatisch, unabhängig vom Multiplikator. Für eine bereits bekannte aktive Nebenbedingung liefert uns die Komplementarität tatsächlich keine zusätzliche Einschränkung des Multiplikators.

Ihr entscheidender Nutzen liegt vielmehr bei den inaktiven Nebenbedingungen. Dort zwingt sie die Multiplikatoren auf null und verhindert dadurch, dass Begrenzungen, die das Optimum gar nicht berührt, trotzdem in der Stationaritätsgleichung auftauchen.

Vor allem wissen wir vor der Optimierung noch nicht, welche Nebenbedingungen aktiv sind. Das Optimum könnte im Inneren der zulässigen Menge liegen, eine einzelne Kante berühren oder am Schnittpunkt mehrerer Begrenzungen liegen. Welche dieser Situationen tatsächlich eintritt, ist Teil des Optimierungsproblems.

Wäre die aktive Menge bereits bekannt, könnten wir die entsprechenden Nebenbedingungen als Gleichungen behandeln und alle übrigen Multiplikatoren auf null setzen. Da wir diese Information jedoch zunächst nicht besitzen, brauchen wir eine Bedingung, die beide Möglichkeiten gleichzeitig berücksichtigt. Genau dies leistet die Komplementarität.

Sie sorgt auch dafür, dass die ursprüngliche Optimalitätsbedingung der unbeschränkten Optimierung als Spezialfall enthalten ist. Liegt $x^\star$ im Inneren der zulässigen Menge, sind alle Nebenbedingungen inaktiv. Dann gilt $s_i>0$ für alle $i$, und die Komplementarität erzwingt $\lambda^\star=0$. Die Stationaritätsgleichung vereinfacht sich folglich zu

$$
\nabla f(x^\star)=0.
$$

Liegt das Optimum dagegen auf dem Rand, können die Multiplikatoren aktiver Nebenbedingungen positiv sein und den von null verschiedenen Zielfunktionsgradienten ausgleichen.

Die KKT-Bedingungen beschreiben beide Fälle, ohne dass wir vorher entscheiden müssten, wo das Optimum liegt.

## Globale Optimalität und Sattelpunkt

Für konvexe Probleme ist die Bedeutung der KKT-Bedingungen besonders weitreichend. Wir haben die Bedingungen aus der starken Dualität hergeleitet und damit gezeigt, dass sie unter den genannten Voraussetzungen notwendig sind. Aufgrund der Konvexität sind sie jedoch auch hinreichend. Jeder zulässige Punkt, für den geeignete Multiplikatoren existieren, die alle KKT-Bedingungen erfüllen, ist bereits global optimal.

Warum können wir uns dessen sicher sein? Bei einer konvexen, differenzierbaren Zielfunktion gilt für jeden Punkt $x$

$$
f(x)\ge
f(x^\star)+\nabla f(x^\star)^\top(x-x^\star).
$$

Die Funktion liegt also überall oberhalb ihrer Tangentialebene am Punkt $x^\star$. Setzen wir nun die Stationarität $\nabla f(x^\star)=-A^\top\lambda^\star$ ein, erhalten wir

$$
f(x)\ge
f(x^\star)-{\lambda^\star}^\top A(x-x^\star).
$$

Wegen der Komplementarität gilt außerdem

$$
{\lambda^\star}^\top Ax^\star
=
{\lambda^\star}^\top b.
$$

Damit wird aus der vorherigen Ungleichung

$$
f(x)\ge
f(x^\star)+{\lambda^\star}^\top(b-Ax).
$$

Für jeden zulässigen Punkt $x$ ist $b-Ax\ge0$. Gleichzeitig gilt $\lambda^\star\ge0$. Das Skalarprodukt kann deshalb nicht negativ sein, sodass

$$
\boxed{
f(x)\ge f(x^\star)
}
$$

für jeden zulässigen Punkt folgt.

Damit ist gezeigt, dass kein anderer zulässiger Punkt einen kleineren Zielfunktionswert besitzen kann. Genau deshalb sind die KKT-Bedingungen bei konvexen Problemen so mächtig. Sobald wir einen Punkt finden, der sie gemeinsam mit geeigneten Multiplikatoren erfüllt, haben wir nicht nur einen Kandidaten für ein Minimum, sondern einen mathematischen Nachweis globaler Optimalität.

Die Verbindung zur Dualität lässt sich sogar noch deutlicher machen. Für ein beliebiges primal zulässiges $x$ und ein dual zulässiges $\lambda$ können wir die primal-duale Lücke umformen und erhalten

$$
\boxed{
f(x)-g(\lambda)
=
\underbrace{\lambda^\top(b-Ax)}_{\text{Komplementaritätsanteil}}
+
\underbrace{\bigl(\mathcal{L}(x,\lambda)-g(\lambda)\bigr)}_{\text{Minimierungsanteil}}.
}
$$

Beide Terme auf der rechten Seite sind nichtnegativ. Der erste zeigt, ob die Komplementaritätsbedingungen erfüllt sind. Der zweite zeigt, wie weit die Lagrange-Funktion am betrachteten Punkt noch über ihrem Infimum bei festem $\lambda$ liegt.

Wenn die gesamte Dualitätslücke null ist, müssen beide Terme einzeln null sein. Der erste liefert dann die Komplementarität. Der zweite bedeutet, dass $x$ bei festem $\lambda$ die Lagrange-Funktion minimiert, was für eine konvexe, differenzierbare Lagrange-Funktion genau durch die Stationarität beschrieben wird.

Die KKT-Bedingungen stellen somit sicher, dass die primale und die duale Lösung denselben optimalen Zielfunktionswert erreichen.

Diesen Zusammenhang können wir auch als Sattelpunkt der Lagrange-Funktion verstehen. Am optimalen Punkt $x^\star$ maximiert $\lambda^\star$ die Lagrange-Funktion bezüglich der Multiplikatoren. Gleichzeitig minimiert $x^\star$ die Lagrange-Funktion, wenn die Multiplikatoren fest auf $\lambda^\star$ gesetzt werden. Deshalb gilt

$$
\boxed{
\mathcal{L}(x^\star,\lambda)
\le
\mathcal{L}(x^\star,\lambda^\star)
\le
\mathcal{L}(x,\lambda^\star)
}
$$

für alle $x\in\mathbb{R}^n$ und alle $\lambda\ge0$.

Links sehen wir also eine Maximierung bezüglich $\lambda$, rechts eine Minimierung bezüglich $x$. Am gemeinsamen Lösungspunkt stimmen beide miteinander überein.

<figure class="static-figure">
  <img src="/img/notes/beschraenkte-optimierung/sattel.gif" alt="Animation einer sattelförmigen Gitterfläche über x und lambda, die sich langsam hin und her dreht. Eine blaue Parabel bei lambda gleich 1 hat ihr Minimum im markierten Sattelpunkt, eine orangefarbene waagerechte Linie bei x gleich 1 läuft durch denselben Punkt, und eine violette Kurve, die Talsohle, erreicht dort ihren höchsten Punkt." width="790" height="420" loading="lazy">
  <figcaption>Abbildung 7: Die Lagrange-Funktion $\mathcal{L}(x,\lambda)=\tfrac12(x-2)^2+\lambda(x-1)$ des Beispiels aus Abbildung 5 als Fläche über $x$ und $\lambda$. Der blaue Schnitt bei $\lambda=\lambda^\star=1$ ist eine Parabel mit ihrem Minimum bei $x^\star=1$, das ist die rechte Ungleichung. Der orangefarbene Schnitt bei $x=x^\star$ ist waagerecht: Weil die Nebenbedingung dort aktiv ist, gilt $\mathcal{L}(x^\star,\lambda)=f(x^\star)+\lambda\cdot0=\tfrac12$ für jedes $\lambda$, und die linke Ungleichung gilt mit Gleichheit. Violett verläuft die Talsohle $g(\lambda)$ aus Abbildung 6, deren höchster Punkt der Sattelpunkt ist.</figcaption>
</figure>

So lassen sich die primale Optimierung, die duale Optimierung und die KKT-Bedingungen als unterschiedliche Beschreibungen derselben Situation verstehen. Die primale Lösung minimiert die Kosten unter Einhaltung der Grenzen. Die duale Lösung wählt die Gewichte so, dass die beste mögliche untere Schranke entsteht. Am gemeinsamen Optimum verschwindet die Dualitätslücke, die Gradienten befinden sich im Gleichgewicht und die Komplementarität stellt sicher, dass nur die richtigen Nebenbedingungen daran beteiligt sind.

## Schattenpreise

Damit haben wir die mathematische Rolle der Multiplikatoren verstanden. Ihre vielleicht interessanteste Eigenschaft haben wir aber noch nicht betrachtet. Die Zahlen $\lambda_i^\star$ sagen uns nämlich nicht nur, wie stark eine Begrenzung zum Kräftegleichgewicht beiträgt. Sie verraten auch, wie viel uns diese Begrenzung beim optimalen Zielfunktionswert kostet.

<div class="narrator" role="note" data-pose="staunt">
<p>Mein dritter Beruf: Preisschild. Gleich zeigt sich, dass mein Wert angibt, was eine Grenze kostet.</p>
</div>

Dazu müssen wir die Nebenbedingungen nicht mehr als fest vorgegeben betrachten. Stattdessen stellen wir uns vor, dass wir eine einzelne Begrenzung ein wenig verschieben dürfen. Was würde dann mit dem optimalen Zielfunktionswert passieren?

Nehmen wir die Nebenbedingung

$$
a_i^\top x\le b_i.
$$

Wenn wir $b_i$ erhöhen, wird die Nebenbedingung gelockert. Die zulässige Menge wird größer, weil nun auch Punkte erlaubt sind, die vorher außerhalb lagen. Der optimale Zielfunktionswert kann dadurch sinken oder unverändert bleiben. Er kann aber nicht steigen, denn sämtliche zuvor zulässigen Lösungen bleiben weiterhin zulässig.

Um diesen Einfluss mathematisch zu untersuchen, betrachten wir den optimalen Zielfunktionswert als Funktion der rechten Seiten $b$, sodass

$$
p^\star(b)
=
\underset{Ax\le b}{\min}f(x)
$$

gilt. Unter geeigneten Differenzierbarkeitsvoraussetzungen erhalten wir für die Änderung des Optimalwerts bezüglich einer einzelnen Schranke die Beziehung

$$
\boxed{
\frac{\partial p^\star(b)}{\partial b_i}
=
-\lambda_i^\star.
}
$$

Diese Gleichung ist bemerkenswert. Der Multiplikator, den wir ursprünglich eingeführt haben, um die Randnormalen mit dem Zielfunktionsgradienten ins Gleichgewicht zu bringen, beschreibt gleichzeitig die Empfindlichkeit des optimalen Zielfunktionswerts gegenüber einer Veränderung der zugehörigen Nebenbedingung.

Eine kleine Lockerung $b_i\mapsto b_i+\delta$ führt daher näherungsweise zu

$$
\boxed{
p^\star(b_i+\delta)
\approx
p^\star(b_i)-\lambda_i^\star\delta.
}
$$

Der Multiplikator gibt also an, wie stark sich der optimale Zielfunktionswert verringern würde, wenn wir die Nebenbedingung geringfügig lockern.

Aus diesem Grund werden Lagrange-Multiplikatoren auch als Schattenpreise bezeichnet. Sie beschreiben den marginalen Wert einer zusätzlichen Einheit Freiheit innerhalb des Optimierungsproblems.

Was bedeutet das konkret? Stellen wir uns vor, die Zielfunktion beschreibt Energiekosten in Euro und eine Nebenbedingung begrenzt die maximale elektrische Leistung in Kilowatt. Dann besitzt der zugehörige Multiplikator die Einheit Euro pro Kilowatt. Ein Multiplikator von beispielsweise $3\,\text{€/kW}$ bedeutet, dass eine geringfügige Erhöhung dieser Leistungsgrenze um $1\,\mathrm{kW}$ den optimalen Zielfunktionswert lokal um ungefähr $3\,\text{€}$ verringern würde. Für größere Veränderungen ist diese lineare Näherung nicht notwendigerweise gültig, weil sich die optimale Lösung und die aktiven Nebenbedingungen ändern können.

Die Multiplikatoren beantworten damit eine Frage, die uns der optimale Punkt $x^\star$ allein nicht beantworten kann. Der optimale Punkt sagt uns, welche Entscheidungen wir treffen sollten. Die Multiplikatoren erklären zusätzlich, welche Grenzen besonders teuer sind und bei welchen sich eine Lockerung lohnen würde.

Genau hier wird auch die Unterscheidung zwischen aktiven und inaktiven Nebenbedingungen wieder wichtig.

Ist eine Nebenbedingung inaktiv, besitzt das Optimum noch einen positiven Abstand zur Begrenzung. Wenn wir diese Begrenzung ein wenig nach außen verschieben, ändert sich an der aktuellen optimalen Lösung zunächst nichts. Die bisherige Lösung bleibt zulässig und optimal. Deshalb ist der zugehörige Multiplikator null.

Ist eine Nebenbedingung dagegen stark aktiv, besitzt sie einen positiven Multiplikator. Bei differenzierbarer optimaler Wertfunktion bedeutet dies, dass eine kleine Lockerung unmittelbar eine Verbesserung des Optimalwerts erster Ordnung ermöglicht. Je größer der Multiplikator, desto größer fällt diese Verbesserung pro Einheit Lockerung aus.

Bei einer schwach aktiven Nebenbedingung liegt die optimale Lösung zwar auf der Begrenzung, der Multiplikator ist aber null. Die Begrenzung wird geometrisch berührt, verursacht jedoch keinen positiven Schattenpreis. Eine Lockerung besitzt bei eindeutiger lokaler Sensitivität daher keinen Verbesserungseffekt erster Ordnung.

Eine aktive Nebenbedingung muss somit nicht zwangsläufig eine spürbare Einschränkung der optimalen Kosten darstellen. Erst der Multiplikator verrät, wie stark diese Begrenzung tatsächlich ins Gewicht fällt.

Allerdings sollten wir die Beziehung zwischen Multiplikator und Sensitivität nicht uneingeschränkt als gewöhnliche Ableitung verstehen. Die optimale Wertfunktion $p^\star(b)$ ist bei einem konvexen Problem mit affinen Nebenbedingungen zwar konvex in $b$, muss aber nicht überall differenzierbar sein. Insbesondere beim Wechsel der aktiven Menge können Knicke auftreten. Außerdem können mehrere optimale Multiplikatorenvektoren existieren.

Unter starker Dualität liefert ein optimaler Multiplikatorenvektor dann einen Subgradienten der Wertfunktion. Für eine Veränderung der Schranken von $b$ nach $b'$ gilt

$$
\boxed{
p^\star(b')
\ge
p^\star(b)-{\lambda^\star}^\top(b'-b).
}
$$

Der Vektor $-\lambda^\star$ beschreibt somit eine stützende lineare Abschätzung der optimalen Wertfunktion. Ist diese an der betrachteten Stelle differenzierbar, erhalten wir daraus die zuvor verwendete Ableitungsbeziehung.

## Skalierung der Nebenbedingungen

Ein weiterer Punkt ist für die Interpretation wichtig. Der Zahlenwert eines Multiplikators hängt davon ab, wie wir die Nebenbedingung mathematisch formulieren.

Betrachten wir beispielsweise

$$
a_i^\top x\le b_i
$$

und multiplizieren beide Seiten mit einer positiven Zahl $\alpha$. Wir erhalten

$$
\alpha a_i^\top x\le\alpha b_i.
$$

Beide Ungleichungen beschreiben exakt dieselbe Begrenzung. Die Geometrie des Optimierungsproblems hat sich also nicht verändert. Trotzdem verändert sich der zugehörige Multiplikator, denn der Gradient des Nebenbedingungsausdrucks wird nun um den Faktor $\alpha$ größer. Damit das Kräftegleichgewicht erhalten bleibt, muss der Multiplikator entsprechend kleiner werden,

$$
\boxed{
\widetilde{\lambda}_i^\star
=
\frac{\lambda_i^\star}{\alpha}.
}
$$

Die gewichtete Randnormale bleibt dabei unverändert, weil

$$
\widetilde{\lambda}_i^\star(\alpha a_i)
=
\lambda_i^\star a_i
$$

gilt.

Das bedeutet, dass wir die Größe eines Multiplikators nicht unabhängig von der Skalierung seiner Nebenbedingung beurteilen dürfen. Erst wenn wir wissen, auf welche Größe sich die Schranke bezieht und in welchen Einheiten sie formuliert ist, können wir den Multiplikator sinnvoll interpretieren.

Besonders anschaulich wird dies, wenn wir die Nebenbedingung als geometrische Begrenzung betrachten. Die Gleichung $a_i^\top x=b_i$ beschreibt eine Hyperebene mit dem Normalenvektor $a_i$. Erhöhen wir $b_i$ um $\delta$, wird diese Ebene parallel nach außen verschoben. Ihre geometrische Verschiebungsstrecke beträgt für $a_i\ne0$

$$
\sigma=\frac{\delta}{\|a_i\|}.
$$

Ist $a_i$ ein Einheitsvektor, vereinfacht sich dies zu $\sigma=\delta$. In diesem Fall ist die Änderung der rechten Seite unmittelbar gleich der geometrischen Verschiebung der Begrenzung.

Für eine Verschiebung um die geometrische Strecke $\sigma$ gilt bei entsprechender Differenzierbarkeit des Optimalwerts

$$
\boxed{
\frac{dp^\star}{d\sigma}
=
-\lambda_i^\star\|a_i\|.
}
$$

Bei normierten Normalenvektoren beschreibt der Multiplikator somit direkt den Einfluss einer Verschiebung pro Längeneinheit. Ohne Normierung müssen wir dagegen die Norm des Normalenvektors berücksichtigen.

Stellen wir uns beispielsweise ein zweidimensionales Optimierungsproblem vor, dessen Optimum auf einer einzelnen Kante BC liegt, wie im mittleren Bild von Abbildung 4. Die Höhenellipse der Zielfunktion berührt diese Kante im optimalen Punkt $x^\star$. Der negative Zielfunktionsgradient zeigt von diesem Punkt aus in Richtung des unbeschränkten Minimums, das außerhalb der zulässigen Menge liegt. Die nach innen gerichtete Gegenkraft $-\lambda^\star a$ gleicht diesen Gradienten genau aus.

Beträgt der Multiplikator bei einem normierten Normalenvektor etwa $\lambda^\star=0{,}34$, so bedeutet dies, dass eine kleine Verschiebung der Kante BC um die Strecke $\delta$ nach außen den optimalen Zielfunktionswert zunächst näherungsweise um $0{,}34\delta$ verringert.

Die optimale Lösung kann dadurch weiter in Richtung des unbeschränkten Minimums wandern. Gleichzeitig verändert sich der Gradient der Zielfunktion, sodass sich im Allgemeinen auch der Multiplikator verändert. Sobald das unbeschränkte Minimum innerhalb der zulässigen Menge liegt, besitzt die zuvor begrenzende Kante keinen Einfluss mehr auf das Optimum. Ihr Multiplikator wird null.

## Ein Beispiel zum Nachrechnen

Ein einfaches eindimensionales Beispiel erlaubt es, diesen Zusammenhang vollständig nachzurechnen. Wir minimieren die quadratische Zielfunktion

$$
f(x)=\frac12(x-2)^2
$$

unter der Nebenbedingung $x\le1$. Das Optimierungsproblem lautet damit

$$
\begin{align*}
\underset{x}{\min}\quad &\frac12(x-2)^2\\
\text{unter}\quad &x\le1.
\end{align*}
$$

Ohne Nebenbedingung wäre der optimale Punkt $x_{\mathrm{ref}}=2$, weil die Ableitung dort verschwindet. Dieser Punkt ist allerdings unzulässig. Das beschränkte Optimum liegt deshalb genau auf der Begrenzung bei $x^\star=1$, und der optimale Zielfunktionswert beträgt $p^\star=\frac12$.

Die Lagrange-Funktion ist

$$
\mathcal{L}(x,\lambda)
=
\frac12(x-2)^2+\lambda(x-1),
\qquad \lambda\ge0.
$$

Ihre Ableitung nach $x$ liefert die Stationaritätsbedingung

$$
\frac{\partial\mathcal{L}}{\partial x}
=
x-2+\lambda=0.
$$

Setzen wir $x^\star=1$ ein, erhalten wir

$$
1-2+\lambda^\star=0
\quad\Longrightarrow\quad
\boxed{\lambda^\star=1.}
$$

Wir können diesen Wert zunächst geometrisch interpretieren. Der Gradient der Zielfunktion beträgt am Optimum $f'(1)=-1$. Damit zeigt die Abstiegsrichtung $-f'(1)=1$ nach rechts, also unmittelbar aus der zulässigen Menge $x\le1$ hinaus. Die Nebenbedingung besitzt den Normalenvektor $a=1$, und der Multiplikator $\lambda^\star=1$ sorgt dafür, dass das Kräftegleichgewicht erfüllt ist.

Auch die übrigen KKT-Bedingungen gelten. Die Lösung $x^\star=1$ ist zulässig, der Multiplikator ist nichtnegativ und die Komplementarität $\lambda^\star(1-x^\star)=0$ ist erfüllt.

Betrachten wir zusätzlich die duale Funktion, so minimieren wir die Lagrange-Funktion bei festem $\lambda$ über $x$. Aus der Stationarität folgt dafür

$$
x(\lambda)=2-\lambda.
$$

Einsetzen in die Lagrange-Funktion ergibt

$$
\begin{align*}
g(\lambda)
&=\frac12(-\lambda)^2+\lambda(1-\lambda)\\
&=\lambda-\frac12\lambda^2.
\end{align*}
$$

Die duale Funktion ist eine konkave Parabel. Ihr Maximum liegt bei $\lambda^\star=1$, weil $g'(\lambda)=1-\lambda$ dort verschwindet. Damit erhalten wir

$$
\boxed{
d^\star=g(1)=\frac12=p^\star.
}
$$

Das primale und das duale Optimum stimmen überein. Die Dualitätslücke ist null, und die KKT-Bedingungen charakterisieren die globale Lösung vollständig.

## Die Grenze im Beispiel verschieben

Nun können wir die Sensitivitätsinterpretation unmittelbar überprüfen. Dazu verschieben wir die Begrenzung von $x\le1$ auf $x\le1+\delta$. Solange $0\le\delta<1$ gilt, bleibt die Begrenzung aktiv. Die optimale Lösung verschiebt sich zu $x^\star(\delta)=1+\delta$, und der optimale Zielfunktionswert lautet

$$
p^\star(\delta)
=
\frac12(1+\delta-2)^2
=
\frac12(1-\delta)^2.
$$

Leiten wir diesen Ausdruck nach $\delta$ ab, erhalten wir

$$
\frac{dp^\star}{d\delta}=-(1-\delta).
$$

Am ursprünglichen Punkt $\delta=0$ ist die Steigung somit

$$
\boxed{
\left.\frac{dp^\star}{d\delta}\right|_{\delta=0}
=-1=-\lambda^\star.
}
$$

Der Multiplikator besitzt also genau die vorhergesagte Bedeutung. Eine kleine Lockerung der Schranke führt zunächst zu einer Verringerung des optimalen Zielfunktionswerts mit der Änderungsrate $-1$.

Mit zunehmendem $\delta$ wandert das Optimum weiter nach rechts. Gleichzeitig nimmt der Multiplikator ab. Aus der Stationarität folgt nun

$$
\lambda^\star(\delta)
=
2-x^\star(\delta)
=
1-\delta.
$$

Je näher das Optimum dem unbeschränkten Minimierer $x_{\mathrm{ref}}=2$ kommt, desto geringer wird also der Einfluss der Begrenzung. Bei $\delta=1$ erreicht die optimale Lösung den Punkt $x^\star=2$. Der Multiplikator ist dort bereits null, obwohl die Nebenbedingung noch mit Gleichheit erfüllt ist. Wir haben somit eine schwach aktive Nebenbedingung.

Für $\delta>1$ liegt $x_{\mathrm{ref}}=2$ im Inneren der zulässigen Menge. Die Nebenbedingung ist dann inaktiv, und der Multiplikator bleibt null. Eine weitere Lockerung kann den optimalen Zielfunktionswert nicht mehr verbessern, weil das unbeschränkte Minimum bereits erreicht ist.

<div class="narrator" role="note" data-pose="schiebt">
<p>In Abbildung 8 sieht man mich bei der Arbeit. Je weiter die Grenze nach rechts rückt, desto weniger muss ich drücken. Bei $\delta=1$ stehe ich plötzlich an der Wand, ohne zu drücken: schwach aktiv. Danach habe ich frei.</p>
</div>

<figure class="static-figure">
  <img src="/img/notes/beschraenkte-optimierung/schattenpreis.gif" alt="Animation mit drei Teilen. Oben eine Zahlengerade mit dem Punkt x Stern an einer grünen Wand bei 1 plus delta; Lambda drückt von rechts gegen die Wand, darunter zeigen zwei gleich lange Pfeile den Zug zu x ref gleich 2 und die Gegenkraft. Unten links die fallende Kurve p Stern von delta mit einer Tangente der Steigung minus lambda Stern, unten rechts ein Punkt, der auf der senkrechten Achse nach unten und dann auf der waagerechten nach rechts wandert." width="790" height="500" loading="lazy">
  <figcaption>Abbildung 8: Das Beispiel, während die Grenze von $x\le1$ bis $x\le2{,}6$ nach außen rückt. Oben gleichen sich der Zug $-f'(x^\star)=2-x^\star$ zum Ziel und die Gegenkraft $-\lambda^\star$ der Grenze aus. Unten links der Optimalwert $p^\star(\delta)$ mit seiner Tangente; ihre Steigung ist $-\lambda^\star(\delta)=-(1-\delta)$. Unten rechts das Paar aus Schlupf und Multiplikator: Es läuft zuerst auf der $\lambda$-Achse nach unten (stark aktiv), erreicht bei $\delta=1$ den Ursprung (schwach aktiv) und läuft danach auf der $s$-Achse nach rechts (inaktiv). Abseits der beiden Achsen ist die Komplementarität verletzt.</figcaption>
</figure>

An diesem Beispiel erkennt man besonders gut, was der Multiplikator aussagt. Solange die Begrenzung das Optimum tatsächlich einschränkt, besitzt sie einen positiven Schattenpreis. Je stärker wir die Begrenzung lockern, desto näher kommen wir dem unbeschränkten Minimum und desto kleiner wird dieser Schattenpreis. Sobald die Begrenzung für das Optimum keine Rolle mehr spielt, verschwindet er.

Daran lässt sich auch die ursprüngliche geometrische Interpretation noch einmal nachvollziehen. Der Multiplikator ist groß, wenn der Zielfunktionsgradient an der Begrenzung stark ausgeglichen werden muss. Gleichzeitig ist der optimale Zielfunktionswert dann besonders empfindlich gegenüber einer Lockerung dieser Begrenzung. Beide Interpretationen hängen unmittelbar miteinander zusammen. Die Größe des Gradienten in Richtung der Randnormalen bestimmt, wie stark das Kräftegleichgewicht durch die Nebenbedingung hergestellt werden muss, und genau diese Gewichtung erscheint als lokale Sensitivität des Optimalwerts.

## Ausblick

Bisher haben wir ausschließlich affine Nebenbedingungen betrachtet. Die grundlegenden Überlegungen sind jedoch nicht auf solche Begrenzungen beschränkt. Auch gekrümmte, nichtlineare Nebenbedingungen lassen sich in die Lagrange-Funktion einbeziehen, solange das Optimierungsproblem konvex bleibt.

Ein allgemeineres konvexes Optimierungsproblem besitzt beispielsweise die Form

$$
\begin{align*}
\underset{x\in\mathbb{R}^n}{\min}\quad &f(x)\\
\text{unter}\quad
&c_i(x)\le0,\qquad i=1,\ldots,m,\\
&Hx=h,
\end{align*}
$$

wobei $f$ und sämtliche Ungleichungsfunktionen $c_i$ konvex sind. Die Gleichungsnebenbedingungen werden affin formuliert, da allgemeine nichtlineare Gleichungen die Konvexität der zulässigen Menge nicht sicherstellen würden.

Die Lagrange-Funktion lautet dann

$$
\boxed{
\mathcal{L}(x,\lambda,\nu)
=
f(x)+\sum_{i=1}^m\lambda_i c_i(x)
+\nu^\top(Hx-h),
}
$$

wobei die Multiplikatoren der Ungleichungsnebenbedingungen weiterhin $\lambda_i\ge0$ erfüllen müssen. Die Multiplikatoren $\nu$ der Gleichungsnebenbedingungen sind dagegen vorzeichenfrei. Der Grund ist, dass eine Gleichung keine einseitige Begrenzung beschreibt, sondern Abweichungen in beide Richtungen ausschließt.

Die Stationarität erhält damit die Form

$$
\boxed{
\nabla f(x^\star)
+\sum_{i=1}^m\lambda_i^\star\nabla c_i(x^\star)
+H^\top\nu^\star=0.
}
$$

An der Interpretation ändert sich wenig. Die Gradienten der aktiven Ungleichungsnebenbedingungen übernehmen nun die Rolle der Randnormalen. Ist eine Nebenbedingung gekrümmt, beschreibt ihr Gradient die lokale Normale der Begrenzung am betrachteten Punkt. Die Multiplikatoren bestimmen weiterhin, wie stark diese Normalen zum Gleichgewicht beitragen.

Auch die Komplementarität bleibt erhalten und lautet

$$
\lambda_i^\star c_i(x^\star)=0.
$$

Die Vorzeichenkonvention ist dabei wichtig. Wir haben die Ungleichungsnebenbedingungen hier als $c_i(x)\le0$ definiert und deshalb ein Pluszeichen vor den gewichteten Nebenbedingungstermen verwendet. Verwendet man stattdessen die Konvention $c_i(x)\ge0$, schreibt man die Lagrange-Funktion mit einem Minuszeichen vor diesen Termen. Beide Darstellungen sind gleichwertig, solange die Vorzeichen durchgehend konsistent verwendet werden.

Bei allgemeinen konvexen Ungleichungsnebenbedingungen benötigen wir für die Notwendigkeit der KKT-Bedingungen geeignete Regularitätsvoraussetzungen. Eine wichtige hinreichende Bedingung ist erneut die Slater-Bedingung, die im betrachteten Fall eines vollständig definierten, endlichwertigen konvexen Problems die Existenz eines Punkts $\bar x$ mit

$$
c_i(\bar x)<0,\qquad H\bar x=h
$$

fordert. Unter den entsprechenden Voraussetzungen garantiert sie starke Dualität und die Existenz optimaler Multiplikatoren.

Für konvexe Probleme sind die KKT-Bedingungen weiterhin hinreichend für globale Optimalität. Anders als bei allgemeinen nichtkonvexen Problemen sind deshalb keine zusätzlichen Bedingungen zweiter Ordnung erforderlich, um einen KKT-Punkt als globales Minimum zu charakterisieren. Die Konvexität der Zielfunktion und der Nebenbedingungsfunktionen sorgt bereits dafür, dass die Stationarität der Lagrange-Funktion bei festen dual zulässigen Multiplikatoren ein globales Minimum beschreibt.

Eine letzte Feinheit betrifft die Eindeutigkeit der Multiplikatoren. Auch wenn die optimale primale Lösung $x^\star$ eindeutig ist, müssen die Multiplikatoren nicht eindeutig sein. Beispielsweise können mehrere aktive Nebenbedingungen dieselbe oder linear abhängige Randnormalen besitzen. Dann lassen sich unterschiedliche Gewichte finden, deren Summe denselben Zielfunktionsgradienten ausgleicht.

Die Linear Independence Constraint Qualification (LICQ) schließt diese Mehrdeutigkeit aus, indem sie lineare Unabhängigkeit der Gradienten aller aktiven Ungleichungsnebenbedingungen und sämtlicher Gleichungsnebenbedingungen fordert. Wenn KKT-Multiplikatoren existieren, sind sie unter LICQ eindeutig. Für die globale Optimalität eines KKT-Punkts ist LICQ bei einem konvexen Problem jedoch nicht erforderlich.

Die KKT-Bedingungen bilden schließlich nicht nur eine theoretische Beschreibung des Optimums, sondern auch die Grundlage zahlreicher numerischer Optimierungsverfahren. Die besondere Schwierigkeit liegt dabei in der Komplementarität, weil wir nicht im Voraus wissen, welche Nebenbedingungen aktiv sind.

Active-Set-Verfahren versuchen, die aktive Menge während der Optimierung zu bestimmen. Innere-Punkte-Verfahren verfolgen einen anderen Ansatz. Sie ersetzen die exakte Komplementarität zunächst durch eine gestörte Beziehung

$$
\boxed{
\lambda_i s_i=\mu,
\qquad
s_i>0,\quad\lambda_i>0,\quad\mu>0,
}
$$

und verringern den Parameter $\mu$ schrittweise gegen null. Dadurch können sie sich einer optimalen Lösung nähern, ohne bereits zu Beginn entscheiden zu müssen, welche Nebenbedingungen aktiv sind. Im Grenzfall entsteht wieder die ursprüngliche Komplementarität $\lambda_i s_i=0$. Die detaillierte Herleitung dieser Verfahren gehört zur numerischen Optimierung, baut aber unmittelbar auf den hier entwickelten Zusammenhängen auf.

## Zusammenfassung

Damit können wir die gesamte Betrachtung noch einmal gedanklich zusammenführen. Unser Ausgangspunkt war die einfache Frage, wie ein Punkt optimal sein kann, obwohl der Gradient der Zielfunktion dort nicht verschwindet. Die Antwort liegt in den Nebenbedingungen. Sie verhindern bestimmte Bewegungen und können dadurch einen Punkt auf dem Rand zum Optimum machen, selbst wenn die Zielfunktion außerhalb der zulässigen Menge noch kleinere Werte annehmen würde.

Die Lagrange-Multiplikatoren beschreiben zunächst, welche Rolle die einzelnen Begrenzungen bei diesem Optimum spielen. Als Gewichte der Randnormalen stellen sie das Gleichgewicht mit dem Zielfunktionsgradienten her. Die Lagrange-Funktion führt dieses Gleichgewicht in einer gemeinsamen mathematischen Funktion zusammen und ermöglicht es gleichzeitig, die Nebenbedingungen durch die Optimierung über die Multiplikatoren zu berücksichtigen.

Aus dieser Darstellung entsteht die Dualität. Jeder Multiplikatorenvektor liefert eine untere Schranke für den optimalen Zielfunktionswert, während jeder zulässige Punkt eine obere Schranke liefert. Bei starker Dualität treffen beide Schranken im Optimum zusammen. Die daraus hergeleiteten KKT-Bedingungen beschreiben dann genau die Beziehungen, die zwischen den optimalen Entscheidungsvariablen, den Nebenbedingungen und den Multiplikatoren bestehen müssen.

Die Komplementarität sorgt dafür, dass nur die tatsächlich relevanten Begrenzungen zum Gleichgewicht beitragen können. Die Schattenpreisinterpretation geht noch einen Schritt weiter. Sie sagt uns, wie stark sich der optimale Zielfunktionswert ändern würde, wenn wir eine dieser Begrenzungen lockern.

So lassen sich die drei zentralen Eigenschaften der Multiplikatoren miteinander verbinden. Sie sind Gewichte im geometrischen Kräftegleichgewicht, duale Variablen zur Bestimmung der besten unteren Schranke und Schattenpreise zur Beurteilung der Empfindlichkeit des Optimalwerts. Diese Interpretationen sind nicht voneinander unabhängig. Sie entstehen alle aus derselben Lagrange-Funktion und beschreiben unterschiedliche Seiten derselben optimalen Lösung.

Gerade bei konvexen Optimierungsproblemen ist dieser Zusammenhang besonders aussagekräftig. Unter geeigneten Voraussetzungen sind die KKT-Bedingungen notwendig und hinreichend, sodass ein KKT-Punkt nicht nur eine mögliche Lösung, sondern nachweislich ein globales Optimum ist. Die Multiplikatoren erklären darüber hinaus, weshalb dieses Optimum an seiner Position liegt, welche Nebenbedingungen es tatsächlich begrenzen und wie viel eine Lockerung dieser Grenzen bewirken würde.

Die Lagrange-Dualität und die KKT-Bedingungen liefern damit nicht nur ein Werkzeug, um eine optimale Lösung zu berechnen. Sie ermöglichen auch, die Struktur der Lösung zu verstehen und den Einfluss der einzelnen Nebenbedingungen quantitativ zu beurteilen.

<div class="narrator" role="note" data-pose="zeigt">
<p>Das war meine Geschichte. Wie Verfahren mich ausrechnen, ohne vorher zu wissen, welche Grenzen aktiv sind, steht in der Notiz über <a href="/notes/zentralpfad.html">Innere-Punkte-Verfahren und den Zentralpfad</a>. Dort bin ich wieder dabei, allerdings mit $\lambda_i s_i=\mu$ statt null.</p>
</div>