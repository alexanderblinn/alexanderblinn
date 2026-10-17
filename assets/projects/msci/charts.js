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
  const fontSize = 14;
  const titleSize = 15;
  function styleAxes(layout) {
    Object.keys(layout).filter(key => /^[xy]axis\d*$/.test(key)).forEach(function (key) {
      const axis = layout[key];
      axis.tickfont = Object.assign({}, axis.tickfont, { family: family, size: fontSize });
      if (axis.title) {
        axis.title.font = Object.assign({}, axis.title.font, { family: family, size: titleSize });
      }
      axis.automargin = true;
    });
  }
  const presentation = {
    "font.family": family,
    "font.size": fontSize,
    "font.color": "#252525",
    "hoverlabel.font.family": family,
    "hoverlabel.font.size": fontSize,
    "legend.font.family": family,
    "legend.font.size": fontSize,
    "hoverlabel.bgcolor": "#faf9f6",
    "paper_bgcolor": "#faf9f6",
    "plot_bgcolor": "#faf9f6"
  };
  const axes = {};
  Object.keys(chart.layout).filter(key => /^[xy]axis\d*$/.test(key)).forEach(function (key) {
    axes[key] = structuredClone(chart.layout[key]);
  });
  styleAxes(axes);
  Object.assign(presentation, axes);
  const menus = structuredClone(chart.layout.updatemenus || []);
  menus.forEach(function (menu) {
    menu.font = Object.assign({}, menu.font, { family: family, size: fontSize });
    menu.bgcolor = "#faf9f6";
    // View buttons replace entire axes; keep the shared typography in those layouts too.
    (menu.buttons || []).forEach(function (button) {
      if (button.method === "update" && button.args && button.args[1]) {
        styleAxes(button.args[1]);
      }
    });
  });
  if (menus.length) presentation.updatemenus = menus;
  const returnBands = chart.data.length > 0 && chart.data.every(trace => trace.type === "bar" && trace.text);
  // On narrow screens the year blocks get smaller labels instead of a horizontal scrollbar.
  const bandSize = width => (width < 640 ? 10 : fontSize);
  let currentBandSize = bandSize(shell.clientWidth);
  if (returnBands) {
    document.body.classList.add("chart-page-bands");
    presentation["uniformtext.minsize"] = currentBandSize;
    presentation["uniformtext.mode"] = "show";
    (chart.layout.annotations || []).forEach(function (_, i) {
      presentation[`annotations[${i}].font.family`] = family;
      presentation[`annotations[${i}].font.size`] = currentBandSize === fontSize ? fontSize : 11;
    });
  }
  (chart.layout.sliders || []).forEach(function (_, i) {
    presentation[`sliders[${i}].font.family`] = family;
    presentation[`sliders[${i}].font.size`] = fontSize;
    presentation[`sliders[${i}].currentvalue.font.family`] = family;
    presentation[`sliders[${i}].currentvalue.font.size`] = fontSize;
  });
  let scheduled = false;
  function resize() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      const width = shell.clientWidth;
      const height = shell.clientHeight;
      if (returnBands && bandSize(width) !== currentBandSize) {
        currentBandSize = bandSize(width);
        const annotationSize = currentBandSize === fontSize ? fontSize : 11;
        const sizes = { "uniformtext.minsize": currentBandSize };
        (chart.layout.annotations || []).forEach(function (_, i) { sizes[`annotations[${i}].font.size`] = annotationSize; });
        Plotly.restyle(chart, { "textfont.size": currentBandSize }).then(() => Plotly.relayout(chart, sizes));
      }
      if (chart.layout.width === width && chart.layout.height === height) return;
      Plotly.relayout(chart, { width: width, height: height });
    });
  }
  const typography = returnBands
    ? Plotly.restyle(chart, { "textfont.family": family, "textfont.size": currentBandSize })
    : Promise.resolve();
  typography.then(() => Plotly.relayout(chart, presentation)).then(resize);
  new ResizeObserver(resize).observe(shell);
});
