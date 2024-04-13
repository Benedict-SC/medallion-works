import {LitElement, html, css, repeat} from '../../lit-all.min.js';

export class WeaponsPage extends LitElement {
  static styles = css`
    .navbar {
      background-color:rgb(240, 240, 240);
    }
  `;
  static get properties() {
    return {
      weaponsList: {type:Array},
      someModified: {type:Boolean},
      saving: {type:Boolean}
    };
  }

  constructor() {
    super();
    window.medallionAPI.getWeaponsData().then(data => {
      this.weaponsList = data;
    });
  }
  saveList(){
    let gs = window.gs;
    gs.weapons = this.weaponsList;
    this.saving = true;
    window.medallionAPI.saveWeaponsData(this.weaponsList).then(response => {
      this.saving = false;
      this.someModified = false;
    })
  }
  giveUniqueId(weapon){
    let orginalId = weapon.id;
    let foundMatch = this.weaponsList.find(x => x.id == weapon.id);
    let counter = 2;
    while(foundMatch){
      weapon.id = orginalId + "-" + counter;
      counter++;
      foundMatch = this.weaponsList.find(x => {
        return x.id == weapon.id;
      });
    } 
  }
  render() {
    return this.weaponsList ? 
    html`
      <div class="wep-window">
        ${repeat(this.weaponsList,(wep) => wep, (wep,idx) => {
            return html`
                <div class="wep-box">
                    ${wep.name}
                </div>
            `
        })}
      </div>
    `
    :html`Loading...`
  }
}
window.customElements.define('weapons-page', WeaponsPage);