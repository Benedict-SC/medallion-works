import {LitElement, html, css} from '../../lit-core.min.js';

export class AppWrapper extends LitElement {
  static styles = css`
    .global-styles{
      font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
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
  `;
  static get properties() {
    return {
      view: {type: String}
    };
  }

  constructor() {
    super();
    window.gs = {};
    this.view = 'Home';
    this.addEventListener('mw-nav-event', (e) => this.changeView(e.detail.view));
  }
  changeView(view){
    this.view = view;
  }
  getView(){
    if(this.view == "Home"){
      return html`<span>Put navigation instructions here</span>`;
    }else if(this.view == "Units"){
      return html`<units-page></units-page>`;
    }else if(this.view == "Maps"){
      return html`<maps-page></maps-page>`;
    }else{
      return html`<span>Invalid view.</span>`
    }
  }
  render() {
    return html`
      <div class="global-styles">
        <div class="mw-title">Medallion Works content management tool</div>
        <div class="navbar">
          <mw-nav-item target="Maps" text="Edit Maps"></mw-nav-item>
          <mw-nav-item target="Units" text="Edit Units"></mw-nav-item>
        </div>
        <div>
          ${this.getView()}
        </div>
      </div>
    `;
  }
}
window.customElements.define('app-wrapper', AppWrapper);