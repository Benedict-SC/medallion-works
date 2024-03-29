import {LitElement, html, css} from '../../lit-core.min.js';

export class UnitTemplate extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .template-box{
        background-color:#EEE;
    }
    .template-hidden{
        font-size:10px;
        color:#222;
    }
    .template-header{
        background-color:#CCC;
        padding:2px;
    }
    .template-toggle-icon{
        padding:2px;
        background-color: #444;
        border-radius:5px;
        position:relative;
        top:3px;
    }
  `;
  static get properties() {
    return {
      template: {type:Object},
      visible: {type:Boolean},
      editId: {type:Boolean},
      editName: {type:Boolean}
    };
  }

  constructor() {
    super();
    this.visible = true;
    this.editId = false;
    this.editName = false;
  }
  toggle(){
    this.visible = !this.visible;
  }
  toggleEdit(propertyId){
    this["edit" + propertyId] = !(this["edit" + propertyId]);
  }
  modifyProperty(propertyName,target){
    let newValue = target.value;
    if(propertyName == "templateName"){ //do some validation so the IDs don't get wacky
        newValue = newValue.replaceAll(/[^a-zA-Z0-9-]/g, '');
        newValue = newValue.toLowerCase();
    }
    this.template[propertyName] = newValue;
    target.value = newValue;
  }
  render() {
   return html`
            <div class=${"template-box" + (this.visible ? "" : " template-hidden")}>
                <div class="template-header">
                    <img class="template-toggle-icon" src=${this.visible ? "frontend/assets/visible-icon.png" : "frontend/assets/hidden-icon-small.png"} @click=${this.toggle}> 
                    ${
                        (this.editId && this.visible) ? 
                        html`
                            <input type="text" .value=${this.template.templateName} @keyup=${(e) => {this.modifyProperty("templateName",e.target)}} @focusout=${() => this.toggleEdit("Id")}>
                        `:
                        html`<span class="template-id" @click=${() => {this.toggleEdit("Id")}}>${this.template.templateName}</span>`
                    }
                </div>
                ${this.visible ? html`                 
                <div class="template-name">
                    ${
                        this.editName ? 
                        html`
                            <input type="text" .value=${this.template.name} @keyup=${(e) => {this.modifyProperty("name",e.target)}} @focusout=${() => this.toggleEdit("Name")}>
                        `:
                        html`<span @click=${() => {this.toggleEdit("Name")}}>${this.template.name}</span>`
                    }
                </div>`
                : html``}
            </div>
          `
  }
}
window.customElements.define('unit-template', UnitTemplate);