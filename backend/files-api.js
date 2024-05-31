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
class FilesAPI{
    rootPrefix = "./game-client/";
    rootName = "custom";
    root = null;
    bankPrefix = "./game-client/custom/";
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
    getAllFileData(fresh){
        if(fresh){
            this.loadFileData();
        }
        return this.root;
    }
    deleteFile(path){
        fs.unlinkSync(path);
        this.loadFileData();
    }
    uploadFile(file,location,name){
        console.log(file + " saves to " + location + " with name " + name);
        fs.copyFileSync(file,location+name);
        this.loadFileData();
    }
    createFolder(location,name){
        fs.mkdirSync(location+name);
        this.loadFileData();
    }
    loadJsonFile(filename){
        let fileBuffer = fs.readFileSync("./game-client/" + filename);
        return JSON.parse(fileBuffer.toString());
    }
}
module.exports = FilesAPI;