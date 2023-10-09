const fs = require("fs");
class MapsAPI{
    mapsFolderPath = "./game-client/custom/maps/"
    nativeTerrainPath = "./game-client/defaults/terrain.json"
    customTerrainPath = "./game-client/custom/terrain.json"
    mapFilenames = [];
    constructor(){
        const mapsFiles = fs.readdirSync(this.mapsFolderPath,{withFileTypes:true});
        mapsFiles.forEach(f => {
            this.populateMapPaths(f);
        });
    }
    getMapData(mapPath){
        let mapFileBuffer = fs.readFileSync(this.mapsFolderPath + mapPath);
        return JSON.parse(mapFileBuffer.toString());
    }
    saveMapData(mapObject,mapPath){
        let mapData = JSON.stringify(mapObject);
        try{
            fs.writeFileSync(this.mapsFolderPath + mapPath,mapData);
            return "success";
        }catch(e){
            return e;
        }
    }
    getTerrainData(){
        let terrainFile = fs.readFileSync(this.nativeTerrainPath);
        let nativeTerrain = JSON.parse(terrainFile);
        let customTerrainFile = fs.readFileSync(this.customTerrainPath);
        let customTerrain = JSON.parse(customTerrainFile);
        return {native:nativeTerrain,custom:customTerrain};
    }
    populateMapPaths(dirent,prefix=""){
        if(dirent.isFile()){
            console.log("file found: " + prefix + dirent.name);
            this.mapFilenames.push(prefix + dirent.name);
        }else if(dirent.isDirectory()){
            console.log("folder found: " + prefix + dirent.name);
            let newprefix = prefix + dirent.name + "/";
            const mapsFiles = fs.readdirSync(this.mapsFolderPath + newprefix,{withFileTypes:true});
            mapsFiles.forEach(f => {
                this.populateMapPaths(f,newprefix);
            });
        }
    }
}
module.exports = MapsAPI;