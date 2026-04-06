// Predicas Simple - Casa de Oración
(function() {
    'use strict';

    // Función para cargar predicas desde JSON
    async function cargarPredicas() {
        try {
            const response = await fetch('predicas.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar predicas.json');
            }
            const data = await response.json();
            return data.predicas;
        } catch (error) {
            console.error('Error cargando predicas:', error);
            return [];
        }
    }

    // Función para crear tarjeta de predica
    function crearTarjetaPredica(predica) {
        const icono = predica.platform === 'facebook' ? 'fab fa-facebook' : 'fas fa-video';
        
        return `
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
                <div class="card h-100 shadow sermon-card">
                    <div class="card-header text-white text-center" style="background: var(--primary-color);">
                        <i class="${icono} fa-2x mb-2"></i>
                        <h5 class="mb-0">Predicación</h5>
                    </div>
                    <div class="card-body text-center">
                        <p class="card-text mb-3">
                            <strong>${predica.title}</strong><br>
                            <small>${predica.speaker}</small>
                        </p>
                        <div class="d-grid gap-2">
                            <a href="${predica.url}" 
                               target="_blank" 
                               class="btn btn-primary">
                                <i class="${icono} me-2"></i>Ver Predicación
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Función principal para inicializar
    async function inicializarPredicas() {
        const container = document.getElementById('predicasContainer');
        if (!container) return;

        const predicas = await cargarPredicas();
        
        if (predicas.length === 0) {
            container.innerHTML = '<p class="text-center">No hay predicas disponibles.</p>';
            return;
        }

        // Generar HTML de todas las predicas
        let html = '';
        predicas.forEach(predica => {
            html += crearTarjetaPredica(predica);
        });

        container.innerHTML = html;

        // Reinicializar AOS
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarPredicas);
    } else {
        inicializarPredicas();
    }

})();
