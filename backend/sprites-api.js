const fs = require("fs");
class FileOrFolder{
    name = "";
    prefix = "";
    folderContents = null;
    constructor(name,prefix){
        this.name = name;
        this.prefix = prefix
    }
    fullPath(){
        return this.prefix + "/" + this.name + (this.folderContents ? "/" : "");
    }
    markAsFolder(){
        if(!this.folderContents){
            this.folderContents = [];
        }
    }
    add(forf){
        this.markAsFolder();
        forf.parent = this;
        this.folderContents.push(forf);
        this.sort();
    }
    sort(){
        if(this.folderContents){
            this.folderContents.sort((a,b) => {
                if(a.folderContents && !b.folderContents){
                    return -1;
                }else if(b.folderContents && !a.folderContents){
                    return 1;
                }else{
                    if(a < b){
                        return 1;
                    }else if(b < a){
                        return -1;
                    }else{
                        return 0;
                    }
                }
            });
        }
    }
}
class SpritesAPI{
    rootPrefix = "./game-client/custom/";
    rootName = "img";
    root = null;
    bankPrefix = "./game-client/custom/img/";
    constructor(){
        this.loadFileData();
    }
    loadFileData(){
        this.root = new FileOrFolder(this.rootName,this.rootPrefix);
        const bankFiles = fs.readdirSync(this.bankPrefix,{withFileTypes:true});
        bankFiles.forEach(f => {
            this.populateFileData(f,this.root);
        });
    }
    /*populateFilePaths(dirent,prefix=""){
        if(dirent.isFile()){
            //console.log("img file found: " + prefix + dirent.name);
            this.imgFilenames.push(prefix + dirent.name);
        }else if(dirent.isDirectory()){
            //console.log("img folder found: " + prefix + dirent.name);
            let newprefix = prefix + dirent.name + "/";
            const imgFiles = fs.readdirSync(this.bankPrefix + newprefix,{withFileTypes:true});
            imgFiles.forEach(f => {
                this.populateFilePaths(f,newprefix);
            });
        }
    }*/
    populateFileData(dirent,forf){
        let newFile = new FileOrFolder(dirent.name,forf.prefix + forf.name + "/");
        if(dirent.isFile()){
            //we're done
        }else if(dirent.isDirectory()){
            newFile.markAsFolder();
            const imgFiles = fs.readdirSync(newFile.prefix + newFile.name + "/",{withFileTypes:true});
            imgFiles.forEach(f => {
                this.populateFileData(f,newFile);
            });
        }
        forf.add(newFile);
    }
    getAllSpriteData(fresh){
        if(fresh){
            this.loadFileData();
        }
        return this.root;
    }
    deleteSprite(path){
        fs.unlinkSync(path);
        this.loadFileData();
    }
    uploadSprite(file,location,name){
        console.log(file + " saves to " + location + " with name " + name);
        fs.copyFileSync(file,location+name);
        this.loadFileData();
    }
    createFolder(location,name){
        fs.mkdirSync(location+name);
        this.loadFileData();
    }
}
module.exports = SpritesAPI;