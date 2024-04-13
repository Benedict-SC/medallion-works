const fs = require("fs");
class TemplatesAPI{
    templatesPath = "./game-client/custom/units/templates.json"
    weaponsPath = "./game-client/custom/weapons.json"
    loadedTemplates = null;
    loadedWeapons = null;
    constructor(){
    }
    getTemplatesData(){
        if(!this.loadedTemplates){
            let templatesFileBuffer = fs.readFileSync(this.templatesPath);
            this.loadedTemplates = JSON.parse(templatesFileBuffer.toString());
        }
        return this.loadedTemplates;
    }
    saveTemplatesData(templatesObject){
        this.loadedTemplates = templatesObject;
        let templatesData = JSON.stringify(templatesObject);
        try{
            fs.writeFileSync(this.templatesPath,templatesData);
            return "success";
        }catch(e){
            return e;
        }
    }
    getWeaponsData(){
        if(!this.loadedWeapons){
            let weaponsFileBuffer = fs.readFileSync(this.weaponsPath);
            this.loadedWeapons = JSON.parse(weaponsFileBuffer.toString());
        }
        return this.loadedWeapons;
    }
    saveWeaponsData(weaponsArray){
        this.loadedWeapons = weaponsArray;
        let weaponsData = JSON.stringify(weaponsArray);
        try{
            fs.writeFileSync(this.weaponsPath,weaponsData);
            return "success";
        }catch(e){
            return e;
        }
    }
}
module.exports = TemplatesAPI;