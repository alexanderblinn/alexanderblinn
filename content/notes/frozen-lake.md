---
title: "Frozen Lake: Reinforcement Learning in einer Tabelle"
date: 2025-05-31
description: "Q-Learning, Double Q-Learning, SARSA, SARSA(λ) und Monte Carlo auf dem rutschigen Frozen Lake: Bellman-Gleichungen, ε-greedy-Erkundung und die Update-Regeln mit Animationen, Code und einem Politik-Editor zum Ausprobieren."
tags: [reinforcement-learning, optimierung, python]
featured: false
draft: false
---

Ein Wanderer soll über einen zugefrorenen See zu einer Fahne gelangen und dabei die Löcher im Eis meiden. Das Eis ist rutschig: Wer nach rechts gehen will, landet nur in einem Drittel der Fälle rechts, sonst oben oder unten. Niemand sagt dem Wanderer, welcher Weg gut ist. Er erhält erst am Ziel eine Belohnung, sonst nichts, und muss aus vielen Versuchen selbst lernen, welche Aktion in welchem Feld sinnvoll ist. Das ist **Reinforcement Learning** in seiner einfachsten Form: eine Tabelle mit einem Wert je Feld und Aktion, die aus Erfahrung Schritt für Schritt verbessert wird.

Diese Notiz löst Gymnasiums `FrozenLake-v1` mit fünf tabellarischen Verfahren: Q-Learning, Double Q-Learning, SARSA, SARSA(λ) und Monte Carlo. Der Text erklärt die Mathematik dahinter, von der Bellman-Optimalitätsgleichung bis zu den Eligibility Traces, und stellt jeder Update-Regel direkt ihre Implementierung gegenüber. Die Animationen zeigen, was in der Tabelle passiert, und gleich nach der Beschreibung der Umgebung lässt sich in einem kleinen Editor selbst eine Politik bauen und exakt bewerten.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/gieriger-lauf.gif" alt="Animation des Frozen-Lake-Spielfelds: Die Figur folgt der gelernten gierigen Politik vom Start zur Fahne; im zweiten Lauf rutscht sie in ein Loch" width="512" height="548" loading="lazy">
  <figcaption>Abbildung 1: Zwei Testläufe mit der gelernten Tabelle (Q-Learning, 100 000 Episoden, <em>gierige</em> Politik). Der erste erreicht die Fahne, der zweite rutscht trotz gleicher Politik in ein Loch: Die Umgebung ist stochastisch, die beste Politik gewinnt nur in etwa drei von vier Fällen.</figcaption>
</figure>

## Die Umgebung als Markow-Entscheidungsprozess

Das Spielfeld ist ein Gitter mit $4\times4$ Feldern. Der Zustand $s\in\mathcal{S}=\{0,\ldots,15\}$ ist die Nummer des Felds, zeilenweise von links oben gezählt. Vier Aktionen $a\in\mathcal{A}=\{0,1,2,3\}$ stehen für links, unten, rechts und oben. Das Startfeld S ist Zustand 0, das Ziel G Zustand 15; die vier Löcher H und das Ziel sind Endzustände, in denen die Episode endet.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/karte.svg" alt="Das 4 mal 4 Gitter von Frozen Lake mit den Zustandsnummern 0 bis 15, dem Start links oben, vier grau markierten Löchern und dem Ziel rechts unten" width="512" height="512" loading="lazy">
  <figcaption>Abbildung 2: Die Karte von FrozenLake-v1 mit den Zustandsnummern. S ist der Start (Zustand 0), H sind Löcher, G ist das Ziel (Zustand 15).</figcaption>
</figure>

