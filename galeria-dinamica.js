// Galería Dinámica Categorizada - Casa de Oración
(function() {
    'use strict';

    let galleryData = null;
    let currentImagePage = {};
    let currentVideoPage = {};

    // Función para cargar el JSON de la galería
    async function loadGalleryData() {
        try {
            const response = await fetch('galeria.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo galeria.json');
            }
            galleryData = await response.json();
            console.log('📸 Galería categorizada cargada:', galleryData);
            return galleryData;
        } catch (error) {
            console.error('❌ Error cargando galería:', error);
            return null;
        }
    }

    // Función para crear una tarjeta de imagen
    function createImageCard(image, index, categoryIndex) {
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
    function createVideoCard(video, index, categoryIndex) {
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

    // Función para crear el selector de categorías
    function createCategorySelector(categories, type) {
        return `
            <div class="category-selector mb-4" data-aos="fade-up">
                <div class="btn-group w-100" role="group">
                    <button class="btn btn-outline-primary active" data-category="all" data-type="${type}">
                        <i class="fas fa-th me-2"></i>Todas
                    </button>
                    ${categories.map((cat, index) => `
                        <button class="btn btn-outline-primary" data-category="${cat.id}" data-type="${type}">
                            <i class="fas fa-calendar me-2"></i>${cat.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Función para renderizar imágenes por categoría
    function renderImagesByCategory(categoryId = 'all', page = 1) {
        const imageGallery = document.getElementById('imageGallery');
        if (!imageGallery || !galleryData) return;

        let imagesToShow = [];
        let categoriesHtml = '';

        if (categoryId === 'all') {
            // Mostrar todas las categorías
            galleryData.categories.images.forEach((category, catIndex) => {
                categoriesHtml += `
                    <div class="category-section mb-5" data-category-id="${category.id}">
                        <div class="category-header d-flex justify-content-between align-items-center mb-3">
                            <h4 class="category-title">
                                <i class="fas fa-calendar-alt me-2 text-primary"></i>
                                ${category.name}
                            </h4>
                            <span class="badge bg-primary">${category.items.length} imágenes</span>
                        </div>
                        <div class="gallery-grid">
                            ${category.items.slice(0, galleryData.settings.itemsPerPage).map((img, imgIndex) => 
                                createImageCard(img, imgIndex, catIndex)
                            ).join('')}
                        </div>
                        ${category.items.length > galleryData.settings.itemsPerPage ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-primary load-more-btn" 
                                        data-category="${category.id}" 
                                        data-type="images" 
                                        data-current-page="1"
                                        data-total-pages="${Math.ceil(category.items.length / galleryData.settings.itemsPerPage)}">
                                    <i class="fas fa-plus-circle me-2"></i>
                                    Ver más (${category.items.length - galleryData.settings.itemsPerPage} restantes)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        } else {
            // Mostrar categoría específica
            const category = galleryData.categories.images.find(cat => cat.id === parseInt(categoryId));
            if (category) {
                const startIndex = (page - 1) * galleryData.settings.itemsPerPage;
                const endIndex = startIndex + galleryData.settings.itemsPerPage;
                const itemsToShow = category.items.slice(startIndex, endIndex);

                categoriesHtml = `
                    <div class="category-section">
                        <div class="category-header d-flex justify-content-between align-items-center mb-3">
                            <h4 class="category-title">
                                <i class="fas fa-calendar-alt me-2 text-primary"></i>
                                ${category.name}
                            </h4>
                            <span class="badge bg-primary">${category.items.length} imágenes</span>
                        </div>
                        <div class="gallery-grid">
                            ${itemsToShow.map((img, imgIndex) => 
                                createImageCard(img, imgIndex, categoryId)
                            ).join('')}
                        </div>
                        ${endIndex < category.items.length ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-primary load-more-btn" 
                                        data-category="${category.id}" 
                                        data-type="images" 
                                        data-current-page="${page}"
                                        data-total-pages="${Math.ceil(category.items.length / galleryData.settings.itemsPerPage)}">
                                    <i class="fas fa-plus-circle me-2"></i>
                                    Ver más (${category.items.length - endIndex} restantes)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        imageGallery.innerHTML = categoriesHtml;
        
        // Reinicializar AOS para las nuevas tarjetas
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

        // Inicializar eventos de clic para las tarjetas y botones
        initializeMediaCardEvents();
        initializeLoadMoreEvents();
    }

    // Función para renderizar videos por categoría
    function renderVideosByCategory(categoryId = 'all', page = 1) {
        const videoGallery = document.getElementById('videoGallery');
        if (!videoGallery || !galleryData) return;

        let videosHtml = '';

        if (categoryId === 'all') {
            // Mostrar todas las categorías de videos
            galleryData.categories.videos.forEach((category, catIndex) => {
                videosHtml += `
                    <div class="category-section mb-5" data-category-id="${category.id}">
                        <div class="category-header d-flex justify-content-between align-items-center mb-3">
                            <h4 class="category-title">
                                <i class="fas fa-video me-2 text-primary"></i>
                                ${category.name}
                            </h4>
                            <span class="badge bg-primary">${category.items.length} videos</span>
                        </div>
                        <div class="gallery-grid">
                            ${category.items.slice(0, galleryData.settings.itemsPerPage).map((video, vidIndex) => 
                                createVideoCard(video, vidIndex, catIndex)
                            ).join('')}
                        </div>
                        ${category.items.length > galleryData.settings.itemsPerPage ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-primary load-more-btn" 
                                        data-category="${category.id}" 
                                        data-type="videos" 
                                        data-current-page="1"
                                        data-total-pages="${Math.ceil(category.items.length / galleryData.settings.itemsPerPage)}">
                                    <i class="fas fa-plus-circle me-2"></i>
                                    Ver más (${category.items.length - galleryData.settings.itemsPerPage} restantes)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        } else {
            // Mostrar categoría específica
            const category = galleryData.categories.videos.find(cat => cat.id === parseInt(categoryId));
            if (category) {
                const startIndex = (page - 1) * galleryData.settings.itemsPerPage;
                const endIndex = startIndex + galleryData.settings.itemsPerPage;
                const itemsToShow = category.items.slice(startIndex, endIndex);

                videosHtml = `
                    <div class="category-section">
                        <div class="category-header d-flex justify-content-between align-items-center mb-3">
                            <h4 class="category-title">
                                <i class="fas fa-video me-2 text-primary"></i>
                                ${category.name}
                            </h4>
                            <span class="badge bg-primary">${category.items.length} videos</span>
                        </div>
                        <div class="gallery-grid">
                            ${itemsToShow.map((video, vidIndex) => 
                                createVideoCard(video, vidIndex, categoryId)
                            ).join('')}
                        </div>
                        ${endIndex < category.items.length ? `
                            <div class="text-center mt-3">
                                <button class="btn btn-primary load-more-btn" 
                                        data-category="${category.id}" 
                                        data-type="videos" 
                                        data-current-page="${page}"
                                        data-total-pages="${Math.ceil(category.items.length / galleryData.settings.itemsPerPage)}">
                                    <i class="fas fa-plus-circle me-2"></i>
                                    Ver más (${category.items.length - endIndex} restantes)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        videoGallery.innerHTML = videosHtml;
        
        // Reinicializar AOS para las nuevas tarjetas
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

        // Inicializar eventos de clic para las tarjetas y botones
        initializeMediaCardEvents();
        initializeLoadMoreEvents();
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

    // Función para inicializar eventos de botones "ver más"
    function initializeLoadMoreEvents() {
        const loadMoreBtns = document.querySelectorAll('.load-more-btn');
        
        loadMoreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.dataset.category;
                const type = this.dataset.type;
                const currentPage = parseInt(this.dataset.currentPage);
                const totalPages = parseInt(this.dataset.totalPages);
                
                if (currentPage < totalPages) {
                    if (type === 'images') {
                        renderImagesByCategory(categoryId, currentPage + 1);
                    } else if (type === 'videos') {
                        renderVideosByCategory(categoryId, currentPage + 1);
                    }
                }
            });
        });
    }

    // Función para inicializar eventos de categorías
    function initializeCategoryEvents() {
        const categoryBtns = document.querySelectorAll('[data-category]');
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase active de todos los botones del mismo tipo
                document.querySelectorAll(`[data-type="${this.dataset.type}"]`).forEach(b => 
                    b.classList.remove('active')
                );
                
                // Agregar clase active al botón clickeado
                this.classList.add('active');
                
                // Renderizar contenido correspondiente
                if (this.dataset.type === 'images') {
                    renderImagesByCategory(this.dataset.category);
                } else if (this.dataset.type === 'videos') {
                    renderVideosByCategory(this.dataset.category);
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

    // Función para renderizar la galería completa
    function renderGallery() {
        if (!galleryData) return;

        // Agregar selectores de categorías
        const imageTab = document.querySelector('#images');
        const videoTab = document.querySelector('#videos');

        if (imageTab && galleryData.settings.enableCategories) {
            const imageCategories = galleryData.categories.images;
            const categorySelectorHtml = createCategorySelector(imageCategories, 'images');
            
            // Insertar el selector después del tab-pane
            const imageContainer = document.querySelector('#images .gallery-grid');
            if (imageContainer) {
                imageContainer.insertAdjacentHTML('beforebegin', categorySelectorHtml);
            }
        }

        if (videoTab && galleryData.settings.enableCategories) {
            const videoCategories = galleryData.categories.videos;
            const categorySelectorHtml = createCategorySelector(videoCategories, 'videos');
            
            // Insertar el selector después del tab-pane
            const videoContainer = document.querySelector('#videos .gallery-grid');
            if (videoContainer) {
                videoContainer.insertAdjacentHTML('beforebegin', categorySelectorHtml);
            }
        }

        // Renderizar contenido inicial
        renderImagesByCategory('all');
        renderVideosByCategory('all');

        // Inicializar eventos de categorías
        initializeCategoryEvents();
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
