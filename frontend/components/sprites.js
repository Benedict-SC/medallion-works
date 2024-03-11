import {LitElement, html, css} from '../../lit-core.min.js';

export class SpritesPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
    .file-browser{
      overflow:scroll;
    }
    .file-row{
      display:block;
    }
    .file-container{
      display:inline-block;
      height:120px;
      width:120px;
      background-color:#E0E0E0;
      margin:2px;
    }
    .file-container:hover{
      color:rgb(7 73 155);
      background-color:#7BF
    }
    .file-img-box{
      margin:auto;
      margin-top:15px;
      width:70px;
      height:70px;
      background-color:#FFFA;
    }
    .file-img{
      width:100%;
    }
    .file-label{
      margin:auto;
      font-size:10px;
      text-align:center;
    }
  `;
  static get properties() {
    return {
      fileslist: {type:Array}
    };
  }
  bankPrefix = "./game-client/custom/img/";

  constructor() {
    super();
    window.medallionAPI.getSpriteGallery().then(data => {
      this.fileslist = data;
      console.log("data: %o",this.fileslist);
    });
  }
  render() {
    if(this.fileslist){
    return html`
      <div>
        <div class="file-browser">
          <div class="file-row">
              ${this.fileslist.map((filename,index) => {
                return html`
                <div class="file-container">
                  <div class="file-img-box">
                    <img class="file-img" src="${this.bankPrefix + filename}">
                  </div>
                  <div class="file-label">${filename}</div>
                </div>
                `
              })}
          </div>
        </div>
      </div>
    `;
    }else{
      return html`<p>Loading...</p>`;
    }
  }
}
window.customElements.define('sprites-page', SpritesPage);