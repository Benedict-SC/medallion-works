import {LitElement, html, css, repeat} from '../../lit-all.min.js';

export class MapDecorationWindow extends LitElement {
  static styles = css`
    .props-toolbar{
      background-color:#444444;
      width:100%;
      padding:4px;
    }
    .props-general-button{
      background-color:#888888;
      padding:3px;
      padding-left:5px;
      padding-right:5px;
      color:#ebebeb;
      font-weight:bold;
    }
    .map-ui{
      display:flex;
      user-select: none;
      padding:5px;
      background-color:#555555;
    }
    .map-grid { 
      flex:4;
      overflow:scroll;
      max-height:90vh;
      min-height:300px;
      position:relative;
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
    }
    .unit-img{
        opacity:50%;
        position:absolute;
        bottom: 0px;
        left: 50%;
        transform: translate(-50%,0);
        z-index:10;
        pointer-events:none;
    }
    .prop{
      position:absolute;
    }
    .props-controls{
      flex:1;
      background-color:#AAAAAA;
      padding:5px;
    }
    .prop-control-row-1{
      display:flex;
    }
    .prop-control{
      background-color:#BBB;
      padding:2px;
      border: 1px solid #444;
      border-radius:3px;
    }
    .prop-mini-img-container{
      flex:1;
      margin:2px;
    }
    .prop-mini-img{
      height:32px;
      width:32px;
    }
    .prop-dim-controls{
      flex:2;
      margin:2px;
    }
    .prop-dim-control{
      font-size:10px;
      white-space:nowrap;
    }
    .prop-dim-input{
      width:32px;
      font-size:10px;
    }
    .prop-order-buttons{
      flex:1;
      margin:2px;
    }
    .prop-order{
      display:block;
      font-size:16px;
      padding:0px;
      line-height:14px;
    }
    .prop-control-row-2{
      display:flex;
    }
    .prop-control-row-2 button{
      font-size:10px;
      flex:1;
    }
  `;
  static get properties() {
    return {
      gs: {type:Object},
      currentMapName: {type:String},
      tileSize: {type:Number},
      props: {type:Array},
      showUnits: {type:Boolean},
      newPropWaiting: {type:Boolean},
      oldPropWaiting: {type:Object}
    };
  }

