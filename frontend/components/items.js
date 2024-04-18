import {LitElement, html, css, repeat} from '../../lit-all.min.js';

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
  `;
  static get properties() {
    return {
      itemsList: {type:Array},
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
    this.currentCategory = "SWORD";
    window.medallionAPI.getItemsData().then(data => {
      this.itemsList = data;
      this.processItems();
    });
  }
  saveList(){
    let gs = window.gs;
    gs.items = this.itemsList;
    this.saving = true;
    window.medallionAPI.saveItemsData(this.itemsList).then(response => {
      this.saving = false;
      this.someModified = false;
    })
  }
  giveUniqueId(item){
    let orginalId = item.id;
    let foundMatch = this.itemsList.find(x => x.id == item.id);
    let counter = 2;
    while(foundMatch){
      item.id = orginalId + "-" + counter;
      counter++;
      foundMatch = this.itemsList.find(x => {
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
    for(let item of this.itemsList){
      if(!this.categories[item.wtype]){
        this.categories[item.wtype] = [];
        this.categoryList.push(item.wtype);
      }
      this.categories[item.wtype].push(item);
    }
    console.log(this.categories);
  }
  selectTab(category){
    this.currentCategory = category;
  }
  render() {
    return this.itemsList ? 
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
              <div class="wep-box">
                  ${wep.name}
              </div>
            `
        })}
      </div>
    `
    :html`Loading...`
  }
}
window.customElements.define('items-page', ItemsPage);