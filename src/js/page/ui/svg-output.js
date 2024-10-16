import { domReady, strToEl } from '../utils.js';
import PanZoom from './pan-zoom.js';

export default class SvgOutput {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="svg-output">' +
        '<div class="svg-container">' +
          '<iframe class="svg-frame" sandbox="allow-scripts" scrolling="no" title="Loaded SVG file"></iframe>' +
        '</div>' +
      '</div>'
    );

    this._svgFrame = this.container.querySelector('.svg-frame');
    this._svgContainer = this.container.querySelector('.svg-container');

    domReady.then(() => {
      this._panZoom = new PanZoom(this._svgContainer, {
        eventArea: this.container,
      });
    });
  }

  setSvg({ text, width, height }) {
    const nextLoad = this._nextLoadPromise();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'image/svg+xml');
    const noNamespace = !doc.documentElement.attributes.xmlns;
    if (noNamespace) {
      this._svgFrame.src = `data:text/html,${encodeURIComponent(
        '<html>' +
          '<head><style>body { margin: 0 }</style></head>' +
          `<body>${text}</body>` +
        '</html>'
      )}`;
    } else {
      const blob = new Blob([text], { type: 'image/svg+xml' });
      this._svgFrame.src = URL.createObjectURL(blob);
    }
    this._svgFrame.style.width = `${width}px`;
    this._svgFrame.style.height = `${height}px`;
    return nextLoad;
  }

  reset() {
    this._svgFrame.src = 'about:blank';
    this._panZoom.reset();
  }

  _nextLoadPromise() {
    return new Promise((resolve) => {
      const onload = () => {
        this._svgFrame.removeEventListener('load', onload);
        resolve();
      };

      this._svgFrame.addEventListener('load', onload);
    });
  }
}
