import {LitElement, html, css, repeat} from '../../lit-all.min.js';
import { FileOrFolder } from './folder-util.js';

export class DialoguePage extends LitElement {
  static styles = css`
    .dialogue-portraits{
        padding:5px;
        border:1px solid #888;
        background-color:#EEE;
    }
    .dialogue-portraits-header{
        font-weight:bold;
    }
    .dialogue-portrait{
        font-size:12px;
        background-color:#DDDDE2;
        padding:5px;
        margin:2px;
    }
    .dialogue-portrait-label{
        font-weight:bold;
        font-size:14px;
    }
    .dialogue-version{
        display:inline-block;
        background:#D2D2D8;
        border:1px solid #777;
        border-radius:3px;
        padding:2px;
        margin:1px;
    }
    .dialogue-portrait-img{
        height:100px;
    }
    .dialogue-portrait-number{
        width:80px;
    }
    .toggle-icon{
        padding:2px;
        background-color: #444;
        border-radius:5px;
        position:relative;
        top:3px;
    }
    .circled-question-mark{
        border:2px solid gray;
        color:gray;
        border-radius:15px;
        display:inline-block;
        width: 12px;
        line-height: 12px;
        text-align: center;
        padding-top: 1px;    
        font-size: 12px;
        font-weight: bold;
        cursor:pointer;
    }
  `;
  static get properties() {
    return {
        filesLoaded: {type:Boolean},
        convoLoaded: {type:Boolean},
        portraitsShowing: {type:Boolean},
        filesList: {type:Object},
        currentFilename: {type:String},
        tentativeFilename: {type:String},
        portraits: {type:Object},
        portraitKeys: {type:Array},
        lines: {type:Array}
    };
  }

  constructor() {
    super();
    this.startFresh();
    this.portraitsShowing = true;
    window.medallionAPI.getFileList().then(fileRoot => {
        fileRoot = new FileOrFolder(fileRoot);
        let convosFolder = fileRoot.child("convo");
        this.filesList = convosFolder.listOfChildPaths();
        console.log("%o",this.filesList)
        this.filesLoaded = true;
    });
  }
  loadFile(){
    let selector = this.renderRoot.querySelector("#convoSelector");
    if(selector){
        let filename = selector.value;
        window.medallionAPI.getJsonFileContents("custom/convo/" + filename).then(response => {
            this.portraits = response.portraits;
            this.portraitKeys = Object.keys(this.portraits);
            console.log("keys: %o",this.portraitKeys);
            this.lines = response.lines;
            this.currentFilename = filename;
        });
    }
  }
  startFresh(){
    this.currentFilename = null;
    this.convoLoaded = true;
    this.lines = [];
    this.portraits = {};
    this.portraitKeys = [];
  }
  updateTentativeFilename(){
    let selector = this.renderRoot.querySelector("#newFilename");
    let value = selector.value.trim();
    this.tentativeFilename = value;
  }
  togglePortraits(){
    this.portraitsShowing = !this.portraitsShowing;
  }
  render() {
    return this.filesLoaded ? 
    html`
      <div class="dialogue-main">
        <div class="dialogue-convo-select">
            Choose a dialogue file to load: <select id="convoSelector">
                ${repeat(this.filesList,(filename) => filename,(filename,idx) => {
                    return html`<option .value=${filename}>${filename}</option>`;
                })}
            </select>
            <button @click=${this.loadFile}>Load file</button> or <button @click=${this.startFresh}>Start fresh</button>
            <div class="dialogue-current-file">
                ${this.currentFilename ? html`
                    Currently editing ${this.currentFilename}.
                ` 
                : html`
                    Currently creating a new file. Enter a filename to save.
                    <input title="No extension needed- .json is automatically appended." type="text" id="newFilename" @change=${this.updateTentativeFilename}/> <button ?disabled=${(!this.tentativeFilename) || (this.tentativeFilename == '')}>Save</button>
                `}
            </div>
        </div>
        <div class="dialogue-portraits">
        ${
            this.convoLoaded ? 
                this.portraitsShowing ? 
                    html`
                        <div class="dialogue-portraits-header"><img class="toggle-icon" src="frontend/assets/visible-icon.png" @click=${this.togglePortraits}/> Portraits</div>
                        ${repeat(this.portraitKeys,(port) => port,(port,idx) => {
                            return html`
                            <div class="dialogue-portrait">
                                <div class="dialogue-portrait-label">Character ID: ${port}</div>
                                ${
                                    repeat(Object.keys(this.portraits[port].versions),(version) => version,(version,idx) => {
                                        return html`
                                        <div class="dialogue-version">
                                            <div class="dialogue-version-label">${version}:</div>
                                            <img class="dialogue-portrait-img" src=${"./game-client/" + this.portraits[port].versions[version] + ".png"}>
                                        </div>
                                        `
                                    })
                                }
                                <div class="dialogue-portrait-controls">
                                X: <input type="number" class="dialogue-portrait-number" .value=${this.portraits[port].x}/> <div title="Numbers smaller than 1 will be interpreted as percentages of the screen. Non-whole numbers greater than 1 will be rounded to the nearest integer and interpreted as pixels." class="circled-question-mark">?</div>&nbsp;&nbsp;&nbsp;&nbsp;
                                Visible: <input type="checkbox" .checked=${this.portraits[port].active}/>
                                </div>
                            </div>
                            `
                        })}
                        <div class="dialogue-new-portrait-controls">
                            <button>Add character</button>
                        </div>
                    ` :
                    html`
                    <div class="dialogue-portraits-header"><img class="toggle-icon" src="frontend/assets/hidden-icon-small.png" @click=${this.togglePortraits} /> Portraits</div>
                    `
             :  html`Loading portrait data...`
        }
        </div>
        <div class="dialogue-lines">
        ${
            this.convoLoaded ? 
                repeat(this.lines,(line) => line,(line,idx) => {
                    return html`
                        <div>${line.text ? line.text : ''}</div>
                    `
                })
             : html`Loading line data...`
        }
        </div>
      </div>
    `
    :html`Loading...`
  }
}
window.customElements.define('dialogue-page', DialoguePage);