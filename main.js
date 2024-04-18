const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const MapsAPI = require("./backend/maps-api");
const TemplatesAPI = require('./backend/templates-api');
const SpritesAPI = require('./backend/sprites-api');
const maps = new MapsAPI();
const templates = new TemplatesAPI();
const sprites = new SpritesAPI();
const createWindow = function(){
    const win = new BrowserWindow({
        width:1400,height:800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon:"./icon.ico"
    });
    win.loadFile("index.html");
}
app.whenReady().then(() => {
    ipcMain.handle("maps-wants-maps-list",async (event) => {
        return maps.mapFilenames;
    });
    ipcMain.handle("maps-wants-maps-data",async (event,filename) => {
        return await maps.getMapData(filename);
    });
    ipcMain.handle("maps-saving-map-data",async (event,data,filename) => {
        return await maps.saveMapData(data,filename);
    });
    ipcMain.handle("maps-wants-terrain-data",async (event) => {
        return await maps.getTerrainData();
    });
    ipcMain.handle("maps-wants-templates-data",async (event) => {
        return await templates.getTemplatesData();
    });
    ipcMain.handle("units-saving-templates-data",async (event,data) => {
        return await templates.saveTemplatesData(data);
    });
    ipcMain.handle("sprites-wants-file-data",async (event) => {
        return sprites.getAllSpriteData();
    });
    ipcMain.handle("sprites-saving-sprite",async (event,path,location,filename) => {
        return sprites.uploadSprite(path,location,filename);
    });
    ipcMain.handle("sprites-deleting-sprite",async (event,path) => {
        return sprites.deleteSprite(path);
    });
    ipcMain.handle("something-wants-item-data",async (event) =>{
        return await templates.getItemsData();
    });
    ipcMain.handle("items-saving-item-data",async (event,data) =>{
        return await templates.saveItemsData(data);
    });
    createWindow();
    BrowserWindow.getAllWindows()[0].openDevTools();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){ app.quit(); }
});