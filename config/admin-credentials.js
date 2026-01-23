// Configuración de Administración - Casa de Oración
// ARCHIVO SENSIBLE - NO SUBIR AL REPOSITORIO

// Contraseña del administrador
const ADMIN_CONFIG = {
    password: 'ICICO08102315',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutos en milisegundos
};

// Función para obtener la configuración del administrador
function getAdminConfig() {
    return ADMIN_CONFIG;
}

// Función para validar la contraseña del administrador
function validateAdminPassword(inputPassword) {
    return inputPassword === ADMIN_CONFIG.password;
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getAdminConfig, validateAdminPassword };
}
