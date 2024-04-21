import {LitElement, html, css, repeat} from '../../lit-all.min.js';

export class UnitTemplate extends LitElement {
  static styles = css`
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
    .template-top{
        display:flex;
        align-items:flex-end;
    }
    .template-clone-button{
        font-size:inherit;
        float:right;
    }
    .template-portrait{
        width:fit-content;
        flex:1;
        position:relative;
    }
    .template-portrait-img{
        width:80px;
        height:80px;
    }
    .template-portrait-edit{
        padding:0px;
        background-color:#FFF0;
        border:none;
        position:absolute;
        top:62px;
        left:64px;
    }
    .template-portrait-edit:hover{
        text-shadow: white 0 0 5px;
    }
    .template-name{
        flex:5;
        font-size:20px;
        margin-left:3px;
    }
    .template-class{
        flex:1;
    }
    .template-icon{
        flex:1;
        position:relative;
    }
    .template-icon-edit{
        padding:0px;
        background-color:#FFF0;
        border:none;
        position:absolute;
        top:31px;
        left:37px;
    }
    .template-icon-edit:hover{
        text-shadow: white 0 0 4px;
    }
    .template-body{
        display:flex;
    }
    .template-body-header{
        font-size:10px;
        font-weight:bold;
        margin-bottom:-3px;
        margin-top:-4px;
    }
    .template-stats{
        flex:1;
        margin:2px;
    }
    .template-inventory{
        flex:1;
        margin:2px;
    }
    .template-stats-columns{
        display:flex;
        padding:4px;
        padding-bottom:2px;
        padding-top:2px;
        background-color:#DDE8DD;
        border:1px solid #888;
        border-radius:7px;
    }
    .template-stats-column{
        flex:1;
    }
    .template-stat-editor{
        max-width:32px;
    }
    .template-inventory-column{
        padding:4px;
        padding-bottom:2px;
        padding-top:2px;
        background-color:#DDDDE8;
        border:1px solid #888;
        border-radius:7px;
    }
    .template-item-delete-button{
        float:right;
        font-size:10px;
        padding: 0px;
        padding-bottom: 1px;
        margin-top:2px;
    }
    hr{
        margin-top:3px;
        margin-bottom:3px;
    }
  `;
  static get properties() {
    return {
      template: {type:Object},
      visible: {type:Boolean},
      editId: {type:Boolean},
      editName: {type:Boolean},
      editHp: {type:Boolean},
      editHpGrowth: {type:Boolean},
      editStr: {type:Boolean},
      editStrGrowth: {type:Boolean},
      editSkl: {type:Boolean},
      editSklGrowth: {type:Boolean},
      editSpd: {type:Boolean},
      editSpdGrowth: {type:Boolean},
      editCon: {type:Boolean},
      editLuk: {type:Boolean},
      editLukGrowth: {type:Boolean},
      editDef: {type:Boolean},
      editDefGrowth: {type:Boolean},
      editRes: {type:Boolean},
      editResGrowth: {type:Boolean},
      editMov: {type:Boolean},
      waitingProperty: {type:String}
    };
  }

