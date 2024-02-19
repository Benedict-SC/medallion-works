const fs = require("fs");
class TemplatesAPI{
    templatesPath = "./game-client/custom/units/templates.json"
    constructor(){
    }
    getTemplatesData(){
        let templatesFileBuffer = fs.readFileSync(this.templatesPath);
        return JSON.parse(templatesFileBuffer.toString());
    }
    saveTemplatesData(templatesObject){
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