// Galería Dinámica Simplificada - Casa de Oración
(function() {
    'use strict';

    let galleryData = null;

    // Función para cargar el JSON de la galería
    async function loadGalleryData() {
        console.log('📁 Cargando galeria.json...');
        try {
            const response = await fetch('galeria.json');
            console.log('📡 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            galleryData = await response.json();
            console.log('✅ Galería cargada correctamente');
            return galleryData;
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
            return null;
        }
    }

    // Función para crear una tarjeta de imagen
    function createImageCard(image, index) {
        return `
            <div class="media-card" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                <div class="media-card-image">
                    <img src="${image.src}" alt="${image.alt}" loading="lazy">
                </div>
                <div class="media-card-content">
                    <h5 class="media-card-title">${image.title}</h5>
                    <p class="media-card-description">${image.description}</p>
                </div>
            </div>
        `;
    }

    // Función para renderizar todas las imágenes
    function renderAllImages() {
        const imageGallery = document.getElementById('imageGallery');
        if (!imageGallery || !galleryData) {
            return;
        }

        // Juntar todas las imágenes de todas las categorías
        const allImages = [];
        galleryData.categories.images.forEach(category => {
            allImages.push(...category.items);
        });

        // Renderizar todas las imágenes
        const allImagesHtml = allImages.map((image, index) => createImageCard(image, index)).join('');
        imageGallery.innerHTML = allImagesHtml;
        
        // Reinicializar AOS
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }

        // Inicializar eventos de clic para las tarjetas
        initializeMediaCardEvents();
    }

    // Función para inicializar eventos de las tarjetas multimedia
    function initializeMediaCardEvents() {
        const mediaCards = document.querySelectorAll('.media-card');
        
        mediaCards.forEach(card => {
            card.addEventListener('click', function() {
                const img = this.querySelector('img');
                const title = this.querySelector('.media-card-title')?.textContent;
                const description = this.querySelector('.media-card-description')?.textContent;

                if (img) {
                    openMediaPreview('image', img.src, title, description);
                }
            });
        });
    }

    // Función para abrir previsualización de medios
    function openMediaPreview(type, src, title, description) {
        const modal = document.getElementById('mediaPreviewModal');
        const previewImage = document.getElementById('previewImage');
        const previewVideo = document.getElementById('previewVideo');
        const previewTitle = document.getElementById('mediaPreviewTitle');
        const previewDescription = document.getElementById('mediaPreviewDescription');
        const downloadBtn = document.getElementById('downloadMediaBtn');

        // Resetear elementos
        previewImage.classList.add('d-none');
        previewVideo.classList.add('d-none');

        if (type === 'image') {
            previewImage.src = src;
            previewImage.classList.remove('d-none');
            downloadBtn.onclick = () => downloadMedia(src, title);
        }

        previewTitle.textContent = title || 'Previsualización';
        previewDescription.textContent = description || '';

        // Mostrar modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    // Función para descargar medios
    function downloadMedia(src, filename) {
        const link = document.createElement('a');
        link.href = src;
        link.download = filename || 'media';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Función de inicialización
    async function initializeGallery() {
        console.log('🚀 Inicializando galería...');
        
        await loadGalleryData();
        
        if (!galleryData) {
            console.error('❌ No se cargaron los datos de la galería');
            return;
        }
        
        console.log('✅ Datos cargados, renderizando imágenes...');
        renderAllImages();
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery);
    } else {
        initializeGallery();
    }

})();
