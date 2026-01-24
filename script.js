// JavaScript para Casa de Oración - Sistema Completo de Gestión

// Cargar configuración de administración de forma asíncrona
(function loadAdminConfig() {
    const script = document.createElement('script');
    script.src = 'config/admin-credentials.js';
    script.onload = function() {
        console.log('Configuración de administrador cargada exitosamente');
    };
    script.onerror = function() {
        console.error('Error al cargar configuración de administrador');
        // Fallback: sin contraseña por defecto - requiere archivo de configuración
        window.validateAdminPassword = function(inputPassword) {
            console.error('Configuración de administrador no disponible');
            return false;
        };
    };
    document.head.appendChild(script);
})();

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global del ContentManager primero
    window.contentManager = new ContentManager();
    
    // Inicializar AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Inicializar todos los sistemas
    initializeCounters();
    loadEvents();
    loadSundaySchool();
    loadSpecialServices();
    initializeGallery();
    loadSermons();
    initializeContact();
    initializeAdmin();
    checkAdminSession();
});

// Sistema de Navegación Suave
function initializeNavigation() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Actualizar navegación activa al hacer scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Contadores Animados
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-count');
        const increment = target / speed;
        
        const updateCount = () => {
            const count = +counter.innerText;
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        
        updateCount();
    };

    // Usar Intersection Observer para activar cuando sea visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Sistema de Monitoreo de Almacenamiento Mejorado
class StorageMonitor {
    constructor() {
        this.maxStorage = 1024 * 1024 * 1024 * 1024; // 1TB en bytes
        this.usedStorage = 0;
        this.fileDetails = [];
        this.init();
    }

    init() {
        this.calculateStorageUsage();
        this.updateProgressBar();
        this.setupEventListeners();
        this.createDetailedStorageDisplay();
    }

