import {LitElement, html, css} from '../../lit-core.min.js';
export class MwNavItem extends LitElement {
    static styles = css`
        .nav-item{
            display:inline-block;
            margin:4px;
            margin-right:-4px;
            background-color:white;
            padding:10px;
        }
        .nav-item:hover{
            background-color:rgb(235, 246, 255);
            cursor:pointer;
        }
    `;
    static get properties() {
        return {
            text: {type:String},
            target: {type:String}
        };
    }
    constructor() {
        super();
    }
    navTo(){
        console.log("navving to " + this.target);
        const event = new CustomEvent("mw-nav-event", { bubbles:true, composed:true, detail: {view:this.target} });
        this.dispatchEvent(event);
    }

    render() {
        return html`
        <div class="nav-item" @click="${this.navTo}">
            ${this.text}
        </div>
        `;
    }
}
window.customElements.define('mw-nav-item', MwNavItem);