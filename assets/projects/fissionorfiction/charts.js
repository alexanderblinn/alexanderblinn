"use strict";
const figure = JSON.parse(document.getElementById("chart-data").textContent);
const kind = document.body.dataset.chart;
const font = { family: '"Courier New", Courier, monospace' };
const layout = figure.layout;
layout.font = { ...layout.font, ...font };
layout.hoverlabel = { ...layout.hoverlabel, font: { ...layout.hoverlabel?.font, ...font }, bgcolor: "#faf9f6" };
layout.paper_bgcolor = "#faf9f6";
layout.plot_bgcolor = "#faf9f6";
layout.title = { text: "" };
layout.margin = { l: 85, r: 35, t: 80, b: 180 };
layout.legend = Object.assign({}, layout.legend, { font: { ...layout.legend?.font, ...font }, y: -0.2, yanchor: "top" });
if (kind !== "evolution") layout.legend.font.size = 14;
// Source and methodology notes are placed in the article, outside the plotting area.
layout.annotations = (layout.annotations || []).filter(a => !a.text.startsWith("Data source:"));
layout.annotations.forEach(a => { a.font = { ...a.font, ...font }; });
for (const axis of ["xaxis", "yaxis"]) {
  if (!layout[axis]) continue;
  layout[axis].tickfont = { ...layout[axis].tickfont, ...font };
  layout[axis].automargin = true;
  layout[axis].title = { ...layout[axis].title, font: { ...layout[axis].title?.font, ...font } };
}
if (kind === "count") {
  layout.coloraxis.colorbar.title.font = { ...layout.coloraxis.colorbar.title.font, ...font };
  layout.coloraxis.colorbar.tickfont = { ...layout.coloraxis.colorbar.tickfont, ...font };
  layout.coloraxis.colorbar.len = 0.35;
}
for (const menu of layout.updatemenus || []) {
  menu.font = { ...menu.font, ...font };
  menu.bgcolor = "#faf9f6";
  for (const button of menu.buttons || []) {
    if (button.method === "update" && button.args[1]) delete button.args[1]["title.text"];
  }
}
for (const slider of layout.sliders || []) {
  slider.font = { ...slider.font, ...font };
  slider.currentvalue = { ...slider.currentvalue, font: { ...slider.currentvalue?.font, ...font } };
}
if (kind === "evolution") {
  layout.margin = { l: 10, r: 10, t: 10, b: 100 };
  layout.geo.bgcolor = "#faf9f6";
  for (const frame of figure.frames) {
    if (frame.layout?.annotations) {
      frame.layout.annotations = frame.layout.annotations.filter(a => !a.text.startsWith("Data source:"));
      frame.layout.annotations.forEach(a => { a.font = { ...a.font, ...font }; });
    }
  }
}
const chart = document.getElementById("chart");
const shell = document.querySelector(".chart-shell");
function fitMapHeight() {
  if (kind !== "evolution") return;
  // A world map is roughly twice as wide as it is high. A tall fixed frame
  // makes Plotly center it in unused space above and below the map.
  const height = Math.ceil((shell.clientWidth - 20) / 2 + 110);
  shell.style.height = `${height}px`;
  if (window.frameElement) window.frameElement.style.height = `${height + 20}px`;
}
fitMapHeight();
layout.width = shell.clientWidth;
layout.height = shell.clientHeight;
Plotly.newPlot(chart, figure.data, layout, { ...figure.config, displaylogo: false })
  .then(() => figure.frames.length ? Plotly.addFrames(chart, figure.frames) : null)
  .then(() => {
    document.getElementById("chart-status").hidden = true;
    new ResizeObserver(() => {
      fitMapHeight();
      if (chart.layout.width !== shell.clientWidth || chart.layout.height !== shell.clientHeight) {
        Plotly.relayout(chart, { width: shell.clientWidth, height: shell.clientHeight });
      }
    }).observe(shell);
  })
  .catch(() => { document.getElementById("chart-status").textContent = "Das Diagramm konnte nicht geladen werden. Bitte die Seite neu laden."; });
