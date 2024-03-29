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
      topFolder: {type:Object},
      folder: {type:Object},
      isEmbeddedSelector: {type:Boolean}
    };
  }
  bankPrefix = "./game-client/custom/img/";

  constructor() {
    super();
    window.medallionAPI.getSpriteGallery().then(data => {
      this.topFolder = data;
      this.folder = data;
    });
  }
  openFolder(folder){
    this.folder = folder;
  }
  selectFile(file){
    if(this.isEmbeddedSelector){
      const event = new CustomEvent("file-selected-event", { bubbles:true, composed:true, detail: file.prefix + file.name });
      this.dispatchEvent(event);
    }
  }
  backUp(){
    this.folder = this.folder.parent;
  }
  render() {
    if(this.folder){
    return html`
      <div>
        <div class="file-browser">
          <div class="file-row">
              ${
                (this.folder != this.topFolder) ?
                    html`
                    <div class="file-container">
                        <div class="file-img-box">
                            <img class="file-img" @dblclick=${this.backUp} src="./frontend/assets/parentfolder.png">
                        </div>
                        <div class="file-label">&nbsp;</div>
                    </div>`
                  : html``
              }
              ${this.folder.folderContents.map((file,index) => {
                return html`
                <div class="file-container">
                  <div class="file-img-box">
                    ${
                      file.folderContents ? 
                        html`
                        <img class="file-img" @dblclick=${() => {this.openFolder(file)}} src="./frontend/assets/folder.png">
                        `
                      : html` 
                        <img class="file-img" @dblclick=${() => {this.selectFile(file)}} src="${this.folder.prefix + this.folder.name + "/" + file.name}">
                      `
                    }
                  </div>
                  <div class="file-label">${file.name}</div>
                </div>
                `
              })}
          </div>
        </div>
        <div class="file-upload-station">
              <input type="file" id="sprite-upload-button" name="sprite-upload" accept="image/png"/>
              <button>Upload here</button>
        </div>
      </div>
    `;
    }else{
      return html`<p>Loading...</p>`;
    }
  }
}
window.customElements.define('sprites-page', SpritesPage);