  constructor() {
    super();
    this.gs = window.gs;
    this.addEventListener("prop-refreshed",this.refreshMap);
    this.showUnits = true;
  }
  refreshMap(){
    this.requestUpdate();
  }
  dynamicCss(){
    return css`
        .map-cell{
            width: ${this.tileSize}px;
            height: ${this.tileSize}px;
        }
    `
  }
  getImagePathFromCellCode(code){
    let index = (code > 1000) ? (code-1001) : (code - 1);
    if(code > 1000){
      return this.gs.customTerrain[index].imgPath;
    }else{
      return this.gs.nativeTerrain[index].imgPath;
    }
  }
  returnToNormalView(){
    const event = new CustomEvent("back-from-props", { bubbles:true, composed:true });
    this.dispatchEvent(event);
  }
  changeProperty(event,property,idx){
    let value = event.target.value;
    value = parseInt(value);
    this.props[idx][property] = value;
    this.requestUpdate();
  }
  toggleUnits(){
    this.showUnits = !this.showUnits;
  }
  trueSizeImage(idx){
    let imgElement = this.shadowRoot.getElementById("propMiniImg" + idx);
    let nw = imgElement.naturalWidth;
    let nh = imgElement.naturalHeight;
    this.props[idx].w = nw;
    this.props[idx].h = nh;
    this.refreshMap();
  }
  deleteProp(idx){
    let confirmation = confirm("Are you sure you want to delete this prop?");
    if(confirmation){
      this.props.splice(idx,1);
      this.refreshMap();
    }
  }
  createNewProp(){
    this.newPropWaiting = true;
    this.requestFilename();
  }
  requestFilename(){
    const event = new CustomEvent("request-sprite-filename", { bubbles:true, composed:true, detail: this });
    this.dispatchEvent(event);
  }
  receiveFilename(filename){
    if(!filename){
      this.newPropWaiting = false;
      this.oldPropWaiting = null;
      return;
    }
    if(this.newPropWaiting){
      this.newPropWaiting = false;
      let prop = {img:filename,x:10,y:10,w:50,h:50};
      this.props.push(prop);
      this.refreshMap();
      let self = this;
      window.setTimeout(() => {self.trueSizeImage(self.props.length - 1)},100);
    }
  }
  swapUp(idx){
    if(idx == 0){
      return;
    }
    let temp = this.props[idx];
    let above = this.props[idx-1];
    this.props[idx] = above;
    this.props[idx - 1] = temp;
    this.refreshMap();
  }
  swapDown(idx){
    console.log(idx);
    if(idx + 1 == this.props.length){
      return;
    }
    let temp = this.props[idx];
    let below = this.props[idx+1];
    this.props[idx] = below;
    this.props[idx + 1] = temp;
    this.refreshMap();
  }
  render(){
    return html`
        <style>
            ${this.dynamicCss()}
        </style>
        <div class="props-toolbar">
          <button class="props-general-button" @click=${this.returnToNormalView}>Return to data editor</button>
          <button class="props-general-button" @click=${this.toggleUnits}>${this.showUnits ? html`Hide units` : html`Show units`}</button>
        </div>
        <div class="map-ui">
          <div class="map-grid">
            ${this.gs.mapData.tiles.map((row,yindex) => {
              return html`<div class="map-row">
                ${row.map((cell,xindex) => {
                  return html`<div class="map-cell" style=${"background-image:url('./game-client/" + this.getImagePathFromCellCode(cell.tile) + "')"}>
                    ${ this.showUnits ? html`
                    <img class="unit-img" src=${this.gs.units[yindex][xindex] ? "game-client/" + (this.gs.units[yindex][xindex].mapSpriteFile ? this.gs.units[yindex][xindex].mapSpriteFile : "assets/img/qmark.png") : ""} draggable="false"/>
                    ` : html``}
                  </div>`
                })}
              </div>`
            })}
            ${this.props ? this.props.map((prop) => {
              return html`
                <resizable-prop class="prop" style=${"top:" + prop.y + "px;left:" + prop.x + "px;height:" + prop.h + "px;width:" + prop.w + "px;"} .prop=${prop}></resizable-prop>
              `
            }) : html``}
          </div>
          <div class="props-controls">
            ${
              this.props ? repeat(this.props, (prop) => prop, (prop,idx) => {
                return html`
                <div class="prop-control">
                  <div class="prop-control-row-1">
                    <div class="prop-mini-img-container">
                      <img class="prop-mini-img" id=${"propMiniImg" + idx} src=${"./game-client/" + prop.img}>
                    </div>
                    <div class="prop-dim-controls">
                      <div class="prop-dim-control">
                        X:&nbsp; <input class="prop-dim-input" type="number" @change=${(e) => {this.changeProperty(e,"x",idx)}} .value=${prop.x}/>
                      </div>
                      <div class="prop-dim-control">
                        W: <input class="prop-dim-input" type="number" @change=${(e) => {this.changeProperty(e,"w",idx)}} .value=${prop.w}/>
                      </div>
                    </div>
                    <div class="prop-dim-controls">
                      <div class="prop-dim-control">
                        Y: <input class="prop-dim-input" type="number" @change=${(e) => {this.changeProperty(e,"y",idx)}} .value=${prop.y}/>
                      </div>
                      <div class="prop-dim-control">
                        H: <input class="prop-dim-input" type="number" @change=${(e) => {this.changeProperty(e,"h",idx)}} .value=${prop.h}/>
                      </div>
                    </div>
                    <div class="prop-order-buttons">
                      <button class="prop-order" ?disabled=${idx == 0} @click=${() => {this.swapUp(idx)}}>🠽</button>
                      <button class="prop-order" ?disabled=${idx == (this.props.length - 1)} @click=${() => {this.swapDown(idx)}}>🠿</button>
                    </div>
                  </div>
                  <div class="prop-control-row-2">
                    <button>Sprite</button>
                    <button @click=${() => {this.trueSizeImage(idx)}}>Lifesize</button>
                    <button @click=${() => {this.deleteProp(idx)}}>Delete</button>
                  </div>
                </div>
                `
              }) : html`<p>No props yet.</p>`
            }
            <div class="props-add-control">
              <button @click=${this.createNewProp}>Add new prop</button>
            </div>
          </div>
        </div>
    `
  }
}
window.customElements.define('maps-props-view', MapDecorationWindow);