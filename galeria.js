// Galería Casa de Oración - Versión Definitiva
console.log('🚀 Iniciando galería...');

let galleryData = null;

// Función para cargar galería desde JSON
async function cargarGaleria() {
    try {
        const response = await fetch('galeria.json');
        const data = await response.json();
        galleryData = data;
        return data;
    } catch (error) {
        console.error('❌ Error cargando galería:', error);
        return null;
    }
}

// Función para filtrar por mes y año combinados
function filtrarPorMesYAño() {
    const mesSelect = document.getElementById('filtro-mes-select');
    const yearInput = document.getElementById('filtro-year-input');
    
    const mes = mesSelect.value;
    const año = yearInput.value;
    
    console.log(`🔍 Filtrando: mes=${mes}, año=${año}`);
    
    renderizarGaleria(mes, año);
}

// Función principal para renderizar galería
async function renderizarGaleria(mesFiltro = 'todos', añoFiltro = null) {
    const container = document.getElementById('imageGallery');
    if (!container) return;

    // Cargar datos si no están cargados
    if (!galleryData) {
        console.log('📁 Cargando galeria.json...');
        await cargarGaleria();
    }
    
    if (!galleryData || !galleryData.categories || !galleryData.categories.images) {
        container.innerHTML = '<p class="text-center">No hay imágenes disponibles.</p>';
        return;
    }

    // Extraer y filtrar imágenes
    let todasLasImagenes = [];
    galleryData.categories.images.forEach(categoria => {
        todasLasImagenes.push(...categoria.items);
    });
    
    // Aplicar filtros
    const imagenesFiltradas = todasLasImagenes.filter(img => {
        if (mesFiltro === 'todos' && !añoFiltro) return true;
        
        // Extraer mes y año del nombre de la categoría
        const categoria = galleryData.categories.images.find(cat => 
            cat.items.some(item => item.id === img.id)
        );
        
        if (!categoria) return true;
        
        const coincideMes = mesFiltro === 'todos' || categoria.month === mesFiltro;
        const coincideAño = !añoFiltro || categoria.year == añoFiltro;
        
        return coincideMes && coincideAño;
    });
    
    console.log(`📸 Imágenes filtradas: ${imagenesFiltradas.length} de ${todasLasImagenes.length}`);
    
    if (imagenesFiltradas.length === 0) {
        container.innerHTML = '<p class="text-center">No hay imágenes para los filtros seleccionados.</p>';
        return;
    }

    // Generar HTML
    let html = '<div class="row g-4">';
    imagenesFiltradas.forEach((img, index) => {
        html += `
            <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
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
    
    // Insertar HTML
    container.innerHTML = html;
    
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log(`✅ Galería renderizada: ${imagenesFiltradas.length} imágenes`);
}

// Función para ver imagen en modal
function verImagen(src, title, description) {
    const modal = document.getElementById('mediaPreviewModal');
    const img = document.getElementById('previewImage');
    const titleEl = document.getElementById('mediaPreviewTitle');
    const descEl = document.getElementById('mediaPreviewDescription');
    
    if (modal && img) {
        img.src = src;
        img.classList.remove('d-none');
        titleEl.textContent = title || 'Imagen';
        descEl.textContent = description || '';
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderizarGaleria());
} else {
    renderizarGaleria();
}
