const fs = require("fs");
class SpritesAPI{
    bankPrefix = "./game-client/custom/img/";
    imgFilenames = [];
    constructor(){
        const bankFiles = fs.readdirSync(this.bankPrefix,{withFileTypes:true});
        bankFiles.forEach(f => {
            this.populateFilePaths(f);
        });
        console.log(this.imgFilenames);
    }
    populateFilePaths(dirent,prefix=""){
        if(dirent.isFile()){
            console.log("img file found: " + prefix + dirent.name);
            this.imgFilenames.push(prefix + dirent.name);
        }else if(dirent.isDirectory()){
            console.log("img folder found: " + prefix + dirent.name);
            let newprefix = prefix + dirent.name + "/";
            const imgFiles = fs.readdirSync(this.bankPrefix + newprefix,{withFileTypes:true});
            imgFiles.forEach(f => {
                this.populateFilePaths(f,newprefix);
            });
        }
    }
    getAllSpriteData(){
        return this.imgFilenames;
    }
    deleteSprite(path){
    }
    uploadSprite(file,location,name){

    }
}
module.exports = SpritesAPI;