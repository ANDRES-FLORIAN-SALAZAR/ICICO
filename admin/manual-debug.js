// Función de debug manual - Solo se ejecuta cuando se llama
window.manualDebugClean = function() {
    console.log('🔍 Iniciando limpieza manual con debug...');
    
    const results = {
        localStorage: [],
        sessionStorage: [],
        indexedDB: null,
        cache: [],
        errors: []
    };
    
    // Mostrar indicador de progreso
    const progressDiv = document.createElement('div');
    progressDiv.id = 'debugProgress';
    progressDiv.className = 'position-fixed top-0 start-0 w-100 p-3';
    progressDiv.style.zIndex = '9999';
    progressDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    progressDiv.style.color = 'white';
    progressDiv.innerHTML = `
        <div class="container">
            <h5><i class="fas fa-bug me-2"></i>Debug en progreso...</h5>
            <div id="debugLog"></div>
        </div>
    `;
    document.body.appendChild(progressDiv);
    
    function log(message) {
        console.log(message);
        document.getElementById('debugLog').innerHTML += `<small>${message}</small><br>`;
    }
    
    // 1. Limpiar localStorage con detalles
    log('📊 Analizando localStorage...');
    try {
        const allKeys = Object.keys(localStorage);
        log(`📊 Encontrados ${allKeys.length} elementos en localStorage`);
        
        allKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                log(`🗑️ Eliminando: ${key} (${value?.length || 0} chars)`);
                localStorage.removeItem(key);
                results.localStorage.push({key, size: value?.length || 0});
            } catch (error) {
                log(`❌ Error eliminando ${key}: ${error.message}`);
                results.errors.push({type: 'localStorage', key, error: error.message});
            }
        });
        log('✅ localStorage limpiado');
    } catch (error) {
        log(`❌ Error general en localStorage: ${error.message}`);
        results.errors.push({type: 'localStorage', error: error.message});
    }
    
    // 2. Limpiar sessionStorage
    log('📊 Analizando sessionStorage...');
    try {
        const allSessionKeys = Object.keys(sessionStorage);
        log(`📊 Encontrados ${allSessionKeys.length} elementos en sessionStorage`);
        
        allSessionKeys.forEach(key => {
            try {
                const value = sessionStorage.getItem(key);
                log(`🗑️ Eliminando: ${key} (${value?.length || 0} chars)`);
                sessionStorage.removeItem(key);
                results.sessionStorage.push({key, size: value?.length || 0});
            } catch (error) {
                log(`❌ Error eliminando ${key}: ${error.message}`);
                results.errors.push({type: 'sessionStorage', key, error: error.message});
            }
        });
        log('✅ sessionStorage limpiado');
    } catch (error) {
        log(`❌ Error general en sessionStorage: ${error.message}`);
        results.errors.push({type: 'sessionStorage', error: error.message});
    }
    
    // 3. Eliminar IndexedDB
    log('🗑️ Eliminando IndexedDB...');
    try {
        const deleteRequest = indexedDB.deleteDatabase('CasaOracionDB');
        
        deleteRequest.onsuccess = () => {
            log('✅ IndexedDB eliminado exitosamente');
            results.indexedDB = 'success';
            finishDebug();
        };
        
        deleteRequest.onerror = (event) => {
            log(`❌ Error eliminando IndexedDB: ${event.target.error.message}`);
            results.indexedDB = event.target.error.message;
            results.errors.push({type: 'indexedDB', error: event.target.error.message});
            finishDebug();
        };
        
        deleteRequest.onblocked = () => {
            log('⏳ IndexedDB bloqueado, esperando...');
            results.indexedDB = 'blocked';
        };
        
    } catch (error) {
        log(`❌ Error con IndexedDB: ${error.message}`);
        results.indexedDB = error.message;
        results.errors.push({type: 'indexedDB', error: error.message});
        finishDebug();
    }
    
    // 4. Limpiar caché
    log('📊 Analizando caché...');
    try {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                log(`📊 Encontradas ${cacheNames.length} cachés`);
                
                Promise.all(cacheNames.map(cacheName => {
                    return caches.delete(cacheName).then(deleted => {
                        log(`${deleted ? '✅' : '❌'} Caché ${cacheName}: ${deleted ? 'eliminado' : 'no eliminado'}`);
                        results.cache.push({name: cacheName, deleted});
                        return deleted;
                    });
                })).then(() => {
                    log('✅ Caché limpiado');
                    checkIfFinished();
                });
            }).catch(error => {
                log(`❌ Error obteniendo cachés: ${error.message}`);
                results.errors.push({type: 'cache', error: error.message});
                checkIfFinished();
            });
        } else {
            log('ℹ️ Cache API no disponible');
            results.cache.push({info: 'Cache API no disponible'});
            checkIfFinished();
        }
    } catch (error) {
        log(`❌ Error general en caché: ${error.message}`);
        results.errors.push({type: 'cache', error: error.message});
        checkIfFinished();
    }
    
    let indexedDBFinished = false;
    let cacheFinished = false;
    
    function checkIfFinished() {
        cacheFinished = true;
        if (indexedDBFinished) {
            finishDebug();
        }
    }
    
    function finishDebug() {
        indexedDBFinished = true;
        if (cacheFinished) {
            showResults();
        }
    }
    
    function showResults() {
        log('📋 Generando resultados...');
        
        // Eliminar indicador de progreso
        const progressDiv = document.getElementById('debugProgress');
        if (progressDiv) {
            progressDiv.remove();
        }
        
        console.log('📋 Resultados completos:', results);
        
        // Crear modal con resultados
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '9999';
        
        const hasErrors = results.errors.length > 0;
        const modalClass = hasErrors ? 'modal-content bg-danger text-white' : 'modal-content bg-success text-white';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="${modalClass}">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas ${hasErrors ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2"></i>
                            Resultados de Debug - ${hasErrors ? 'Con Errores' : 'Exitoso'}
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <h6>📊 Estadísticas:</h6>
                                <ul class="list-unstyled">
                                    <li><strong>LocalStorage:</strong> ${results.localStorage.length} eliminados</li>
                                    <li><strong>SessionStorage:</strong> ${results.sessionStorage.length} eliminados</li>
                                    <li><strong>IndexedDB:</strong> ${results.indexedDB}</li>
                                    <li><strong>Caché:</strong> ${results.cache.length} procesados</li>
                                    <li><strong>Errores:</strong> ${results.errors.length}</li>
                                </ul>
                            </div>
                            <div class="col-md-8">
                                <h6>${hasErrors ? '❌ Errores Detectados:' : '✅ Todo Limpio:'}</h6>
                                <div style="max-height: 200px; overflow-y: auto;">
                                    ${hasErrors ? 
                                        results.errors.map(err => `<small><code>${err.type}:</code> ${err.error}</small><br>`).join('') :
                                        '<small>Todos los datos fueron eliminados correctamente</small>'
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <h6>🔍 Datos Completos:</h6>
                                <textarea class="form-control" rows="15" readonly>${JSON.stringify(results, null, 2)}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-warning" onclick="location.reload()">
                            🔄 Recargar Página
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        console.log(`
🧹 LIMPIEZA MANUAL COMPLETADA
=============================
LocalStorage: ${results.localStorage.length} eliminados
SessionStorage: ${results.sessionStorage.length} eliminados  
IndexedDB: ${results.indexedDB}
Caché: ${results.cache.length} procesados
Errores: ${results.errors.length}

📋 Revisa el modal para detalles completos
🔄 Haz clic en "Recargar Página" cuando termines
        `);
    }
};
