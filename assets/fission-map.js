// Keep the original Leaflet tooltip, correcting only positions outside the iframe.
window.addEventListener("load", function () {
  const map = Object.values(window).find(value => value instanceof L.Map);
  if (!map) return;
  map.eachLayer(function (layer) {
    const tooltip = layer.getTooltip?.();
    if (!tooltip) return;
    tooltip.options.interactive = true;
    const setPosition = tooltip._setPosition;
    tooltip._setPosition = function (position) {
      setPosition.call(this, position);
      const box = this.getElement();
      L.DomEvent.disableScrollPropagation(box);
      const bounds = map.getContainer().getBoundingClientRect();
      const rect = box.getBoundingClientRect();
      const padding = 12;
      const dx = Math.max(bounds.left + padding - rect.left,
        Math.min(0, bounds.right - padding - rect.right));
      const dy = Math.max(bounds.top + padding - rect.top,
        Math.min(0, bounds.bottom - padding - rect.bottom));
      box.classList.toggle("edge-adjusted", dx !== 0 || dy !== 0);
      if (dx || dy) L.DomUtil.setPosition(box, L.DomUtil.getPosition(box).add([dx, dy]));
    };
  });
});
