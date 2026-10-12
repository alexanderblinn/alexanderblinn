/* Scalar, unconstrained finite-horizon LQR; all computation stays in the browser. */
(function () {
  "use strict";

  function solveGain(horizon, inputWeight, terminalWeight) {
    var cost = terminalWeight;
    var gain = 0;
    for (var step = horizon - 1; step >= 0; step -= 1) {
      gain = cost / (inputWeight + cost);
      cost = 1 + inputWeight * cost / (inputWeight + cost);
    }
    return gain;
  }

  function simulate(horizon, inputWeight, terminalWeight) {
    var gain = solveGain(horizon, inputWeight, terminalWeight);
    var states = [4];
    var inputs = [];
    for (var step = 0; step < 25; step += 1) {
      var input = -gain * states[step];
      inputs.push(input);
      states.push(states[step] + input);
    }
    return { gain: gain, states: states, inputs: inputs };
  }

  window.ControlDemo = Object.freeze({ solveGain: solveGain, simulate: simulate });

  var form = document.getElementById("control-demo");
  if (!form) return;

  var horizon = document.getElementById("demo-horizon");
  var inputWeight = document.getElementById("demo-input-weight");
  var terminalWeight = document.getElementById("demo-terminal-weight");
  var statePath = document.getElementById("demo-state-path");
  var inputPath = document.getElementById("demo-input-path");
  var number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 });
  var decimal = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function path(values, top, minimum, maximum) {
    return values.map(function (value, index) {
      var x = 54 + index / 25 * 628;
      var y = top + (maximum - value) / (maximum - minimum) * 108;
      return (index === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
    }).join(" ");
  }

  function render() {
    var n = Number(horizon.value);
    var r = Number(inputWeight.value);
    var p = Number(terminalWeight.value);
    var result = simulate(n, r, p);
    var stateAtEnd = result.states[25];

    document.getElementById("demo-horizon-value").value = n + " Schritte";
    document.getElementById("demo-input-weight-value").value = decimal.format(r);
    document.getElementById("demo-terminal-weight-value").value = decimal.format(p);
    horizon.setAttribute("aria-valuetext", n + " Schritte");
    inputWeight.setAttribute("aria-valuetext", decimal.format(r));
    terminalWeight.setAttribute("aria-valuetext", decimal.format(p));

    statePath.setAttribute("d", path(result.states, 42, 0, 4));
    inputPath.setAttribute("d", path(result.inputs, 214, -4, 0));

    document.getElementById("demo-gain").textContent = number.format(result.gain);
    document.getElementById("demo-first-input").textContent = number.format(result.inputs[0]);
    document.getElementById("demo-final-state").textContent = stateAtEnd > 0 && stateAtEnd < 0.001
      ? "< 0,001" : number.format(stateAtEnd);

    var description = "Horizont " + n + ", r = " + decimal.format(r) + ", p = " + decimal.format(p) + ". ";
    description += result.gain === 0
      ? "Die Stellgröße ist null. Der Zustand bleibt bei vier."
      : "Der Zustand startet bei vier und fällt gegen null. Die Stellgröße ist zunächst negativ und nähert sich null.";
    document.getElementById("demo-chart-description").textContent = description;
    document.getElementById("demo-observation").textContent = result.gain === 0
      ? "Bei N = 1 und p = 0 sieht der Regler keinen Nutzen einer Zustandsänderung: Die aktuellen Zustandskosten stehen schon fest, daher spart er die Stellgröße."
      : "In jedem Schritt wird mit demselben Horizont neu gerechnet. Für dieses zeitinvariante, unbeschränkte Beispiel bleibt die Verstärkung K dabei gleich: u[k] = −K · x[k].";
  }

  form.addEventListener("input", render);
  form.addEventListener("reset", function (event) {
    event.preventDefault();
    horizon.value = 5;
    inputWeight.value = 1;
    terminalWeight.value = 0;
    render();
  });

  form.hidden = false;
  document.getElementById("demo-result").hidden = false;
  render();
}());
