import {LitElement, html, css} from '../../lit-core.min.js';

export class UnitsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .templates-browser{
      overflow:scroll;
    }
    .templates-row{
      display:block;
    }
    .template-container{
      display:block;
      background-color
    }
  `;
  static get properties() {
    return {
      templatesList: {type:Array}
    };
  }

  constructor() {
    super();
    window.medallionAPI.getTemplatesData().then(data => {
      this.templatesList = data;
    });
  }
  render() {
    return this.templatesList ? 
    html`
      <div class="templates-browser">
        <div class="templates-row">
        ${this.templatesList.map((template,tidx) => {
          return html`
            <div class="template-container">
              <unit-template .template=${template}></unit-template>
            </div>
          `
        })}
        </div>
      </div>
    `
    :html`Loading...`
  }
}
window.customElements.define('units-page', UnitsPage);