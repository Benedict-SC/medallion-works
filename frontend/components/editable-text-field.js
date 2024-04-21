import {LitElement, html, css} from '../../lit-core.min.js';

export class EditableTextField extends LitElement {
    static styles = css`
        .field-warning{
            color:red;
        }
    `
    static get properties() {
        return {
          client: {type:Object},
          fieldName: {type:String},
          editActive: {type:Boolean},
          warning: {type:String}
        };
    }
    constructor() {
        super();
    }
    toggleEdit(){
        this.editActive = !this.editActive;
    }
    updateValue(ev){
        this.client[this.fieldName] = ev.target.value.trim();
        //then send an event to the parent so it can do validation
        const event = new CustomEvent("field-modified-event", { bubbles:true, composed:true, detail:{client:this.client,field:this.fieldName} });
        this.dispatchEvent(event);
    }
    render(){
        return this.editActive ? 
        html`
            <input type="text" .value=${this.client[this.fieldName]} @change=${(e) => this.updateValue(e)} @focusout=${this.toggleEdit} /> <span class="field-warning">${this.warning}</span>
        `
        :html`
            <span @click=${this.toggleEdit}>${this.client[this.fieldName]}</span>
        `
    }
}
window.customElements.define('editable-text-field', EditableTextField);