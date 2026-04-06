// Galería Dinámica Simplificada - Casa de Oración
(function() {
    'use strict';

    let galleryData = null;

    // Función para cargar el JSON de la galería
    async function loadGalleryData() {
        try {
            const response = await fetch('galeria.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo galeria.json');
            }
            galleryData = await response.json();
            console.log('📸 Galería cargada:', galleryData);
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
            console.log('❌ No hay imageGallery o galleryData');
            return;
        }

        let allImagesHtml = '';
        
        // Juntar todas las imágenes de todas las categorías
        const allImages = [];
        galleryData.categories.images.forEach(category => {
            console.log(`📁 Categoría: ${category.name}, Imágenes: ${category.items.length}`);
            allImages.push(...category.items);
        });

        console.log(`📸 Total de imágenes a renderizar: ${allImages.length}`);

        // Renderizar todas las imágenes
        allImagesHtml = allImages.map((image, index) => createImageCard(image, index)).join('');

        imageGallery.innerHTML = allImagesHtml;
        console.log('✅ Galería renderizada con', allImages.length, 'imágenes');
        
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
        console.log('📋 DOM ready:', document.readyState);
        
        await loadGalleryData();
        
        if (!galleryData) {
            console.log('❌ Error: galleryData es null después de cargar');
            return;
        }
        
        console.log('📊 galleryData cargado:', {
            categories: galleryData.categories ? Object.keys(galleryData.categories) : 'null',
            settings: galleryData.settings
        });
        
        renderAllImages();
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery);
    } else {
        initializeGallery();
    }

    // Hacer funciones globales si es necesario
    window.initializeGallery = initializeGallery;

})();