    calculateStorageUsage() {
        this.usedStorage = 0;
        this.fileDetails = [];

        // Calcular tamaño del contenido principal
        try {
            const content = localStorage.getItem('churchContent');
            if (content) {
                const contentSize = new Blob([content]).size;
                this.usedStorage += contentSize;
                this.fileDetails.push({
                    name: 'Contenido Principal',
                    size: contentSize,
                    type: 'content',
                    color: '#007bff'
                });

                // Calcular tamaño de imágenes y videos en el contenido
                const parsedContent = JSON.parse(content);
                if (parsedContent.gallery && parsedContent.gallery.images) {
                    parsedContent.gallery.images.forEach((image, index) => {
                        if (image.fileSize) {
                            this.usedStorage += image.fileSize;
                            this.fileDetails.push({
                                name: `Imagen ${index + 1}: ${image.title || image.fileName || 'Sin título'}`,
                                size: image.fileSize,
                                type: 'imagen',
                                color: '#17a2b8'
                            });
                        }
                    });
                }

                if (parsedContent.gallery && parsedContent.gallery.videos) {
                    parsedContent.gallery.videos.forEach((video, index) => {
                        if (video.fileSize) {
                            this.usedStorage += video.fileSize;
                            this.fileDetails.push({
                                name: `Video ${index + 1}: ${video.title || video.fileName || 'Sin título'}`,
                                size: video.fileSize,
                                type: 'video',
                                color: '#6f42c1'
                            });
                        }
                    });
                }

                // Calcular tamaño de eventos con archivos adjuntos
                if (parsedContent.events) {
                    parsedContent.events.forEach((event, index) => {
                        if (event.fileSize) {
                            this.usedStorage += event.fileSize;
                            this.fileDetails.push({
                                name: `Evento ${index + 1}: ${event.title || 'Sin título'}`,
                                size: event.fileSize,
                                type: 'evento',
                                color: '#fd7e14'
                            });
                        }
                    });
                }

                // Calcular tamaño de sermones/predicas con archivos adjuntos
                if (parsedContent.sermons) {
                    parsedContent.sermons.forEach((sermon, index) => {
                        if (sermon.fileSize) {
                            this.usedStorage += sermon.fileSize;
                            this.fileDetails.push({
                                name: `Predica ${index + 1}: ${sermon.title || 'Sin título'}`,
                                size: sermon.fileSize,
                                type: 'predica',
                                color: '#20c997'
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Error calculando contenido principal:', error);
        }

        // Calcular tamaño de otros elementos en localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key !== 'churchContent') {
                    const value = localStorage.getItem(key);
                    const size = new Blob([key + value]).size;
                    this.usedStorage += size;
                    
                    // Determinar tipo y color
                    let type, color;
                    if (key.includes('admin')) {
                        type = 'admin';
                        color = '#dc3545';
                    } else if (key.includes('session')) {
                        type = 'sesión';
                        color = '#28a745';
                    } else {
                        type = 'otros';
                        color = '#6c757d';
                    }
                    
                    this.fileDetails.push({
                        name: key,
                        size: size,
                        type: type,
                        color: color
                    });
                }
            }
        } catch (error) {
            console.warn('Error calculando otros elementos:', error);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getPercentageColor(percentage) {
        if (percentage < 50) return '#28a745';  // Verde
        if (percentage < 75) return '#ffc107';  // Amarillo
        if (percentage < 90) return '#fd7e14';  // Naranja
        return '#dc3545';  // Rojo
    }

    updateProgressBar() {
        const percentage = (this.usedStorage / this.maxStorage) * 100;
        
        // Actualizar solo los valores numéricos
        const storageUsed = document.getElementById('storageUsed');
        const storageAvailable = document.getElementById('storageAvailable');
        const storageTotal = document.getElementById('storageTotal');
        const storagePercentage = document.getElementById('storagePercentage');
        
        if (storageUsed) {
            storageUsed.textContent = this.formatBytes(this.usedStorage);
        }
        
        if (storageAvailable) {
            const available = this.maxStorage - this.usedStorage;
            storageAvailable.textContent = this.formatBytes(available);
        }

        if (storageTotal) {
            storageTotal.textContent = this.formatBytes(this.maxStorage);
        }

        if (storagePercentage) {
            storagePercentage.textContent = percentage.toFixed(2) + '%';
        }
    }

    createDetailedStorageDisplay() {
        // Crear panel detallado de almacenamiento
        const storagePanel = document.getElementById('storageDetailsPanel');
        if (storagePanel) {
            const percentage = (this.usedStorage / this.maxStorage) * 100;
            const color = this.getPercentageColor(percentage);
            
            storagePanel.innerHTML = `
                <div class="storage-files">
                    <h6>Desglose de Archivos:</h6>
                    <div class="file-list">
                        ${this.fileDetails.map(file => `
                            <div class="file-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                <div class="d-flex align-items-center">
                                    <div class="file-color-indicator me-2" 
                                         style="width: 12px; height: 12px; background-color: ${file.color}; border-radius: 50%;"></div>
                                    <div>
                                        <small class="file-name">${file.name}</small>
                                        <div class="file-type text-muted" style="font-size: 0.75rem;">${file.type}</div>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <small class="file-size fw-bold">${this.formatBytes(file.size)}</small>
                                    <div class="file-percentage text-muted" style="font-size: 0.75rem;">
                                        ${((file.size / this.usedStorage) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="storage-actions mt-3">
                    <button class="btn btn-outline-warning btn-sm" onclick="window.storageMonitor.clearCache()">
                        <i class="fas fa-broom me-1"></i>Limpiar Caché
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="window.storageMonitor.clearAllStorage()">
                        <i class="fas fa-trash me-1"></i>Limpiar Todo
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="window.storageMonitor.exportStorageInfo()">
                        <i class="fas fa-download me-1"></i>Exportar Info
                    </button>
                </div>
            `;
        }
    }

    clearCache() {
        if (confirm('¿Estás seguro de que quieres limpiar la caché? Esto eliminará datos temporales.')) {
            // Guardar sesión de admin
            const adminLoggedIn = localStorage.getItem('adminLoggedIn');
            const adminRemember = localStorage.getItem('adminRemember');
            
            localStorage.clear();
            
            // Restaurar sesión de admin
            if (adminLoggedIn === 'true') {
                localStorage.setItem('adminLoggedIn', adminLoggedIn);
            }
            if (adminRemember) {
                localStorage.setItem('adminRemember', adminRemember);
            }
            
            this.calculateStorageUsage();
            this.updateProgressBar();
            this.createDetailedStorageDisplay();
            
            showNotification('Caché limpiada exitosamente', 'success');
        }
    }

    clearAllStorage() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el almacenamiento? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            sessionStorage.clear();
            
            this.calculateStorageUsage();
            this.updateProgressBar();
            this.createDetailedStorageDisplay();
            
            showNotification('Almacenamiento limpiado exitosamente', 'success');
        }
    }

    exportStorageInfo() {
        const info = {
            timestamp: new Date().toISOString(),
            totalUsed: this.usedStorage,
            totalAvailable: this.maxStorage - this.usedStorage,
            percentage: ((this.usedStorage / this.maxStorage) * 100).toFixed(2),
            files: this.fileDetails
        };
        
        const dataStr = JSON.stringify(info, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `storage-info-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Información de almacenamiento exportada', 'success');
    }

    setupEventListeners() {
        // Actualizar cada 30 segundos
        setInterval(() => {
            this.calculateStorageUsage();
            this.updateProgressBar();
        }, 30000);
    }

    addFile(size) {
        this.usedStorage += size;
        this.updateProgressBar();
    }

    removeFile(size) {
        this.usedStorage = Math.max(0, this.usedStorage - size);
        this.updateProgressBar();
    }
}

// Inicializar el StorageMonitor global
window.storageMonitor = new StorageMonitor();

document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global del ContentManager primero
    window.contentManager = new ContentManager();
    
    // Inicializar AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Inicializar todos los sistemas
    initializeCounters();
    loadEvents();
    loadSundaySchool();
    loadSpecialServices();
    initializeGallery();
    loadSermons();
    initializeContact();
    initializeAdmin();
    checkAdminSession();
});

function isContentManagerReady() {
    return window.contentManager && window.contentManager.content;
}

// Sistema de Eventos
function loadEvents() {
    // Cargar horarios regulares desde ContentManager
    const regularServices = document.getElementById('regularServices');
    if (regularServices) {
        console.log('Elemento regularServices encontrado');
        // Verificar si contentManager está disponible
        if (!isContentManagerReady()) {
            console.warn('ContentManager no está disponible aún');
            return;
        }
        
        // Obtener eventos del ContentManager
        let events = window.contentManager.content.events;
        
        // Si no hay eventos en ContentManager, inicializar con los eventos del HTML
        if (events.length === 0) {
            console.log('Inicializando eventos desde HTML...');
            
            // Horarios regulares (no se muestran en próximos eventos)
            const regularServices = [
                {
                    id: 'service_1',
                    title: 'Culto de Oración',
                    date: new Date().toISOString().slice(0, 10),
                    time: '19:00',
                    timeDisplay: '7:00 PM',
                    description: 'Tiempo de oración y comunión con Dios',
                    icon: 'fa-praying-hands',
                    dayOfWeek: 'Martes',
                    isRegularService: true
                },
                {
                    id: 'service_2',
                    title: 'Estudio Bíblico',
                    date: new Date().toISOString().slice(0, 10),
                    time: '20:00',
                    timeDisplay: '8:00 PM',
                    description: 'Estudio profundo de la Palabra de Dios',
                    icon: 'fa-book-bible',
                    dayOfWeek: 'Jueves',
                    isRegularService: true
                },
                {
                    id: 'service_3',
                    title: 'Culto Familiar',
                    date: new Date().toISOString().slice(0, 10),
                    time: '10:00',
                    timeDisplay: '10:00 AM',
                    description: 'Compartiendo en comunidad y amor fraternal',
                    icon: 'fa-home',
                    dayOfWeek: 'Domingo',
                    isRegularService: true
                }
            ];
            
            // Agregar solo servicios regulares
            regularServices.forEach(service => {
                window.contentManager.addEvent(service);
            });
            
            // Obtener eventos actualizados
            events = window.contentManager.content.events;
        }
        
        // Filtrar: solo servicios regulares para horarios
        const regularServicesList = events.filter(event => event.isRegularService);
        console.log('Servicios regulares encontrados:', regularServicesList);
        
        // Filtrar: solo eventos especiales para próximos eventos
        const specialEvents = events.filter(event => !event.isRegularService);
        console.log('Eventos especiales encontrados:', specialEvents);
        
        // Cargar horarios regulares
        const services = regularServicesList.map(event => ({
            icon: event.icon || 'fa-calendar',
            title: event.title,
            time: event.dayOfWeek + ' ' + (event.timeDisplay || event.time)
        }));

        regularServices.innerHTML = services.map(service => `
            <div class="col-md-4" data-aos="fade-up">
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${service.icon}"></i>
                    </div>
                    <h5 class="service-title">${service.title}</h5>
                    <p class="service-time">${service.time}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Los eventos especiales se cargan mediante initializePublicContent()
}

// Sistema de Escuela Dominical
function loadSundaySchool() {
    const container = document.getElementById('sundaySchoolClasses');
    if (!container) return;

    const classes = [
        {
            icon: 'fa-baby',
            title: 'Cuna',
            age: '0-2 años',
            description: 'Cuidado y enseñanza básica para los más pequeños.'
        },
        {
            icon: 'fa-child',
            title: 'Preescolar',
            age: '3-5 años',
            description: 'Enseñanzas bíblicas adaptadas para preescolares.'
        },
        {
            icon: 'fa-user-graduate',
            title: 'Primarios',
            age: '6-11 años',
            description: 'Estudios bíblicos interactivos y divertidos.'
        },
        {
            icon: 'fa-users',
            title: 'Adolescentes',
            age: '12-17 años',
            description: 'Formación espiritual y guía para jóvenes.'
        },
        {
            icon: 'fa-user-tie',
            title: 'Jóvenes',
            age: '18-25 años',
            description: 'Discipulado y preparación para el ministerio.'
        },
        {
            icon: 'fa-user-friends',
            title: 'Adultos',
            age: '26+ años',
            description: 'Estudio profundo de la Palabra de Dios.'
        }
    ];

    container.innerHTML = classes.map(cls => `
        <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${classes.indexOf(cls) * 100}">
            <div class="class-card">
                <div class="class-icon">
                    <i class="fas ${cls.icon}"></i>
                </div>
                <h5 class="class-title">${cls.title}</h5>
                <span class="class-age">${cls.age}</span>
                <p class="class-description">${cls.description}</p>
            </div>
        </div>
    `).join('');
}

// Sistema de Cultos Especiales
function loadSpecialServices() {
    const container = document.getElementById('specialServices');
    if (!container) return;

    const services = [
        {
            icon: 'fa-cross',
            title: 'Semana Santa',
            date: 'Marzo-Abril',
            description: 'Conmemoración de la pasión, muerte y resurrección de Cristo.'
        },
        {
            icon: 'fa-dove',
            title: 'Celebración de Pentecostés',
            date: 'Mayo-Junio',
            description: 'Fiesta del Espíritu Santo y su poder en la iglesia.'
        },
        {
            icon: 'fa-gift',
            title: 'Campaña de Navidad',
            date: 'Diciembre',
            description: 'Mes de celebración del nacimiento de nuestro Salvador.'
        }
    ];

    container.innerHTML = services.map(service => `
        <div class="col-md-4" data-aos="fade-up" data-aos-delay="${services.indexOf(service) * 100}">
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h5 class="service-title">${service.title}</h5>
                <p class="service-time">${service.date}</p>
                <p class="class-description">${service.description}</p>
            </div>
        </div>
    `).join('');
}

// Función para actualizar galería en páginas públicas
function updatePublicGallery() {
    if (!isContentManagerReady()) {
        console.warn('ContentManager no está disponible aún');
        return;
    }
    
    const imageGallery = document.getElementById('imageGallery');
    const videoGallery = document.getElementById('videoGallery');
    
    // Actualizar imágenes
    if (imageGallery) {
        const images = window.contentManager.content.gallery.images;
        console.log('Imágenes encontradas en ContentManager:', images);
        console.log('Número de imágenes:', images.length);
        
        if (images.length === 0) {
            imageGallery.innerHTML = '<p class="text-center text-white-50">No hay imágenes cargadas aún.</p>';
        } else {
            imageGallery.innerHTML = images.map((image, index) => {
                // Validar y limpiar URL de la imagen
                let imageUrl = image.url;
                console.log(`Procesando imagen ${index + 1}:`, image);
                console.log('URL original:', imageUrl);
                
                if (imageUrl && imageUrl.includes('data:image')) {
                    // Verificar que la URL base64 sea válida
                    if (imageUrl.length < 100 || !imageUrl.includes('base64') || !imageUrl.includes('image/')) {
                        // Usar placeholder si la URL es inválida
                        console.log('URL base64 inválida, usando placeholder para imagen:', image.id);
                        imageUrl = 'https://picsum.photos/seed/' + image.id + '/400/300.jpg';
                    } else {
                        // Usar la URL base64 directamente
                        console.log('Usando URL base64 válida para imagen:', image.id);
                    }
                } else if (!imageUrl) {
                    // Usar placeholder si no hay URL
                    imageUrl = 'https://picsum.photos/seed/' + image.id + '/400/300.jpg';
                } else if (imageUrl.startsWith('./uploads/')) {
                    // Usar la ruta del servidor directamente
                    console.log('Usando ruta de servidor:', imageUrl);
                }
                
                console.log('URL final:', imageUrl);
                
                return `
                <div class="gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}" onclick="openMediaModal('${image.title}', '${imageUrl}', 'image')">
                    <img src="${imageUrl}" alt="${image.title}" loading="lazy" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                         onload="console.log('Imagen cargada exitosamente:', this.src);">
                    <div class="gallery-item-content">
                        <h5>${image.title}</h5>
                        <p>${image.description}</p>
                        <small class="text-muted">${image.fileSize ? '(' + Math.round(image.fileSize / 1024 / 1024 * 100) / 100 + ' MB)' : ''}</small>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
    
    // Actualizar videos
    if (videoGallery) {
        const videos = window.contentManager.content.gallery.videos;
        if (videos.length === 0) {
            videoGallery.innerHTML = '<p class="text-center text-white-50">No hay videos cargados aún.</p>';
        } else {
            videoGallery.innerHTML = videos.map((video, index) => {
                // Validar y limpiar URL del video
                let videoUrl = video.url;
                let thumbnailUrl = '';
                
                // Generar miniatura SVG personalizada para cada video
                const generateVideoThumbnail = (title, id) => {
                    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
                    const color = colors[id % colors.length];
                    const svg = `
                        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="300" fill="${color}"/>
                            <circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.9)"/>
                            <polygon points="185,130 185,170 220,150" fill="${color}"/>
                            <text x="200" y="250" font-size="18" fill="#ffffff" text-anchor="middle" font-weight="bold">${title}</text>
                        </svg>
                    `;
                    return `data:image/svg+xml;base64,${btoa(svg)}`;
                };
                
                if (videoUrl && videoUrl.includes('data:video')) {
                    // Verificar que la URL base64 sea válida
                    if (videoUrl.length < 100 || !videoUrl.includes('base64') || !videoUrl.includes('video/')) {
                        // Usar miniatura SVG si la URL es inválida
                        console.log('URL base64 inválida, usando miniatura SVG para video:', video.id);
                        thumbnailUrl = generateVideoThumbnail(video.title || 'Video', index);
                        videoUrl = '#'; // No reproducir si es inválido
                    } else {
                        // Para videos base64 válidos, usar miniatura SVG
                        console.log('Usando URL base64 válida para video:', video.id);
                        thumbnailUrl = generateVideoThumbnail(video.title || 'Video', index);
                    }
                } else if (!videoUrl) {
                    // Usar miniatura SVG si no hay URL
                    thumbnailUrl = generateVideoThumbnail(video.title || 'Video', index);
                    videoUrl = '#';
                } else {
                    // Para URLs externas o de servidor, generar miniatura SVG
                    thumbnailUrl = generateVideoThumbnail(video.title || 'Video', index);
                    if (videoUrl.startsWith('./uploads/')) {
                        // Usar la ruta del servidor directamente
                        console.log('Usando ruta de video:', videoUrl);
                    }
                }
                
                return `
                <div class="gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}" onclick="openMediaModal('${video.title}', '${videoUrl}', 'video')">
                    <div class="video-thumbnail" style="background-image: url('${thumbnailUrl}'); position: relative; overflow: hidden; border-radius: 8px;">
                        <div class="video-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: background 0.3s;">
                            <div class="play-button" style="width: 60px; height: 60px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.3s;">
                                <i class="fas fa-play" style="color: #333; font-size: 20px; margin-left: 3px;"></i>
                            </div>
                        </div>
                    </div>
                    <div class="gallery-item-content">
                        <h5>${video.title}</h5>
                        <p>${video.description}</p>
                        <small class="text-muted">${video.fileSize ? '(' + Math.round(video.fileSize / 1024 / 1024 * 100) / 100 + ' MB)' : ''}</small>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
}

// Función para actualizar predicas en páginas públicas
function updatePublicPredicas() {
    if (!isContentManagerReady()) {
        console.warn('ContentManager no está disponible aún');
        return;
    }
    
    const predicasContainer = document.getElementById('predicasContainer');
    if (predicasContainer) {
        const sermons = window.contentManager.content.sermons;
        
        if (sermons.length === 0) {
            predicasContainer.innerHTML = '<p class="text-center text-white-50">No hay predicas cargadas aún.</p>';
        } else {
            predicasContainer.innerHTML = sermons.map((sermon, index) => `
                <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="predica-card">
                        <div class="predica-image">
                            ${sermon.fileUrl && sermon.fileType.startsWith('image/') ? 
                                `<img src="${sermon.fileUrl}" alt="${sermon.title}" style="width: 100%; height: 200px; object-fit: cover;">` :
                                '<i class="fas fa-bible"></i>'
                            }
                        </div>
                        <div class="predica-content">
                            <span class="predica-date">${sermon.date}</span>
                            <h5 class="predica-title">${sermon.title}</h5>
                            <p class="predica-speaker"><i class="fas fa-user me-2"></i>${sermon.speaker}</p>
                            <p class="predica-description">${sermon.description}</p>
                            <div class="predica-time">
                                <i class="fas fa-clock me-2"></i>Disponible ahora
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Función para actualizar eventos en páginas públicas
function updatePublicEvents() {
    if (!isContentManagerReady()) {
        console.warn('ContentManager no está disponible aún');
        return;
    }
    
    const eventsContainer = document.getElementById('eventsContainer');
    if (eventsContainer) {
        const events = window.contentManager.content.events;
        
        // Filtrar solo eventos especiales (no servicios regulares)
        const specialEvents = events.filter(event => !event.isRegularService);
        
        if (specialEvents.length === 0) {
            // No hay eventos especiales, mantener el contenido HTML existente
            console.log('No hay eventos especiales, manteniendo contenido HTML existente');
            return;
        }
        
        console.log('Actualizando eventos especiales:', specialEvents);
        
        // Limpiar contenido existente antes de agregar nuevos eventos
        eventsContainer.innerHTML = '';
        
        // Agregar eventos especiales
        specialEvents.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'col-md-4';
            eventCard.setAttribute('data-aos', 'fade-up');
            eventCard.setAttribute('data-aos-delay', `${index * 100}`);
            eventCard.innerHTML = `
                <div class="event-card">
                    <div class="event-image">
                        <i class="fas ${event.icon || 'fa-calendar-alt'}"></i>
                    </div>
                    <div class="event-content">
                        <span class="event-date">${event.date}</span>
                        <h5 class="event-title">${event.title}</h5>
                        <p class="event-description">${event.description}</p>
                        <div class="event-time">
                            <i class="fas fa-clock me-2"></i>${event.timeDisplay || event.time}
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar al contenedor
            eventsContainer.appendChild(eventCard);
        });
    }
}

// Función para inicializar el contenido en páginas públicas
function initializePublicContent() {
    setTimeout(() => {
        // Primero verificar y limpiar errores críticos
        detectAndFixCriticalErrors();
        
        updatePublicGallery();
        updatePublicPredicas();
        updatePublicEvents();
        
        // Limpiar URLs base64 inválidas primero
        cleanInvalidBase64URLs();
        
        // Limpiar imágenes rotas o inexistentes
        cleanBrokenImages();
        
        // Agregar videos subidos que puedan faltar
        addUploadedVideos();
        
        // Agregar imágenes existentes sin timestamps
        addExistingImages();
    }, 500);
}

// Función para detectar y corregir errores críticos
function detectAndFixCriticalErrors() {
    console.log('Detectando errores críticos...');
    
    // Detectar errores de consola relacionados con URLs inválidas
    const errorCount = window.console.error.toString().includes('ERR_INVALID_URL') ? 1 : 0;
    
    if (errorCount > 0 || !isContentManagerReady()) {
        console.log('Se detectaron errores críticos, ejecutando reparación automática...');
        emergencyResetContent();
    }
}

// Función para limpiar caché y recargar contenido
function clearCacheAndReload() {
    console.log('Limpiando caché y recargando contenido...');
    localStorage.removeItem('churchContent');
    
    // Recrear el ContentManager para forzar recarga
    if (window.contentManager) {
        window.contentManager = new ContentManager();
    }
    
    // Recargar la galería
    updatePublicGallery();
    
    console.log('Caché limpiada y contenido recargado');
}

// Función para agregar manualmente el video subido si no está en el sistema
function addUploadedVideos() {
    if (!isContentManagerReady()) {
        console.log('ContentManager no está listo, reintentando en 1 segundo...');
        setTimeout(addUploadedVideos, 1000);
        return;
    }
    
    console.log('Verificando videos subidos...');
    
    // Verificar si el video ya existe
    const existingVideos = window.contentManager.content.gallery.videos;
    console.log('Videos existentes:', existingVideos.length, existingVideos);
    
    const uploadedVideoExists = existingVideos.some(video => 
        video.url.includes('pagina}.mp4') || video.url.includes('VIDEO1.mp4')
    );
    console.log('¿Video subido ya existe?', uploadedVideoExists);
    
    if (!uploadedVideoExists) {
        console.log('Agregando video subido manualmente...');
        const uploadedVideo = {
            id: 'video_' + Date.now(),
            title: 'Testimonio de Fe',
            description: 'Seréis mis testigos en Jerusalén, en toda Judea, en Samaria, y hasta lo último de la tierra - Hechos 1:8',
            url: './uploads/videos/VIDEO1.mp4',
            date: new Date().toISOString().slice(0, 10),
            fileSize: 9153243 // bytes
        };
        
        console.log('Intentando agregar video:', uploadedVideo);
        
        try {
            window.contentManager.addVideo(uploadedVideo);
            console.log('Video subido agregado exitosamente:', uploadedVideo);
            
            // Verificar que se agregó correctamente
            const updatedVideos = window.contentManager.content.gallery.videos;
            console.log('Videos después de agregar:', updatedVideos.length, updatedVideos);
            
            // Actualizar la galería pública
            updatePublicGallery();
            
            // Si estamos en admin, actualizar también la galería del admin
            if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
                console.log('Actualizando galería del admin...');
                loadAdminGallery();
                updateContentCounts();
            }
            
        } catch (error) {
            console.error('Error al agregar video:', error);
        }
    } else {
        console.log('El video subido ya existe en la galería');
        
        // Si ya existe, asegurarse de que se muestre en el admin
        if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
            console.log('Forzando actualización de galería del admin...');
            loadAdminGallery();
        }
    }
}

// Función para escanear y agregar todas las imágenes existentes
function addExistingImages() {
    if (!isContentManagerReady()) return;
    
    console.log('Escaneando imágenes existentes...');
    
    // Lista de imágenes conocidas en la carpeta uploads/images
    const knownImages = [
        { name: '1.jpg', title: 'Fe en Acción', description: 'La fe es la certeza de lo que se espera, la convicción de lo que no se ve - Hebreos 11:1' },
        { name: '2.jpg', title: 'Oración Comunitaria', description: 'Donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos - Mateo 18:20' },
        { name: '3.jpg', title: 'Alabanza y Adoración', description: 'Cantaré al Señor toda mi vida; salmodiaré a mi Dios mientras viva - Salmos 104:33' },
        { name: '4.jpg', title: 'Familia Cristiana', description: 'Gracia y paz a vosotros de Dios nuestro Padre y del Señor Jesucristo - Filipenses 1:2' },
        { name: '5.jpg', title: 'Palabra de Dios', description: 'Tu palabra es lámpara a mis pies y lumbrera a mi camino - Salmos 119:105' },
        { name: '6.jpg', title: 'Comunión Fraternal', description: 'Amaos los unos a los otros como yo os he amado - Juan 15:12' },
        { name: '7.jpg', title: 'Misión y Servicio', description: 'Id y haced discípulos a todas las naciones - Mateo 28:19' },
        { name: '8.jpg', title: 'Esperanza y Gozo', description: 'El gozo del Señor es nuestra fortaleza - Nehemías 8:10' },
        { name: '9.jpg', title: 'Paz y Consuelo', description: 'La paz os dejo, mi paz os doy - Juan 14:27' },
        { name: '10.jpg', title: 'Gracia Divina', description: 'Por gracia sois salvos por medio de la fe - Efesios 2:8' },
        { name: '11.jpg', title: 'Amor Fraterno', description: 'Sobre todo, vístanse de amor, que es el vínculo perfecto - Colosenses 3:14' },
        { name: '12.jpg', title: 'Nueva Vida', description: 'Si alguno está en Cristo, nueva criatura es - 2 Corintios 5:17' }
    ];
    
    const existingImages = window.contentManager.content.gallery.images;
    
    knownImages.forEach(imageInfo => {
        const alreadyExists = existingImages.some(img => 
            img.url.includes(imageInfo.name) || img.title === imageInfo.title
        );
        
        if (!alreadyExists) {
            console.log('Agregando imagen existente:', imageInfo.name);
            const newImage = {
                id: 'image_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                title: imageInfo.title,
                description: imageInfo.description,
                url: `./uploads/images/${imageInfo.name}`,
                date: new Date().toISOString().slice(0, 10),
                isServerFile: true,
                folder: 'images'
            };
            
            window.contentManager.addImage(newImage);
            console.log('Imagen agregada:', newImage);
        }
    });
    
    // Actualizar la galería
    updatePublicGallery();
}

// Función para limpiar URLs base64 inválidas de forma más agresiva
function cleanInvalidBase64URLs() {
    if (!isContentManagerReady()) return;
    
    console.log('Limpiando URLs base64 inválidas de forma agresiva...');
    
    const images = window.contentManager.content.gallery.images;
    const videos = window.contentManager.content.gallery.videos;
    
    // Función para validar base64
    function isValidBase64(str) {
        try {
            if (!str || typeof str !== 'string') return false;
            
            // Verificar que sea una URL data válida
            if (!str.startsWith('data:')) return false;
            
            // Extraer la parte base64
            const parts = str.split(',');
            if (parts.length < 2) return false;
            
            const base64Data = parts[1];
            if (!base64Data || base64Data.length < 100) return false;
            
            // Verificar que solo contenga caracteres base64 válidos
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(base64Data)) return false;
            
            // Intentar decodificar para verificar
            atob(base64Data);
            return true;
        } catch (error) {
            console.error('Error al validar base64:', error);
            return false;
        }
    }
    
    // Limpiar imágenes
    images.forEach((image, index) => {
        if (image.url && image.url.startsWith('data:')) {
            if (!isValidBase64(image.url)) {
                console.log('URL base64 inválida detectada, reemplazando imagen:', image.title);
                
                // Reemplazar con una imagen SVG segura
                const safeSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#2ecc71"/><text x="50%" y="50%" font-size="20" fill="#ffffff" text-anchor="middle" dy=".3em">${image.title || 'Imagen'}</text></svg>`;
                image.url = `data:image/svg+xml;base64,${btoa(safeSvg)}`;
                
                console.log('Imagen reemplazada con URL segura');
            }
        }
    });
    
    // Limpiar videos (si tienen URLs base64)
    videos.forEach((video, index) => {
        if (video.url && video.url.startsWith('data:')) {
            if (!isValidBase64(video.url)) {
                console.log('URL base64 inválida detectada, reemplazando video:', video.title);
                
                // Para videos, usar una miniatura SVG
                const safeSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e74c3c"/><circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.9)"/><polygon points="185,130 185,170 220,150" fill="#e74c3c"/><text x="200" y="250" font-size="18" fill="#ffffff" text-anchor="middle" font-weight="bold">${video.title || 'Video'}</text></svg>`;
                video.url = `data:image/svg+xml;base64,${btoa(safeSvg)}`;
                
                console.log('Video reemplazado con URL segura');
            }
        }
    });
    
    // Guardar los cambios
    window.contentManager.saveContent();
    console.log('URLs base64 limpiadas exitosamente');
    
    // Forzar actualización de la galería
    if (typeof updatePublicGallery === 'function') {
        setTimeout(() => {
            updatePublicGallery();
        }, 100);
    }
}

// Función de emergencia para resetear contenido si hay muchos errores
function emergencyResetContent() {
    console.log('Ejecutando reset de emergencia del contenido...');
    
    // Limpiar localStorage completamente
    localStorage.removeItem('churchContent');
    
    // Recrear ContentManager
    if (window.contentManager) {
        window.contentManager = new ContentManager();
    }
    
    // Limpiar URLs inválidas y rotas
    setTimeout(() => {
        cleanInvalidBase64URLs();
        cleanBrokenImages();
        addExistingImages();
        addUploadedVideos();
    }, 200);
    
    console.log('Reset de emergencia completado');
}

// Hacer las funciones accesibles globalmente
window.emergencyResetContent = emergencyResetContent;
window.forceCleanReload = function() {
    console.log('Forzando limpieza completa del localStorage...');
    localStorage.removeItem('churchContent');
    localStorage.clear();
    location.reload();
};
window.addExistingImages = addExistingImages;
window.cleanInvalidBase64URLs = cleanInvalidBase64URLs;
window.cleanBrokenImages = cleanBrokenImages;

// Función para limpiar imágenes rotas o inexistentes
function cleanBrokenImages() {
    if (!isContentManagerReady()) return;
    
    console.log('Limpiando imágenes rotas o inexistentes...');
    
    const images = window.contentManager.content.gallery.images;
    
    // Filtrar y eliminar imágenes que no existen
    const validImages = images.filter(image => {
        // Eliminar imágenes con URLs rotas o vacías
        if (!image.url || image.url === './uploads/images/' || image.url.includes('1769118545690_vivae.jpg')) {
            console.log('Eliminando imagen rota o inexistente:', image.title || 'Sin título');
            return false;
        }
        
        // Eliminar imágenes base64 inválidas
        if (image.url && image.url.startsWith('data:') && image.url.length < 100) {
            console.log('Eliminando imagen base64 inválida:', image.title || 'Sin título');
            return false;
        }
        
        return true;
    });
    
    // Actualizar la lista de imágenes
    window.contentManager.content.gallery.images = validImages;
    
    // Guardar los cambios
    window.contentManager.saveContent();
    
    console.log('Imágenes rotas eliminadas. Imágenes válidas:', validImages.length);
    
    // Actualizar la galería
    if (typeof updatePublicGallery === 'function') {
        setTimeout(() => {
            updatePublicGallery();
        }, 100);
    }
}

// Sistema de Galería
function initializeGallery() {
    // Primero intentar cargar contenido dinámico
    if (isContentManagerReady()) {
        updatePublicGallery();
    } else {
        // Si no está listo, esperar un poco y reintentar
        setTimeout(() => {
            if (isContentManagerReady()) {
                updatePublicGallery();
            } else {
                // Cargar contenido estático como fallback
                loadStaticGallery();
            }
        }, 300);
    }
}

// Función fallback para galería estática
function loadStaticGallery() {
    const imageGallery = document.getElementById('imageGallery');
    const videoGallery = document.getElementById('videoGallery');
    
    if (imageGallery) {
        imageGallery.innerHTML = '<p class="text-center text-white-50">No hay imágenes cargadas aún.</p>';
    }
    
    if (videoGallery) {
        videoGallery.innerHTML = '<p class="text-center text-white-50">No hay videos cargados aún.</p>';
    }
}

// Sistema de Sermones
function loadSermons() {
    const container = document.getElementById('predicasContainer');
    if (!container) return;

    // Verificar si contentManager está disponible
    if (!isContentManagerReady()) {
        console.warn('ContentManager no está disponible aún');
        return;
    }

    // Usar la función de actualización dinámica
    updatePublicPredicas();
}

// Sistema de Contacto
function initializeContact() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Simular envío (en producción, esto iría a un servidor)
            showNotification('Enviando mensaje...', 'info');
            
            setTimeout(() => {
                showNotification('¡Mensaje enviado exitosamente! Te responderemos pronto.', 'success');
                contactForm.reset();
            }, 2000);
        });
    }
}

// Función para agregar imagen a la galería
function addImageToGallery(title, description, url) {
    const imageGallery = document.getElementById('imageGallery');
    
    // Verificar si el elemento existe antes de usarlo
    if (!imageGallery) {
        console.warn('Elemento imageGallery no encontrado - la imagen no se agregará a la galería');
        showNotification('No se puede agregar la imagen: galería no disponible', 'warning');
        return;
    }
    
    const newImage = document.createElement('div');
    newImage.className = 'gallery-item animate-slide-up';
    newImage.onclick = () => openMediaModal(title, url, 'image');
    newImage.innerHTML = `
        <img src="${url}" alt="${title}">
        <div class="gallery-item-content">
            <h5 class="gallery-item-title">${title}</h5>
            <p class="gallery-item-description">${description}</p>
        </div>
    `;
    imageGallery.appendChild(newImage);
}

// Función para agregar video a la galería
function addVideoToGallery(title, description, url) {
    const videoGallery = document.getElementById('videoGallery');
    
    // Verificar si el elemento existe antes de usarlo
    if (!videoGallery) {
        console.warn('Elemento videoGallery no encontrado');
        return;
    }
    
    const newVideo = document.createElement('div');
    newVideo.className = 'gallery-item animate-slide-up';
    newVideo.onclick = () => openMediaModal(title, url, 'video');
    newVideo.innerHTML = `
        <div class="video-placeholder">
            <i class="fas fa-play"></i>
        </div>
        <div class="gallery-item-content">
            <h5 class="gallery-item-title">${title}</h5>
            <p class="gallery-item-description">${description}</p>
        </div>
    `;
    videoGallery.appendChild(newVideo);
}

// Sistema de Administración
function initializeAdmin() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const uploadForm = document.getElementById('uploadForm');
    
    // Login de administrador
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('adminPassword').value;
            const remember = document.getElementById('rememberAdmin').checked;
            
            // Validar contraseña usando configuración externa
            if (validateAdminPassword(password)) {
                console.log('Contraseña correcta, iniciando proceso de login');
                
                // Guardar sesión inmediatamente
                localStorage.setItem('adminLoggedIn', 'true');
                if (remember) {
                    localStorage.setItem('adminRemember', 'true');
                }
                console.log('Sesión guardada en localStorage');
                
                // Cerrar modal primero
                const modal = bootstrap.Modal.getInstance(document.getElementById('adminLoginModal'));
                if (modal) {
                    modal.hide();
                    console.log('Modal cerrado');
                }
                
                // Mostrar notificación y redirigir
                showNotification('¡Redirigiendo al panel de administración...', 'success');
                console.log('Notificación mostrada');
                
                // Redireccionar inmediatamente
                console.log('Ejecutando redirección a admin.html');
                window.location.href = 'admin.html';
                
            } else {
                showNotification('Contraseña incorrecta', 'danger');
            }
        });
    }
    
    // Formulario de subida
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contentType = document.getElementById('contentType').value;
            const title = document.getElementById('contentTitle').value;
            const description = document.getElementById('contentDescription').value;
            const file = document.getElementById('contentFile').files[0];
            
            console.log('Intentando subir:', {
                contentType,
                title,
                description,
                fileName: file?.name,
                fileType: file?.type,
                fileSize: file?.size
            });
            
            if (!file) {
                showNotification('Por favor selecciona un archivo', 'warning');
                return;
            }
            
            // Validar tipo de archivo
            if (contentType === 'video' && !file.type.startsWith('video/')) {
                showNotification('El archivo seleccionado no es un video válido', 'danger');
                console.error('Tipo de archivo inválido para video:', file.type);
                return;
            }
            
            if (contentType === 'image' && !file.type.startsWith('image/')) {
                showNotification('El archivo seleccionado no es una imagen válida', 'danger');
                console.error('Tipo de archivo inválido para imagen:', file.type);
                return;
            }
            
            // Previsualizar archivo
            previewGalleryFile(file);
            
            // Subir a carpeta local en lugar de guardar como base64
            uploadFileToServer(file, title, description, contentType).then(itemData => {
                console.log('Archivo subido exitosamente:', itemData);
                
                // Agregar al ContentManager con la ruta del servidor
                if (contentType === 'image') {
                    window.contentManager.addImage(itemData);
                    console.log('Imagen agregada a ContentManager');
                } else if (contentType === 'video') {
                    // Agregar video sin importar en qué página estemos
                    window.contentManager.addVideo(itemData);
                    console.log('Video agregado a ContentManager:', itemData);
                }
                
                showNotification('¡Contenido subido exitosamente!', 'success');
                
                // Cerrar modal y limpiar formulario
                const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
                if (modal) modal.hide();
                document.getElementById('uploadForm').reset();
                document.getElementById('filePreview').style.display = 'none';
                
                // Actualizar lista
                loadAdminGallery();
            }).catch(error => {
                console.error('Error al subir archivo:', error);
                showNotification('Error al subir archivo: ' + error.message, 'danger');
            });
        });
    }
    
    // Cargar datos del panel de administración si estamos en admin.html
    if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
        setTimeout(() => {
            loadAdminEvents();
            loadAdminGallery();
            loadAdminPredicas();
            updateContentCounts();
        }, 500);
    }
}

// Funciones auxiliares
function showAdminLogin() {
    console.log('Intentando mostrar modal de admin login');
    const modalElement = document.getElementById('adminLoginModal');
    console.log('Modal element:', modalElement);
    
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        console.log('Modal creado:', modal);
        modal.show();
        console.log('Modal show() llamado');
    } else {
        console.error('No se encontró el modal con ID adminLoginModal');
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleBtn = passwordInput.parentElement.querySelector('button');
    
    console.log('Toggle password - Tipo actual:', passwordInput.type);
    console.log('Toggle password - Botón encontrado:', toggleBtn);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        console.log('Contraseña visible');
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        console.log('Contraseña oculta');
    }
}

function openMediaModal(title, url, type) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    
    if (type === 'image') {
        modalBody.innerHTML = `<img src="${url}" alt="${title}" class="img-fluid">`;
    } else if (type === 'video') {
        // Detectar si es una URL de YouTube o un video local
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Para YouTube, usar iframe con autoplay y mute desactivado
            const videoId = url.includes('youtu.be') ? url.split('/').pop() : url.split('v=')[1]?.split('&')[0];
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
            
            modalBody.innerHTML = `
                <div class="ratio ratio-16x9">
                    <iframe src="${embedUrl}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else {
            // Para videos locales, usar elemento video nativo con audio habilitado
            modalBody.innerHTML = `
                <div class="video-container">
                    <video controls autoplay muted class="w-100" style="max-height: 70vh;">
                        <source src="${url}" type="video/mp4">
                        <source src="${url}" type="video/webm">
                        <source src="${url}" type="video/ogg">
                        Tu navegador no soporta el elemento de video.
                    </video>
                    <div class="mt-3 text-center">
                        <button class="btn btn-outline-primary btn-sm" onclick="toggleVideoMute()">
                            <i class="fas fa-volume-up"></i> Activar Audio
                        </button>
                        <small class="text-muted d-block mt-2">Si el video no tiene audio, haz clic en "Activar Audio"</small>
                    </div>
                </div>
            `;
        }
    }
    
    const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
    modal.show();
    
    // Para videos locales, intentar activar el audio automáticamente
    if (type === 'video' && !url.includes('youtube.com') && !url.includes('youtu.be')) {
        setTimeout(() => {
            const video = modalBody.querySelector('video');
            if (video) {
                // Intentar quitar el muted después de la primera interacción
                video.addEventListener('play', function() {
                    setTimeout(() => {
                        video.muted = false;
                        console.log('Audio activado para el video');
                    }, 100);
                }, { once: true });
            }
        }, 500);
    }
}

// Función para activar/desactivar el audio del video
function toggleVideoMute() {
    const video = document.querySelector('#mediaModal video');
    if (video) {
        video.muted = !video.muted;
        const button = document.querySelector('[onclick="toggleVideoMute()"]');
        if (button) {
            if (video.muted) {
                button.innerHTML = '<i class="fas fa-volume-up"></i> Activar Audio';
            } else {
                button.innerHTML = '<i class="fas fa-volume-mute"></i> Silenciar Audio';
            }
        }
    }
}

function showUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
}

function addVideoToGallery(title, description, url) {
    const videoGallery = document.getElementById('videoGallery');
    if (!videoGallery) {
        console.warn('Elemento videoGallery no encontrado');
        return;
    }
    
    const newVideo = document.createElement('div');
    newVideo.className = 'gallery-item animate-slide-up';
    newVideo.onclick = () => openMediaModal(title, url, 'video');
    newVideo.innerHTML = `
        <div class="video-placeholder">
            <i class="fas fa-play-circle"></i>
        </div>
        <div class="gallery-item-content">
            <h5 class="gallery-item-title">${title}</h5>
            <p class="gallery-item-description">${description}</p>
        </div>
    `;
    videoGallery.appendChild(newVideo);
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">&times;</button>
    `;
    
    // Insertar al principio del body
    document.body.insertBefore(notification, document.body.firstChild);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Función para agregar imagen a la galería
function addImageToGallery(title, description, url) {
    const imageGallery = document.getElementById('imageGallery');
    
    // Verificar si el elemento existe antes de usarlo
    if (!imageGallery) {
        console.warn('Elemento imageGallery no encontrado - la imagen no se agregará a la galería');
        showNotification('No se puede agregar la imagen: galería no disponible', 'warning');
        return;
    }
    
    const newImage = document.createElement('div');
    newImage.className = 'gallery-item animate-slide-up';
    newImage.onclick = () => openMediaModal(title, url, 'image');
    newImage.innerHTML = `
        <img src="${url}" alt="${title}">
        <div class="gallery-item-content">
            <h5 class="gallery-item-title">${title}</h5>
            <p class="gallery-item-description">${description}</p>
        </div>
    `;
    imageGallery.appendChild(newImage);
}

// Verificar sesión de administrador al cargar
function checkAdminSession() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        const adminUploadTab = document.getElementById('adminUploadTab');
        const adminAccess = document.getElementById('adminAccess');
        
        if (adminUploadTab) {
            adminUploadTab.style.display = 'block';
        }
        if (adminAccess) {
            adminAccess.style.display = 'none';
        }
    }
}

// Sistema de Gestión de Contenido (para el panel de administración)
class ContentManager {
    constructor() {
        this.content = this.loadContent();
    }

    loadContent() {
        // Cargar contenido desde localStorage o archivos JSON
        const savedContent = localStorage.getItem('churchContent');
        if (savedContent) {
            try {
                const parsed = JSON.parse(savedContent);
                console.log('Contenido cargado desde localStorage:', parsed);
                return parsed;
            } catch (error) {
                console.warn('Error al parsear contenido del localStorage:', error);
                localStorage.removeItem('churchContent');
            }
        }
        
        // Intentar cargar datos desde el HTML
        const htmlContent = this.loadFromHTML();
        if (htmlContent) {
            return htmlContent;
        }
        
        // Si no hay contenido en HTML ni localStorage, usar datos por defecto
        console.log('Cargando contenido por defecto');
        return this.getDefaultContent();
    }

    loadFromHTML() {
        try {
            // Intentar cargar eventos desde el HTML
            const regularServices = document.getElementById('regularServices');
            const eventsContainer = document.getElementById('eventsContainer');
            const predicasContainer = document.getElementById('predicasContainer');
            
            const content = {
                events: [],
                sermons: [],
                gallery: { images: [], videos: [] },
                contact: {
                    address: 'Calle Principal #123, Ciudad',
                    phone: '(123) 456-7890',
                    email: 'info@casadeoracion.org'
                }
            };
            
            // Extraer eventos del HTML
            if (regularServices && regularServices.children.length > 0) {
                const serviceCards = regularServices.querySelectorAll('.service-card');
                serviceCards.forEach((card, index) => {
                    const title = card.querySelector('.service-title')?.textContent;
                    const time = card.querySelector('.service-time')?.textContent;
                    const icon = card.querySelector('.service-icon i')?.className;
                    
                    if (title && time) {
                        const [dayOfWeek, timeDisplay] = time.split(' ');
                        content.events.push({
                            id: `event_${index + 1}`,
                            title,
                            date: new Date().toISOString().slice(0, 10),
                            time: timeDisplay.replace(' AM', ':00').replace(' PM', ':00'),
                            description: `Servicio regular`,
                            icon: icon.replace('fas ', ''),
                            dayOfWeek,
                            timeDisplay
                        });
                    }
                });
            }
            
            // Extraer predicas del HTML
            if (predicasContainer && predicasContainer.children.length > 0) {
                const predicaCards = predicasContainer.querySelectorAll('.predica-card');
                predicaCards.forEach((card, index) => {
                    const title = card.querySelector('.predica-title')?.textContent;
                    const speaker = card.querySelector('.predica-speaker')?.textContent.replace(/.*?\s/, '');
                    const date = card.querySelector('.predica-date')?.textContent;
                    const description = card.querySelector('.predica-description')?.textContent;
                    
                    if (title && speaker && date) {
                        content.sermons.push({
                            id: `sermon_${index + 1}`,
                            title,
                            speaker,
                            date,
                            description,
                            audioUrl: '#',
                            videoUrl: '#'
                        });
                    }
                });
            }
            
            // Si encontramos contenido, guardarlo y retornarlo
            if (content.events.length > 0 || content.sermons.length > 0) {
                this.content = content;
                this.saveContent();
                return content;
            }
        } catch (error) {
            console.warn('Error cargando contenido desde HTML:', error);
        }
        
        return null;
    }

    getDefaultContent() {
        return {
            events: [
                {
                    id: 'event_1',
                    title: 'Servicio Dominical',
                    date: new Date().toISOString().slice(0, 10),
                    time: '10:00',
                    description: 'Servicio principal con alabanza y predicación',
                    icon: 'fa-church',
                    dayOfWeek: 'Domingo',
                    timeDisplay: '10:00 AM'
                },
                {
                    id: 'event_2',
                    title: 'Estudio Bíblico',
                    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                    time: '19:00',
                    description: 'Estudio bíblico para crecimiento espiritual',
                    icon: 'fa-praying-hands',
                    dayOfWeek: 'Miércoles',
                    timeDisplay: '7:00 PM'
                },
                {
                    id: 'event_3',
                    title: 'Oración Comunitaria',
                    date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
                    time: '18:00',
                    description: 'Reunión semanal de oración y comunión',
                    icon: 'fa-users',
                    dayOfWeek: 'Viernes',
                    timeDisplay: '6:00 PM'
                }
            ],
            gallery: {
                images: [],
                videos: []
            },
            sermons: [
                {
                    id: 'sermon_1',
                    title: 'El Poder de la Oración',
                    speaker: 'Pastor Juan Pérez',
                    date: new Date().toISOString().slice(0, 10),
                    description: 'Descubre cómo la oración puede transformar tu vida',
                    audioUrl: 'https://example.com/audio1.mp3',
                    videoUrl: 'https://www.youtube.com/watch?v=example1'
                },
                {
                    id: 'sermon_2',
                    title: 'Viviendo en Gracia',
                    speaker: 'Pastora María González',
                    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
                    description: 'Comprendiendo el maravilloso regalo de la gracia divina',
                    audioUrl: 'https://example.com/audio2.mp3',
                    videoUrl: 'https://www.youtube.com/watch?v=example2'
                },
                {
                    id: 'sermon_3',
                    title: 'La Esperanza de Salvación',
                    speaker: 'Pastor Carlos Rodríguez',
                    date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
                    description: 'La esperanza que no defrauda',
                    audioUrl: 'https://example.com/audio3.mp3',
                    videoUrl: 'https://www.youtube.com/watch?v=example3'
                }
            ],
            contact: {
                address: 'Calle Principal #123, Ciudad',
                phone: '(123) 456-7890',
                email: 'info@casadeoracion.org'
            }
        };
    }

    saveContent() {
        try {
            // Comprimir el contenido antes de guardarlo
            const compressedContent = this.compressContent(this.content);
            localStorage.setItem('churchContent', JSON.stringify(compressedContent));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                showNotification('Espacio de almacenamiento insuficiente. Intenta eliminar algunos archivos grandes.', 'danger');
                // Intentar guardar solo contenido esencial
                try {
                    const essentialContent = this.getEssentialContent();
                    localStorage.setItem('churchContent', JSON.stringify(essentialContent));
                    showNotification('Se ha guardado solo el contenido esencial debido al espacio limitado.', 'warning');
                } catch (essentialError) {
                    showNotification('Error crítico: No se pudo guardar el contenido.', 'danger');
                }
            } else {
                console.error('Error al guardar contenido:', error);
                showNotification('Error al guardar el contenido', 'danger');
            }
        }
    }
    
    compressContent(content) {
        const compressed = { ...content };
        
        // Comprimir imágenes y videos guardando solo URLs más pequeñas
        if (compressed.gallery) {
            compressed.gallery.images = compressed.gallery.images.map(img => ({
                ...img,
                url: img.url.length > 1000 ? img.url.substring(0, 1000) + '...' : img.url
            }));
            
            compressed.gallery.videos = compressed.gallery.videos.map(video => ({
                ...video,
                url: video.url.length > 1000 ? video.url.substring(0, 1000) + '...' : video.url
            }));
        }
        
        // Comprimir predicas con archivos
        if (compressed.sermons) {
            compressed.sermons = compressed.sermons.map(sermon => {
                const compressedSermon = { ...sermon };
                if (sermon.fileUrl && sermon.fileUrl.length > 1000) {
                    compressedSermon.fileUrl = sermon.fileUrl.substring(0, 1000) + '...';
                    compressedSermon.fileName = 'Archivo comprimido';
                }
                return compressedSermon;
            });
        }
        
        return compressed;
    }
    
    getEssentialContent() {
        // Devolver solo contenido esencial cuando hay poco espacio
        return {
            announcements: this.content.announcements.slice(0, 3), // Solo últimos 3 anuncios
            events: this.content.events.slice(0, 5), // Solo últimos 5 eventos
            gallery: {
                images: this.content.gallery.images.slice(0, 3), // Solo primeras 3 imágenes
                videos: this.content.gallery.videos.slice(0, 2) // Solo primeros 2 videos
            },
            sermons: this.content.sermons.slice(0, 3) // Solo primeras 3 predicas
        };
    }

    addAnnouncement(announcement) {
        announcement.id = Date.now();
        announcement.date = new Date().toLocaleDateString();
        this.content.announcements.unshift(announcement);
        this.saveContent();
        
        // Actualizar storage monitor
        if (window.storageMonitor) {
            const announcementSize = new Blob([JSON.stringify(announcement)]).size;
            window.storageMonitor.addFile(announcementSize);
        }
        
        return announcement;
    }

    addEvent(event) {
        event.id = Date.now();
        event.date = new Date().toLocaleDateString();
        this.content.events.unshift(event);
        this.saveContent();
        
        // Actualizar storage monitor
        if (window.storageMonitor) {
            const eventSize = new Blob([JSON.stringify(event)]).size;
            window.storageMonitor.addFile(eventSize);
        }
        
        return event;
    }

    addGalleryItem(item, type) {
        item.id = Date.now();
        item.date = new Date().toLocaleDateString();
        if (type === 'image') {
            this.content.gallery.images.unshift(item);
        } else {
            this.content.gallery.videos.unshift(item);
        }
        this.saveContent();
        return item;
    }

    addSermon(sermon) {
        sermon.id = Date.now();
        sermon.date = new Date().toLocaleDateString();
        this.content.sermons.unshift(sermon);
        this.saveContent();
        return sermon;
    }

    updateContactInfo(contactInfo) {
        this.content.contact = { ...this.content.contact, ...contactInfo };
        this.saveContent();
    }

    deleteItem(type, id) {
        let itemSize = 0;
        
        const findAndDelete = (array, id) => {
            const index = array.findIndex(item => item.id === id);
            if (index !== -1) {
                const item = array[index];
                itemSize = new Blob([JSON.stringify(item)]).size;
                return array.filter(item => item.id !== id);
            }
            return array;
        };
        
        switch(type) {
            case 'announcement':
                this.content.announcements = findAndDelete(this.content.announcements, id);
                break;
            case 'event':
                this.content.events = findAndDelete(this.content.events, id);
                break;
            case 'image':
                this.content.gallery.images = findAndDelete(this.content.gallery.images, id);
                break;
            case 'video':
                this.content.gallery.videos = findAndDelete(this.content.gallery.videos, id);
                break;
            case 'sermon':
                this.content.sermons = findAndDelete(this.content.sermons, id);
                break;
        }
        
        this.saveContent();
        
        // Actualizar storage monitor
        if (window.storageMonitor && itemSize > 0) {
            window.storageMonitor.removeFile(itemSize);
        }
    }

    clearGallery() {
        if (confirm('¿Estás seguro de que quieres limpiar toda la galería? Esta acción no se puede deshacer.')) {
            this.content.gallery.images = [];
            this.content.gallery.videos = [];
            this.saveContent();
            
            // Limpiar también el DOM de la galería
            const imageGallery = document.getElementById('imageGallery');
            const videoGallery = document.getElementById('videoGallery');
            
            if (imageGallery) {
                imageGallery.innerHTML = '<p class="text-center text-white-50">Galería limpiada exitosamente</p>';
            }
            if (videoGallery) {
                videoGallery.innerHTML = '<p class="text-center text-white-50">Galería limpiada exitosamente</p>';
            }
            
            showNotification('Galería limpiada exitosamente', 'success');
        }
    }

    clearAllContent() {
        if (confirm('¿Estás seguro de que quieres limpiar TODO el contenido? Esta acción eliminará anuncios, eventos, galería y predicas. No se puede deshacer.')) {
            // Confirmación adicional
            const secondConfirm = confirm('¡ADVERTENCIA! Esta es una acción destructiva. ¿Estás ABSOLUTAMENTE seguro?');
            
            if (secondConfirm) {
                // Limpiar todo el contenido
                this.content.announcements = [];
                this.content.events = [];
                this.content.gallery.images = [];
                this.content.gallery.videos = [];
                this.content.sermons = [];
                
                // Mantener solo la información de contacto
                this.saveContent();
                
                // Mostrar notificación
                showNotification('TODO el contenido ha sido eliminado exitosamente', 'success');
                
                // Actualizar todas las interfaces
                this.updateAllInterfaces();
                
                return true;
            }
        }
        return false;
    }

    updateAllInterfaces() {
        // Actualizar galerías
        const imageGallery = document.getElementById('imageGallery');
        const videoGallery = document.getElementById('videoGallery');
        
        if (imageGallery) {
            imageGallery.innerHTML = '<p class="text-center text-white-50">No hay imágenes cargadas aún.</p>';
        }
        
        if (videoGallery) {
            videoGallery.innerHTML = '<p class="text-center text-white-50">No hay videos cargados aún.</p>';
        }
        
        // Actualizar otros contenedores si existen
        const announcementsContainer = document.getElementById('featuredAnnouncements');
        const eventsContainer = document.getElementById('eventsContainer');
        const predicasContainer = document.getElementById('predicasContainer');
        
        if (announcementsContainer) {
            announcementsContainer.innerHTML = '<p class="text-center text-white-50">No hay anuncios cargados aún.</p>';
        }
        
        if (eventsContainer) {
            eventsContainer.innerHTML = '<p class="text-center text-white-50">No hay eventos cargados aún.</p>';
        }
        
        if (predicasContainer) {
            predicasContainer.innerHTML = '<p class="text-center text-white-50">No hay predicas cargadas aún.</p>';
        }
    }

    // ========== FUNCIONES CRUD ==========
    
    addEvent(eventData) {
        const newEvent = {
            id: 'event_' + Date.now(),
            ...eventData,
            createdAt: new Date().toISOString()
        };
        this.content.events.push(newEvent);
        this.saveContent();
        return newEvent;
    }
    
    updateEvent(id, eventData) {
        const index = this.content.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.content.events[index] = {
                ...this.content.events[index],
                ...eventData,
                updatedAt: new Date().toISOString()
            };
            this.saveContent();
            return this.content.events[index];
        }
        return null;
    }
    
    getEvent(id) {
        return this.content.events.find(e => e.id === id);
    }
    
    addSermon(sermonData) {
        const newSermon = {
            id: 'sermon_' + Date.now(),
            ...sermonData,
            createdAt: new Date().toISOString()
        };
        this.content.sermons.push(newSermon);
        this.saveContent();
        return newSermon;
    }
    
    updateSermon(id, sermonData) {
        const index = this.content.sermons.findIndex(s => s.id === id);
        if (index !== -1) {
            this.content.sermons[index] = {
                ...this.content.sermons[index],
                ...sermonData,
                updatedAt: new Date().toISOString()
            };
            this.saveContent();
            return this.content.sermons[index];
        }
        return null;
    }
    
    getSermon(id) {
        return this.content.sermons.find(s => s.id === id);
    }
    
    addImage(imageData) {
        const newImage = {
            id: 'image_' + Date.now(),
            ...imageData,
            date: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
        };
        this.content.gallery.images.push(newImage);
        this.saveContent();
        return newImage;
    }
    
    updateImage(id, imageData) {
        const index = this.content.gallery.images.findIndex(i => i.id === id);
        if (index !== -1) {
            this.content.gallery.images[index] = {
                ...this.content.gallery.images[index],
                ...imageData,
                updatedAt: new Date().toISOString()
            };
            this.saveContent();
            return this.content.gallery.images[index];
        }
        return null;
    }
    
    getImage(id) {
        return this.content.gallery.images.find(i => i.id === id);
    }
    
    addVideo(videoData) {
        const newVideo = {
            id: 'video_' + Date.now(),
            ...videoData,
            date: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString()
        };
        this.content.gallery.videos.push(newVideo);
        this.saveContent();
        return newVideo;
    }
    
    updateVideo(id, videoData) {
        const index = this.content.gallery.videos.findIndex(v => v.id === id);
        if (index !== -1) {
            this.content.gallery.videos[index] = {
                ...this.content.gallery.videos[index],
                ...videoData,
                updatedAt: new Date().toISOString()
            };
            this.saveContent();
            return this.content.gallery.videos[index];
        }
        return null;
    }
    
    getVideo(id) {
        return this.content.gallery.videos.find(v => v.id === id);
    }
    
    clearAllContent() {
        if (confirm('¿Estás seguro de que quieres limpiar TODO el contenido? Esta acción eliminará anuncios, eventos, galería y predicas. No se puede deshacer.')) {
            // Confirmación adicional
            const secondConfirm = confirm('¡ADVERTENCIA! Esta es una acción destructiva. ¿Estás ABSOLUTAMENTE seguro?');
            
            if (secondConfirm) {
                // Limpiar todo el contenido
                this.content.announcements = [];
                this.content.events = [];
                this.content.gallery.images = [];
                this.content.gallery.videos = [];
                this.content.sermons = [];
                
                // Mantener solo la información de contacto
                this.saveContent();
                
                // Mostrar notificación
                showNotification('TODO el contenido ha sido eliminado exitosamente', 'success');
                
                // Actualizar todas las interfaces
                this.updateAllInterfaces();
                
                return true;
            }
        }
        return false;
    }
}

// Funciones para cargar contenido en el panel de administración
function loadAdminEvents() {
    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        if (!isContentManagerReady()) {
            console.warn('ContentManager no está disponible aún');
            return;
        }
        
        // Obtener solo los eventos del ContentManager
        const events = window.contentManager.content.events;
        
        if (events.length === 0) {
            eventsList.innerHTML = '<tr><td colspan="4" class="text-center">No hay eventos cargados</td></tr>';
            return;
        }
        
        eventsList.innerHTML = events.map(event => `
            <tr>
                <td>${event.title}</td>
                <td>${event.dayOfWeek || 'N/A'} - ${event.timeDisplay || event.time}</td>
                <td>${event.description}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editEvent('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Función para extraer eventos del HTML
function getEventsFromHTML() {
    // Si estamos en admin.html, no intentar extraer del HTML
    if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
        return [];
    }
    
    // Intentar obtener desde eventos.html si no está en la página actual
    let regularServices = document.getElementById('regularServices');
    
    // Si no está en la página actual, intentar obtener desde eventos.html
    if (!regularServices) {
        // Intentar cargar eventos.html para obtener los datos
        try {
            const response = fetch('eventos.html');
            if (response.ok) {
                const html = response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                regularServices = tempDiv.querySelector('#regularServices');
            }
        } catch (error) {
            console.warn('Error cargando eventos.html:', error);
        }
    }
    
    if (!regularServices) {
        console.warn('Elemento regularServices no encontrado en ninguna página');
        return [];
    }
    
    const serviceCards = regularServices.querySelectorAll('.service-card');
    const events = [];
    
    console.log('Encontrados serviceCards:', serviceCards.length);
    
    serviceCards.forEach((card, cardIndex) => {
        const title = card.querySelector('.service-title')?.textContent;
        const time = card.querySelector('.service-time')?.textContent;
        const icon = card.querySelector('.service-icon i')?.className;
        
        console.log(`Procesando tarjeta ${cardIndex}:`, { title, time, icon });
        
        if (title && time) {
            const [dayOfWeek, timeDisplay] = time.split(' ');
            events.push({
                id: `html_event_${cardIndex + 1}`,
                title,
                date: new Date().toISOString().slice(0, 10),
                time: timeDisplay.replace(' AM', ':00').replace(' PM', ':00'),
                description: `Servicio regular`,
                icon: icon.replace('fas ', ''),
                dayOfWeek,
                timeDisplay,
                isFromHTML: true // Marcar como evento del HTML
            });
        }
    });
    
    console.log('Eventos extraídos del HTML:', events);
    return events;
}

function loadAdminGallery() {
    const galleryList = document.getElementById('galleryList');
    if (galleryList) {
        console.log('Cargando galería en admin...');
        
        if (!isContentManagerReady()) {
            console.warn('ContentManager no está disponible aún');
            galleryList.innerHTML = '<tr><td colspan="4" class="text-center">ContentManager no está disponible</td></tr>';
            return;
        }
        
        const images = window.contentManager.content.gallery.images;
        const videos = window.contentManager.content.gallery.videos;
        
        console.log('Imágenes en ContentManager:', images.length, images);
        console.log('Videos en ContentManager:', videos.length, videos);
        
        if (images.length === 0 && videos.length === 0) {
            galleryList.innerHTML = '<tr><td colspan="4" class="text-center">No hay contenido en la galería</td></tr>';
            return;
        }
        
        let content = '';
        
        images.forEach(image => {
            console.log('Procesando imagen:', image.title, image.url);
            content += `
                <tr>
                    <td><i class="fas fa-image text-primary"></i> <span style="opacity: 0; color: transparent;">Imagen</span></td>
                    <td>${image.title}</td>
                    <td>${image.date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem('image', '${image.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        videos.forEach(video => {
            console.log('Procesando video:', video.title, video.url);
            content += `
                <tr>
                    <td><i class="fas fa-video text-danger"></i> <span style="opacity: 0; color: transparent;">Video</span></td>
                    <td>${video.title}</td>
                    <td>${video.date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem('video', '${video.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        console.log('Contenido HTML generado:', content);
        galleryList.innerHTML = content;
        console.log('Galería cargada en admin exitosamente');
    } else {
        console.error('Elemento galleryList no encontrado');
    }
}

function loadAdminPredicas() {
    const predicasList = document.getElementById('predicasList');
    if (predicasList) {
        if (!isContentManagerReady()) {
            console.warn('ContentManager no está disponible aún');
            return;
        }
        
        // Obtener solo las predicas del ContentManager
        const sermons = window.contentManager.content.sermons;
        
        if (sermons.length === 0) {
            predicasList.innerHTML = '<tr><td colspan="5" class="text-center">No hay predicas cargadas</td></tr>';
            return;
        }
        
        predicasList.innerHTML = sermons.map(sermon => `
            <tr>
                <td>${sermon.title}</td>
                <td>${sermon.speaker}</td>
                <td>${sermon.date}</td>
                <td>${sermon.description}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editSermon('${sermon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSermon('${sermon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Función para extraer predicas del HTML
function getPredicasFromHTML() {
    // Si estamos en admin.html, no intentar extraer del HTML
    if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
        return [];
    }
    
    // Intentar obtener desde predicas.html si no está en la página actual
    let predicasContainer = document.getElementById('predicasContainer');
    
    // Si no está en la página actual, intentar obtener desde predicas.html
    if (!predicasContainer) {
        // Intentar cargar predicas.html para obtener los datos
        try {
            const response = fetch('predicas.html');
            if (response.ok) {
                const html = response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                predicasContainer = tempDiv.querySelector('#predicasContainer');
            }
        } catch (error) {
            console.warn('Error cargando predicas.html:', error);
        }
    }
    
    if (!predicasContainer) {
        console.warn('Elemento predicasContainer no encontrado en ninguna página');
        return [];
    }
    
    const predicaCards = predicasContainer.querySelectorAll('.predica-card');
    const predicas = [];
    
    console.log('Encontradas predicaCards:', predicaCards.length);
    
    predicaCards.forEach((card, cardIndex) => {
        const title = card.querySelector('.predica-title')?.textContent;
        const speaker = card.querySelector('.predica-speaker')?.textContent.replace(/.*?\s/, '');
        const date = card.querySelector('.predica-date')?.textContent;
        const description = card.querySelector('.predica-description')?.textContent;
        
        console.log(`Procesando predica ${cardIndex}:`, { title, speaker, date, description });
        
        if (title && speaker && date) {
            predicas.push({
                id: `html_sermon_${cardIndex + 1}`,
                title,
                speaker,
                date,
                description,
                audioUrl: '#',
                videoUrl: '#',
                isFromHTML: true // Marcar como predica del HTML
            });
        }
    });
    
    console.log('Predicas extraídas del HTML:', predicas);
    return predicas;
}

// Funciones CRUD para eventos
function editEvent(id) {
    const event = window.contentManager.content.events.find(e => e.id === id);
    if (event) {
        document.getElementById('editEventId').value = event.id;
        document.getElementById('editEventTitle').value = event.title;
        document.getElementById('editEventDate').value = event.date;
        document.getElementById('editEventTime').value = event.time;
        document.getElementById('editEventDescription').value = event.description;
        
        const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
        modal.show();
    }
}

function updateEvent() {
    const id = document.getElementById('editEventId').value;
    const title = document.getElementById('editEventTitle').value;
    const date = document.getElementById('editEventDate').value;
    const time = document.getElementById('editEventTime').value;
    const description = document.getElementById('editEventDescription').value;
    
    if (id) {
        // Actualizar evento existente
        const index = window.contentManager.content.events.findIndex(e => e.id === id);
        if (index !== -1) {
            const oldEvent = window.contentManager.content.events[index];
            const oldSize = new Blob([JSON.stringify(oldEvent)]).size;
            
            window.contentManager.content.events[index] = {
                ...oldEvent,
                title,
                date,
                time,
                description
            };
            window.contentManager.saveContent();
            
            // Actualizar storage monitor
            const newSize = new Blob([JSON.stringify(window.contentManager.content.events[index])]).size;
            if (window.storageMonitor) {
                window.storageMonitor.removeFile(oldSize);
                window.storageMonitor.addFile(newSize);
            }
            
            showNotification('Evento actualizado exitosamente', 'success');
        }
    } else {
        // Agregar nuevo evento
        const newEvent = {
            id: Date.now().toString(),
            title,
            date,
            time,
            description,
            icon: 'fa-calendar',
            dayOfWeek: 'Por definir',
            timeDisplay: time
        };
        
        window.contentManager.addEvent(newEvent);
        showNotification('Evento agregado exitosamente', 'success');
    }
    
    loadAdminEvents();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
    modal.hide();
}

function deleteEvent(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
        // Usar el método del ContentManager para eliminar
        window.contentManager.deleteItem('event', id);
        showNotification('Evento eliminado exitosamente', 'success');
        loadAdminEvents();
    }
}

// Funciones CRUD para anuncios
function editAnnouncement(id) {
    const announcement = window.contentManager.content.announcements.find(a => a.id === id);
    if (announcement) {
        document.getElementById('editAnnouncementId').value = announcement.id;
        document.getElementById('editAnnouncementTitle').value = announcement.title;
        document.getElementById('editAnnouncementContent').value = announcement.content;
        
        const modal = new bootstrap.Modal(document.getElementById('editAnnouncementModal'));
        modal.show();
    }
}

function updateAnnouncement() {
    const id = document.getElementById('editAnnouncementId').value;
    const title = document.getElementById('editAnnouncementTitle').value;
    const content = document.getElementById('editAnnouncementContent').value;
    
    const index = window.contentManager.content.announcements.findIndex(a => a.id === id);
    if (index !== -1) {
        window.contentManager.content.announcements[index] = {
            ...window.contentManager.content.announcements[index],
            title,
            content
        };
        window.contentManager.saveContent();
    }
    
    showNotification('Anuncio actualizado exitosamente', 'success');
    loadAdminAnnouncements();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
    modal.hide();
}

function deleteAnnouncement(id) {
    console.log('Intentando eliminar anuncio con ID:', id);
    
    if (confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
        try {
            // Verificar que ContentManager esté disponible
            if (!window.contentManager) {
                console.error('ContentManager no está disponible');
                showNotification('Error: ContentManager no disponible', 'danger');
                return;
            }
            
            console.log('Eliminando anuncio...');
            window.contentManager.deleteItem('announcement', id);
            console.log('Anuncio eliminado, actualizando lista...');
            
            showNotification('Anuncio eliminado exitosamente', 'success');
            
            // Esperar un momento antes de recargar la lista
            setTimeout(() => {
                loadAdminAnnouncements();
            }, 500);
            
        } catch (error) {
            console.error('Error al eliminar anuncio:', error);
            showNotification('Error al eliminar anuncio', 'danger');
        }
    }
}

// Funciones CRUD para galería
function deleteGalleryItem(type, id) {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento de la galería?')) {
        window.contentManager.deleteItem(type, id);
        showNotification('Elemento eliminado exitosamente', 'success');
        loadAdminGallery();
    }
}

// Función para guardar/agregar predica
function saveSermon() {
    const id = document.getElementById('editSermonId').value;
    const title = document.getElementById('editSermonTitle').value;
    const speaker = document.getElementById('editSermonSpeaker').value;
    const date = document.getElementById('editSermonDate').value;
    const description = document.getElementById('editSermonDescription').value;
    const reference = document.getElementById('editSermonReference').value;
    const link = document.getElementById('editSermonLink').value;
    
    if (id) {
        // Actualizar predica existente
        const index = window.contentManager.content.sermons.findIndex(s => s.id === id);
        if (index !== -1) {
            window.contentManager.content.sermons[index] = {
                ...window.contentManager.content.sermons[index],
                title,
                speaker,
                date,
                description,
                reference,
                audioUrl: link,
                videoUrl: link
            };
            window.contentManager.saveContent();
        }
        showNotification('Predica actualizada exitosamente', 'success');
    } else {
        // Agregar nueva predica
        window.contentManager.addSermon({
            title,
            speaker,
            date,
            description,
            reference,
            audioUrl: link,
            videoUrl: link
        });
        showNotification('Predica agregada exitosamente', 'success');
    }
    
    loadAdminPredicas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editSermonModal'));
    modal.hide();
}

function editSermon(id) {
    const sermon = window.contentManager.content.sermons.find(s => s.id === id);
    if (sermon) {
        document.getElementById('editSermonId').value = sermon.id;
        document.getElementById('editSermonTitle').value = sermon.title;
        document.getElementById('editSermonSpeaker').value = sermon.speaker;
        document.getElementById('editSermonDate').value = sermon.date;
        document.getElementById('editSermonDescription').value = sermon.description;
        document.getElementById('editSermonReference').value = sermon.reference || '';
        document.getElementById('editSermonLink').value = sermon.audioUrl || sermon.videoUrl || '';
        
        const modal = new bootstrap.Modal(document.getElementById('editSermonModal'));
        modal.show();
    }
}

function deleteSermon(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta predica?')) {
        window.contentManager.deleteItem('sermon', id);
        showNotification('Predica eliminada exitosamente', 'success');
        loadAdminPredicas();
    }
}

// Funciones para mostrar modales de agregar
function showAddEventModal() {
    // Verificar que los elementos existan antes de intentar acceder
    const editEventId = document.getElementById('editEventId');
    const editEventTitle = document.getElementById('editEventTitle');
    const editEventDate = document.getElementById('editEventDate');
    const editEventTime = document.getElementById('editEventTime');
    const editEventDescription = document.getElementById('editEventDescription');
    
    if (editEventId) editEventId.value = '';
    if (editEventTitle) editEventTitle.value = '';
    if (editEventDate) editEventDate.value = '';
    if (editEventTime) editEventTime.value = '';
    if (editEventDescription) editEventDescription.value = '';
    
    // Resetear el formulario de hora
    const hourSelect = document.getElementById('editEventHour');
    const minuteSelect = document.getElementById('editEventMinute');
    const periodSelect = document.getElementById('editEventPeriod');
    if (hourSelect) hourSelect.value = '';
    if (minuteSelect) minuteSelect.value = '';
    if (periodSelect) periodSelect.value = '';
    
    const modalElement = document.getElementById('editEventModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Inicializar el formulario después de mostrar el modal
        setTimeout(initializeEventForm, 100);
    }
}

// Función para manejar el cambio de formato de hora
function toggleTimeFormat() {
    const is12Hour = document.getElementById('editEvent12Hour')?.checked;
    const periodSelect = document.getElementById('editEventPeriod');
    const periodLabel = periodSelect?.previousElementSibling;
    
    if (periodSelect) {
        if (is12Hour) {
            // Mostrar selector AM/PM
            periodSelect.style.display = 'block';
            if (periodLabel) periodLabel.style.display = 'block';
        } else {
            // Ocultar selector AM/PM
            periodSelect.style.display = 'none';
            if (periodLabel) periodLabel.style.display = 'none';
        }
    }
}

// Función para inicializar el formulario de eventos
function initializeEventForm() {
    // Agregar event listeners para los radio buttons
    const radio12 = document.getElementById('editEvent12Hour');
    const radio24 = document.getElementById('editEvent24Hour');
    
    if (radio12) {
        radio12.addEventListener('change', toggleTimeFormat);
    }
    if (radio24) {
        radio24.addEventListener('change', toggleTimeFormat);
    }
    
    // Inicializar el estado
    toggleTimeFormat();
}

// Función para guardar/agregar evento
function saveEvent() {
    // Verificar que los elementos existan antes de intentar acceder
    const idElement = document.getElementById('editEventId');
    const titleElement = document.getElementById('editEventTitle');
    const dateElement = document.getElementById('editEventDate');
    const hourElement = document.getElementById('editEventHour');
    const minuteElement = document.getElementById('editEventMinute');
    const descriptionElement = document.getElementById('editEventDescription');
    
    const id = idElement ? idElement.value : '';
    const title = titleElement ? titleElement.value : '';
    const date = dateElement ? dateElement.value : '';
    const description = descriptionElement ? descriptionElement.value : '';
    
    // Construir la hora correctamente
    let time = '';
    if (hourElement && minuteElement) {
        const hour = hourElement.value;
        const minute = minuteElement.value;
        const is12Hour = document.getElementById('editEvent12Hour')?.checked;
        
        if (is12Hour) {
            // Formato 12 horas con AM/PM
            const periodElement = document.getElementById('editEventPeriod');
            const period = periodElement ? periodElement.value : 'AM';
            time = `${hour}:${minute} ${period}`;
        } else {
            // Formato 24 horas
            // Convertir 12 horas a 24 horas si es necesario
            let hour24 = parseInt(hour);
            const periodElement = document.getElementById('editEventPeriod');
            const period = periodElement ? periodElement.value : 'AM';
            
            if (period === 'PM' && hour24 < 12) {
                hour24 += 12;
            } else if (period === 'AM' && hour24 === 12) {
                hour24 = 0;
            }
            
            time = `${hour24.toString().padStart(2, '0')}:${minute}`;
        }
    }
    
    if (!title || !date) {
        showNotification('Por favor completa el título y la fecha del evento', 'warning');
        return;
    }
    
    if (id) {
        // Actualizar evento existente
        window.contentManager.updateEvent(id, {
            title,
            date,
            time,
            description,
            icon: 'fa-calendar',
            dayOfWeek: 'Por definir',
            timeDisplay: time
        });
        showNotification('Evento actualizado exitosamente', 'success');
    } else {
        // Agregar nuevo evento (como evento especial, no servicio regular)
        window.contentManager.addEvent({
            title,
            date,
            time,
            description,
            icon: 'fa-calendar',
            dayOfWeek: 'Por definir',
            timeDisplay: time,
            isRegularService: false // Marcar como evento especial
        });
        showNotification('Evento agregado exitosamente', 'success');
    }
    
    loadAdminEvents();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
    if (modal) modal.hide();
}

// Función para guardar/agregar anuncio
function saveAnnouncement() {
    const id = document.getElementById('editAnnouncementId').value;
    const title = document.getElementById('editAnnouncementTitle').value;
    const content = document.getElementById('editAnnouncementContent').value;
    
    if (id) {
        // Actualizar anuncio existente
        const index = window.contentManager.content.announcements.findIndex(a => a.id === id);
        if (index !== -1) {
            window.contentManager.content.announcements[index] = {
                ...window.contentManager.content.announcements[index],
                title,
                content
            };
            window.contentManager.saveContent();
        }
        showNotification('Anuncio actualizado exitosamente', 'success');
    } else {
        // Agregar nuevo anuncio
        window.contentManager.addAnnouncement({
            title,
            content,
            priority: 'medium'
        });
        showNotification('Anuncio agregado exitosamente', 'success');
    }
    
    loadAdminAnnouncements();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
    modal.hide();
}

function showUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
}

// Función para forzar la recarga de la galería en el admin
function forceReloadAdminGallery() {
    console.log('Forzando recarga de galería en admin...');
    
    // Limpiar caché
    if (window.contentManager) {
        window.contentManager.loadContent();
    }
    
    // Recargar galería del admin
    loadAdminGallery();
    
    // Actualizar contadores
    updateContentCounts();
    
    console.log('Recarga forzada completada');
}

// Hacer la función accesible globalmente
window.forceReloadAdminGallery = forceReloadAdminGallery;

// Funciones de utilidad para el admin
function refreshContentList() {
    loadAdminEvents();
    loadAdminGallery();
    loadAdminPredicas();
    updateContentCounts();
    showNotification('Contenido actualizado', 'success');
}

function updateContentCounts() {
    if (!isContentManagerReady()) {
        console.warn('ContentManager no está disponible aún');
        return;
    }
    
    const eventsCount = window.contentManager.content.events.length;
    const imagesCount = window.contentManager.content.gallery.images.length;
    const videosCount = window.contentManager.content.gallery.videos.length;
    const predicasCount = window.contentManager.content.sermons.length;
    
    const eventsCountEl = document.getElementById('eventsCount');
    const galleryCountEl = document.getElementById('galleryCount');
    const videosCountEl = document.getElementById('videosCount');
    const predicasCountEl = document.getElementById('predicasCount');
    
    if (eventsCountEl) eventsCountEl.textContent = eventsCount;
    if (galleryCountEl) galleryCountEl.textContent = imagesCount;
    if (videosCountEl) videosCountEl.textContent = videosCount;
    if (predicasCountEl) predicasCountEl.textContent = predicasCount;
}

function clearAllContent() {
    if (window.contentManager.clearAllContent()) {
        refreshContentList();
    }
}

// Funciones para el panel de administración
window.adminFunctions = {
    showContentManager: function() {
        // Mostrar interfaz de gestión de contenido
        console.log('Content Manager:', window.contentManager.content);
    },
    
    exportContent: function() {
        // Exportar contenido a JSON
        const dataStr = JSON.stringify(window.contentManager.content, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'church_content_' + new Date().toISOString().slice(0,10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    importContent: function(file) {
        // Importar contenido desde archivo JSON
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedContent = JSON.parse(e.target.result);
                window.contentManager.content = importedContent;
                window.contentManager.saveContent();
                showNotification('Contenido importado exitosamente', 'success');
                location.reload();
            } catch (error) {
                showNotification('Error al importar contenido', 'danger');
            }
        };
        reader.readAsText(file);
    }
};

// Función para previsualizar archivos de predica
function previewSermonFile(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('predicaFilePreview');
    const previewImage = document.getElementById('predicaPreviewImage');
    const previewVideo = document.getElementById('predicaPreviewVideo');
    const previewAudio = document.getElementById('predicaPreviewAudio');
    const fileInfo = document.getElementById('predicaFileInfo');
    
    if (!file) {
        preview.style.display = 'none';
        return;
    }
    
    console.log('Previsualizando archivo de predica:', file.name, file.type);
    
    // Mostrar información del archivo
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    fileInfo.textContent = `Nombre: ${file.name} | Tamaño: ${fileSize} MB | Tipo: ${file.type}`;
    
    // Ocultar todas las previsualizaciones
    previewImage.style.display = 'none';
    previewVideo.style.display = 'none';
    previewAudio.style.display = 'none';
    
    if (file.type.startsWith('image/')) {
        // Previsualizar imagen
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        // Previsualizar video
        const reader = new FileReader();
        reader.onload = function(e) {
            previewVideo.src = e.target.result;
            previewVideo.style.display = 'block';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
        // Previsualizar audio
        const reader = new FileReader();
        reader.onload = function(e) {
            previewAudio.src = e.target.result;
            previewAudio.style.display = 'block';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        // Archivo no soportado para previsualización
        fileInfo.textContent += ' | ⚠️ No se puede previsualizar este tipo de archivo';
        preview.style.display = 'block';
    }
}

// Función para guardar predica desde el modal
function saveSermonFromModal() {
    const title = document.getElementById('newSermonTitle').value;
    const speaker = document.getElementById('newSermonSpeaker').value;
    const date = document.getElementById('newSermonDate').value;
    const description = document.getElementById('newSermonDescription').value;
    const reference = document.getElementById('newSermonReference').value;
    const link = document.getElementById('newSermonLink').value;
    const file = document.getElementById('newSermonFile').files[0];
    
    if (!title || !speaker || !date) {
        showNotification('Por favor completa el título, predicador y fecha', 'warning');
        return;
    }
    
    const sermonData = {
        title,
        speaker,
        date,
        description,
        reference,
        audioUrl: link,
        videoUrl: link
    };
    
    // Si hay un archivo, procesarlo
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            sermonData.fileUrl = e.target.result;
            sermonData.fileName = file.name;
            sermonData.fileType = file.type;
            
            window.contentManager.addSermon(sermonData);
            showNotification('Predica agregada exitosamente', 'success');
            
            // Cerrar modal y limpiar formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSermonModal'));
            if (modal) modal.hide();
            document.getElementById('addSermonForm').reset();
            
            // Actualizar lista
            loadAdminPredicas();
        };
        reader.readAsDataURL(file);
    } else {
        // Sin archivo, guardar directamente
        window.contentManager.addSermon(sermonData);
        showNotification('Predica agregada exitosamente', 'success');
        
        // Cerrar modal y limpiar formulario
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSermonModal'));
        if (modal) modal.hide();
        document.getElementById('addSermonForm').reset();
        
        // Actualizar lista
        loadAdminPredicas();
    }
}

// Función para manejar la subida de archivos desde el modal de upload
function handleFileUpload() {
    const contentType = document.getElementById('contentType').value;
    const title = document.getElementById('contentTitle').value;
    const description = document.getElementById('contentDescription').value;
    const file = document.getElementById('contentFile').files[0];
    
    if (!contentType || !title || !file) {
        showNotification('Por favor completa el tipo, título y selecciona un archivo', 'warning');
        return;
    }
    
    // Verificar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showNotification('El archivo es demasiado grande. Máximo permitido: 5MB', 'danger');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const result = e.target.result;
            
            // Validar que el resultado sea una URL válida
            if (!result || result.length < 100) {
                showNotification('Error al procesar el archivo', 'danger');
                return;
            }
            
            const itemData = {
                title,
                description,
                url: result,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadDate: new Date().toISOString()
            };
            
            if (contentType === 'image') {
                window.contentManager.addImage(itemData);
            } else if (contentType === 'video') {
                window.contentManager.addVideo(itemData);
            }
            
            showNotification('Contenido subido exitosamente', 'success');
            
            // Cerrar modal y limpiar formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
            if (modal) modal.hide();
            document.getElementById('uploadForm').reset();
            document.getElementById('filePreview').style.display = 'none';
            
            // Actualizar lista
            loadAdminGallery();
            
        } catch (error) {
            console.error('Error al procesar archivo:', error);
            showNotification('Error al procesar el archivo', 'danger');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error al leer el archivo', 'danger');
    };
    
    reader.readAsDataURL(file);
}

// Función para mostrar el modal de agregar predica
function showAddSermonModal() {
    document.getElementById('newSermonTitle').value = '';
    document.getElementById('newSermonSpeaker').value = '';
    document.getElementById('newSermonDate').value = '';
    document.getElementById('newSermonDescription').value = '';
    document.getElementById('newSermonReference').value = '';
    document.getElementById('newSermonLink').value = '';
    document.getElementById('newSermonFile').value = '';
    document.getElementById('predicaFilePreview').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('addSermonModal'));
    modal.show();
}

// Detectar tipo de página y inicializar contenido correspondiente
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que todo esté cargado
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        console.log('Página actual:', currentFile);
        
        // Inicializar contenido según la página
        if (currentFile === 'galeria.html') {
            console.log('Inicializando galería...');
            initializePublicContent();
        } else if (currentFile === 'predicas.html') {
            console.log('Inicializando predicas...');
            initializePublicContent();
        } else if (currentFile === 'eventos.html') {
            console.log('Inicializando eventos...');
            loadEvents(); // Cargar eventos específicos para esta página
            initializePublicContent(); // También inicializar anuncios y galería
        } else if (currentFile === 'index.html' || currentFile === '') {
            console.log('Inicializando página principal...');
            initializePublicContent();
        }
    }, 1000);
});

// Función para previsualizar archivos de galería
function previewGalleryFile(file) {
    const preview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    const fileInfo = document.getElementById('fileInfo');
    
    if (!file) {
        preview.style.display = 'none';
        return;
    }
    
    console.log('Previsualizando archivo de galería:', file.name, file.type);
    
    // Mostrar información del archivo
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    fileInfo.textContent = `Nombre: ${file.name} | Tamaño: ${fileSize} MB | Tipo: ${file.type}`;
    
    // Ocultar todas las previsualizaciones
    previewImage.style.display = 'none';
    previewVideo.style.display = 'none';
    
    if (file.type.startsWith('image/')) {
        // Previsualizar imagen
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        // Previsualizar video
        const reader = new FileReader();
        reader.onload = function(e) {
            previewVideo.src = e.target.result;
            previewVideo.style.display = 'block';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        // Archivo no soportado para previsualización
        fileInfo.textContent += ' | ⚠️ No se puede previsualizar este tipo de archivo';
    }
}

// Función para subir archivos a carpetas específicas
function uploadFileToServer(file, title, description, type) {
    // Crear FormData para subir al servidor
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    
    // Simular subida al servidor (en un caso real, esto sería fetch a un endpoint)
    return new Promise((resolve, reject) => {
        // Simular respuesta del servidor
        setTimeout(() => {
            // Generar nombre de archivo único (con timestamp para evitar conflictos)
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${timestamp}_${file.name}`;
            
            // También guardar el nombre original para referencia
            const originalFileName = file.name;
            
            // Definir ruta según el tipo de archivo
            let serverPath;
            if (type === 'image') {
                serverPath = `./uploads/images/${fileName}`;
            } else if (type === 'video') {
                serverPath = `./uploads/videos/${fileName}`;
            } else {
                serverPath = `./uploads/${fileName}`;
            }
            
            console.log('Archivo subido a:', serverPath);
            console.log('Nombre original:', originalFileName);
            
            // Guardar la ruta en lugar del base64
            const itemData = {
                title,
                description,
                fileName: fileName,
                originalFileName: originalFileName, // Guardar nombre original
                fileType: file.type,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                // Usar ruta del servidor en lugar de base64
                url: serverPath,
                isServerFile: true,
                folder: type === 'image' ? 'images' : type === 'video' ? 'videos' : 'general'
            };
            
            resolve(itemData);
        }, 1000);
    });
}

// Función para inicializar el formulario de subida
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFileUpload();
        });
    }
    
    // Configurar el formulario de predica
    const addSermonForm = document.getElementById('addSermonForm');
    if (addSermonForm) {
        addSermonForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSermonFromModal();
        });
    }
    
    // Inicializar formulario de eventos si estamos en admin.html
    if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
        setTimeout(initializeEventForm, 500);
    }
});

// Inicialización final
console.log('Sistema de Casa de Oración inicializado correctamente');
console.log('Content Manager disponible en: window.contentManager');
console.log('Funciones de administración disponibles en: window.adminFunctions');
