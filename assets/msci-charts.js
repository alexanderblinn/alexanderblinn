/* Shared presentation for imported figures. The original data stays in /img/. */
window.addEventListener("load", function () {
  "use strict";
  const chart = document.getElementById("chart");
  const shell = document.querySelector(".chart-shell");
  const status = document.getElementById("chart-status");
  if (!window.Plotly || !chart || !chart.data) {
    status.textContent = "Das Diagramm konnte nicht geladen werden. Bitte die Seite neu laden.";
    return;
  }
  status.hidden = true;
  const family = '"Courier New", Courier, monospace';
  const presentation = {
    "font.family": family,
    "font.color": "#252525",
    "hoverlabel.font.family": family,
    "hoverlabel.bgcolor": "#faf9f6",
    "paper_bgcolor": "#faf9f6",
    "plot_bgcolor": "#faf9f6"
  };
  (chart.layout.updatemenus || []).forEach(function (_, i) {
    presentation[`updatemenus[${i}].font.family`] = family;
    presentation[`updatemenus[${i}].bgcolor`] = "#faf9f6";
  });
  (chart.layout.sliders || []).forEach(function (_, i) {
    presentation[`sliders[${i}].font.family`] = family;
    presentation[`sliders[${i}].currentvalue.font.family`] = family;
  });
  let scheduled = false;
  function resize() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      const width = shell.clientWidth;
      const height = shell.clientHeight;
      if (chart.layout.width === width && chart.layout.height === height) return;
      Plotly.relayout(chart, { width: width, height: height });
    });
  }
  Plotly.relayout(chart, presentation).then(resize);
  new ResizeObserver(resize).observe(shell);
});
