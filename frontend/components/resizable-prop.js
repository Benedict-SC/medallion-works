import {LitElement, html, css} from '../../lit-core.min.js';
export class ResizableProp extends LitElement {
    static styles = css`
        .all-prop-styles{
            height:100%;
            width:100%;
        }
    `;
    static get properties() {
        return {
            prop: {type:Object}
        };
    }
    constructor() {
        super();
    }

    render() {
        return html`
        <div class="all-prop-styles" style=${"background-image:url(\"./game-client/" + this.prop.img + "\")"}>
            
        </div>
        `;
    }
}
window.customElements.define('resizable-prop', ResizableProp);