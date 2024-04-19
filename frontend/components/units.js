import {LitElement, html, css, repeat} from '../../lit-all.min.js';
import { UnitTemplateData } from '../objects/unit-template.js';

export class UnitsPage extends LitElement {
  static styles = css`
    .templates-browser{
      display:flex;
    }
    .templates-list{
      flex:4;
      height:600px;
      overflow-y:scroll;
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
      padding:4px;
    }
    .template-save-warning{
      color:red;
      font-size:10px;
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
      let list = [];
      data.forEach(x => list.push(new UnitTemplateData(x)));
      this.templatesList = list;
    });
    this.addEventListener('unit-template-modified-event', this.handleMutate);
    this.addEventListener('unit-template-cloned-event',this.handleClone);
  }
  handleMutate(){
    this.someModified = true;
  }
  handleClone(event){
    let template = event.detail;
    let clone = new UnitTemplateData(template);
    clone.templateName = clone.templateName + "-clone";
    let idx = this.templatesList.indexOf(template);
    this.giveUniqueId(clone);
    this.templatesList.splice(idx+1,0,clone);
    this.someModified = true;
    this.requestUpdate();
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
  giveUniqueId(template){
    let originalName = template.templateName;
    let foundMatch = this.templatesList.find(x => x.templateName == template.templateName);
    let counter = 2;
    while(foundMatch){
      template.templateName = originalName + "-" + counter;
      counter++;
      foundMatch = this.templatesList.find(x => {
        return x.templateName == template.templateName;
      });
    } 
  }
  createBlankTemplate(){
    let template = new UnitTemplateData();
    this.giveUniqueId(template);
    this.templatesList.push(template);
    this.someModified = true;
    this.requestUpdate();
  }
  render() {
    return this.templatesList ? 
    html`
      <div class="templates-browser">
        <div class="templates-list">
          <div class="templates-row">
          ${repeat(this.templatesList,(item) => item, (template,idx) =>{
            return html`
              <div class="template-container">
                <unit-template .template=${template}></unit-template>
              </div>
            `
          })}
          <div class="template-add">
            <button @click=${this.createBlankTemplate} class="template-add-button">+ Add new template</button>
          </div>
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