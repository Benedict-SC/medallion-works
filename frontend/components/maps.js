import {LitElement, staticHtml, html, literal, css, repeat} from '../../lit-all.min.js';
import { InteractTemplate } from '../objects/interact-template.js';

export class MapsPage extends LitElement {
  static styles = css`
    .newmap-filename-input{
      text-align:right;
    }
    .map-editor{
      max-width:100vw;
      max-height:800px;
    }
    .map-ui{
      display:flex;
      max-width:100%;
      user-select: none;
    }
    .map-main{
      flex:2.5;
      max-height:700px;
      max-width:70%;
      background-color:#555555;
    }
    .map-grid { 
      overflow:scroll;
      height:94%;
    }
    .map-toolbar{
      background-color:#444444;
      width:98%;
      padding:4px;
    }
    .toolbar-button{
      background-color:#888888;
      padding:3px;
      padding-left:5px;
      padding-right:5px;
    }
    .toolbar-not-a-state{
      float:right;
      color:#ebebeb;
      font-weight:bold;
      margin-right:4px;
      margin-top:1px;
    }
    .toolbar-selected{
      background-color: #666666;
    }
    .map-row {
      line-height:0px;
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
    .map-cell:hover{
      border-color: #66E;
    }
    .map-cell-selected{
      border-color: #55B;
    }
    .tile-detail{
      flex:1;
      width:235px;
      border: 2px solid #666666;
      padding:3px;
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
      bottom: 0px;
      left: 50%;
      transform: translate(-50%,0);
    }
    .ghost-unit{
      position:absolute;
      left:-2px;
      top:-1px;
      opacity:50%;
    }
    .starting-position-img{
      position:absolute;
      left:-2px;
      top:-1px;
      pointer-events:none;
    }
    .wall-n{
      border-top-color:black;
    }
    .wall-w{
      border-left-color:black;
    }
    .wall-s{
      border-bottom-color:black;
    }
    .wall-e{
      border-right-color:black;
    }
    .wall-n:hover{
      border-top-color:navy;
    }
    .wall-w:hover{
      border-left-color:navy;
    }
    .wall-s:hover{
      border-bottom-color:navy;
    }
    .wall-e:hover{
      border-right-color:navy;
    }
    .wall-control-box{
      perspective:50px;
      transform-style:preserve-3d;
      position:relative;
      height:46px;
      width:46px;
    }
    .wall-control-pane{
      background-color:#0000;
      position:absolute;
      top:0px;
      left:0px;
      height:46px;
      width:46px;
    }
    .wall-control-pane:hover{
      background-color:#0005;
      border:1px solid white;
    }
    .wall-control-bottom{
      position:absolute;
      transform: rotateX(90deg);
      transform-origin:bottom;
    }
    .wall-control-top{
      position:absolute;
      transform: rotateX(-90deg);
      transform-origin:top;
    }
    .wall-control-left{
      position:absolute;
      transform: rotateY(90deg);
      transform-origin:left;
    }
    .wall-control-right{
      position:absolute;
      transform: rotateY(-90deg);
      transform-origin:right;
    }
    .map-interactions-list{
      font-size:12px;
    }
    .map-interaction{
      position:relative;
      background-color:#EEFFDD;
      margin:2px;
      padding:1px;
      border-radius:3px;
    }
    .map-interactions-text-input{
      width:100px;
    }
    .map-interact-indicator{
      position:absolute;
      bottom:0px;
      right:0px;
    }
    .map-interaction-trash-button{
        background-color:#FFEEEE;
        border-radius:8px;
        position:absolute;
        top:0px;
        right:6px;
        font-weight: bold;
        border: 1px solid #FF6666;
    }
    .map-interaction-trash-button:hover{
        background-color:#F0DDDD;
        cursor:pointer;
        text-shadow: red 0 0 4px;
    }
  `;
  static get properties() {
    return {
      gs: {type:Object},
      mutex: {type:Boolean},
      maplist: {type:Array},
      interactIdsList: {type:Array},
      currentMapName: {type:String},
      activeTile: {type:Object},
      movingUnit: {type:Object},
      movingSourceCell: {type:Object},
      movingHoversOver: {type:Object},
      selectedTool: {type:String}, //select, paint, move, fence
      paintingTileID: {type:Number},
      decorationView: {type:Boolean}
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
    if(!this.interactIdsList){
      this.interactIdsList = [];
    }
    window.medallionAPI.getTerrainData().then(result => {
      this.gs.nativeTerrain = result.native;
      this.gs.customTerrain = result.custom;
    });
    this.addEventListener('back-from-props',() => {this.decorationView = false});
  }
  firstUpdated(){
    super.firstUpdated();
    window.gs.activePage = this;
  }
  refreshMap(){
    this.requestUpdate();
  }
  getMapData(){
    let selector = this.renderRoot.querySelector("#map-selector");
    let mapfile = selector.value;
    window.medallionAPI.getMapData(mapfile).then(data => {
      this.gs.mapData = data;
      if(!this.gs.mapData.props){
        this.gs.mapData.props = [];
      }
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
          if(value.interaction){ //compensate for inconsistent single-interact vs list-of-interacts data formats. TODO: remove this later once no single-interacts exist
            if(!(value.interactions)){
              value.interactions = [];
            }
            value.interactions.push(value.interaction);
            delete value.interaction;
          }
          this.interactIdsList = [];
          if(value.interactions){
            for(let k=1;k<value.interactions.length;k++){
              this.interactIdsList.push(value.interactions[k].id);
            }
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
      this.currentMapName = mapfile;
      this.requestUpdate();
    });
  }
  saveMapData(){
    if(this.currentMapName == undefined){
      console.log("hey what the hell! why's it undefined???");
      return;
    }
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
    if(!this.gs.mapData.props){
      this.gs.mapData.props = [];
    }
    this.gs.mapData.units = flattenedUnits;
    window.medallionAPI.saveMapData(this.gs.mapData,this.currentMapName).then(response => {
      console.log("%o",response);
    });
  }
  activateCell(x,y){
    if(this.selectedTool == "select"){
      this.activeTile = {x:x,y:y};
      console.log(this.activeCell());
    }
  }
  valueOfActiveCell(){
    return this.activeCell().tile;
  }
  valueOfCell(x,y){
    return this.gs.mapData.tiles[y][x].tile;
  }
  activeCell(){
    if(!(this.activeTile)){
      return null;
    }
    return this.gs.mapData.tiles[this.activeTile.y][this.activeTile.x];
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
  updateStartingPosition(){
    let selector = this.renderRoot.querySelector("input[name='starting-select']:checked");
    let isStarting = selector.value == "true";
    this.activeCell().isStartingPosition = isStarting;
    this.refreshMap();
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
    this.gs.mapData.props = [];
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
  cellClass(cell,x,y){
    let classString = "map-cell";
    if(this.activeTile && x == this.activeTile.x && y == this.activeTile.y){
      classString += " map-cell-selected";
    }
    if(cell.walls){
      if(cell.walls.n){ classString += " wall-n"; }
      if(cell.walls.e){ classString += " wall-e"; }
      if(cell.walls.s){ classString += " wall-s"; }
      if(cell.walls.w){ classString += " wall-w"; }
    }
    return classString;
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
  toggleDecorationView(){
    this.decorationView = !this.decorationView;
  }
  toggleWall(cell,x,y,quadrant){
    console.log("we're togglin'");
    let otherCell = null;
    let oppositeQuadrants = {n:"s",s:"n",e:"w",w:"e"}
    if(quadrant == "n"){
      if(y > 0){
        otherCell = this.gs.mapData.tiles[y-1][x];
      }
    }else if(quadrant == "s"){
      if(y < this.gs.mapData.tiles.length - 1){
        otherCell = this.gs.mapData.tiles[y+1][x];
      }
    }else if(quadrant == "e"){
      if(x < this.gs.mapData.tiles[0].length - 1){
        otherCell = this.gs.mapData.tiles[y][x+1];
      }
    }else if(quadrant == "w"){
      if(x > 0){
        otherCell = this.gs.mapData.tiles[y][x-1];
      }
    }else{
      return; //????
    }
    if(!cell.walls){
      cell.walls = {};
    }
    cell.walls[quadrant] = !(cell.walls[quadrant]);
    if(otherCell){
      if(!otherCell.walls){
        otherCell.walls = {};
      }
      otherCell.walls[oppositeQuadrants[quadrant]] = cell.walls[quadrant];
    }
    this.requestUpdate();
  }
  updateInteractField(event,interact,fieldname){
    let newValue = event.target.value;
    interact[fieldname] = newValue;
  }
  addNewInteract(cell){
    if(!cell.interactions){
      cell.interactions = [];
    }
    let interact = new InteractTemplate();
    let originalId = interact.id;
    let foundMatch = this.interactIdsList.find(x => x == interact.id);
    let counter = 2;
    while(foundMatch){
      interact.id = originalId + "-" + counter;
      counter++;
      foundMatch = this.interactIdsList.find(x => {
        return x == interact.id;
      });
    }
    this.interactIdsList.push(interact.id);
    cell.interactions.push(interact);
    this.requestUpdate();
  }
  removeInteract(interact,cell){
    cell.interactions = cell.interactions.filter(x => x != interact);
    this.interactIdsList = this.interactIdsList.filter(x => x != interact.id);
    if(cell.interactions.length == 0){
      delete(cell.interactions);
    }
    this.requestUpdate();
  }
  mousedown(x,y){
    if(this.selectedTool == "paint"){
      this.paintCell(x,y);
    }else if(this.selectedTool == "move"){
      this.movingSourceCell = {x:x,y:y};
      this.movingUnit = this.gs.units[y][x];
    }
  }
  mouseover(x,y){
    if(this.selectedTool == "paint" && this.gs.mousedown){
      this.paintCell(x,y);
    }else if(this.selectedTool == "move"){
      this.movingHoversOver = {x:x,y:y};
    }
  }
  mouseup(x,y){
    if(this.selectedTool == "move" && this.movingUnit && this.movingHoversOver){
      let unitAt = this.gs.units[y][x];
      this.gs.units[y][x] = this.movingUnit;
      if(unitAt){ //swap with it
        this.gs.units[this.movingSourceCell.y][this.movingSourceCell.x] = unitAt;
      }else{
        this.gs.units[this.movingSourceCell.y][this.movingSourceCell.x] = null;
      }
      this.movingSourceCell = null;
      this.movingUnit = null;
      this.movingHoversOver = null;
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
          if(unit.aiStrategy == undefined){
            unit.aiStrategy = "SENTRY";
          }
          if(unit.aiTactic == undefined){
            unit.aiTactics = "NORMAL";
          }
        }
      }
    }
  }
  render() {
    return html`
      <div>
        <select id="map-selector">
          ${this.maplist.map((mapname,index) => {
            return html`<option value=${mapname}>${mapname}</option>`
          })}
        </select>
        <button @click=${this.getMapData}>Press to load map data</button>
        <div>
          Or create a new map: <input id="newmap-width" type="number" value="1" min="1" max="60"/> wide by <input id="newmap-height" type="number" value="1" min="1" max="60"/> tall, save to <input id="newmap-filepath" class="newmap-filename-input" type="text" maxlength="32" @keyup=${this.validateMapFilename}>.json <button @click=${this.createNewMap}>Create</button>
        </div>
        <div class="map-editor">
        ${ !(this.decorationView) ? html`
        <div class="map-ui">
          <div class="map-main">
            <div class="map-toolbar">
              <button class=${this.toolSelectionClass("select")} @click=${(e) => {this.selectTool("select");}}><img src="frontend/assets/select-icon.png"/></button>
              <button class=${this.toolSelectionClass("paint")} @click=${(e) => {this.selectTool("paint");}}><img src="frontend/assets/paint-icon.png"/></button>  
              <button class=${this.toolSelectionClass("move")} @click=${(e) => {this.selectTool("move");}}><img src="frontend/assets/move-icon.png"/></button>
              <button class=${this.toolSelectionClass("fence")} @click=${(e) => {this.selectTool("fence");}}><img src="frontend/assets/fence-icon.png"/></button>
              <button class="toolbar-button toolbar-not-a-state" @click=${this.toggleDecorationView}>Decorate map</button>             
            </div>
            <div class="map-grid">
            ${this.gs.mapData.tiles.map((row,yindex) => {
              return html`<div class="map-row">
                ${row.map((cell,xindex) => {
                  return html`<div class=${this.cellClass(cell,xindex,yindex)} @click=${() => {this.activateCell(xindex,yindex)}} @mousedown=${() => {this.mousedown(xindex,yindex)}} style=${"background-image:url('./game-client/" + this.getImagePathFromCellCode(cell.tile) + "')"} @mouseover=${() => {this.mouseover(xindex,yindex);}} @mouseup=${() => {this.mouseup(xindex,yindex)}}>
                    ${
                      cell.isStartingPosition ? html`
                        <img class="starting-position-img" src="game-client/assets/img/startingPosition.png" draggable="false">
                      ` : html``
                    }
                    <img class="unit-img" src=${this.gs.units[yindex][xindex] ? "game-client/" + (this.gs.units[yindex][xindex].mapSpriteFile ? this.gs.units[yindex][xindex].mapSpriteFile : "assets/img/qmark.png") : ""} draggable="false"/>
                    ${
                        (this.movingHoversOver && (xindex == this.movingHoversOver.x) && (yindex == this.movingHoversOver.y)) ? html`
                        <img class="ghost-unit" src=${this.movingUnit ? "game-client/" + (this.movingUnit.mapSpriteFile ? this.movingUnit.mapSpriteFile : "assets/img/qmark.png") : ""} draggable="false"/>
                        ` : html``
                    }
                    ${cell.interactions ? html`
                      <img class="map-interact-indicator" src="frontend/assets/tiny-exclamation.png">
                    ` : html``}
                    ${
                      this.selectedTool == "fence" ? html`
                      <div class="wall-control-box">
                        <div class="wall-control-pane wall-control-top" @click=${() => this.toggleWall(cell,xindex,yindex,"n")}></div>
                        <div class="wall-control-pane wall-control-bottom" @click=${() => this.toggleWall(cell,xindex,yindex,"s")}></div>
                        <div class="wall-control-pane wall-control-left" @click=${() => this.toggleWall(cell,xindex,yindex,"w")}></div>
                        <div class="wall-control-pane wall-control-right" @click=${() => this.toggleWall(cell,xindex,yindex,"e")}></div>
                      </div>
                      ` : html``
                    }
                  </div>`
                })}
              </div>`
            })}
            </div>
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
                    <div class="start-position-selector">
                        Player starting position:<br/>
                        <label for="startYes">Yes</label>
                        <input type="radio" name="starting-select" id="startYes" value=true @change=${this.updateStartingPosition}>
                        <label for="startNo">No</label>
                        <input type="radio" name="starting-select" id="startNo" value=false @change=${this.updateStartingPosition}>
                    </div>
                    <hr/>
                    ${this.activeCell().interactions ? html`
                      <div class="map-interactions-list">
                        ${repeat(this.activeCell().interactions,(interact) => interact,(interact,idx) => {
                          return html`
                            <div class="map-interaction">
                            <button class="map-interaction-trash-button" @click=${() => this.removeInteract(interact,this.activeCell())}>🗑</button>
                            ID: <input class="map-interactions-text-input" type="text" value=${interact.id} @change=${(e) => this.updateInteractField(e,interact,"id")}/><br/>
                            Name: <input class="map-interactions-text-input" type="text" value=${interact.name} @change=${(e) => this.updateInteractField(e,interact,"name")}/><br/>
                            Menu option: <input type="checkbox" ?checked=${interact.displaysInMenu} @change=${(e) => {interact.displaysInMenu = !!(e.target.checked)}}/>
                            Highlight: <input type="checkbox" ?checked=${interact.displaysOnMap} @change=${(e) => {interact.displaysOnMap = !!(e.target.checked)}}/>
                            Type: <select>
                              <option ?selected=${interact.actionType == "Script"} value="Script">Script</option>
                              <option ?selected=${interact.actionType == "Seize"} value="Seize">Seize</option>
                              <option ?selected=${interact.actionType == "Sack"} value="Sack">Sack</option>
                            </select>
                            </div>
                          `
                        })}
                        <button @click=${(e) => this.addNewInteract(this.activeCell())}>Add new</button>
                      </div>
                    `:html` <div class="map-interactions-list">
                              No interactions on this tile.<br/>
                              <button @click=${(e) => this.addNewInteract(this.activeCell())}>Add one?</button>
                            </div>`}
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
        `:html`<maps-props-view .props=${this.gs.mapData.props} currentMapName=${this.currentMapName} tileSize=50></maps-props-view>`}
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
    if(!this.decorationView && this.selectedTool == "select"){
      let activeCell = this.activeCell();
      if(activeCell){
        if(activeCell.isStartingPosition){
          this.renderRoot.querySelector("#startYes").checked = true;
        }else{
          this.renderRoot.querySelector("#startNo").checked = true;
        }
      }
    }
  }
}
window.customElements.define('maps-page', MapsPage);