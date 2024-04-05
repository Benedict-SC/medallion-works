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
        this.level = 1;
        this.presetWeapons = [];
        this.presetItems = [];
    }
}
export class MapsUnitView extends LitElement{
    static styles = css`
    .unit-detail{
      background-color: white;
      border: 1px solid #BBBBBB;
      margin:2px;
      padding:3px;
    }
    .faction-toggles-box{
        font-size:8px;
    }
    .tiny-radio{
        margin:1px;
    }
    .other-specifier{
        width:70px;
    }
    .stat-div{
        font-size:12px;
    }
    .stat-input{
        width:50px;
    }
    .stat-blocks{
        margin:3px;
    }
  `;
  static get properties() {
    return {
        firstRadioRender: {type:Boolean},
        templatesLoaded: {type:Boolean},
        otherSelected: {type:Boolean},
        x: {type:Number},
        y: {type:Number},
        createState: {type:String} //NONE, TEMPLATE
    };
  }
  constructor() {
    super();
    let gs = window.gs;
    this.createState = "NONE";
    this.otherSelected = false;
    this.firstRadioRender = true;
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
    selector = this.renderRoot.querySelector("input[name='factionSelect']:checked");
    let faction = selector.value;
    if(faction == "OTHER"){
        selector = this.renderRoot.querySelector("#otherSpecifier");
        faction = selector.value;
    }
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
    for(let i = 0; i < level-1; i++){ //minus one because level 1 is base
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
    unit.faction = faction;
    unit.name = template.name;
    unit.level = level;
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
  toggleOtherBox(){
    let selector = this.renderRoot.querySelector("#otherToggle");
    this.otherSelected = selector.checked;
  }
  updateUnitFaction(){
    console.log("we're updating the faction");
    this.toggleOtherBox();
    let unit = window.gs.units[this.y][this.x];
    
    let selector = this.renderRoot.querySelector("input[name='factionSelect']:checked");
    let faction = selector.value;
    if(faction == "OTHER"){
        selector = this.renderRoot.querySelector("#otherSpecifier");
        faction = selector.value;
    }
    unit.faction = faction;
  }
  updateStat(statname){
    let unitid = "unit-y" + this.y + "-x" + this.x;
    let unit = gs.units[this.y][this.x];
    let statInput = this.renderRoot.querySelector("#" + unitid + "-" + statname);
    unit[statname] = statInput.value;
  }

  render(){
    let gs = window.gs;
    let unitid = "unit-y" + this.y + "-x" + this.x;
    let unit = gs.units[this.y][this.x];
    if(unit){
        this.otherSelected = ((unit.faction != "PLAYER") && (unit.faction != "ENEMY"));
    }
    return html`
        <div class="unit-detail">
            ${
                unit ? 
                unit.armyId ? html`
                    <p>Pre-positioned player unit is here (${unit.armyId}). Data is pulled from the army object in the savefile.</p>
                ` :
                  html`
                    <img class="portrait-img" src=${ "game-client/" + unit.portraitFile }></img> - <img class="map-sprite-img" src=${ "game-client/" + unit.mapSpriteFile }></img>
                    <div class="unit-name">Name: <input type="text" id=${unitid + "-name"} .value=${unit.name} @change=${(e) => {this.updateStat("name")}}></div>
                    <div class="faction-toggles-box">
                        <input class="tiny-radio" type="radio" id="enemyToggle" name="factionSelect" value="ENEMY" @change=${this.updateUnitFaction}>
                        <label for="enemyToggle">ENEMY</label>
                        <input class="tiny-radio" type="radio" id="playerToggle" name="factionSelect" value="PLAYER" @change=${this.updateUnitFaction}>
                        <label for="playerToggle">PLAYER</label>
                        <input class="tiny-radio" type="radio" id="otherToggle" name="factionSelect" value="OTHER" @change=${this.updateUnitFaction}>
                        <label for="otherToggle">Other</label>
                        <input type="text" class="other-specifier" id="otherSpecifier" .value=${unit.faction} ?disabled=${!this.otherSelected}>
                    </div>
                    <div class="stat-blocks">
                        <div class="stat-div">  STR: <input class="stat-input" type="number" id=${unitid + "-str"} .value=${unit.str ? unit.str : 0} @change=${(e) => {this.updateStat("str")}}> 
                                                LUK: <input class="stat-input" type="number" id=${unitid + "-luk"} .value=${unit.luk ? unit.luk : 0} @change=${(e) => {this.updateStat("luk")}}></div>
                        <div class="stat-div">  SKL: <input class="stat-input" type="number" id=${unitid + "-skl"} .value=${unit.skl ? unit.skl : 0} @change=${(e) => {this.updateStat("skl")}}>
                                                DEF: <input class="stat-input" type="number" id=${unitid + "-def"} .value=${unit.def ? unit.def : 0} @change=${(e) => {this.updateStat("def")}}></div>
                        <div class="stat-div">  SPD: <input class="stat-input" type="number" id=${unitid + "-spd"} .value=${unit.spd ? unit.spd : 0} @change=${(e) => {this.updateStat("spd")}}>
                                                RES: <input class="stat-input" type="number" id=${unitid + "-res"} .value=${unit.res ? unit.res : 0} @change=${(e) => {this.updateStat("res")}}></div>
                        <div class="stat-div">  CON: <input class="stat-input" type="number" id=${unitid + "-con"} .value=${unit.con ? unit.con : 0} @change=${(e) => {this.updateStat("con")}}>
                                                MOV: <input class="stat-input" type="number" id=${unitid + "-mov"} .value=${unit.mov ? unit.mov : 0} @change=${(e) => {this.updateStat("res")}}></div>
                    </div>
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
                    <div class="faction-toggles-box">
                        <input class="tiny-radio" type="radio" id="enemyToggle" name="factionSelect" value="ENEMY" @change=${this.toggleOtherBox} checked>
                        <label for="enemyToggle">ENEMY</label>
                        <input class="tiny-radio" type="radio" id="playerToggle" name="factionSelect" value="PLAYER" @change=${this.toggleOtherBox}>
                        <label for="playerToggle">PLAYER</label>
                        <input class="tiny-radio" type="radio" id="otherToggle" name="factionSelect" value="OTHER" @change=${this.toggleOtherBox}>
                        <label for="otherToggle">Other</label>
                        <input type="text" class="other-specifier" id="otherSpecifier" value="OTHER" ?disabled=${!this.otherSelected}>
                    </div>
                    <label for="templateLevelSelect">Level:</label>
                    <input class="templateLevelSelect" id="templateLevelSelect" type="number" min="1" max="20" value="1"></input>
                    <button @click=${this.createUnitFromTemplate}>Create unit</button>
                    </br><button @click=${this.cancelUnitCreation}>Go back</button>
                ` : html`Error: invalid state`
            }
        </div>
    `
  }
  updated(){
        let gs = window.gs;
        let unit = gs.units[this.y][this.x];
        if(unit && !unit.armyId){
            let checkbox = this.renderRoot.querySelector("#otherToggle");
            if(unit.faction == "PLAYER"){
                checkbox = this.renderRoot.querySelector("#playerToggle");
            }else if(unit.faction == "ENEMY"){
                checkbox = this.renderRoot.querySelector("#enemyToggle");
            }//else it stays Other
            checkbox.checked = true;
        }
  }
}
window.customElements.define('maps-unit-view', MapsUnitView);