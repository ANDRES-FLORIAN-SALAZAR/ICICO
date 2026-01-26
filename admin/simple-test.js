// Test ultra simple - Solo para ver si se ejecuta
window.simpleTest = function() {
    alert('🔍 TEST: El script se está ejecutando');
    
    console.log('🔍 INICIO DEL TEST SIMPLE');
    
    // Mostrar todos los elementos de localStorage
    console.log('📊 localStorage keys:', Object.keys(localStorage));
    
    // Intentar eliminar uno por uno
    const keys = Object.keys(localStorage);
    console.log(`📊 Se encontraron ${keys.length} elementos en localStorage`);
    
    keys.forEach((key, index) => {
        try {
            console.log(`🗑️ Eliminando ${index + 1}/${keys.length}: ${key}`);
            localStorage.removeItem(key);
            console.log(`✅ Eliminado: ${key}`);
        } catch (error) {
            console.error(`❌ Error eliminando ${key}:`, error);
        }
    });
    
    // Verificar que está vacío
    const remainingKeys = Object.keys(localStorage);
    console.log(`📊 Después de limpiar: ${remainingKeys.length} elementos restantes`);
    
    alert(`🔍 RESULTADO: Se encontraron ${keys.length} elementos y quedan ${remainingKeys.length}. Revisa la consola para detalles.`);
};
