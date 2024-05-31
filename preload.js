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
  createFolder: (location,foldername) => ipcRenderer.invoke('something-creating-folder',location,foldername),
  getFileList: () => ipcRenderer.invoke('something-wants-file-data'),
  getJsonFileContents: (path) => ipcRenderer.invoke('something-wants-file-json',path),
  uploadFile: (path,location,filename) => ipcRenderer.invoke('something-saving-file',path,location,filename),
  deleteFile: (path) => ipcRenderer.invoke('something-deleting-file',path),
  getItemsData: () => ipcRenderer.invoke('something-wants-item-data'),
  saveItemsData: (data) => ipcRenderer.invoke('items-saving-item-data',data)
});