import {LitElement, staticHtml, html, literal, css} from '../../lit-all.min.js';
class MapUnit{
    constructor(){
        this.maxhp = 1;
        this.hp = 1; //it'll be the same most of the time at this stage, but idk maybe you want to add damaged units to maps
        this.str = 0;
        this.skl = 0;
        this.spd = 0;
        this.luk = 0;
        this.def = 0;
        this.res = 0;
        this.mov = 5;
        this.con = 10;
        this.mapSpriteFile = "assets/img/qmark.png";
        this.portraitFile = "assets/img/qmark-portrait.png";
        this.classPreset = "DEFAULT";
        this.name = "UNITNAME";
        this.faction = "ENEMY";
    }
}
export class MapsUnitView extends LitElement{
    static styles = css`
    .unit-detail{
      background-color: white;
      border: 1px solid #BBBBBB;
      margin:2px;
    }
  `;
  static get properties() {
    return {
      templatesLoaded: {type:Boolean},
      x: {type:Number},
      y: {type:Number},
      createState: {type:String} //NONE, TEMPLATE, EDIT
    };
  }
  constructor() {
    super();
    let gs = window.gs;
    this.createState = "NONE";
    this.validLevels = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    if(!gs.templates){
        this.templatesLoaded = false;
        gs.templates = {templates:[]}; 
        window.medallionAPI.getTemplatesData().then(data => {
            gs.templates = data;
            this.templatesLoaded = true;
        });
    }else{
        this.templatesLoaded = true;
    }
  }
  beginTemplateSelection(){
    this.createState = "TEMPLATE";
  }
  createUnitFromTemplate(){
    let selector = this.renderRoot.querySelector("#templateSelect");
    let templateIndex = parseInt(selector.value);
    selector = this.renderRoot.querySelector("#templateLevelSelect");
    let level = selector.value;
    let template = window.gs.templates[templateIndex];
    let unit = new MapUnit();
    unit.str = template.str;
    unit.skl = template.skl;
    unit.spd = template.spd;
    unit.luk = template.luk;
    unit.def = template.def;
    unit.res = template.res;
    unit.mov = template.mov;
    unit.con = template.con;
    for(let i = 0; i < level; i++){
        //TODO: implement >100% growths by doing these in loops. ugh.
        let strRNG = Math.random() * 100;
        if(strRNG <= template.strg){ unit.str += 1; }
        let sklRNG = Math.random() * 100;
        if(sklRNG <= template.sklg){ unit.skl += 1; }
        let spdRPG = Math.random() * 100;
        if(spdRPG <= template.spdg){ unit.spd += 1; }
        let lukRNG = Math.random() * 100;
        if(lukRNG <= template.lukg){ unit.luk += 1; }
        let defRNG = Math.random() * 100;
        if(defRNG <= template.defg){ unit.def += 1; }
        let resRNG = Math.random() * 100;
        if(resRNG <= template.resg){ unit.res += 1; }
        let hpRNG = Math.random() * 100;
        if(hpRNG <= template.mhpg){ unit.maxhp += 1; unit.hp += 1;}
    }
    unit.mapSpriteFile = template.mapSpriteFile;
    unit.portraitFile = template.portraitFile;
    unit.classPreset = template.classPreset;
    unit.name = template.name;
    gs.units[this.y][this.x] = unit;
    gs.mapsComponent.refreshMap();
    this.createState = "NONE";
  }
  createEmptyUnit(){
    let unit = new MapUnit();
    gs.units[this.y][this.x] = unit;
    this.createState = "NONE";
  }
  cancelUnitCreation(){
    this.createState = "NONE";
  }
  render(){
    let gs = window.gs;
    return html`
        <div class="unit-detail">
            ${
                gs.units[this.y][this.x] ? 
                  html`
                    <p>There's a unit here- we'll show its details.</p>
                    <img class="portrait-img" src=${ "game-client/" + gs.units[this.y][this.x].portraitFile }></img> - <img class="map-sprite-img" src=${ "game-client/" + gs.units[this.y][this.x].mapSpriteFile }></img>
                    <div class="unit-name">Name: <input type="text" id=${"unit-y" + this.y + "-x" + this.x} value=${gs.units[this.y][this.x].name}></div>
                  `
                : this.createState == "NONE" ? html`
                    <p>No unit here.</p><br/>
                    <button @click=${this.beginTemplateSelection} class="template-button">Create from template</button></br></br>
                    <button @click=${this.createEmptyUnit} class="scratch-button">Create from scratch</button>
                ` : this.createState == "TEMPLATE" ? html`
                    <label for="templateSelect">Template:</label>
                    <select id="templateSelect">
                        ${gs.templates.map((template,i) => {
                            return html`<option value=${i}>${template.templateName}</option>`
                        })}
                    </select>
                    <label for="templateLevelSelect">Level:</label>
                    <input class="templateLevelSelect" id="templateLevelSelect" type="number" min="1" max="20" value="1"></input>
                    <button @click=${this.createUnitFromTemplate}>Create unit</button>
                    </br><button @click=${this.cancelUnitCreation}>Go back</button>
                ` : this.createState == "EDIT" ? html`
                    <p>TODO: Implement unit editing</p>
                    <button @click=${this.cancelUnitCreation}>Go back</button>
                ` : html`Error: invalid state`
            }
        </div>
    `
  }
}
window.customElements.define('maps-unit-view', MapsUnitView);