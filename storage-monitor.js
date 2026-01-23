// Script para actualizar automáticamente la barra de almacenamiento
// Este archivo se carga después de script.js

// Función para monitorear cambios en el almacenamiento
function monitorStorageChanges() {
    // Monitorear localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.call(this, key, value);
        
        // Si se guardó contenido de la iglesia, actualizar la barra
        if (key === 'churchContent') {
            setTimeout(() => {
                if (typeof updateStorageIndicator === 'function') {
                    updateStorageIndicator();
                }
            }, 100);
        }
    };
    
    // Monitorear IndexedDB si está disponible
    if (window.hybridStorage && window.hybridStorage.db) {
        // Interceptamos las operaciones de guardado
        const originalSaveFile = window.hybridStorage.saveFileToIndexedDB;
        window.hybridStorage.saveFileToIndexedDB = async function(storeName, fileData) {
            const result = await originalSaveFile.call(this, storeName, fileData);
            
            // Actualizar la barra después de guardar
            setTimeout(() => {
                if (typeof updateStorageIndicator === 'function') {
                    updateStorageIndicator();
                }
            }, 100);
            
            return result;
        };
    }
    
    console.log('Monitoreo de almacenamiento activado');
}

// Iniciar monitoreo cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorStorageChanges);
} else {
    monitorStorageChanges();
}

// También actualizar la barra cada 5 segundos por si hay cambios externos
setInterval(() => {
    if (typeof updateStorageIndicator === 'function') {
        updateStorageIndicator();
    }
}, 5000);
