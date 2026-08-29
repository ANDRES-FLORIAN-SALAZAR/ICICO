// Predicas Dinámicas - Casa de Oración
console.log('Predicas Dinámicas - Iniciando...');

let predicas = [];

// Cargar predicas desde JSON
async function cargarPredicas() {
    try {
        console.log('Cargando predicas desde JSON...');
        const response = await fetch('predicas.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        predicas = data.predicas;
        console.log('Predicas cargadas:', predicas.length);
        
        renderizarPredicas();
        return;
    } catch (error) {
        console.error('Error cargando predicas:', error);
        return false;
    }
}

// Renderizar predicas
function renderizarPredicas() {
    console.log('Renderizando predicas...');
    const container = document.getElementById('predicasContainer');
    
    if (!container) {
        console.error('No se encontró el contenedor de predicas');
        return;
    }
    
    if (predicas.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay predicas disponibles</p></div>';
        return;
    }
    
    let html = '';
    predicas.forEach((predica, index) => {
        const icono = obtenerIcono(predica.platform);
        
        html += `
            <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow">
                    <div class="card-body text-center">
                        <div class="predica-icon mb-3">
                            <i class="${icono} fa-3x"></i>
                        </div>
                        <h5 class="card-title">${predica.title}</h5>
                        <p class="speaker">${predica.speaker}</p>
                        <a href="${predica.url}" target="_blank" class="btn btn-primary w-100">
                            <i class="fas fa-play me-2"></i>Escuchar Predica
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('Predicas renderizadas exitosamente');
}

// Obtener icono según plataforma
function obtenerIcono(platform) {
    switch(platform) {
        case 'facebook':
            return 'fab fa-facebook';
        case 'youtube':
            return 'fab fa-youtube';
        case 'instagram':
            return 'fab fa-instagram';
        case 'twitter':
            return 'fab fa-twitter';
        default:
            return 'fas fa-bible';
    }
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando predicas...');
    
    // Cargar predicas automáticamente
    cargarPredicas().then(success => {
        if (success) {
            console.log('Predicas inicializadas exitosamente');
        } else {
            console.error('Error inicializando predicas');
        }
    });
});
