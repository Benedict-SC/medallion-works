const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('medallionAPI', {
  getMapsList: () => ipcRenderer.invoke('maps-wants-maps-list'),
  getMapData: (filename) => ipcRenderer.invoke('maps-wants-maps-data',filename),
  saveMapData: (data,filename) => ipcRenderer.invoke('maps-saving-map-data',data,filename),
  getTerrainData: (filename) => ipcRenderer.invoke('maps-wants-terrain-data',filename),
  getTemplatesData: (filename) => ipcRenderer.invoke('maps-wants-templates-data',filename)
});