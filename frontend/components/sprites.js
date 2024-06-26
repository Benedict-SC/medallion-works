import {LitElement, html, css} from '../../lit-core.min.js';

export class SpritesPage extends LitElement {
  static styles = css`
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
      height:100%;
    }
    .file-label{
      margin:auto;
      font-size:10px;
      text-align:center;
    }
    .file-controls{
      margin-top:-2px;
    }
    .file-delete-button{
      display:block;
      margin:auto;
      color: darkred;
      font-weight: bold;
      border: none;
      background-color: #FFF0;
      margin-top: -3px;
    }
    .file-delete-button:hover{
      text-shadow: red 0 0 4px;
    }
    .folder-create-input:invalid{
      background-color:pink;
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
  firstUpdated(){
    super.firstUpdated();
    if(!this.isEmbeddedSelector){
      window.gs.activePage = this;
    }
  }
  reload(){
    let currentPrefix = this.folder.prefix;
    let currentName = this.folder.name;
    window.medallionAPI.getSpriteGallery().then(data => {
      this.topFolder = data;
      this.navigateToFolder(currentPrefix,currentName);
    });
  }
  navigateToFolder(prefix,name){
    let rootNames = (this.topFolder.prefix + this.topFolder.name).split("/");
    let names = (prefix+name).split("/").slice(rootNames.length);
    let currentFolder = this.topFolder;
    for(let i = 0; i < names.length; i++){
      currentFolder = currentFolder.folderContents.find(x => x.name == names[i]);
    }
    this.folder = currentFolder;
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
  deleteFile(file){
    let confirmed = confirm("Delete " + file.name + "?");
    let filepath = file.prefix + file.name;
    if(confirmed){
      window.medallionAPI.deleteSprite(filepath).then(response => {
        this.reload();
      }).catch(err => {console.log(err);});
    }
  }
  uploadFile(){
    let selector = this.renderRoot.querySelector("#sprite-upload-button");
    let file = selector.files[0];
    if(!file){
      return;
    }
    let pathSegments = file.path.split("\\");
    let filename = pathSegments[pathSegments.length - 1];
    let folderpath = this.folder.prefix + this.folder.name + "/";
    let exists = this.folder.folderContents.find(x => x.name == filename);
    let okToUpload = true;
    if(exists){
      okToUpload = confirm(filename + " already exists. Would you like to overwrite it?");
    }
    if(okToUpload){
      window.medallionAPI.uploadSprite(file.path,folderpath,filename).then(response => {
        this.reload();
      }).catch(err => {
        console.log("error: %o",err);
      });      
    }
  }
  createFolder(){
    let fnameinput = this.renderRoot.querySelector("#folder-create-name");
    let value = fnameinput.value;
    let match = value.match(/^[a-zA-Z-]+$/g)
    if(match && value.length > 0){
      let folderpath = this.folder.prefix + this.folder.name + "/";
      window.medallionAPI.createFolder(folderpath,value).then(response => {
        this.reload();
      }).catch(err => {
        console.log("error: %o",err);
      });  
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
                        <div class="file-controls">
                          <button class="file-delete-button">&nbsp;</button>
                        </div>
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
                  ${ 
                    (this.isEmbeddedSelector || file.folderContents) ? html`
                    <div class="file-controls">
                      <button class="file-delete-button">&nbsp;</button>
                    </div>` :
                    html`
                    <div class="file-controls">
                      <button @click=${() => {this.deleteFile(file)}} class="file-delete-button">🗑</button>
                    </div>
                    `
                  }
                </div>
                `
              })}
          </div>
        </div>
        <div class="file-upload-station">
              <input type="file" id="sprite-upload-button" name="sprite-upload" accept="image/png"/>
              <button @click=${this.uploadFile}>Upload here</button>
        </div>
        <div class="folder-create">
              New folder name: <input type="text" maxlength=20 pattern="[a-zA-Z\\\-]+" title="Letters and dashes only." id="folder-create-name" class="folder-create-input"/>
              <button @click=${this.createFolder}>Create new folder</button>
        </div>
      </div>
    `;
    }else{
      return html`<p>Loading...</p>`;
    }
  }
}
window.customElements.define('sprites-page', SpritesPage);