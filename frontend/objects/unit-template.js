export class UnitTemplateData{
    constructor(templateObj){
        if(templateObj){
            this.templateName = templateObj.templateName;
            this.mapSpriteFile = templateObj.mapSpriteFile;
            this.portraitFile = templateObj.portraitFile;
            this.classId = templateObj.classId;
            this.name = templateObj.name;
            this.maxhp = templateObj.maxhp;
            this.str = templateObj.str;
            this.skl = templateObj.skl;
            this.spd = templateObj.spd;
            this.luk = templateObj.luk;
            this.def = templateObj.def;
            this.res = templateObj.res;
            this.mov = templateObj.mov;
            this.con = templateObj.con;
            this.mhpg = templateObj.mhpg;
            this.strg = templateObj.strg;
            this.sklg = templateObj.sklg;
            this.spdg = templateObj.spdg;
            this.lukg = templateObj.lukg;
            this.defg = templateObj.defg;
            this.resg = templateObj.resg;
        }else{
            this.templateName = "inserttemplatenamehere";
            this.mapSpriteFile = "assets/img/qmark.png";
            this.portraitFile = "assets/img/qmark-portrait.png";
            this.classId = "NONE";
            this.name = "insertnamehere";
            this.maxhp = 1;
            this.str = 0;
            this.skl = 0;
            this.spd = 0;
            this.luk = 0;
            this.def = 0;
            this.res = 0;
            this.mov = 5;
            this.con = 10;
            this.mhpg = 50;
            this.strg = 20;
            this.sklg = 20;
            this.spdg = 20;
            this.lukg = 20;
            this.defg = 20;
            this.resg = 20;
        }
    }
    getCopy(){
        return new UnitTemplate(this);
    }
}