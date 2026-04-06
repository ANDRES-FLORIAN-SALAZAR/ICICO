// Predicas Dinámicas - Casa de Oración
(function() {
    'use strict';

    let predicasData = null;

    // Función para cargar el JSON de predicas
    async function loadPredicasData() {
        console.log('🚀 Cargando predicas.json...');
        try {
            const response = await fetch('predicas.json');
            console.log('📡 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            predicasData = await response.json();
            console.log('✅ Predicas cargadas:', predicasData);
            return predicasData;
        } catch (error) {
            console.error('❌ Error cargando predicas:', error);
            return null;
        }
    }

    // Función para crear una tarjeta de predica
    function createPredicaCard(predica, index) {
        const platformIcon = predica.platform === 'facebook' ? 'fab fa-facebook' : 'fas fa-video';
        const formattedDate = new Date(predica.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                <div class="card h-100 shadow sermon-card">
                    <div class="card-header text-white text-center" style="background: var(--primary-color);">
                        <i class="${platformIcon} fa-2x mb-2"></i>
                        <h5 class="mb-0">Predicación</h5>
                    </div>
                    <div class="card-body text-center">
                        <p class="card-text mb-3">
                            <strong>${predica.title}</strong><br>
                            <small class="text-muted">${predica.speaker}</small><br>
                            <small class="text-muted">${formattedDate} • ${predica.duration}</small>
                        </p>
                        <div class="d-grid gap-2">
                            <a href="${predica.url}" 
                               target="_blank" 
                               class="btn btn-primary">
                                <i class="${platformIcon} me-2"></i>Ver Predicación
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Función para renderizar predicas por categoría
    function renderPredicas(category = 'recientes') {
        const container = document.getElementById('predicasContainer');
        if (!container || !predicasData) {
            return;
        }

        // Obtener predicas de la categoría especificada
        const predicas = predicasData.categories[category] || [];
        
        // Renderizar predicas
        const predicasHtml = predicas.map((predica, index) => createPredicaCard(predica, index)).join('');
        container.innerHTML = predicasHtml;
        
        // Reinicializar AOS
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
    }

    // Función para crear tabs de categorías
    function createCategoryTabs() {
        if (!predicasData || !predicasData.settings.enableCategories) {
            return;
        }

        const categories = Object.keys(predicasData.categories);
        if (categories.length <= 1) return;

        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'category-tabs mb-4';
        tabsContainer.innerHTML = `
            <ul class="nav nav-pills justify-content-center" id="predicasTabs" role="tablist">
                ${categories.map((category, index) => `
                    <li class="nav-item" role="presentation">
                        <button class="nav-link ${index === 0 ? 'active' : ''}" 
                                id="${category}-tab" 
                                data-bs-toggle="pill" 
                                data-bs-target="#${category}" 
                                type="button"
                                onclick="renderPredicas('${category}')">
                            ${category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;

        // Insertar tabs antes del contenedor de predicas
        const container = document.getElementById('predicasContainer');
        container.parentNode.insertBefore(tabsContainer, container);
    }

    // Función de inicialización
    async function initializePredicas() {
        await loadPredicasData();
        
        if (!predicasData) {
            return;
        }
        
        // Crear tabs si hay categorías
        createCategoryTabs();
        
        // Renderizar categoría por defecto
        const defaultCategory = predicasData.settings.defaultCategory || 'recientes';
        renderPredicas(defaultCategory);
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePredicas);
    } else {
        initializePredicas();
    }

})();
