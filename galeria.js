// Galería Casa de Oración - Versión Definitiva
console.log('🚀 Iniciando galería...');

async function cargarGaleria() {
    try {
        // Cargar datos
        const response = await fetch('galeria.json');
        const data = await response.json();
        
        // Obtener container
        const container = document.getElementById('imageGallery');
        if (!container) return;
        
        // Extraer todas las imágenes
        const imagenes = [];
        if (data.categories && data.categories.images) {
            data.categories.images.forEach(categoria => {
                imagenes.push(...categoria.items);
            });
        }
        
        // Generar HTML
        let html = '<div class="row g-4">';
        imagenes.forEach((img, index) => {
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
        
        console.log(`✅ Galería cargada: ${imagenes.length} imágenes`);
        
    } catch (error) {
        console.error('❌ Error cargando galería:', error);
        const container = document.getElementById('imageGallery');
        if (container) {
            container.innerHTML = '<p class="text-center text-danger">Error cargando la galería</p>';
        }
    }
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
    document.addEventListener('DOMContentLoaded', cargarGaleria);
} else {
    cargarGaleria();
}
