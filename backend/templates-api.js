const fs = require("fs");
class TemplatesAPI{
    templatesPath = "./game-client/custom/units/templates.json"
    itemsPath = "./game-client/custom/items.json"
    loadedTemplates = null;
    loadedItems = null;
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
    getItemsData(){
        if(!this.loadedItems){
            let itemsFileBuffer = fs.readFileSync(this.itemsPath);
            this.loadedItems = JSON.parse(itemsFileBuffer.toString());
        }
        return this.loadedItems;
    }
    saveItemsData(itemsArray){
        this.loadedItems = itemsArray;
        let itemsData = JSON.stringify(itemsArray);
        try{
            fs.writeFileSync(this.itemsPath,itemsData);
            return "success";
        }catch(e){
            return e;
        }
    }
}
module.exports = TemplatesAPI;