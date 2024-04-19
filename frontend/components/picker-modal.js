import {LitElement, html, css} from '../../lit-core.min.js';

export class PickerModal extends LitElement {
  static styles = css`
    .picker-modal-overlay{
        width:100vw;
        height:100vw;
        background-color:#000B;
        border: 1px solid #000B;
    }
    .picker-modal-container{
        border: 2px solid black;
        border-radius: 10px;
        background-color:white;
        width:70%;
        margin:auto;
        margin-top:60px;
        padding:5px;
    }
    .picker-dismiss-button{
        padding:5px;
        font-wight:bold;
        float:right;
    }
  `;
  static get properties() {
    return {
      active: {type:Boolean},
      waitingComponent: {type:Object},
      modalType: {type:String},
      itemCategory: {type:String}
    };
  }
  constructor() {
    super();
    this.itemCategory = "SWORD";
  }
  firstUpdated(){
    super.firstUpdated();
    if(this.modalType == "sprite"){
      window.addEventListener("request-sprite-filename",(e) => this.handleSpriteRequest(e));
    }else if(this.modalType == "item"){
      window.addEventListener("request-inventory-item",(e) => this.handleItemRequest(e,"ITEM"));
      window.addEventListener("request-inventory-weapon",(e) => this.handleItemRequest(e,"SWORD"));
    }
  }
  handleSpriteRequest(event){
    this.active = true;
    this.waitingComponent = event.detail;
    this.addEventListener("file-selected-event", (e) => this.completeSpriteRequest(e), {once:true});
  }
  completeSpriteRequest(event){
    let value = event.detail;
    if(value){
        value = value.replace("./game-client/","");
    }
    this.waitingComponent.receiveFilename(value);
    this.active = false;
  }
  handleItemRequest(event,type){
    this.active = true;
    this.itemCategory = type;
    this.waitingComponent = event.detail;
    this.addEventListener("item-selected-event", (e) => this.completeItemRequest(e), {once:true});
  }
  completeItemRequest(event){
    let value = event.detail;
    this.waitingComponent.receiveItemData(value);
    this.active = false;
  }
  dismissWithoutSelecting(){
    let event;
    //fake an empty event to get rid of the once listener
    if(this.modalType == "sprite"){
      event = new CustomEvent("file-selected-event", { bubbles:true, composed:true });
    }else if(this.modalType == "item"){
      event = new CustomEvent("item-selected-event", { bubbles:true, composed:true });
    }
    this.dispatchEvent(event);
    this.active = false;
  }
  render() {
    if(this.active){
        return html`
            <div class="picker-modal-overlay">
                <div class="picker-modal-container">
                    <button class="picker-dismiss-button" @click=${this.dismissWithoutSelecting}>X</button>
                    ${ this.modalType == "sprite" ? 
                      html`<sprites-page isEmbeddedSelector=true></sprites-page>` 
                      : this.modalType == "item" ? 
                      html`<items-page isEmbeddedSelector=true currentCategory=${this.itemCategory}></items-page>`
                      : html``
                    }
                </div>
            </div>
        `
    }else{
        return html``;
    }
  }
}
window.customElements.define('picker-modal', PickerModal);