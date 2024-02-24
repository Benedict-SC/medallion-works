const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const MapsAPI = require("./backend/maps-api");
const TemplatesAPI = require('./backend/templates-api');
const maps = new MapsAPI();
const templates = new TemplatesAPI();
async function retrieveMapData(filename){
    return maps.getMapData(filename);
}
async function getMapsList(){
    return maps.mapFilenames;
}
async function saveMapData(data,filename){
    return maps.saveMapData(data,filename);
}
async function retrieveTerrainData(){
    return maps.getTerrainData();
}
async function retrieveTemplatesData(){
    return templates.getTemplatesData();
}
const createWindow = function(){
    const win = new BrowserWindow({
        width:1400,height:720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon:"./icon.ico"
    });
    win.loadFile("index.html");
}
app.whenReady().then(() => {
    ipcMain.handle("maps-wants-maps-list",async (event) => {
        return await getMapsList();
    });
    ipcMain.handle("maps-wants-maps-data",async (event,filename) => {
        return await retrieveMapData(filename);
    });
    ipcMain.handle("maps-saving-map-data",async (event,data,filename) => {
        return await saveMapData(data,filename);
    });
    ipcMain.handle("maps-wants-terrain-data",async (event) => {
        return await retrieveTerrainData();
    });
    ipcMain.handle("maps-wants-templates-data",async (event) => {
        return await retrieveTemplatesData();
    });
    createWindow();
    BrowserWindow.getAllWindows()[0].openDevTools();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){ app.quit(); }
});