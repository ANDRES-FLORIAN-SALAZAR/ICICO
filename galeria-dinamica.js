// Galería Dinámica - Casa de Oración
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

    // Función para crear una tarjeta de video
    function createVideoCard(video, index) {
        return `
            <div class="media-card" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                <div class="media-card-video">
                    <video controls preload="metadata" muted loop playsinline poster="${video.poster || ''}">
                        <source src="${video.src}" type="video/mp4">
                        ${video.webmSrc ? `<source src="${video.webmSrc}" type="video/webm">` : ''}
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>
                <div class="media-card-content">
                    <h5 class="media-card-title">${video.title}</h5>
                    <p class="media-card-description">${video.description}</p>
                </div>
            </div>
        `;
    }

    // Función para renderizar la galería
    function renderGallery() {
        if (!galleryData) return;

        const imageGallery = document.getElementById('imageGallery');
        const videoGallery = document.getElementById('videoGallery');

        if (imageGallery && galleryData.images) {
            imageGallery.innerHTML = galleryData.images
                .map((image, index) => createImageCard(image, index))
                .join('');
        }

        if (videoGallery && galleryData.videos) {
            videoGallery.innerHTML = galleryData.videos
                .map((video, index) => createVideoCard(video, index))
                .join('');
        }

        // Reinicializar AOS para las nuevas tarjetas
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
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
                const video = this.querySelector('video');
                const title = this.querySelector('.media-card-title')?.textContent;
                const description = this.querySelector('.media-card-description')?.textContent;

                if (img) {
                    openMediaPreview('image', img.src, title, description);
                } else if (video) {
                    const videoSrc = video.querySelector('source')?.src;
                    openMediaPreview('video', videoSrc, title, description);
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
        } else if (type === 'video') {
            previewVideo.src = src;
            previewVideo.classList.remove('d-none');
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
        await loadGalleryData();
        renderGallery();
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
