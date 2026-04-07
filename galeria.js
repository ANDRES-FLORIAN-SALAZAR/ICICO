// Galería Completa - Casa de Oración
console.log('=== GALERÍA INICIANDO ===');

let galleryData = null;

// Cargar datos desde JSON
async function cargarGaleria() {
    console.log('1. Iniciando carga de galeria.json...');
    try {
        console.log('2. Haciendo fetch a galeria.json...');
        const response = await fetch('galeria.json');
        console.log('3. Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('4. Parseando JSON...');
        const data = await response.json();
        console.log('5. JSON parseado:', data);
        
        galleryData = data;
        console.log('6. Galería cargada exitosamente');
        return data;
    } catch (error) {
        console.error('7. ERROR cargando galería:', error);
        return null;
    }
}

// Filtrar por mes y año combinados
function filtrarPorMesYAño() {
    console.log('=== FILTRANDO ===');
    const mesSelect = document.getElementById('filtro-mes-select');
    const yearInput = document.getElementById('filtro-year-input');
    
    console.log('8. Elementos encontrados:', {mesSelect, yearInput});
    
    const mes = mesSelect ? mesSelect.value : null;
    const año = yearInput ? yearInput.value : null;
    
    console.log('9. Valores de filtro:', {mes, año});
    
    renderizarGaleria(mes, año);
}

// Renderizar galería con filtros
async function renderizarGaleria(mesFiltro = 'todos', añoFiltro = null) {
    console.log('=== RENDERIZANDO GALERÍA ===');
    console.log('10. Parámetros:', {mesFiltro, añoFiltro});
    
    const container = document.getElementById('imageGallery');
    console.log('11. Container encontrado:', container);
    
    if (!container) {
        console.error('12. ERROR: No se encontró #imageGallery');
        return;
    }

    // Cargar datos si no están cargados
    if (!galleryData) {
        console.log('13. Cargando datos...');
        await cargarGaleria();
    }
    
    if (!galleryData) {
        console.error('14. ERROR: No se pudo cargar galleryData');
        container.innerHTML = '<p class="text-center text-danger">Error cargando los datos de la galería</p>';
        return;
    }
    
    if (!galleryData.categories || !galleryData.categories.images) {
        console.error('15. ERROR: Estructura incorrecta:', galleryData);
        container.innerHTML = '<p class="text-center text-danger">Estructura de datos incorrecta</p>';
        return;
    }

    // Extraer y filtrar imágenes
    let todasLasImagenes = [];
    galleryData.categories.images.forEach(categoria => {
        console.log('16. Procesando categoría:', categoria.name);
        todasLasImagenes.push(...categoria.items);
    });
    
    console.log('17. Total imágenes extraídas:', todasLasImagenes.length);
    
    // Aplicar filtros
    const imagenesFiltradas = todasLasImagenes.filter(img => {
        if (mesFiltro === 'todos' && !añoFiltro) return true;
        
        // Encontrar la categoría de esta imagen
        const categoria = galleryData.categories.images.find(cat => 
            cat.items.some(item => item.id === img.id)
        );
        
        if (!categoria) return true;
        
        const coincideMes = mesFiltro === 'todos' || categoria.month === mesFiltro;
        const coincideAño = !añoFiltro || categoria.year == añoFiltro;
        
        return coincideMes && coincideAño;
    });
    
    console.log('18. Imágenes filtradas:', imagenesFiltradas.length, 'de', todasLasImagenes.length);
    
    if (imagenesFiltradas.length === 0) {
        console.log('19. No hay imágenes para mostrar');
        container.innerHTML = '<p class="text-center">No hay imágenes para los filtros seleccionados.</p>';
        return;
    }

    // Generar HTML con Bootstrap
    console.log('20. Generando HTML...');
    let html = '<div class="row g-4">';
    imagenesFiltradas.forEach((img, index) => {
        html += `
            <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow sermon-card">
                    <div class="media-card-image">
                        <img src="${img.src}" alt="${img.alt}" class="card-img-top" style="height: 200px; object-fit: cover; cursor: pointer;" onclick="verImagen('${img.src}', '${img.title}', '${img.description}')">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${img.title}</h5>
                        <p class="card-text">${img.description}</p>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    console.log('21. HTML generado, insertando...');
    // Insertar HTML
    container.innerHTML = html;
    
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('22. Galería renderizada exitosamente');
}

// Ver imagen en modal
function verImagen(src, title, description) {
    console.log('=== ABRIR MODAL ===');
    console.log('23. Parámetros:', {src, title, description});
    
    const modal = document.getElementById('mediaPreviewModal');
    const img = document.getElementById('previewImage');
    const titleEl = document.getElementById('mediaPreviewTitle');
    const descEl = document.getElementById('mediaPreviewDescription');
    
    console.log('24. Elementos modal:', {modal, img, titleEl, descEl});
    
    if (modal && img) {
        img.src = src;
        img.classList.remove('d-none');
        titleEl.textContent = title || 'Imagen';
        descEl.textContent = description || '';
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        console.log('25. Modal abierto');
    } else {
        console.error('26. ERROR: No se encontraron elementos del modal');
    }
}

// Inicializar cuando el DOM esté listo
console.log('27. Verificando estado del DOM:', document.readyState);

if (document.readyState === 'loading') {
    console.log('28. DOM está cargando, agregando listener...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('29. DOM cargado, iniciando renderizado...');
        renderizarGaleria();
    });
} else {
    console.log('30. DOM ya listo, iniciando renderizado...');
    renderizarGaleria();
}

console.log('=== GALERÍA SCRIPT CARGADO ===');
