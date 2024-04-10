import {LitElement, html, css} from '../../lit-core.min.js';
export class ResizableProp extends LitElement {
    static styles = css`
        .all-prop-styles{
            height:100%;
            width:100%;
            position:relative;
            background-size:100% 100%;
        }
        .grab-handle{
            position:absolute;
            height:8px;
            width:8px;
            border:1px solid black;
            background-color:white;
        }
    `;
    static get properties() {
        return {
            prop: {type:Object},
            activeHandleId: {type:String},
            originalSizes: {type:Object},
            startX: {type:Number},
            staryY: {type:Number},
            aborter: {type:Object}
        };
    }
    constructor() {
        super();
        this.activeHandleId = null;
        this.aborter = new AbortController();
        this.minimumSize = 10;
    }
    mousedown(event){
        if(!this.activeHandleId){
            let element = event.target;
            this.activeHandleId = element.id;
            this.startX = event.pageX;
            this.startY = event.pageY;
            this.originalSizes = {x:this.prop.x,y:this.prop.y,w:this.prop.w,h:this.prop.h};
            let self = this;
            this.aborter = new AbortController();
            window.addEventListener("pointermove",(event) => {this.handleDrag(event,self)}, {signal: this.aborter.signal});
            window.addEventListener("mouseup",(event) => {this.finishDrag(event,self)},{once:true});
        }
    }
    mouseup(event){
        this.finishDrag(event);
    }
    getSizes(handleId,growX,growY){
        let mover = handleId.indexOf("root") >= 0
        if(mover){
            return {mx:growX,my:growY,gx:0,gy:0};
        }else{
            let left = handleId.indexOf("left") >= 0;
            let top = handleId.indexOf("top") >= 0;
            let bottom = handleId.indexOf("bottom") >= 0;
            let right = handleId.indexOf("right") >= 0;
            let movX = 0;
            let movY = 0;
            if(left){
                movX = growX;
                growX = -growX;
            }
            if(top){
                movY = growY;
                growY = -growY;
            }
            if(this.originalSizes.w + growX < this.minimumSize){
                let overshoot = this.originalSizes.w + growX;
                let diff = this.minimumSize - overshoot;
                growX += diff;
                movX -= diff;
            }
            if(this.originalSizes.h + growY < this.minimumSize){
                let overshoot = this.originalSizes.h + growY;
                let diff = this.minimumSize - overshoot;
                growY += diff;
                movY -= diff;
            }
            if(right){
                movX = 0;
            }
            if(bottom){
                movY = 0;
            }
            if(!left && !right){
                return {mx:0,my:movY,gx:0,gy:growY};
            }else if(!top && !bottom){
                return {mx:movX,my:0,gx:growX,gy:0};
            }else{
                return {mx:movX,my:movY,gx:growX,gy:growY};
            }
        }
    }
    finishDrag(event,self){
        let dx = event.pageX - self.startX;
        let dy = event.pageY - self.startY;
        let newSizes = self.getSizes(self.activeHandleId,dx,dy);
        self.prop.x = self.originalSizes.x + newSizes.mx;
        self.prop.y = self.originalSizes.y + newSizes.my;
        self.prop.w = self.originalSizes.w + newSizes.gx;
        self.prop.h = self.originalSizes.h + newSizes.gy;
        self.activeHandleId = null;
        self.aborter.abort();
        self.refresh();
    }
    handleDrag(event,self){
        if(self.activeHandleId){
            let dx = event.pageX - self.startX;
            let dy = event.pageY - self.startY;
            let newSizes = self.getSizes(self.activeHandleId,dx,dy);
            self.prop.x = self.originalSizes.x + newSizes.mx;
            self.prop.y = self.originalSizes.y + newSizes.my;
            self.prop.w = self.originalSizes.w + newSizes.gx;
            self.prop.h = self.originalSizes.h + newSizes.gy;
            self.refresh();
        }
    }
    refresh(){
        const event = new CustomEvent("prop-refreshed", { bubbles:true, composed:true });
        this.dispatchEvent(event);
        this.requestUpdate();
    }

    render() {
        return html`
        <div class="all-prop-styles" id="root" style=${"background-image:url(\"./game-client/" + this.prop.img + "\")"} @mousedown=${this.mousedown}>
            <div class="grab-handle" id="top-left" style="top:-4px;left:-4px;" @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="bottom-left" style="bottom:-4px;left:-4px;" @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="top-right" style="top:-4px;right:-4px;" @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="bottom-right" style="bottom:-4px;right:-4px;" @mousedown=${this.mousedown}></div>
            
            <div class="grab-handle" id="top" style="top:-4px;left:50%;transform:translate(-50%,0);"  @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="bottom" style="bottom:-4px;left:50%;transform:translate(-50%,0);" @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="left" style="top:50%;left:-4px;transform:translate(0,-50%);" @mousedown=${this.mousedown}></div>
            <div class="grab-handle" id="right" style="top:50%;right:-4px;transform:translate(0,-50%);" @mousedown=${this.mousedown}></div>
        </div>
        `;
    }
}
window.customElements.define('resizable-prop', ResizableProp);