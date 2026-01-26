// Limpieza de emergencia - Elimina todo inmediatamente
(function() {
    console.log('🚨 Iniciando limpieza de emergencia...');
    
    // 1. Limpiar localStorage completamente
    try {
        const keysToKeep = []; // No guardar nada
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Eliminado localStorage: ${key}`);
        });
    } catch (error) {
        console.error('Error limpiando localStorage:', error);
    }
    
    // 2. Limpiar sessionStorage completamente
    try {
        const allSessionKeys = Object.keys(sessionStorage);
        allSessionKeys.forEach(key => {
            sessionStorage.removeItem(key);
            console.log(`🗑️ Eliminado sessionStorage: ${key}`);
        });
    } catch (error) {
        console.error('Error limpiando sessionStorage:', error);
    }
    
    // 3. Eliminar IndexedDB
    try {
        const deleteRequest = indexedDB.deleteDatabase('CasaOracionDB');
        deleteRequest.onsuccess = () => {
            console.log('✅ IndexedDB eliminado');
        };
        deleteRequest.onerror = () => {
            console.error('❌ Error eliminando IndexedDB');
        };
    } catch (error) {
        console.error('Error con IndexedDB:', error);
    }
    
    // 4. Limpiar caché
    try {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                    console.log(`🗑️ Caché eliminado: ${cacheName}`);
                });
            });
        }
    } catch (error) {
        console.error('Error limpiando caché:', error);
    }
    
    // 5. Forzar recarga después de 2 segundos
    setTimeout(() => {
        console.log('🔄 Recargando página...');
        window.location.reload(true); // Forzar recarga desde servidor
    }, 2000);
    
    console.log('✨ Limpieza de emergencia completada');
})();
