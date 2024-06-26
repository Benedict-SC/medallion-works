import {LitElement, html, css} from '../../lit-core.min.js';

export class AppWrapper extends LitElement {
  static styles = css`
    .global-styles{
      font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      margin:2px;
    }
    .mw-title{
      font-size:20px;
      font-weight:bold;
      color:rgb(78, 132, 182);
      padding:5px;
    }
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .picker{
      position:absolute;
      top:0;
    }
  `;
  static get properties() {
    return {
      view: {type: String}
    };
  }

  constructor() {
    super();
    window.gs = {};
    window.gs.mousedown = false;
    this.view = 'Home';
    this.addEventListener('mw-nav-event', (e) => this.changeView(e.detail.view));
  }
  changeView(view){
    if(window.gs.activePage){
      if(window.gs.activePage.someModified){//check for unsaved changes before navigating
        let ok = confirm("There are unsaved changes in this view! Discard changes?");
        if(ok){
          this.view = view;
        }
      }else{
        this.view = view;
      }
    }else{
      this.view = view;
    }
  }
  getView(){
    if(this.view == "Home"){
      return html`<span>Put navigation instructions here</span>`;
    }else if(this.view == "Units"){
      return html`<units-page></units-page>`;
    }else if(this.view == "Maps"){
      return html`<maps-page></maps-page>`;
    }else if(this.view == "Items"){
      return html`<items-page></items-page>`;
    }else if(this.view == "Sprites"){
      return html`<sprites-page></sprites-page>`;
    }else if(this.view == "Dialogue"){
      return html`<dialogue-page></dialogue-page>`;
    }else{
      return html`<span>Invalid view.</span>`
    }
  }
  mousedown(){
    window.gs.mousedown = true;
  }
  mouseup(){
    window.gs.mousedown = false;
  }
  mousein(){
    window.gs.mousedown = false;
  }
  render() {
    return html`
      <div class="global-styles" @mouseup=${this.mouseup} @mousedown=${this.mousedown} @mouseover=${this.mousein}>
        <div class="mw-title">Medallion Works content management tool</div>
        <div class="navbar">
          <mw-nav-item target="Maps" text="Edit Maps"></mw-nav-item>
          <mw-nav-item target="Units" text="Edit Units"></mw-nav-item>
          <mw-nav-item target="Items" text="Edit Items"></mw-nav-item>
          <mw-nav-item target="Sprites" text="Sprite Bank"></mw-nav-item>
          <mw-nav-item target="Dialogue" text="Edit Dialogue"></mw-nav-item>
        </div>
        <div>
          ${this.getView()}
        </div>
        <picker-modal class="picker" modalType="sprite"></picker-modal>
        <picker-modal class="picker" modalType="item"></picker-modal>
      </div>
    `;
  }
}
window.customElements.define('app-wrapper', AppWrapper);