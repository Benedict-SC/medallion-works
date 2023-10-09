import {LitElement, html, css} from '../../lit-core.min.js';

export class UnitsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
  `;
  static get properties() {
    return {
    };
  }

  constructor() {
    super();
  }
  render() {
    return html`
      <div>
        <p>Units go here.</p>
      </div>
    `;
  }
}
window.customElements.define('units-page', UnitsPage);