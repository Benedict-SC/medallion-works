export class FileOrFolder{
    constructor(loadedFileOrFolderObject){
        this.name = loadedFileOrFolderObject.name;
        this.prefix = loadedFileOrFolderObject.prefix;
        this.parent = loadedFileOrFolderObject.parent;
        this.folderContents = loadedFileOrFolderObject.folderContents;
        if(this.folderContents){
            for(let i = 0; i < this.folderContents.length; i++){
                this.folderContents[i] = new FileOrFolder(this.folderContents[i]);
            }
        }
    }
    fullPath(){
        return this.prefix + "/" + this.name + (this.folderContents ? "/" : "");
    }
    child(name){
        if(!this.folderContents){
            return null;
        }
        let childFound = null;
        this.folderContents.forEach(x => {if(x.name == name){childFound = x}});
        return childFound;
    }
    listOfChildPaths(currentPath){
        if(!currentPath){
            currentPath = "";
        }
        let list = [];
        for(let i = 0; i < this.folderContents.length; i++){
            let forf = this.folderContents[i];
            if(forf.folderContents){
                let sublist = forf.listOfChildPaths(currentPath + forf.name + "/");
                list = list.concat(sublist);
            }else{
                list.push(currentPath + forf.name);
            }
        }
        return list;
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