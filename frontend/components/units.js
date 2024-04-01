import {LitElement, html, css} from '../../lit-core.min.js';

export class UnitsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .templates-browser{
      overflow-y:scroll;
      display:flex;
      height:600px;
    }
    .templates-list{
      flex:3;
    }
    .templates-row{
      display:block;
    }
    .template-container{
      display:block;
      background-color
    }
    .templates-controls{
      flex:1;
    }
    .template-save-warning{
      color:red;
    }
  `;
  static get properties() {
    return {
      templatesList: {type:Array},
      someModified: {type:Boolean},
      saving: {type:Boolean}
    };
  }

  constructor() {
    super();
    window.medallionAPI.getTemplatesData().then(data => {
      this.templatesList = data;
    });
    this.addEventListener('unit-template-modified-event', this.handleMutate);
  }
  handleMutate(){
    this.someModified = true;
  }
  saveList(){
    let gs = window.gs;
    gs.templates = this.templatesList;
    this.saving = true;
    window.medallionAPI.saveTemplatesData(this.templatesList).then(response => {
      this.saving = false;
      this.someModified = false;
    })
  }
  render() {
    return this.templatesList ? 
    html`
      <div class="templates-browser">
        <div class="templates-list">
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
        <div class="templates-controls">
          ${this.someModified ? html`
          <div class="template-save-warning">You have unsaved changes to unit templates!</div>
          ` : html``}
          <button class="template-save-button" ?disabled=${!this.someModified || this.saving} @click=${this.saveList}>Save templates</button>
        </div>
      </div>
    `
    :html`Loading...`
  }
}
window.customElements.define('units-page', UnitsPage);