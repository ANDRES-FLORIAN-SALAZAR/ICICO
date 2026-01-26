// Limpiador completo de datos - Elimina todo el contenido almacenado
class DataCleaner {
    constructor() {
        this.dbName = 'CasaOracionDB';
    }

    // Limpiar IndexedDB completamente
    async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);
            
            deleteRequest.onsuccess = () => {
                console.log('IndexedDB eliminado exitosamente');
                resolve(true);
            };
            
            deleteRequest.onerror = () => {
                console.error('Error eliminando IndexedDB:', deleteRequest.error);
                reject(deleteRequest.error);
            };
            
            deleteRequest.onblocked = () => {
                console.log('Eliminación de IndexedDB bloqueada, esperando...');
            };
        });
    }

    // Limpiar localStorage
    clearLocalStorage() {
        const keysToRemove = [];
        
        // Encontrar todas las claves relacionadas con Casa de Oración
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('casaOracion') || 
                key.includes('admin') || 
                key.includes('content') ||
                key.includes('galeria') ||
                key.includes('eventos') ||
                key.includes('predicas') ||
                key.includes('anuncios')
            )) {
                keysToRemove.push(key);
            }
        }
        
        // Eliminar todas las claves encontradas
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Eliminado: ${key}`);
        });
        
        return keysToRemove.length;
    }

    // Limpiar sessionStorage
    clearSessionStorage() {
        const keysToRemove = [];
        
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.includes('casaOracion') || 
                key.includes('admin') || 
                key.includes('content')
            )) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        return keysToRemove.length;
    }

    // Limpiar caché del navegador
    async clearCache() {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                const casaOracionCaches = cacheNames.filter(name => 
                    name.includes('casa-oracion') || 
                    name.includes('admin') ||
                    name.includes('contenido')
                );
                
                for (const cacheName of casaOracionCaches) {
                    await caches.delete(cacheName);
                    console.log(`Caché eliminado: ${cacheName}`);
                }
                
                return casaOracionCaches.length;
            } catch (error) {
                console.error('Error limpiando caché:', error);
                return 0;
            }
        }
        return 0;
    }

    // Limpiar todo
    async clearAll() {
        console.log('🧹 Iniciando limpieza completa de datos...');
        
        const results = {
            indexedDB: false,
            localStorage: 0,
            sessionStorage: 0,
            cache: 0
        };

        try {
            // Limpiar IndexedDB
            results.indexedDB = await this.clearIndexedDB();
            
            // Limpiar localStorage
            results.localStorage = this.clearLocalStorage();
            
            // Limpiar sessionStorage
            results.sessionStorage = this.clearSessionStorage();
            
            // Limpiar caché
            results.cache = await this.clearCache();
            
            console.log('✅ Limpieza completada:', results);
            
            // Forzar recarga de la página para limpiar cualquier dato en memoria
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            return results;
            
        } catch (error) {
            console.error('❌ Error durante la limpieza:', error);
            throw error;
        }
    }

    // Mostrar confirmación visual
    showConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirmar Limpieza Total
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <h6><i class="fas fa-info-circle me-2"></i>Esta acción eliminará permanentemente:</h6>
                            <ul class="mb-0">
                                <li>✅ Todos los anuncios</li>
                                <li>✅ Todos los eventos</li>
                                <li>✅ Todas las predicaciones</li>
                                <li>✅ Todas las imágenes y videos</li>
                                <li>✅ Todos los documentos</li>
                                <li>✅ Toda la caché y datos temporales</li>
                            </ul>
                        </div>
                        <p class="text-danger">
                            <strong>⚠️ ADVERTENCIA:</strong> Esta acción no se puede deshacer. 
                            Todo el contenido se perderá permanentemente.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times me-2"></i>Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="confirmCleanAll()">
                            <i class="fas fa-trash me-2"></i>Eliminar Todo
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Crear instancia global
window.dataCleaner = new DataCleaner();

// Función global para confirmar limpieza
window.confirmCleanAll = async function() {
    try {
        const results = await window.dataCleaner.clearAll();
        
        // Mostrar notificación de éxito
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            <h6><i class="fas fa-check-circle me-2"></i>¡Limpieza Completada!</h6>
            <p class="mb-0">Se eliminaron ${results.localStorage} elementos del localStorage y se limpió toda la base de datos.</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error en la limpieza:', error);
        alert('Error al limpiar los datos: ' + error.message);
    }
};

// Función para mostrar el diálogo de confirmación
window.showCleanDialog = function() {
    window.dataCleaner.showConfirmation();
};