  constructor() {
    super();
    //this.visible = true;
  }
  toggle(){
    this.visible = !this.visible;
  }
  toggleEdit(propertyId){
    this["edit" + propertyId] = !(this["edit" + propertyId]);
  }
  markUpdate(){
    const event = new CustomEvent("unit-template-modified-event", { bubbles:true, composed:true });
    this.dispatchEvent(event);
  }
  modifyProperty(propertyName,target){
    let oldValue = this.template[propertyName];
    let newValue = target.value;
    if(propertyName == "templateName"){ //do some validation so the IDs don't get wacky
        newValue = newValue.replaceAll(/[^a-zA-Z0-9-]/g, '');
        newValue = newValue.toLowerCase();
    }
    let intParse = parseInt(newValue);
    if(propertyName != "name" && (intParse || (intParse === 0))){ 
        newValue = intParse;
    }
    this.template[propertyName] = newValue;
    target.value = newValue;
    if(oldValue != newValue){
        this.markUpdate();
    }
  }
  requestFilename(){
    const event = new CustomEvent("request-sprite-filename", { bubbles:true, composed:true, detail: this });
    this.dispatchEvent(event);
  }
  receiveFilename(filename){
    let oldValue = this.template[this.waitingProperty];
    if(filename){
        this.template[this.waitingProperty] = filename;
        if(filename != oldValue){
            this.markUpdate();
        }
    }
    this.waitingProperty = "";
  }
  modifyFilenameProperty(propertyName){
    this.waitingProperty = propertyName;
    this.requestFilename();
  }
  addInventoryItem(weapon){
    let eventType = weapon ? "weapon" : "item"
    const event = new CustomEvent("request-inventory-" + eventType, { bubbles:true, composed:true, detail: this });
    this.dispatchEvent(event);
  }
  receiveItemData(item){
    if(!item){
        return;
    }
    if(item.wtype == "ITEM"){
        this.template.presetItems.push(item.id);
    }else{
        this.template.presetWeapons.push(item.id);
    }
    this.markUpdate();
    this.requestUpdate();
  }
  removeItem(item,list){
    let listToCheck = list == "ITEM" ? this.template.presetItems : this.template.presetWeapons;
    console.log(listToCheck);
    let idx = listToCheck.indexOf(item);
    if(idx >= 0){
        listToCheck.splice(idx,1);
    }
    this.markUpdate();
    this.requestUpdate();
  }
  cloneMe(){
    const event = new CustomEvent("unit-template-cloned-event", { bubbles:true, composed:true, detail: this.template });
    this.dispatchEvent(event);
  }
  render() {
   return html`
            <div class=${"template-box" + (this.visible ? "" : " template-hidden")}>
                <div class="template-header">
                    <img class="template-toggle-icon" src=${this.visible ? "frontend/assets/visible-icon.png" : "frontend/assets/hidden-icon-small.png"} @click=${this.toggle}> 
                    ${
                        this.visible ? this.editId ?
                        html`
                            <input type="text" .value=${this.template.templateName} @keyup=${(e) => {this.modifyProperty("templateName",e.target)}} @focusout=${() => this.toggleEdit("Id")}>
                        `:
                        html`<span class="template-id" @click=${() => {this.toggleEdit("Id")}}>${this.template.templateName}</span>
                        `:
                        html`<span class="template-id" @click=${this.toggle}>${this.template.templateName}</span>`
                    }
                    <button class="template-clone-button" @click=${this.cloneMe}>Clone unit</button>
                </div>
                ${this.visible ? html`
                <div class="template-top"> 
                    <div class="template-portrait">
                        <img class="template-portrait-img" src=${"game-client/" + this.template.portraitFile}>
                        <button @click=${() => {this.modifyFilenameProperty("portraitFile")}} class="template-portrait-edit">✏️</button>
                    </div>
                    <div class="template-name">
                        ${
                            this.editName ? 
                            html`
                                <input type="text" .value=${this.template.name} @keyup=${(e) => {this.modifyProperty("name",e.target)}} @focusout=${() => this.toggleEdit("Name")}>
                            `:
                            html`<span @click=${() => {this.toggleEdit("Name")}}>${this.template.name}</span>`
                        }
                    </div>
                    <div class="template-class">
                        Class: <select>
                            <option>TODO</option>
                        </select>
                    </div>
                    <div class="template-icon">
                        <img class="template-icon-img" src=${"game-client/" + this.template.mapSpriteFile}>
                        <button @click=${() => {this.modifyFilenameProperty("mapSpriteFile")}} class="template-icon-edit">✏️</button>
                    </div>
                </div>
                <div class="template-body">
                    <div class="template-stats">
                        <div class="template-body-header">
                            Stats (click to modify):
                        </div>
                        <div class="template-stats-columns">
                            <div class="template-stats-column">
                                <div class="template-hp-row">
                                    HP: ${
                                        this.editHp ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.maxhp} @change=${(e) => {this.modifyProperty("maxhp",e.target)}} @focusout=${() => this.toggleEdit("Hp")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Hp")}}>${this.template.maxhp}</span>`
                                    } + ${
                                        this.editHpGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.mhpg} @change=${(e) => {this.modifyProperty("mhpg",e.target)}} @focusout=${() => this.toggleEdit("HpGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("HpGrowth")}}>${this.template.mhpg}%</span>`
                                    }
                                </div>
                                <div class="template-stat-row">
                                    STR: ${
                                        this.editStr ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.str} @change=${(e) => {this.modifyProperty("str",e.target)}} @focusout=${() => this.toggleEdit("Str")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Str")}}>${this.template.str}</span>`
                                    } + ${
                                        this.editStrGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.strg} @change=${(e) => {this.modifyProperty("strg",e.target)}} @focusout=${() => this.toggleEdit("StrGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("StrGrowth")}}>${this.template.strg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    SKL: ${
                                        this.editSkl ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.skl} @change=${(e) => {this.modifyProperty("skl",e.target)}} @focusout=${() => this.toggleEdit("Skl")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Skl")}}>${this.template.skl}</span>`
                                    } + ${
                                        this.editSklGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.sklg} @change=${(e) => {this.modifyProperty("sklg",e.target)}} @focusout=${() => this.toggleEdit("SklGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("SklGrowth")}}>${this.template.sklg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    SPD: ${
                                        this.editSpd ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.spd} @change=${(e) => {this.modifyProperty("spd",e.target)}} @focusout=${() => this.toggleEdit("Spd")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Spd")}}>${this.template.spd}</span>`
                                    } + ${
                                        this.editSpdGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.spdg} @change=${(e) => {this.modifyProperty("spdg",e.target)}} @focusout=${() => this.toggleEdit("SpdGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("SpdGrowth")}}>${this.template.spdg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    CON: ${
                                        this.editCon ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.con} @change=${(e) => {this.modifyProperty("con",e.target)}} @focusout=${() => this.toggleEdit("Con")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Con")}}>${this.template.con}</span>`
                                    }</div>
                            </div>
                            <div class="template-stats-column">
                                <div class="template-stat-row">
                                    LUK: ${
                                        this.editLuk ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.luk} @change=${(e) => {this.modifyProperty("luk",e.target)}} @focusout=${() => this.toggleEdit("Luk")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Luk")}}>${this.template.luk}</span>`
                                    } + ${
                                        this.editLukGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.lukg} @change=${(e) => {this.modifyProperty("lukg",e.target)}} @focusout=${() => this.toggleEdit("LukGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("LukGrowth")}}>${this.template.lukg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    DEF: ${
                                        this.editDef ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.def} @change=${(e) => {this.modifyProperty("def",e.target)}} @focusout=${() => this.toggleEdit("Def")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Def")}}>${this.template.def}</span>`
                                    } + ${
                                        this.editDefGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.defg} @change=${(e) => {this.modifyProperty("defg",e.target)}} @focusout=${() => this.toggleEdit("DefGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("DefGrowth")}}>${this.template.defg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    RES: ${
                                        this.editRes ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.res} @change=${(e) => {this.modifyProperty("res",e.target)}} @focusout=${() => this.toggleEdit("Res")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Res")}}>${this.template.res}</span>`
                                    } + ${
                                        this.editResGrowth ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.resg} @change=${(e) => {this.modifyProperty("resg",e.target)}} @focusout=${() => this.toggleEdit("ResGrowth")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("ResGrowth")}}>${this.template.resg}%</span>`
                                    }</div>
                                <div class="template-stat-row">
                                    MOV: ${
                                        this.editMov ? html`
                                        <input class="template-stat-editor" type="number" .value=${this.template.mov} @change=${(e) => {this.modifyProperty("mov",e.target)}} @focusout=${() => this.toggleEdit("Mov")}>
                                        `:
                                        html`<span @click=${() => {this.toggleEdit("Mov")}}>${this.template.mov}</span>`
                                    }</div>
                            </div>
                        </div>
                    </div>
                    <div class="template-inventory">
                        <div class="template-body-header">
                            Inventory:
                        </div>
                        <div class="template-inventory-column">
                            ${repeat(this.template.presetWeapons,(wep) => wep, (wep,idx) => {
                                return html`
                                    <div class="template-item-row">
                                    ${wep} <button class="template-item-delete-button" @click=${() => this.removeItem(wep,"WEAPON")}>❌</button>
                                    </div>
                                `
                            })}
                            <button class="template-new-weapon-button" @click=${() => this.addInventoryItem(true)}>+ Add weapon</button>
                            <hr/>
                            ${repeat(this.template.presetItems,(item) => item, (item,idx) => {
                                return html`
                                    <div class="template-item-row">
                                    ${item} <button class="template-item-delete-button" @click=${() => this.removeItem(item,"ITEM")}>❌</button>
                                    </div>
                                `
                            })}
                            <button class="template-new-weapon-button" @click=${() => this.addInventoryItem(false)}>+ Add item</button>
                        </div>
                    </div>
                </div>
                <div class="template-foot"></div>`
                : html``}
            </div>
          `
  }
}
window.customElements.define('unit-template', UnitTemplate);