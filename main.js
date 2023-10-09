const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const MapsAPI = require("./backend/maps-api");
const maps = new MapsAPI();
async function retrieveMapData(filename){
    return maps.getMapData(filename);
}
async function saveMapData(data,filename){
    return maps.saveMapData(data,filename);
}
async function retrieveTerrainData(){
    return maps.getTerrainData();
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
    ipcMain.handle("maps-wants-maps-data",async (event,filename) => {
        return await retrieveMapData(filename);
    });
    ipcMain.handle("maps-saving-map-data",async (event,data,filename) => {
        return await saveMapData(data,filename);
    });
    ipcMain.handle("maps-wants-terrain-data",async (event) => {
        return await retrieveTerrainData();
    });
    createWindow();
    BrowserWindow.getAllWindows()[0].openDevTools();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){ app.quit(); }
});