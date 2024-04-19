import {LitElement, html, css, repeat} from '../../lit-all.min.js';
import { ItemTemplate } from '../objects/item-template.js';

export class ItemsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .items-header{
      font-size:20px;
      font-weight:bold;
      padding:5px;
      color:rgb(45, 102, 132);
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
    .item-box{
      padding:2px;
      border-radius:5px;
      background-color:#EEF8FF;
      margin:1px;
    }
    .item-name{
      font-weight:bold;
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
  render() {
    return (this.categories && this.categories[this.currentCategory]) ? 
    html`
      <div class="wep-window">
        <div class="items-header">Weapons and Items</div>
        <div class="items-tabs">
          ${repeat(this.categoryList,(cat) => cat,(cat,idx) => {
            return html`
            <div class=${"items-tabs-tab" + ((cat == this.currentCategory) ? " items-tab-highlighted" : "")} @click=${() => {this.selectTab(cat);}}>
              ${cat}
            </div>
            `
          })}
        </div>
        ${repeat(this.categories[this.currentCategory],(wep) => wep, (wep,idx) => {
            return html`
              <div class="item-box" @dblclick=${() => this.selectItem(wep)}>
                  <img src=${"./game-client/" + wep.iconfile}></img> <span class="item-name">${wep.name}</span> (${wep.maxUses}/${wep.maxUses})
              </div>
            `
        })}
      </div>
    `
    :html`Loading ${this.currentCategory}S...`
  }
}
window.customElements.define('items-page', ItemsPage);