Die Dynamik ist ein **Markow-Entscheidungsprozess** $(\mathcal{S},\mathcal{A},p,r,\gamma)$. Die Übergangswahrscheinlichkeit $p(s'\mid s,a)$ hängt nur vom aktuellen Zustand und der Aktion ab, nicht von der Vorgeschichte. Mit der Voreinstellung `is_slippery=True` führt die gewählte Aktion nur mit Wahrscheinlichkeit $1/3$ in die gewünschte Richtung; mit je $1/3$ rutscht die Figur in eine der beiden Querrichtungen. Am Rand bleibt sie stehen. Für Zustand 14 und die Aktion „rechts“ liefert Gymnasium zum Beispiel

$$
p(15\mid 14,\text{rechts})=\tfrac13,\qquad
p(10\mid 14,\text{rechts})=\tfrac13,\qquad
p(14\mid 14,\text{rechts})=\tfrac13 .
$$

Die Belohnung ist $r=1$ beim Betreten des Ziels und sonst $r=0$, auch beim Sturz in ein Loch. Nach 100 Schritten bricht Gymnasium die Episode ab. Der Diskontfaktor ist $\gamma=0{,}99$: Eine Belohnung in $k$ Schritten zählt $\gamma^k$, der Wanderer bevorzugt also kurze Wege, auch wenn die Umgebung selbst Umwege nicht bestraft.

## Eine Politik von Hand

Eine **Politik** legt fest, welche Aktion der Wanderer in welchem Feld wählt. Bevor ein Verfahren sie lernt, lässt sie sich hier von Hand bauen: Jedes Feld bekommt einen Pfeil, und weil das Übergangsmodell bekannt ist, rechnet der Editor exakt aus, wie oft der Wanderer damit das Ziel erreicht.

<p class="figure-description"><span class="figure-symbol" role="img" aria-label="Beschreibung">?</span><span>Klicke ein Feld an, um seinen Pfeil im Uhrzeigersinn zu drehen; Pfeiltasten setzen die Richtung direkt. Die Zahl in jedem Feld ist die Wahrscheinlichkeit, von dort das Ziel zu erreichen. Rechts stehen die Erfolgsquoten ab dem Start mit und ohne die Grenze von 100 Schritten und der diskontierte Wert $v_\pi(s_0)$, den der nächste Abschnitt einführt. Über die Auswahl lassen sich die optimale Politik und die fünf weiter unten gelernten Politiken laden; gestrichelt umrandet sind Felder, deren Aktion von der optimalen abweicht. Probiere etwa „unten“ in Feld 0 oder „rechts“ in Feld 8.</span></p>

<figure class="interactive-figure figure-policy">
  <iframe src="/img/notes/frozen-lake/politik.html" title="Frozen Lake: Politik exakt bewerten" height="560" loading="lazy"></iframe>
  <figcaption><a href="/img/notes/frozen-lake/politik.html" target="_blank" rel="noopener">Einzelansicht ↗</a></figcaption>
</figure>

Von Hand findet man schnell eine brauchbare Politik, aber kaum sicher die beste. Schon ein einzelner Pfeil verschiebt die Erfolgsquote merklich, und bei elf Feldern mit je vier Aktionen gibt es über vier Millionen Politiken. Die folgenden Abschnitte zeigen, wie man die optimale Politik algorithmisch findet: zuerst mit bekanntem Modell aus den Bellman-Gleichungen, dann ohne Modell, nur aus beobachteten Episoden. Das ist das eigentliche Reinforcement Learning.

## Return, Politik und Wertfunktionen

Allgemein gibt eine Politik $\pi(a\mid s)$ an, mit welcher Wahrscheinlichkeit in Zustand $s$ die Aktion $a$ gewählt wird; die Pfeile im Editor sind der Sonderfall, in dem je Feld eine Aktion sicher gewählt wird. Folgt der Wanderer ihr ab dem Zeitpunkt $t$, erhält er die Belohnungen $R_{t+1},R_{t+2},\ldots$ bis zum Ende der Episode zum Zeitpunkt $T$. Ihr diskontierter Wert ist der **Return**

$$
G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots=\sum_{k=0}^{T-t-1}\gamma^k R_{t+k+1}.
$$

Im Frozen Lake ist $G_t$ entweder null oder $\gamma^{T-t-1}$: Nur das Ziel zahlt, und es zahlt umso mehr, je schneller es erreicht wird. Die **Aktionswertfunktion** einer Politik ist der erwartete Return, wenn in $s$ die Aktion $a$ ausgeführt und danach $\pi$ gefolgt wird,

$$
q_\pi(s,a)=\mathbb{E}_\pi\bigl[\,G_t\;\big|\;S_t=s,\ A_t=a\,\bigr],
\qquad
v_\pi(s)=\sum_{a}\pi(a\mid s)\,q_\pi(s,a).
$$

Der Return zerfällt in die erste Belohnung und den diskontierten Rest. Daraus folgt die **Bellman-Gleichung** für $q_\pi$, die den Wert eines Paars $(s,a)$ mit den Werten der Nachfolger verknüpft:

$$
q_\pi(s,a)=\sum_{s'}p(s'\mid s,a)\Bigl[r(s,a,s')+\gamma\sum_{a'}\pi(a'\mid s')\,q_\pi(s',a')\Bigr].
$$

Eine Politik ist optimal, wenn sie in jedem Zustand den größtmöglichen Wert erreicht. Ihre Aktionswerte $q^\star$ erfüllen die **Bellman-Optimalitätsgleichung**, in der die Mittelung über die Politik durch ein Maximum ersetzt ist:

$$
q^\star(s,a)=\sum_{s'}p(s'\mid s,a)\Bigl[r(s,a,s')+\gamma\max_{a'}q^\star(s',a')\Bigr],
\qquad
v^\star(s)=\max_a q^\star(s,a).
$$

Kennt man $q^\star$, ist die optimale Politik abgelesen: In jedem Zustand die Aktion mit dem größten Wert wählen, $\pi^\star(s)=\operatorname{argmax}_a q^\star(s,a)$. Für Frozen Lake sind $p$ und $r$ bekannt, deshalb lässt sich $q^\star$ durch Wertiteration direkt aus der Bellman-Optimalitätsgleichung berechnen; der Abschnitt „Vergleich der Verfahren“ stellt die gelernten Werte daneben. Die Verfahren im Code kennen $p$ allerdings nicht. Sie beobachten nur Übergänge $(s,a,r,s')$ und müssen die Erwartungswerte in den Bellman-Gleichungen durch Stichproben ersetzen. Genau das ist der Kern von Reinforcement Learning.

## Erkunden und ausnutzen

Wer nur die aktuell beste Aktion wählt, findet nie heraus, ob eine andere besser wäre. Die **$\varepsilon$-greedy-Politik** löst dieses Dilemma mit einem Münzwurf: Mit Wahrscheinlichkeit $\varepsilon$ wird eine zufällige Aktion gewählt, sonst die *gierige*,

$$
\pi_\varepsilon(a\mid s)=
\begin{cases}
1-\varepsilon+\dfrac{\varepsilon}{|\mathcal{A}|}, & a=\operatorname{argmax}_{a'}Q(s,a'),\\
\dfrac{\varepsilon}{|\mathcal{A}|}, & \text{sonst.}
\end{cases}
$$

```python
def get_action(Q: np.ndarray, state_index: int, epsilon: float) -> int:
    "Return an action selected by an epsilon-greedy exploration policy."

    if np.random.rand() < epsilon:  # explore
        return int(np.random.randint(0, Q.shape[1]))

    return int(np.argmax(Q[state_index, :]))  # exploit
```

Startwerte, Minima und Abklingdauern beider Zeitpläne stehen zusammen mit dem Diskontfaktor und der Zahl der Episoden in der Konfiguration des Skripts:

```python
# ─────────────────────────── Config ────────────────────────────
DO_TRAINING: bool = False  # ← flip to True to train
SEED: int = 42
ENV_NAME: str = (
    "FrozenLake-v1"  # 'FrozenLake-v1', 'FrozenLake8x8-v1', 'CliffWalking-v0', 'Taxi-v3'
)
MODEL: str = "sarsa_lambda"  # 'single_q', 'double_q', 'sarsa', 'sarsa_lambda', 'mc'
NUM_EPISODES: int = 100_000
Q_FILE: Path = Path(
    "examples", "files", f"{Path(__file__).stem}_{MODEL}_{ENV_NAME}.npy"
)

GAMMA: float = 0.99  # Discount factor
# ────────────────────────────────────────────────────────────────
INIT_ALPHA = 1.0
MIN_ALPHA = 0.1  # 0.05
ALPHA_DECAY_RATIO = 0.9  # after 90% of episodes, alpha will be at its minimum
# ────────────────────────────────────────────────────────────────
INIT_EPSILON = 1.0
MIN_EPSILON = 0.1  # 0.01
EPSILON_DECAY_RATIO = 0.9
# ────────────────────────────────────────────────────────────────
```

Zu Beginn ist $\varepsilon=1$, der Wanderer irrt zufällig über das Eis. Mit wachsender Erfahrung sinkt $\varepsilon$ auf $0{,}1$, sodass die Tabelle am Ende zu 90 Prozent ausgenutzt und zu 10 Prozent weiter erkundet wird. Die Schrittweite $\alpha$ folgt demselben Zeitplan von $1$ auf $0{,}1$. Beide Verläufe erzeugt `decay_schedule`: logarithmisch verteilte Stützstellen zwischen $10^{-2}$ und $1$, umgekehrt, auf $[0,1]$ normiert und auf [Minimum, Startwert] skaliert; nach 90 Prozent der Episoden bleibt der Minimalwert stehen.

```python
def decay_schedule(
    init_value: float,
    min_value: float,
    decay_ratio: float,
    max_steps: int,
    log_start: float = -2,
    log_base: float = 10,
) -> np.ndarray:
    decay_steps = int(max_steps * decay_ratio)
    rem_steps = max_steps - decay_steps

    values = np.logspace(log_start, 0, decay_steps, base=log_base, endpoint=True)[::-1]
    values = (values - values.min()) / (values.max() - values.min())
    values = (init_value - min_value) * values + min_value
    values = np.pad(values, (0, rem_steps), "edge")

    return values
```

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/schedules.svg" alt="Verlauf von Epsilon und Alpha über 100 000 Episoden: schneller Abfall von 1 am Anfang, flacher Verlauf bis 0,1 bei 90 Prozent der Episoden, danach konstant" width="790" height="384" loading="lazy">
  <figcaption>Abbildung 3: Der gemeinsame Zeitplan für $\varepsilon$ und $\alpha$. Beide fallen in den ersten Episoden schnell, nähern sich dann langsam ihrem Minimum 0,1 und bleiben in den letzten zehn Prozent der Episoden konstant.</figcaption>
</figure>

Abbildung 4 zeigt eine Episode aus dieser Anfangsphase. Mit rein zufälligen Aktionen dauert eine Episode im Mittel knapp acht Schritte und erreicht das Ziel nur mit Wahrscheinlichkeit 1,4 Prozent, also etwa einmal in 70 Episoden. Solange das nicht geschieht, bleibt die Tabelle leer: Ein Sturz ins Loch bringt die Belohnung 0, und genau diesen Wert hat die Tabelle schon. Erst ein zufälliger Treffer setzt den ersten positiven Eintrag, und von dort breitet sich der Wert Episode für Episode rückwärts aus.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/erkundung.gif" alt="Animation einer frühen Episode mit Epsilon gleich 1: Die Figur wählt in jedem Schritt eine zufällige Aktion und fällt schließlich in ein Loch" width="512" height="548" loading="lazy">
  <figcaption>Abbildung 4: Eine Episode ganz am Anfang des Trainings mit $\varepsilon=1$. Jede Aktion ist zufällig, und wie die meisten Episoden dieser Phase endet sie in einem Loch.</figcaption>
</figure>

Die Schrittweite $\alpha$ bestimmt, wie stark eine einzelne Beobachtung die Tabelle verändert. Theoretisch konvergieren die Verfahren, wenn $\alpha$ langsam genug gegen null geht, mit $\sum_t\alpha_t=\infty$ und $\sum_t\alpha_t^2<\infty$ (Robbins und Monro). Der Code lässt $\alpha$ bei $0{,}1$ stehen, ein in der Praxis üblicher Kompromiss: Die Tabelle bleibt beweglich, die Schätzungen schwanken dafür um ihren Grenzwert.

## Lernen aus Stichproben: die Tabelle

Alle fünf Verfahren halten die Schätzung der Aktionswerte in einer Tabelle $Q$ mit 16 Zeilen und 4 Spalten, anfangs null. Jede Beobachtung liefert einen **Zielwert** für einen Eintrag, und der Eintrag bewegt sich um den Bruchteil $\alpha$ auf dieses Ziel zu:

$$
Q(S_t,A_t)\;\leftarrow\;Q(S_t,A_t)+\alpha\,\bigl[\,\underbrace{\text{Ziel}_t-Q(S_t,A_t)}_{\text{Fehler }\delta_t}\,\bigr].
$$

Das ist ein gleitender Mittelwert über verrauschte Stichproben des Erwartungswerts in der Bellman-Gleichung, eine stochastische Approximation. Die Verfahren unterscheiden sich allein darin, wie der Zielwert gebildet wird: aus einem Schritt und der eigenen Schätzung des Nachfolgers (Temporal-Difference-Lernen), aus mehreren Schritten mit Gewichten (SARSA(λ)) oder aus der vollständigen Episode (Monte Carlo). Abbildung 5 zeigt, wie sich die Tabelle beim Q-Learning über 100 000 Episoden füllt: zuerst die Felder neben dem Ziel, dann rückwärts entlang der sicheren Wege.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/q-tabelle.gif" alt="Animation der Q-Tabelle während des Q-Learnings: Jedes Feld ist in vier Dreiecke für die vier Aktionen geteilt, deren Färbung mit dem Wert wächst; Pfeile zeigen die gierige Aktion; die Werte breiten sich vom Ziel aus rückwärts aus" width="512" height="576" loading="lazy">
  <figcaption>Abbildung 5: Die Tabelle $Q$ während des Q-Learnings. Jedes Feld ist in vier Dreiecke geteilt, eines je Aktion; die Farbe zeigt $Q(s,a)$, der Pfeil die <em>gierige</em> Aktion, die Zahl den Wert $\max_a Q(s,a)$. Die Werte wachsen vom Ziel aus rückwärts, weil jeder Zielwert die Schätzung des Nachfolgers enthält.</figcaption>
</figure>

## Die Update-Regeln

Alle Verfahren laufen in derselben Schleife: Episode starten, Aktion nach $\varepsilon$-greedy wählen, Schritt ausführen, Tabelle aktualisieren, bis die Episode endet. Der Ausdruck `(not done)` in den Zielwerten sorgt dafür, dass hinter einem Endzustand nichts mehr gebootstrappt wird: Der Wert eines Lochs oder des Ziels ist null, die Belohnung steht dann allein. Der Code behandelt auch den Abbruch nach 100 Schritten so; streng genommen müsste dort weiter mit $Q(s',\cdot)$ gerechnet werden, in Frozen Lake spielt das kaum eine Rolle.

### Q-Learning

Q-Learning bildet den Zielwert aus der Belohnung und dem besten geschätzten Wert des Folgezustands,

$$
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\Bigl[R_{t+1}+\gamma\max_{a}Q(S_{t+1},a)-Q(S_t,A_t)\Bigr].
$$

Das ist die Bellman-Optimalitätsgleichung als Stichprobe: Erwartungswert über $s'$ ersetzt durch den beobachteten Nachfolger, $q^\star$ ersetzt durch die aktuelle Schätzung. Das Maximum im Zielwert bezieht sich auf die *gierige* Politik, egal welche Aktion der Wanderer tatsächlich als nächstes wählt. Q-Learning ist deshalb **off-policy**: Es lernt die Werte der optimalen Politik, während es mit einer erkundenden Politik handelt. Unter den genannten Bedingungen an $\alpha$ und wenn jedes Paar $(s,a)$ unendlich oft besucht wird, konvergiert $Q$ gegen $q^\star$.

```python
def train_q_learning(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run Q‑learning."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            total_reward += reward
            done = terminated or truncated

            target = reward + gamma * np.max(Q[next_state]) * (not done)
            error = target - Q[state, action]
            Q[state, action] += alphas[episode] * error

            state = next_state
            action = get_action(Q, next_state, epsilon=epsilons[episode])
        episodic_reward[episode] = total_reward
    return Q, episodic_reward
```

### Double Q-Learning

Das Maximum im Zielwert von Q-Learning hat einen systematischen Fehler. Sind die Einträge $Q(s',a)$ verrauschte Schätzungen der wahren Werte, gilt für ihr Maximum

$$
\mathbb E\Bigl[\max_a Q(s',a)\Bigr]\;\geq\;\max_a\,\mathbb E\bigl[Q(s',a)\bigr],
$$

denn das Maximum greift bevorzugt die Einträge heraus, die zufällig nach oben abweichen. Die Zielwerte sind dadurch im Mittel zu groß, besonders in Zuständen mit vielen ähnlich guten Aktionen und wenigen Beobachtungen. Double Q-Learning entkoppelt die Auswahl der besten Aktion von der Bewertung ihres Werts mit zwei Tabellen. In jedem Schritt wird per Münzwurf eine Tabelle aktualisiert; sie wählt die Aktion, die andere liefert den Wert:

$$
Q_1(S_t,A_t)\leftarrow Q_1(S_t,A_t)+\alpha\Bigl[R_{t+1}+\gamma\,Q_2\bigl(S_{t+1},\operatorname{argmax}_a Q_1(S_{t+1},a)\bigr)-Q_1(S_t,A_t)\Bigr],
$$

und mit vertauschten Rollen für $Q_2$. Weil beide Tabellen aus verschiedenen Stichproben gelernt werden, ist der Fehler der einen unabhängig von der Auswahl der anderen, und der Erwartungswert des Zielwerts ist nicht mehr nach oben verzerrt. Gehandelt wird nach der Summe $Q_1+Q_2$; zurückgegeben wird ihr Mittel.

```python
def train_double_q_learning(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run double Q‑learning."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q1 = np.zeros((n_states, n_actions), dtype=np.float32)
    Q2 = np.zeros((n_states, n_actions), dtype=np.float32)

    episodic_reward = np.zeros(num_episodes, dtype=np.float32)  # for plotting

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        # initialize episode
        total_reward = 0.0
        done = False
        state, _ = env.reset()

        # parameters for episode
        alpha = alphas[episode]
        epsilon = epsilons[episode]

        while not done:
            action = get_action((Q1 + Q2), state, epsilon=epsilon)  # :2 does not matter
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            total_reward += reward

            if np.random.rand() < 0.5:
                # Q1
                target = reward + gamma * Q2[next_state, np.argmax(Q1[next_state])] * (
                    not done
                )
                error = target - Q1[state, action]
                Q1[state, action] += alpha * error
            else:
                # Q2
                target = reward + gamma * Q1[next_state, np.argmax(Q2[next_state])] * (
                    not done
                )
                error = target - Q2[state, action]
                Q2[state, action] += alpha * error

            # initialize next step
            state = next_state

        episodic_reward[episode] = total_reward
    return (Q1 + Q2) / 2, episodic_reward
```

### SARSA

SARSA verwendet im Zielwert nicht das Maximum, sondern den Wert der Aktion $A_{t+1}$, die der Wanderer tatsächlich als nächstes ausführt. Der Name steht für das Quintupel $(S,A,R,S',A')$:

$$
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\Bigl[R_{t+1}+\gamma\,Q(S_{t+1},A_{t+1})-Q(S_t,A_t)\Bigr].
$$

Das ist die Bellman-Gleichung für $q_\pi$ der aktuellen $\varepsilon$-greedy-Politik als Stichprobe. SARSA ist **on-policy**: Es bewertet die Politik, mit der es handelt, einschließlich ihrer Erkundungsfehler. Solange $\varepsilon>0$ ist, bezahlt die Schätzung für gelegentliche zufällige Schritte in Löcher, deshalb bevorzugt SARSA in der Nähe von Gefahren vorsichtigere Wege als Q-Learning. Lässt man $\varepsilon$ gegen null gehen, konvergiert auch SARSA gegen $q^\star$. Im Code wird die nächste Aktion vor dem Update gezogen, damit sie in den Zielwert eingehen kann, und dann im nächsten Schritt ausgeführt.

```python
def train_sarsa(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run SARSA."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            next_action = get_action(Q, next_state, epsilon=epsilons[episode])
            total_reward += reward
            done = terminated or truncated

            target = reward + gamma * Q[next_state, next_action] * (not done)
            error = target - Q[state, action]
            Q[state, action] += alphas[episode] * error

            state = next_state
            action = next_action

        episodic_reward[episode] = total_reward
    return Q, episodic_reward
```

### SARSA(λ)

Ein Zielwert aus einem Schritt ist stark verzerrt, solange die Tabelle noch falsch ist; ein Zielwert aus der ganzen Episode ist unverzerrt, aber verrauscht. Dazwischen liegen die $n$-Schritt-Returns

$$
G_t^{(n)}=R_{t+1}+\gamma R_{t+2}+\cdots+\gamma^{n-1}R_{t+n}+\gamma^n\,Q(S_{t+n},A_{t+n}),
$$

und der **$\lambda$-Return** gewichtet sie geometrisch mit $(1-\lambda)\lambda^{n-1}$:

$$
G_t^{\lambda}=(1-\lambda)\sum_{n=1}^{T-t-1}\lambda^{n-1}G_t^{(n)}+\lambda^{T-t-1}G_t .
$$

Für $\lambda=0$ bleibt der Ein-Schritt-Zielwert von SARSA, für $\lambda=1$ der Monte-Carlo-Return. Diese Vorwärtssicht lässt sich erst am Ende der Episode auswerten. Die Rückwärtssicht erreicht näherungsweise dasselbe Schritt für Schritt mit **Eligibility Traces**: Jedes Paar $(s,a)$ trägt eine Spur $e(s,a)$, die beim Besuch auf eins gesetzt wird und danach mit $\gamma\lambda$ je Schritt abklingt. Der aktuelle TD-Fehler $\delta_t$ wird allen Paaren im Verhältnis ihrer Spur gutgeschrieben:

$$
\delta_t=R_{t+1}+\gamma Q(S_{t+1},A_{t+1})-Q(S_t,A_t),
\qquad
e_t(S_t,A_t)=1,
$$

$$
Q(s,a)\leftarrow Q(s,a)+\alpha\,\delta_t\,e_t(s,a)\quad\text{für alle }(s,a),
\qquad
e_{t+1}=\gamma\lambda\,e_t .
$$

Die Variante mit $e\leftarrow1$ heißt „replacing traces“; die Alternative $e\leftarrow e+1$ („accumulating traces“) würde mehrfach besuchte Paare stärker gewichten. Erreicht der Wanderer das Ziel, verteilt der eine große Fehler $\delta=1-Q$ die Belohnung sofort rückwärts über den gesamten gelaufenen Weg, abgeschwächt mit $(\gamma\lambda)^k$ für $k$ Schritte Abstand. Ohne Spuren würde dieselbe Information pro Episode nur um ein Feld wandern. Der Code verwendet $\lambda=0{,}9$ und aktualisiert die ganze Tabelle mit einer Matrixoperation.

```python
def train_sarsa_lambda(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run SARSA(λ)."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    LAMBDA = 0.9  # constant λ parameter for SARSA(λ)

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        eligibility_trace = np.zeros((n_states, n_actions), dtype=np.float32)

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            next_action = get_action(Q, next_state, epsilon=epsilons[episode])
            total_reward += reward
            done = terminated or truncated

            # Calculate td error
            target = reward + gamma * Q[next_state, next_action] * (not done)
            error = target - Q[state, action]

            # Update eligibility trace
            eligibility_trace[state, action] = 1.0

            # Update all Q-values using eligibility traces
            Q += alphas[episode] * error * eligibility_trace

            # Fade eligibility traces
            eligibility_trace *= gamma * LAMBDA  # decay eligibility traces

            state = next_state
            action = next_action

        episodic_reward[episode] = total_reward
    return Q, episodic_reward
```

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/spuren.gif" alt="Animation einer SARSA-Lambda-Episode mit zwei Tafeln: links die Q-Tabelle mit gierigen Pfeilen und der Figur, rechts die Eligibility Traces, die entlang des gelaufenen Wegs blau leuchten und Schritt für Schritt verblassen" width="790" height="444" loading="lazy">
  <figcaption>Abbildung 6: Eine Episode mit SARSA(λ). Links die Tabelle $Q$, rechts die Spuren $e(s,a)$: Das zuletzt besuchte Paar hat die Spur 1, ältere Paare verblassen mit $\gamma\lambda=0{,}891$ je Schritt. Jeder TD-Fehler $\delta$ wirkt auf alle Paare mit Spur, nicht nur auf das aktuelle.</figcaption>
</figure>

### Monte Carlo

Das Monte-Carlo-Verfahren wartet das Ende der Episode ab und verwendet den tatsächlichen Return als Zielwert:

$$
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha\Bigl[G_t-Q(S_t,A_t)\Bigr],
\qquad
G_t=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1}.
$$

Der Zielwert enthält keine eigene Schätzung mehr und ist deshalb unverzerrt, aber er schwankt stark: Ob ein Weg zum Ziel führt, entscheidet im rutschigen Eis der Zufall, und jede Episode liefert nur einen einzigen Return. Der Code aktualisiert jedes Paar $(s,a)$ nur beim ersten Besuch in einer Episode („first visit“) und mit konstantem $\alpha$ statt mit dem exakten Mittelwert aller Returns; so bleibt das Verfahren auch dann beweglich, wenn sich die Politik ändert.

```python
def train_mc(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run MC."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])

        trajectory = []
        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            experience = (state, action, reward, next_state, done)
            trajectory.append(experience)

            state = next_state
            action = get_action(Q, state, epsilon=epsilons[episode])  # next action

        rewards = np.array([r for (_, _, r, _, _) in trajectory], dtype=np.float32)
        discounts = gamma ** np.arange(len(rewards))

        visited = np.zeros((n_states, n_actions), dtype=bool)
        for t, (s, a, _, _, _) in enumerate(trajectory):
            if visited[s, a]:
                continue
            visited[s, a] = True

            n_steps = len(trajectory[t:])
            target = np.sum(rewards[t:] * discounts[:n_steps])
            error = target - Q[s, a]
            Q[s, a] += alphas[episode] * error

        episodic_reward[episode] = rewards.sum()

    return Q, episodic_reward
```

## Ein Update-Schritt im Detail

Abbildung 7 zerlegt einen einzelnen Q-Learning-Schritt. Links steht der Wanderer im Feld $s$ und hat die Aktion $a$ gewählt; die zugehörige Zelle der Tabelle ist umrandet. Rechts ist dieselbe Tabelle als Wertetafel mit 16 Zeilen und 4 Spalten zu sehen. Nach dem Schritt sind der Folgezustand $s'$, die Belohnung $r$, der Zielwert $r+\gamma\max_a Q(s',a)$, der Fehler $\delta$ und der neue Eintrag angegeben. Bei einer Belohnung von null wächst der Eintrag nur, wenn der Nachfolger schon einen Wert hat: Information fließt rückwärts vom Ziel zum Start.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/update-schritt.gif" alt="Animation eines Q-Learning-Schritts mit zwei Tafeln: links das Gitter mit der Figur und der umrandeten aktuellen Zelle, rechts die Tabelle mit 16 Zeilen und 4 Spalten; über der Tabelle stehen Zielwert, Fehler und neuer Eintrag" width="790" height="465" loading="lazy">
  <figcaption>Abbildung 7: Eine Episode Q-Learning Schritt für Schritt. Vor jedem Schritt sind Zustand und Aktion markiert, nach dem Schritt der Folgezustand, Zielwert, Fehler $\delta$ und das Update des Eintrags $Q(s,a)$.</figcaption>
</figure>

## Vergleich der Verfahren

Alle fünf Verfahren laufen mit denselben Zeitplänen über 100 000 Episoden. Abbildung 8 zeigt die gleitende Erfolgsquote während des Trainings, also den Anteil der Episoden, die das Ziel erreichen. Sie steigt, während $\varepsilon$ fällt, und bleibt mit 0,1 bis 0,4 weit unter der Erfolgsquote der *gierigen* Politik: Die Politik erkundet bis zum Ende zu 10 Prozent, und auf dem rutschigen Eis genügt ein zufälliger Schritt neben einem Loch, um die Episode zu verlieren.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/lernkurven.svg" alt="Fünf Lernkurven über 100 000 Episoden: gleitende Erfolgsquote von Q-Learning, Double Q-Learning, SARSA, SARSA-Lambda und Monte Carlo, steigend auf etwa 0,1 bis 0,4" width="790" height="384" loading="lazy">
  <figcaption>Abbildung 8: Erfolgsquote während des Trainings, gleitend gemittelt über 2000 Episoden. Die Kurven enthalten die Erkundungsschritte der $\varepsilon$-greedy-Politik.</figcaption>
</figure>

Abbildung 9 stellt die gelernten Tabellen der Wertiteration gegenüber, die $q^\star$ aus dem bekannten Modell berechnet. Die *gierigen* Pfeile stimmen weitgehend überein; die Werte selbst weichen ab, weil die Verfahren die Werte ihrer eigenen, teils erkundenden Politik schätzen und $\alpha$ nicht gegen null geht.

<figure class="static-figure">
  <img src="/img/notes/frozen-lake/politiken.svg" alt="Sechs Gitter nebeneinander: die gelernten Tabellen der fünf Verfahren und q-Stern aus der Wertiteration, jeweils mit gefärbten Dreiecken, gierigen Pfeilen und Zustandswerten" width="790" height="568" loading="lazy">
  <figcaption>Abbildung 9: Die gelernten Tabellen der fünf Verfahren und $q^\star$ aus der Wertiteration mit demselben $\gamma=0{,}99$. Farben und Zahlen zeigen die Werte, Pfeile die <em>gierige</em> Aktion.</figcaption>
</figure>

Die folgende Tabelle bewertet die *gierigen* Politiken ($\varepsilon=0$) nach 100 000 Episoden exakt. Weil das Übergangsmodell bekannt ist, liefert eine Politikbewertung mit $\gamma=1$ die Wahrscheinlichkeit, von $s_0$ aus das Ziel zu erreichen, einmal innerhalb der 100 Schritte, nach denen die Umgebung abbricht, und einmal ohne diese Grenze. Daneben stehen der geschätzte Wert des Startzustands, $v(s_0)=\max_a Q(s_0,a)$, und die Zustände, in denen der *gierige* Pfeil von $q^\star$ abweicht. Zum Vergleich steht die optimale Politik aus der Wertiteration. Alle sechs Politiken lassen sich auch im Editor oben laden und Feld für Feld verändern.

| Verfahren | Erfolg in 100 Schritten | Erfolg ohne Grenze | geschätztes $v(s_0)$ | Pfeile abweichend von $q^\star$ |
| --- | --- | --- | --- | --- |
| Q-Learning | 0,55 | 0,82 | 0,49 | $s_0$ |
| Double Q-Learning | 0,21 | 0,21 | 0,15 | $s_0$, $s_2$, $s_8$, $s_{14}$ |
| SARSA | 0,73 | 0,78 | 0,29 | $s_2$ |
| SARSA(λ) | 0,51 | 0,52 | 0,22 | $s_0$, $s_2$ |
| Monte Carlo | 0,67 | 0,70 | 0,17 | $s_1$, $s_2$, $s_3$, $s_6$ |
| optimale Politik ($q^\star$) | 0,74 | 0,82 | 0,54 | – |

Drei Dinge fallen auf:

1. **Nur Q-Learning trifft den Startwert.** Sein geschätztes $v(s_0)$ liegt nahe am wahren $v^\star(s_0)=0{,}54$, weil es *off-policy* die Werte der *gierigen* Politik lernt. SARSA, SARSA(λ) und Monte Carlo schätzen die Werte der $\varepsilon$-greedy-Politik, die zu 10 Prozent zufällig handelt und entsprechend öfter in Löchern landet; ihre Werte liegen deshalb zu Recht tiefer.
2. **Einzelne Felder entscheiden über die Erfolgsquote.** Q-Learning weicht nur in Zustand 0 von $q^\star$ ab: „unten“ hat dort mit $q^\star(s_0,\text{unten})=0{,}53$ fast denselben Wert wie „links“ mit $0{,}54$, ein einzelner Schritt nach unten kostet also kaum etwas. Die *gierige* Politik geht aber bei jedem Besuch in Zustand 0 nach unten. Das schiebt den Agenten mit Wahrscheinlichkeit $1/3$ nach rechts in die obere Reihe, wo die einzige sichere Aktion „oben“ lange an der Wand entlangpendelt. Ohne Schrittgrenze erreichen beide Politiken das Ziel mit 0,82; innerhalb von 100 Schritten fällt die Erfolgsquote aber von 0,74 auf 0,55, und der exakte Wert der Politik sinkt von 0,54 auf 0,42. Bei Double Q-Learning zeigt der Pfeil in Zustand 8 nach rechts statt nach oben ($q^\star$: 0,40 statt 0,59): Jeder Besuch dort rutscht mit Wahrscheinlichkeit $1/3$ ins Loch 12, und die Erfolgsquote bricht auf 0,21 ein. Weil $\alpha$ bei 0,1 stehen bleibt, schwanken die Einträge bis zum Schluss, und ein einziger falsch gekippter Pfeil kostet viel.
3. **Ein einzelner Lauf hängt am Seed.** Mit den Seeds 7 und 123 statt 42 erreichen Double Q-Learning und Q-Learning je rund 0,73 innerhalb von 100 Schritten, also die Grenze der optimalen Politik; die auf zwei Tabellen verteilten Updates verlangsamen das Lernen, verschlechtern die Tabelle nach 100 000 Episoden aber nicht systematisch.

Die Unterschiede in den Lernkurven folgen aus den Zielwerten: Die TD-Verfahren bootstrappen und lernen schon aus unvollständigen Episoden, Monte Carlo braucht den Ausgang jeder Episode und schwankt stärker. Q-Learning und Double Q-Learning zielen auf die optimale Politik, SARSA und SARSA(λ) auf die Werte der erkundenden Politik, was in der Nähe der Löcher zu vorsichtigeren Pfeilen führt. SARSA(λ) verteilt jede Belohnung über den ganzen Weg zurück; in diesem Beispiel verteilt es damit auch jeden Fehltritt, und seine Erfolgsquote während des Trainings bleibt niedriger als die der Ein-Schritt-Verfahren.

## Testen

Nach dem Training spielt `test` eine Episode mit der *gierigen* Politik, also mit $\varepsilon=0$, und gibt die Belohnung zurück. Im rutschigen Frozen Lake ist das Ergebnis selbst mit der optimalen Politik zufällig; erst der Mittelwert über viele Testläufe zeigt die Qualität der Tabelle. Mit bekanntem Modell geht es genauer: Die Erfolgswahrscheinlichkeiten in der Tabelle oben sind exakt aus den Übergangswahrscheinlichkeiten berechnet.

```python
def test(env: gym.Env, Q: np.ndarray) -> float:
    """Play one episode greedily and return the accumulated reward."""
    state, _ = env.reset(seed=SEED)
    terminated = truncated = False
    total_reward: float = 0.0

    while not (terminated or truncated):
        action = get_action(Q, state, epsilon=0.0)  # greedy action
        state, reward, terminated, truncated, _ = env.step(action)
        total_reward += reward
    return total_reward
```

## Der vollständige Code

Das vollständige Skript. Mit `DO_TRAINING = True` trainiert es das in `MODEL` gewählte Verfahren, speichert die Tabelle und zeichnet die geglättete Lernkurve; mit `DO_TRAINING = False` lädt es die Tabelle und spielt eine Episode im Fenster von Gymnasium vor. Über `ENV_NAME` lassen sich auch das $8\times8$-Feld, Cliff Walking und Taxi verwenden, alle mit diskreten Zuständen und Aktionen.

<details class="code-details">
<summary>Skript anzeigen (rund 400 Zeilen)</summary>

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

from pathlib import Path

import gymnasium as gym
import matplotlib.pyplot as plt
import numpy as np
from tqdm import tqdm

# ─────────────────────────── Config ────────────────────────────
DO_TRAINING: bool = False  # ← flip to True to train
SEED: int = 42
ENV_NAME: str = (
    "FrozenLake-v1"  # 'FrozenLake-v1', 'FrozenLake8x8-v1', 'CliffWalking-v0', 'Taxi-v3'
)
MODEL: str = "sarsa_lambda"  # 'single_q', 'double_q', 'sarsa', 'sarsa_lambda', 'mc'
NUM_EPISODES: int = 100_000
Q_FILE: Path = Path(
    "examples", "files", f"{Path(__file__).stem}_{MODEL}_{ENV_NAME}.npy"
)

GAMMA: float = 0.99  # Discount factor
# ────────────────────────────────────────────────────────────────
INIT_ALPHA = 1.0
MIN_ALPHA = 0.1  # 0.05
ALPHA_DECAY_RATIO = 0.9  # after 90% of episodes, alpha will be at its minimum
# ────────────────────────────────────────────────────────────────
INIT_EPSILON = 1.0
MIN_EPSILON = 0.1  # 0.01
EPSILON_DECAY_RATIO = 0.9
# ────────────────────────────────────────────────────────────────


def get_action(Q: np.ndarray, state_index: int, epsilon: float) -> int:
    "Return an action selected by an epsilon-greedy exploration policy."

    if np.random.rand() < epsilon:  # explore
        return int(np.random.randint(0, Q.shape[1]))

    return int(np.argmax(Q[state_index, :]))  # exploit


def decay_schedule(
    init_value: float,
    min_value: float,
    decay_ratio: float,
    max_steps: int,
    log_start: float = -2,
    log_base: float = 10,
) -> np.ndarray:
    decay_steps = int(max_steps * decay_ratio)
    rem_steps = max_steps - decay_steps

    values = np.logspace(log_start, 0, decay_steps, base=log_base, endpoint=True)[::-1]
    values = (values - values.min()) / (values.max() - values.min())
    values = (init_value - min_value) * values + min_value
    values = np.pad(values, (0, rem_steps), "edge")

    return values


def train_q_learning(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run Q‑learning."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            total_reward += reward
            done = terminated or truncated

            target = reward + gamma * np.max(Q[next_state]) * (not done)
            error = target - Q[state, action]
            Q[state, action] += alphas[episode] * error

            state = next_state
            action = get_action(Q, next_state, epsilon=epsilons[episode])
        episodic_reward[episode] = total_reward
    return Q, episodic_reward


def train_double_q_learning(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run double Q‑learning."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q1 = np.zeros((n_states, n_actions), dtype=np.float32)
    Q2 = np.zeros((n_states, n_actions), dtype=np.float32)

    episodic_reward = np.zeros(num_episodes, dtype=np.float32)  # for plotting

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        # initialize episode
        total_reward = 0.0
        done = False
        state, _ = env.reset()

        # parameters for episode
        alpha = alphas[episode]
        epsilon = epsilons[episode]

        while not done:
            action = get_action((Q1 + Q2), state, epsilon=epsilon)  # :2 does not matter
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            total_reward += reward

            if np.random.rand() < 0.5:
                # Q1
                target = reward + gamma * Q2[next_state, np.argmax(Q1[next_state])] * (
                    not done
                )
                error = target - Q1[state, action]
                Q1[state, action] += alpha * error
            else:
                # Q2
                target = reward + gamma * Q1[next_state, np.argmax(Q2[next_state])] * (
                    not done
                )
                error = target - Q2[state, action]
                Q2[state, action] += alpha * error

            # initialize next step
            state = next_state

        episodic_reward[episode] = total_reward
    return (Q1 + Q2) / 2, episodic_reward


def train_sarsa(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run SARSA."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            next_action = get_action(Q, next_state, epsilon=epsilons[episode])
            total_reward += reward
            done = terminated or truncated

            target = reward + gamma * Q[next_state, next_action] * (not done)
            error = target - Q[state, action]
            Q[state, action] += alphas[episode] * error

            state = next_state
            action = next_action

        episodic_reward[episode] = total_reward
    return Q, episodic_reward


def train_sarsa_lambda(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run SARSA(λ)."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    LAMBDA = 0.9  # constant λ parameter for SARSA(λ)

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])
        total_reward = 0.0

        eligibility_trace = np.zeros((n_states, n_actions), dtype=np.float32)

        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            next_action = get_action(Q, next_state, epsilon=epsilons[episode])
            total_reward += reward
            done = terminated or truncated

            # Calculate td error
            target = reward + gamma * Q[next_state, next_action] * (not done)
            error = target - Q[state, action]

            # Update eligibility trace
            eligibility_trace[state, action] = 1.0

            # Update all Q-values using eligibility traces
            Q += alphas[episode] * error * eligibility_trace

            # Fade eligibility traces
            eligibility_trace *= gamma * LAMBDA  # decay eligibility traces

            state = next_state
            action = next_action

        episodic_reward[episode] = total_reward
    return Q, episodic_reward


def train_mc(
    env: gym.Env,
    gamma: float,
    init_alpha: float,
    min_alpha: float,
    alpha_decay_ratio: float,
    init_epsilon: float,
    min_epsilon: float,
    epsilon_decay_ratio: float,
    num_episodes: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Run MC."""
    n_states, n_actions = env.observation_space.n, env.action_space.n
    Q = np.zeros((n_states, n_actions), dtype=np.float32)
    episodic_reward = np.zeros(num_episodes, dtype=np.float32)

    env.reset(seed=SEED)

    alphas = decay_schedule(init_alpha, min_alpha, alpha_decay_ratio, num_episodes)
    epsilons = decay_schedule(
        init_epsilon, min_epsilon, epsilon_decay_ratio, num_episodes
    )

    for episode in tqdm(range(num_episodes), desc="Training"):
        done = False
        state, _ = env.reset()

        action = get_action(Q, state, epsilon=epsilons[episode])

        trajectory = []
        while not done:
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated
            experience = (state, action, reward, next_state, done)
            trajectory.append(experience)

            state = next_state
            action = get_action(Q, state, epsilon=epsilons[episode])  # next action

        rewards = np.array([r for (_, _, r, _, _) in trajectory], dtype=np.float32)
        discounts = gamma ** np.arange(len(rewards))

        visited = np.zeros((n_states, n_actions), dtype=bool)
        for t, (s, a, _, _, _) in enumerate(trajectory):
            if visited[s, a]:
                continue
            visited[s, a] = True

            n_steps = len(trajectory[t:])
            target = np.sum(rewards[t:] * discounts[:n_steps])
            error = target - Q[s, a]
            Q[s, a] += alphas[episode] * error

        episodic_reward[episode] = rewards.sum()

    return Q, episodic_reward


def test(env: gym.Env, Q: np.ndarray) -> float:
    """Play one episode greedily and return the accumulated reward."""
    state, _ = env.reset(seed=SEED)
    terminated = truncated = False
    total_reward: float = 0.0

    while not (terminated or truncated):
        action = get_action(Q, state, epsilon=0.0)  # greedy action
        state, reward, terminated, truncated, _ = env.step(action)
        total_reward += reward
    return total_reward


TRAIN_FN_MAP = {
    "single_q": train_q_learning,
    "double_q": train_double_q_learning,
    "sarsa": train_sarsa,
    "sarsa_lambda": train_sarsa_lambda,
    "mc": train_mc,
}


def main() -> None:
    if DO_TRAINING:
        env = gym.make(ENV_NAME)
        train_fn = TRAIN_FN_MAP[MODEL]
        if train_fn is None:
            raise ValueError(f"Unknown model '{MODEL}'")

        Q, episodic_rewards = train_fn(
            env,
            GAMMA,
            INIT_ALPHA,
            MIN_ALPHA,
            ALPHA_DECAY_RATIO,
            INIT_EPSILON,
            MIN_EPSILON,
            EPSILON_DECAY_RATIO,
            NUM_EPISODES,
        )
        np.save(Q_FILE, Q)
        env.close()
        print(f"Training complete → Q‑table saved to '{Q_FILE}'.")

        # Plot rewards
        window = 50
        smoothed_episodic_rewards = np.convolve(
            episodic_rewards, np.ones(window) / window, mode="valid"
        )
        plt.figure(figsize=(10, 5))
        plt.plot(
            smoothed_episodic_rewards, label="Total Reward", color="blue", alpha=0.7
        )
        plt.xlabel("Episode")
        plt.ylabel("Total Reward")
        plt.title(f"Training Rewards ({ENV_NAME})")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.show()
    else:
        if not Q_FILE.exists():
            raise FileNotFoundError(
                f"Q‑table '{Q_FILE}' not found.  Set DO_TRAINING = True to create it."
            )
        Q = np.load(Q_FILE)
        env = gym.make(ENV_NAME, render_mode="human")
        reward = test(env, Q)
        env.close()
        print(f"Test episode finished with total reward: {reward}")


if __name__ == "__main__":
    main()
```

</details>

## Literatur

Die Grundlagen, Bellman-Gleichungen, Monte-Carlo- und Temporal-Difference-Lernen sowie Eligibility Traces stehen in Sutton und Barto, *Reinforcement Learning: An Introduction*, 2. Auflage, MIT Press 2018, Kapitel 3, 5, 6 und 12 ([online frei verfügbar](http://incompleteideas.net/book/the-book-2nd.html)). Double Q-Learning stammt aus van Hasselt, *Double Q-learning*, Advances in Neural Information Processing Systems 23, 2010. Die Umgebung ist in der [Dokumentation von Gymnasium](https://gymnasium.farama.org/environments/toy_text/frozen_lake/) beschrieben.
