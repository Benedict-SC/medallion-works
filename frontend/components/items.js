import {LitElement, html, css, repeat} from '../../lit-all.min.js';
import { ItemTemplate } from '../objects/item-template.js';

export class ItemsPage extends LitElement {
  static styles = css`
    .items-header{
      position:relative;
    }
    .header-width-control{
      width:fit-content;
    }
    .items-header-text{
      font-size:20px;
      font-weight:bold;
      padding:5px;
      color:rgb(45, 102, 132);
      width:fit-content;
    }
    .items-header-save{
      position:absolute;
      right:0px;
      top:8px;
    }
    .items-header-save-button{

    }
    .items-header-save-notice{
      color:red;
      font-size:12px;
    }
    .items-tabs{
      display:flex;
    }
    .items-tabs-tab{
      background-color:#DDD;
      flex:1;
      padding:5px;
      border:1px solid #444;
      border-top-right-radius:8px;
      border-top-left-radius:8px;
      border-bottom-color:#BBB;
      cursor:pointer;
    }
    .items-tab-highlighted{
      background-color:white;
      border-bottom:none;
    }
    .clickable-item:hover{
      background-color:#DDE8F2;
      cursor:pointer;
    }
    .item-box{
      padding:2px;
      border-radius:5px;
      background-color:#EEF8FF;
      margin:1px;
    }
    .item-name{
      font-weight:bold;
    }
    .item-field-input{
      width:40px;
      margin-right:8px;
    }
    .item-field-fixed{
      margin-right:8px;
    }
  `;
  static get properties() {
    return {
      isEmbeddedSelector: {type:Boolean},
      categories: {type:Object},
      categoryList: {type:Array},
      currentCategory: {type:String},
      someModified: {type:Boolean},
      saving: {type:Boolean},
      referenceCategories: {type:Array}
    };
  }

