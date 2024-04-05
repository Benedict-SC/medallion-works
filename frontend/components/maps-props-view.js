import {LitElement, html, css, unsafeCSS} from '../../lit-all.min.js';

export class MapDecorationWindow extends LitElement {
  static styles = css`
    .props-toolbar{
      background-color:#444444;
      width:100%;
      padding:4px;
    }
    .return-button{
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
    }
    .prop{
      position:absolute;
    }
    .props-controls{
      flex:1;
      background-color:#AAAAAA;
      padding:5px;
    }
  `;
  static get properties() {
    return {
      gs: {type:Object},
      currentMapName: {type:String},
      tileSize: {type:Number},
      props: {type:Array}
    };
  }

  constructor() {
    super();
    this.gs = window.gs;
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
  render(){
    return html`
        <style>
            ${this.dynamicCss()}
        </style>
        <div class="props-toolbar">
          <button class="return-button" @click=${this.returnToNormalView}>Return to data editor</button>
        </div>
        <div class="map-ui">
          <div class="map-grid">
            ${this.gs.mapData.tiles.map((row,yindex) => {
              return html`<div class="map-row">
                ${row.map((cell,xindex) => {
                  return html`<div class="map-cell" style=${"background-image:url('./game-client/" + this.getImagePathFromCellCode(cell.tile) + "')"}>
                    <img class="unit-img" src=${this.gs.units[yindex][xindex] ? "game-client/" + (this.gs.units[yindex][xindex].mapSpriteFile ? this.gs.units[yindex][xindex].mapSpriteFile : "assets/img/qmark.png") : ""} draggable="false"/>
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
            Controls go here.
          </div>
        </div>
    `
  }
}
window.customElements.define('maps-props-view', MapDecorationWindow);