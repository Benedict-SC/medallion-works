const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('medallionAPI', {
  getMapsList: () => ipcRenderer.invoke('maps-wants-maps-list'),
  getMapData: (filename) => ipcRenderer.invoke('maps-wants-maps-data',filename),
  saveMapData: (data,filename) => ipcRenderer.invoke('maps-saving-map-data',data,filename),
  getTerrainData: (filename) => ipcRenderer.invoke('maps-wants-terrain-data',filename),
  getTemplatesData: (filename) => ipcRenderer.invoke('maps-wants-templates-data',filename),
  saveTemplatesData: (data) => ipcRenderer.invoke('units-saving-templates-data',data),
  getSpriteGallery: () => ipcRenderer.invoke('sprites-wants-file-data'),
  uploadSprite: (path,location,filename) => ipcRenderer.invoke('sprites-saving-sprite',path,location,filename),
  deleteSprite: (path) => ipcRenderer.invoke('sprites-deleting-sprite',path),
  getWeaponsData: () => ipcRenderer.invoke('something-wants-weapon-data'),
  saveWeaponsData: (data) => ipcRenderer.invoke('weapons-saving-weapon-data',data)
});