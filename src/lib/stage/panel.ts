export function applyPanelStyle(
  node: HTMLElement,
  opacity: number,
  offsetY: number,
) {
  node.style.opacity = opacity.toFixed(3);
  node.style.translate = `0 ${offsetY.toFixed(1)}px`;
  node.style.visibility = opacity > 0.02 ? "visible" : "hidden";
}
