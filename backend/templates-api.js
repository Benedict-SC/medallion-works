const fs = require("fs");
class TemplatesAPI{
    templatesPath = "./game-client/custom/units/templates.json"
    loadedTemplates = null;
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
}
module.exports = TemplatesAPI;