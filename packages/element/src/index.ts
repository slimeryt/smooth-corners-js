import { applySmoothCorners } from 'smooth-corners-js';

export class SmoothCornersElement extends HTMLElement {
  static observedAttributes = ['radius', 'smoothing', 'pill'];

  private stop?: () => void;

  connectedCallback() {
    if (!this.style.display) this.style.display = 'block';
    this.render();
  }

  disconnectedCallback() {
    this.stop?.();
    this.stop = undefined;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private render() {
    this.stop?.();
    const radius = Number(this.getAttribute('radius') ?? 16);
    const smoothing = this.hasAttribute('smoothing') ? Number(this.getAttribute('smoothing')) : undefined;
    this.stop = applySmoothCorners(this, { radius, smoothing, pill: this.hasAttribute('pill') });
  }
}

export function defineSmoothCorners(name = 'smooth-corners') {
  if (!customElements.get(name)) customElements.define(name, SmoothCornersElement);
}

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
