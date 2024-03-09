import {LitElement, staticHtml, html, literal, css} from '../../lit-all.min.js';

export class MapsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .newmap-filename-input{
      text-align:right;
    }
    .map-ui{
      display:flex;
      user-select: none;
    }
    .map-grid { 
      flex:2.5;
      overflow:scroll;
      max-height:90vh;
      min-height:300px;
      background-color:#555555;
    }
    .map-toolbar{
      background-color:#444444;
      width:100%;
      padding:4px;
    }
    .toolbar-button{
      background-color:#888888;
      padding:3px;
    }
    .toolbar-selected{
      background-color: #666666;
    }
    .map-row {
      margin-bottom:-7px;
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
    .starting-position-img{
      position:absolute;
      left:-2px;
      top:-1px;
      pointer-events:none;
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
      maplist: {type:Array},
      currentMapName: {type:String},
      activeTile: {type:Object},
      selectedTool: {type:String}, //select, paint, move
      paintingTileID: {type:Number}
    };
  }

  selectedAttribute = literal`selected`;
  nothing = literal ``;

  constructor() {
    super();
    this.gs = window.gs;
    this.gs.mapsComponent = this;
    this.selectedTool = "select";
    this.paintingTileID = 1;
    if(!this.gs.mapData){ 
      this.gs.mapData = {tiles:[]} 
    }
    if(!this.maplist){
      this.maplist = [];
    }
    window.medallionAPI.getTerrainData().then(result => {
      this.gs.nativeTerrain = result.native;
      this.gs.customTerrain = result.custom;
    });
  }
  refreshMap(){
    this.requestUpdate();
  }
  getMapData(){
    let selector = this.renderRoot.querySelector("#map-selector");
    let mapfile = selector.value;
    this.currentMapName = mapfile;
    window.medallionAPI.getMapData(mapfile).then(data => {
      this.gs.mapData = data;
      this.gs.units = [];
      this.activeTile = {x:0,y:0};
      let height = data.tiles.length;
      let width = data.tiles[0].length;
      for(let i = 0; i < height; i++){ //validate map data- we used to have map tiles be number codes rather than objects
        for(let j = 0; j < width; j++){
          let value = data.tiles[i][j];
          if(!(value.tile) && Number.isInteger(value)){
            this.gs.mapData.tiles[i][j] = {tile:value};
          }
        }
      }//we could do this next part in the same loop but let's keep them separate so it's clear what they do
      for(let i = 0; i < height; i++){ //store the units array in a 2D array
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
    window.medallionAPI.saveMapData(this.gs.mapData,this.currentMapName).then(response => {
      console.log("%o",response);
    });
  }
  activateCell(x,y){
    if(this.selectedTool == "select"){
      this.activeTile = {x:x,y:y};
    }
  }
  mousedown(x,y){
    if(this.selectedTool == "paint"){
      this.paintCell(x,y);
    }
  }
  valueOfActiveCell(){
    return this.valueOfCell(this.activeTile.x,this.activeTile.y);
  }
  valueOfCell(x,y){
    return this.gs.mapData.tiles[y][x].tile;
  }
  getImagePathFromCellCode(code){
    let index = (code > 1000) ? (code-1001) : (code - 1);
    if(code > 1000){
      return this.gs.customTerrain[index].imgPath;
    }else{
      return this.gs.nativeTerrain[index].imgPath;
    }
  }
  isSelected(i,custom){
    let codeToCheck = (i+(custom?1001:1));
    let sel = this.valueOfActiveCell() == codeToCheck;
    return sel ? this.selectedAttribute : this.nothing;
  }
  alterCell(){
    let selector = this.renderRoot.querySelector("#terrain");
    this.gs.mapData.tiles[this.activeTile.y][this.activeTile.x].tile = parseInt(selector.value);
    this.requestUpdate();
  }
  paintCell(x,y){
    let selector = this.renderRoot.querySelector("input[name='paintbrush-select']:checked");
    let cell = this.gs.mapData.tiles[y][x];
    if(selector.value == "TERRAIN"){
      cell.tile = this.paintingTileID;
      this.requestUpdate();
    }else if(selector.value == "ERASE"){
      cell.isStartingPosition = false;
      this.requestUpdate();
    }else if(selector.value == "STARTINGS"){
      cell.isStartingPosition = true;
      this.requestUpdate();
    }
  }
  validateMapFilename(){
    let selector = this.renderRoot.querySelector("#newmap-filepath");
    selector.value = selector.value.replace(/[^a-zA-Z0-9-_\/]/, '');
  }
  createNewMap(){
    let selector = this.renderRoot.querySelector("#newmap-filepath");
    let newfilename = selector.value;
    if(!newfilename || newfilename.length < 1)
      return;
    selector = this.renderRoot.querySelector("#newmap-width");
    let w = selector.value;
    selector = this.renderRoot.querySelector("#newmap-height");
    let h = selector.value;
    this.gs.mapData = {tiles:[]}
    this.gs.units = [];
    for(let i = 0; i < h; i++){
      let row = [];
      let unitrow = [];
      for(let j = 0; j < w; j++){
        row.push({tile:1}); //fill with grass
        unitrow.push(null); //no units here
      }
      this.gs.mapData.tiles.push(row);
      this.gs.units.push(unitrow);
    }
    this.currentMapName = newfilename + ".json";
    this.requestUpdate();
  }
  cellClasses = ["","grass","trees","hills"];
  cellClass(cell){
    return "map-cell" + ((cell <= 0 || cell >= this.cellClasses.length) ? "" : " " + this.cellClasses[cell]);
  }
  toolSelectionClass(id){
    let tclass = "toolbar-button";
    if(id == this.selectedTool){
      return tclass + " toolbar-selected";
    }else{
      return tclass;
    }
  }
  selectTool(id){
    this.selectedTool = id;
  }
  selectPaintbrush(){
    let selector = this.renderRoot.querySelector("#terrain");
    this.paintingTileID = parseInt(selector.value);
  }
  mouseover(x,y){
    if(this.selectedTool == "paint" && this.gs.mousedown){
      this.paintCell(x,y);
    }
  }
  validateUnits(){
    for(let i = 0; i < this.gs.units.length; i++){
      for(let j = 0; j < this.gs.units[0].length; j++){
        let unit = this.gs.units[i][j];
        if(unit){
          if(unit.armyId){
            continue; //skip unit placeholders
          }
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
        <select id="map-selector">
          ${this.maplist.map((mapname,index) => {
            return html`<option value=${mapname}>${mapname}</option>`
          })}
        </select>
        <button @click=${this.getMapData}>Press to load map data</button>
        <div>
          Or create a new map: <input id="newmap-width" type="number" value="1" min="1" max="60"/> wide by <input id="newmap-height" type="number" value="1" min="1" max="60"/> tall, save to <input id="newmap-filepath" class="newmap-filename-input" type="text" maxlength="32" @keyup=${this.validateMapFilename}>.json <button @click=${this.createNewMap}>Create</button>
        </div>
        <div class="map-ui">
          <div class="map-grid">
            <div class="map-toolbar">
              <button class=${this.toolSelectionClass("select")} @click=${(e) => {this.selectTool("select");}}><img src="frontend/assets/select-icon.png"/></button>
              <button class=${this.toolSelectionClass("paint")} @click=${(e) => {this.selectTool("paint");}}><img src="frontend/assets/paint-icon.png"/></button>  
              <button class=${this.toolSelectionClass("move")} @click=${(e) => {this.selectTool("move");}}><img src="frontend/assets/move-icon.png"/></button>             
            </div>
            ${this.gs.mapData.tiles.map((row,yindex) => {
              return html`<div class="map-row">
                ${row.map((cell,xindex) => {
                  return html`<div class=${this.cellClass(cell)} @click=${() => {this.activateCell(xindex,yindex)}} @mousedown=${() => {this.mousedown(xindex,yindex)}} style=${"background-image:url('./game-client/" + this.getImagePathFromCellCode(cell.tile) + "')"} @mouseover=${() => {this.mouseover(xindex,yindex);}}>
                    ${
                      cell.isStartingPosition ? html`
                        <img class="starting-position-img" src="game-client/assets/img/startingPosition.png" draggable="false">
                      ` : html``
                    }
                    <img class="unit-img" src=${this.gs.units[yindex][xindex] ? "game-client/" + (this.gs.units[yindex][xindex].mapSpriteFile ? this.gs.units[yindex][xindex].mapSpriteFile : "assets/img/qmark.png") : ""} draggable="false"/>
                  </div>`
                })}
              </div>`
            })}
          </div>
          <div class="tile-detail">
          ${this.selectedTool == "select" ?
            html`
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
            ` : 
            this.selectedTool == "paint" ? html`
              <div class="terrain-select">
                <select id="terrain" @change=${this.selectPaintbrush}>
                  ${this.gs.nativeTerrain.map((terr,i) => {
                    return html`<option value=${i+1} ?selected=${i==0}>${terr.name}</option>`
                  })}
                  ${this.gs.customTerrain.map((terr,i) => {
                    return html`<option value=${i+1001}>${terr.name}</option>`
                  })}
                </select>
                <input class="paint-radio" type="radio" name="paintbrush-select" id="terrain" value="TERRAIN" checked><br/>
                <label for="erase-special">Erase special features</label>
                <input class="paint-radio" type="radio" name="paintbrush-select" id="erase-special" value="ERASE">
                <label for="paint-startings">Starting tiles</label>
                <input class="paint-radio" type="radio" name="paintbrush-select" id="paint-startings" value="STARTINGS">
              </div>
            ` :
            this.selectedTool == "move" ? html`
            
            ` : html`` 
          }            
          </div>
        </div>
        <button @click=${this.saveMapData}>Press to save map data</button>
        <p>${JSON.stringify(this.gs.mapData)}</p>
      </div>
    `;
  }
  updated(){
    if(this.maplist.length == 0){
      window.medallionAPI.getMapsList().then(result => this.maplist = result);
    }
  }
}
window.customElements.define('maps-page', MapsPage);