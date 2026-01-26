// Limpieza con debug - Muestra errores sin recargar
(function() {
    console.log('🔍 Iniciando limpieza con debug...');
    
    const results = {
        localStorage: [],
        sessionStorage: [],
        indexedDB: null,
        cache: [],
        errors: []
    };
    
    // 1. Limpiar localStorage con detalles
    try {
        const allKeys = Object.keys(localStorage);
        console.log(`📊 Encontrados ${allKeys.length} elementos en localStorage:`, allKeys);
        
        allKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                console.log(`🗑️ Eliminando localStorage: ${key} (${value?.length || 0} chars)`);
                localStorage.removeItem(key);
                results.localStorage.push({key, size: value?.length || 0});
            } catch (error) {
                console.error(`❌ Error eliminando ${key}:`, error);
                results.errors.push({type: 'localStorage', key, error: error.message});
            }
        });
    } catch (error) {
        console.error('❌ Error general en localStorage:', error);
        results.errors.push({type: 'localStorage', error: error.message});
    }
    
    // 2. Limpiar sessionStorage con detalles
    try {
        const allSessionKeys = Object.keys(sessionStorage);
        console.log(`📊 Encontrados ${allSessionKeys.length} elementos en sessionStorage:`, allSessionKeys);
        
        allSessionKeys.forEach(key => {
            try {
                const value = sessionStorage.getItem(key);
                console.log(`🗑️ Eliminando sessionStorage: ${key} (${value?.length || 0} chars)`);
                sessionStorage.removeItem(key);
                results.sessionStorage.push({key, size: value?.length || 0});
            } catch (error) {
                console.error(`❌ Error eliminando ${key}:`, error);
                results.errors.push({type: 'sessionStorage', key, error: error.message});
            }
        });
    } catch (error) {
        console.error('❌ Error general en sessionStorage:', error);
        results.errors.push({type: 'sessionStorage', error: error.message});
    }
    
    // 3. Eliminar IndexedDB con detalles
    try {
        console.log('🗑️ Eliminando IndexedDB: CasaOracionDB');
        const deleteRequest = indexedDB.deleteDatabase('CasaOracionDB');
        
        deleteRequest.onsuccess = () => {
            console.log('✅ IndexedDB eliminado exitosamente');
            results.indexedDB = 'success';
            showResults();
        };
        
        deleteRequest.onerror = (event) => {
            console.error('❌ Error eliminando IndexedDB:', event.target.error);
            results.indexedDB = event.target.error.message;
            results.errors.push({type: 'indexedDB', error: event.target.error.message});
            showResults();
        };
        
        deleteRequest.onblocked = () => {
            console.log('⏳ Eliminación de IndexedDB bloqueada, esperando...');
            results.indexedDB = 'blocked';
        };
        
    } catch (error) {
        console.error('❌ Error con IndexedDB:', error);
        results.indexedDB = error.message;
        results.errors.push({type: 'indexedDB', error: error.message});
        showResults();
    }
    
    // 4. Limpiar caché con detalles
    try {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                console.log(`📊 Encontradas ${cacheNames.length} cachés:`, cacheNames);
                
                Promise.all(cacheNames.map(cacheName => {
                    return caches.delete(cacheName).then(deleted => {
                        console.log(`${deleted ? '✅' : '❌'} Caché ${cacheName}: ${deleted ? 'eliminado' : 'no eliminado'}`);
                        results.cache.push({name: cacheName, deleted});
                        return deleted;
                    });
                })).then(() => {
                    console.log('✅ Limpieza de caché completada');
                    if (results.indexedDB !== null) {
                        showResults();
                    }
                });
            }).catch(error => {
                console.error('❌ Error obteniendo cachés:', error);
                results.errors.push({type: 'cache', error: error.message});
                showResults();
            });
        } else {
            console.log('ℹ️ Cache API no disponible');
            results.cache.push({info: 'Cache API no disponible'});
            if (results.indexedDB !== null) {
                showResults();
            }
        }
    } catch (error) {
        console.error('❌ Error general en caché:', error);
        results.errors.push({type: 'cache', error: error.message});
        showResults();
    }
    
    // Función para mostrar resultados en pantalla
    function showResults() {
        console.log('📋 Resultados de la limpieza:', results);
        
        // Crear modal con resultados
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '9999';
        
        const hasErrors = results.errors.length > 0;
        const modalClass = hasErrors ? 'modal-content bg-danger text-white' : 'modal-content bg-success text-white';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="${modalClass}">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas ${hasErrors ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2"></i>
                            Resultados de Limpieza
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>📊 Estadísticas:</h6>
                                <ul>
                                    <li>LocalStorage: ${results.localStorage.length} elementos eliminados</li>
                                    <li>SessionStorage: ${results.sessionStorage.length} elementos eliminados</li>
                                    <li>IndexedDB: ${results.indexedDB}</li>
                                    <li>Caché: ${results.cache.length} elementos procesados</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6>${hasErrors ? '❌ Errores:' : '✅ Éxito:'}</h6>
                                ${hasErrors ? 
                                    results.errors.map(err => `<small>${err.type}: ${err.error}</small><br>`).join('') :
                                    '<small>Todos los datos fueron eliminados correctamente</small>'
                                }
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <h6>🔍 Detalles:</h6>
                            <textarea class="form-control" rows="10" readonly>${JSON.stringify(results, null, 2)}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" onclick="this.closest('.modal').remove()">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-warning" onclick="location.reload()">
                            Recargar Página
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Mostrar resumen en consola
        console.log(`
🧹 LIMPIEZA COMPLETADA
==================
LocalStorage: ${results.localStorage.length} eliminados
SessionStorage: ${results.sessionStorage.length} eliminados  
IndexedDB: ${results.indexedDB}
Caché: ${results.cache.length} procesados
Errores: ${results.errors.length}

📋 Para recargar la página, haz clic en el botón "Recargar Página" en el modal
        `);
    }
    
    console.log('🔍 Limpieza con debug iniciada. Espera resultados...');
})();