  constructor() {
    super();
    this.referenceCategories = ["SWORD","LANCE","AXE","BOW","STAFF","LIGHT","ANIMA","DARK","KNIFE","ITEM"];
    this.categoryList = [...this.referenceCategories];
    if(!this.currentCategory){
      this.currentCategory = "SWORD";
    }
    window.medallionAPI.getItemsData().then(data => {
      window.gs.items = data;
      this.processItems();
    });
  }
  firstUpdated(){
    super.firstUpdated();
    if(!this.isEmbeddedSelector){
      window.gs.activePage = this;
    }
  }
  saveList(){
    let gs = window.gs;
    gs.items = this.flattenedItems();
    this.saving = true;
    window.medallionAPI.saveItemsData(gs.items).then(response => {
      this.saving = false;
      this.someModified = false;
    })
  }
  flattenedItems(){
    let flattenedList = [];
    for(let cat of this.categoryList){
      for(let item of this.categories[cat]){
        flattenedList.push(item);
      }
    }
    return flattenedList;
  }
  giveUniqueId(item){
    let orginalId = item.id;
    let itemsList = this.flattenedItems();
    let foundMatch = itemsList.find(x => x.id == item.id);
    let counter = 2;
    while(foundMatch){
      item.id = orginalId + "-" + counter;
      counter++;
      foundMatch = itemsList.find(x => {
        return x.id == item.id;
      });
    } 
  }
  processItems(){
    this.categoryList = [...this.referenceCategories];
    this.categories = {};
    for(let cat of this.categoryList){
      this.categories[cat] = [];
    }
    for(let item of window.gs.items){
      if(!this.categories[item.wtype]){
        this.categories[item.wtype] = [];
        this.categoryList.push(item.wtype);
      }
      this.categories[item.wtype].push(new ItemTemplate(item));
    }
    console.log(this.categories);
  }
  addNewItem(){
    let newItem = new ItemTemplate();
    newItem.wtype = this.currentCategory;
    this.giveUniqueId(newItem);
    this.categories[this.currentCategory].push(newItem);
    this.requestUpdate();
  }
  selectTab(category){
    this.currentCategory = category;
  }
  selectItem(item){
    if(this.isEmbeddedSelector){
      const event = new CustomEvent("item-selected-event", { bubbles:true, composed:true, detail:item});
      this.dispatchEvent(event);
    }
  }
  modifyProperty(eventTarget,item,propertyName){
    let originalValue = item[propertyName];
    let value = eventTarget.value;
    let isNumber = eventTarget.type == "number";
    if(isNumber){
      value = parseInt(value);
    }
    if(originalValue != value){
      this.someModified = true;
    }
    item[propertyName] = value;
    this.requestUpdate();
  }
  render() {
    return (this.categories && this.categories[this.currentCategory]) ? 
    html`
      <div class="wep-window">
        <div class="${"items-header" + (this.isEmbeddedSelector ? " header-width-control" : "")}">
          <div class="items-header-text">Weapons and Items</div>
          <div class="items-header-save">
            ${this.someModified ? html`<span class="items-header-save-notice">You have unsaved changes to weapons and items!</span>` : html``}
            ${this.isEmbeddedSelector ? html`` : html`<button ?disabled=${!this.someModified} @click=${this.saveList}>Save weapons and items</button>`}
          </div>
        </div>
        <div class="items-tabs">
          ${repeat(this.categoryList,(cat) => cat,(cat,idx) => {
            return html`
            <div class=${"items-tabs-tab" + ((cat == this.currentCategory) ? " items-tab-highlighted" : "")} @click=${() => {this.selectTab(cat);}}>
              ${cat}
            </div>
            `
          })}
        </div>
        <div class="items-list">
          ${repeat(this.categories[this.currentCategory],(wep) => wep, (wep,idx) => {
            return html`
              <div class=${"item-box" + (this.isEmbeddedSelector ? " clickable-item" : "")} @dblclick=${() => this.selectItem(wep)}>
                  <div class="item-title-line">
                    <img src=${"./game-client/" + wep.iconfile}></img> 
                    <span class="item-name">${wep.name}</span>
                    ${wep.maxUses > 0 ? html`<span> (${wep.maxUses}/${wep.maxUses})</span>` : html``}
                  </div>
                  <div class="item-property-controls">
                    <span class="item-field-label">Uses: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.maxUses}</span>`
                      : html`<input class="item-field-input" type="number" min="0" .value=${wep.maxUses} @change=${(e) => this.modifyProperty(e.target,wep,"maxUses")} 
                      }/>`
                    }
                    <span class="item-field-label">Might: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.might}</span>`
                      : html`<input class="item-field-input" type="number" .value=${wep.might} @change=${(e) => this.modifyProperty(e.target,wep,"might")}/>`
                    } 
                    
                    <span class="item-field-label">Hit: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.hit}</span>`
                      : html`<input class="item-field-input" type="number" min="0" .value=${wep.hit} @change=${(e) => this.modifyProperty(e.target,wep,"hit")}/> `
                    }
                    
                    <span class="item-field-label">Crit: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.crit}</span>`
                      : html`<input class="item-field-input" type="number" .value=${wep.crit} @change=${(e) => this.modifyProperty(e.target,wep,"crit")}/>`
                    } 
                    
                    <span class="item-field-label">Weight: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.weight}</span>`
                      : html`<input class="item-field-input" type="number" min="0" .value=${wep.weight} @change=${(e) => this.modifyProperty(e.target,wep,"weight")}/>`
                    }

                    <span class="item-field-label">Rank: </span>
                    ${this.isEmbeddedSelector ? 
                      html`<span class="item-field-fixed">${wep.rank}</span>`
                      : html`
                      <select class="item-field-select" @change=${(e) => this.modifyProperty(e.target,wep,"rank")}>
                        <option ?selected=${wep.rank == "E"} value="E">E</option>
                        <option ?selected=${wep.rank == "D"} value="D">D</option>
                        <option ?selected=${wep.rank == "C"} value="C">C</option>
                        <option ?selected=${wep.rank == "B"} value="B">B</option>
                        <option ?selected=${wep.rank == "A"} value="A">A</option>
                        <option ?selected=${wep.rank == "S"} value="S">S</option>
                      </select>`
                    }
                  </div>
              </div>`
          })}
          ${this.isEmbeddedSelector ? html`` :
            html`<button @click=${this.addNewItem}>+ New item</button>`
          }
        </div>
      </div>
    `
    :html`Loading ${this.currentCategory}S...`
  }
}
window.customElements.define('items-page', ItemsPage);