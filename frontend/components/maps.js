import {LitElement, staticHtml, html, literal, css} from '../../lit-all.min.js';

export class MapsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .map-ui{
      display:flex;
    }
    .map-grid { 
      flex:2.5;
      overflow:scroll;
      max-height:90vh;
      min-height:300px;
    }
    .map-row {
      background-color:#F8F8F8;
      width:fit-content;
      white-space:nowrap;
    }
    .map-cell {
      display:inline-block;
      position:relative;
      background-color:#F3F3F3;
      margin:1px;
      height:46px;
      width:46px;
      border: 2px solid white;
    }
    .tile-detail{
      flex:1;
      border: 2px solid #666666;
    }
    .terrain-detail{
      background-color: white;
      border: 1px solid #BBBBBB;
      margin:2px;
    }
    .unit-detail{
      background-color: white;
      border: 1px solid #BBBBBB;
      margin:2px;
    }
    .unit-img{
      position:absolute;
      left:-2px;
      top:-1px;
    }
    .grass {
      background-color: #d0e7b7;
      border: 2px solid #d0e7b7;
    }
    .grass:hover{
      border: 2px solid #87c93e;
    }
    .trees {
      background-color: #7d9c5c;
      border: 2px solid #7d9c5c;
    }
    .trees:hover {
      border: 2px solid #477715;
    }
    .hills {
      background-color: #8f9079;
      border: 2px solid #8f9079;
    }
    .hills:hover {
      border: 2px solid #69643e;
    }
  `;
  static get properties() {
    return {
      gs: {type:Object},
      activeTile: {type:Object},
      activeUnit: {type:Object}
    };
  }

  selectedAttribute = literal`selected`;
  nothing = literal ``;

  constructor() {
    super();
    this.gs = window.gs;
    this.gs.mapsComponent = this;
    if(!this.gs.mapData){ 
      this.gs.mapData = {tiles:[]} 
    }
  }
  refreshMap(){
    this.requestUpdate();
  }
  getMapData(){
    window.medallionAPI.getMapData("testmap.json").then(data => {
      this.gs.mapData = data;
      this.gs.units = [];
      let height = data.tiles.length;
      let width = data.tiles[0].length;
      for(let i = 0; i < height; i++){
        this.gs.units.push([]);
        for(let j = 0; j < width; j++){
          this.gs.units[i].push(null);
        }
      }
      for(let unit of this.gs.mapData.units){
        this.gs.units[unit.y-1][unit.x-1] = unit;
      }
      this.requestUpdate();
    });
    window.medallionAPI.getTerrainData().then(result => {
      this.gs.nativeTerrain = result.native;
      this.gs.customTerrain = result.custom;
      this.requestUpdate();
    });
  }
  saveMapData(){
    this.validateUnits();
    let flattenedUnits = [];
    for(let i = 0; i < this.gs.units.length; i++){
      for(let j = 0; j < this.gs.units[0].length; j++){
        let unit = this.gs.units[i][j];
        if(unit){
          unit.x = j+1;
          unit.y = i+1;
          flattenedUnits.push(unit);
        }
      }
    }
    this.gs.mapData.units = flattenedUnits;
    window.medallionAPI.saveMapData(this.gs.mapData,"testmap.json").then(response => {
      console.log("%o",response);
    });
  }
  activateCell(x,y){
    this.activeTile = {x:x,y:y};
  }
  valueOfActiveCell(){
    return this.gs.mapData.tiles[this.activeTile.y][this.activeTile.x];
  }
  isSelected(i,custom){
    let codeToCheck = (i+(custom?1001:1));
    let sel = this.valueOfActiveCell() == codeToCheck;
    return sel ? this.selectedAttribute : this.nothing;
  }
  alterCell(){
    let selector = this.renderRoot.querySelector("#terrain");
    this.gs.mapData.tiles[this.activeTile.y][this.activeTile.x] = parseInt(selector.value);
    this.requestUpdate();
  }
  cellClasses = ["","grass","trees","hills"];
  cellClass(cell){
    return "map-cell" + ((cell <= 0 || cell >= this.cellClasses.length) ? "" : " " + this.cellClasses[cell]);
  }
  validateUnits(){
    for(let i = 0; i < this.gs.units.length; i++){
      for(let j = 0; j < this.gs.units[0].length; j++){
        let unit = this.gs.units[i][j];
        if(unit){
          if(unit.name == undefined){
            unit.name = "";
          }
          if(unit.faction == undefined){
            unit.faction = "";
          }
          if(unit.level == undefined){
            unit.level = 1;
          }
          if(unit.str == undefined){
            unit.str = 0;
          }
          if(unit.maxhp == undefined){
            unit.maxhp = 1;
          }
          if(unit.hp == undefined){
            unit.hp = unit.maxhp;
          }
          if(unit.skl == undefined){
            unit.skl = 0;
          }
          if(unit.spd == undefined){
            unit.spd = 0;
          }
          if(unit.luk == undefined){
            unit.luk = 0;
          }
          if(unit.def == undefined){
            unit.def = 0;
          }
          if(unit.res == undefined){
            unit.res = 0;
          }
          if(unit.mov == undefined){
            unit.mov = 1;
          }
          if(unit.con == undefined){
            unit.con = 0;
          }
          if(unit.presetWeapons == undefined){
            unit.presetWeapons = [];
          }
          if(unit.presetItems == undefined){
            unit.presetItems = [];
          }
        }
      }
    }
  }
  render() {
    return html`
      <div>
        <p>Maps go here.</p>
        <button @click=${this.getMapData}>Press to load map data</button>
        <div class="map-ui">
          <div class="map-grid">
            ${this.gs.mapData.tiles.map((row,yindex) => {
              return html`<div class="map-row">
                ${row.map((cell,xindex) => {
                  return html`<div class=${this.cellClass(cell)} @click=${() => {this.activateCell(xindex,yindex)}}>
                    ${cell}
                    <img class="unit-img" src=${this.gs.units[yindex][xindex] ? "game-client/" + this.gs.units[yindex][xindex].mapSpriteFile : ""}/>
                  </div>`
                })}
              </div>`
            })}
          </div>
          <div class="tile-detail">
            <div class="terrain-detail">
              ${
                this.activeTile ?
                  html`<p>Tile ${this.activeTile.x},${this.activeTile.y} selected.</p>
                    <div class="terrain-select">
                      <select id="terrain" @change=${this.alterCell}>
                        ${this.gs.nativeTerrain.map((terr,i) => {
                          return staticHtml`<option value=${i+1} ${this.isSelected(i,false)}>${terr.name}</option>`
                        })}
                        ${this.gs.customTerrain.map((terr,i) => {
                          return staticHtml`<option value=${i+1001} ${this.isSelected(i,true)}>${terr.name}</option>`
                        })}
                      </select>
                    </div>
                  `
                : html`<p>No tile selected.</p>`
              }
            </div>
            ${this.activeTile ? html`<maps-unit-view x=${this.activeTile.x} y=${this.activeTile.y}></maps-unit-view>` : html``}            
          </div>
        </div>
        <button @click=${this.saveMapData}>Press to save map data</button>
        <p>${JSON.stringify(this.gs.mapData)}</p>
      </div>
    `;
  }
}
window.customElements.define('maps-page', MapsPage);