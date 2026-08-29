// Galería Nueva - Casa de Oración
console.log('Galería Nueva - Iniciando...');

let todasLasImagenes = [];
let imagenesFiltradas = [];
let paginaActual = 0;
const imagenesPorPagina = 6;
const cacheBuster = () => '?v=' + Date.now();
const mesesOrden = {
    'Enero': 1,
    'Febrero': 2,
    'Marzo': 3,
    'Abril': 4,
    'Mayo': 5,
    'Junio': 6,
    'Julio': 7,
    'Agosto': 8,
    'Septiembre': 9,
    'Octubre': 10,
    'Noviembre': 11,
    'Diciembre': 12
};

function ordenarPorReciente(a, b) {
    const anioA = Number(a?.año ?? 0);
    const anioB = Number(b?.año ?? 0);

    if (anioB !== anioA) {
        return anioB - anioA;
    }

    const mesA = mesesOrden[a?.mes] ?? 0;
    const mesB = mesesOrden[b?.mes] ?? 0;

    if (mesB !== mesA) {
        return mesB - mesA;
    }

    const fechaA = a?.fechaAgregado ? new Date(a.fechaAgregado).getTime() : 0;
    const fechaB = b?.fechaAgregado ? new Date(b.fechaAgregado).getTime() : 0;

    if (fechaB !== fechaA) {
        return fechaB - fechaA;
    }

    return (Number(b?.id ?? 0)) - (Number(a?.id ?? 0));
}

function ordenarContenido(items) {
    return [...items].sort(ordenarPorReciente);
}

// Cargar datos desde JSON
async function cargarImagenes() {
    try {
        const timestamp = Date.now();
        const response = await fetch(`galeria.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Filtrar solo imágenes y ordenarlas por contenido más reciente primero
        todasLasImagenes = ordenarContenido(data.imagenes.filter(item => item.tipo === 'imagen'));
        imagenesFiltradas = [...todasLasImagenes];
        
        console.log('Imágenes cargadas:', todasLasImagenes.length);
        
        renderizarGaleria();
        
        return true;
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        return false;
    }
}

// Renderizar galería
function renderizarGaleria() {
    console.log('=== RENDERIZANDO GALERÍA ===');
    const container = document.getElementById('galeria-container');
    const btnCargarMas = document.getElementById('btn-cargar-mas-imagenes');
    
    if (!container) {
        console.error('ERROR: No se encontró el contenedor');
        return;
    }
    
    if (imagenesFiltradas.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay imágenes para mostrar</p></div>';
        if (btnCargarMas) btnCargarMas.style.display = 'none';
        return;
    }
    
    // Calcular imágenes a mostrar
    const inicio = paginaActual * imagenesPorPagina;
    const fin = inicio + imagenesPorPagina;
    const imagenesMostrar = imagenesFiltradas.slice(inicio, fin);
    
    // Generar HTML
    let html = '';
    imagenesMostrar.forEach((imagen, index) => {
        html += `
            <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow">
                    <img src="${imagen.src}" alt="${imagen.alt}" onclick="verImagen('${imagen.src}', '${imagen.title}', '${imagen.description}')" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${imagen.title}</h5>
                        <p class="card-text">${imagen.description}</p>
                        <small class="text-muted">${imagen.mes} ${imagen.año}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Si es la primera página, reemplazar todo el contenido
    if (paginaActual === 0) {
        container.innerHTML = html;
    } else {
        container.innerHTML += html;
    }
    
    // Mostrar/ocultar botón de cargar más
    const totalMostradas = (paginaActual + 1) * imagenesPorPagina;
    if (btnCargarMas) {
        if (totalMostradas < imagenesFiltradas.length) {
            btnCargarMas.style.display = 'inline-block';
            btnCargarMas.textContent = `Cargar más (${imagenesFiltradas.length - totalMostradas} imágenes restantes)`;
        } else {
            btnCargarMas.style.display = 'none';
        }
    }
    
    // Inicializar AOS para las nuevas imágenes
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('Galería renderizada exitosamente');
}

// Cargar más imágenes
function cargarMas() {
    paginaActual++;
    renderizarGaleria();
}

// Ver imagen en modal
function verImagen(src, title, description) {
    const modal = new bootstrap.Modal(document.getElementById('imagenModal'));
    document.getElementById('modal-imagen').src = src;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-descripcion').textContent = description;
    modal.show();
}

// Inicialización automática cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando galería...');
    
    // Cargar imágenes automáticamente
    cargarImagenes().then(success => {
        if (success) {
            console.log('Galería inicializada exitosamente');
        } else {
            console.error('Error inicializando galería');
        }
    });
    
    // Agregar evento al botón de cargar más solo si existe
    const btnCargarMas = document.getElementById('btn-cargar-mas-imagenes');
    if (btnCargarMas) {
        btnCargarMas.addEventListener('click', cargarMas);
    }
    
    // Agregar eventos a los botones de navegación
    const btnImagenes = document.getElementById('btn-imagenes');
    const btnVideos = document.getElementById('btn-videos');
    
    if (btnImagenes) {
        btnImagenes.addEventListener('click', function() {
            mostrarSeccion('imagenes');
        });
    }
    
    if (btnVideos) {
        btnVideos.addEventListener('click', function() {
            mostrarSeccion('videos');
        });
    }
    
    console.log('Galería inicializada correctamente');
});

// Función para cambiar entre secciones
function mostrarSeccion(seccion) {
    console.log(`=== CAMBIANDO A SECCIÓN: ${seccion} ===`);
    
    const seccionImagenes = document.getElementById('seccion-imagenes');
    const seccionVideos = document.getElementById('seccion-videos');
    const btnImagenes = document.getElementById('btn-imagenes');
    const btnVideos = document.getElementById('btn-videos');
    
    console.log('1. Elementos encontrados:');
    console.log('   - seccion-imagenes:', seccionImagenes);
    console.log('   - seccion-videos:', seccionVideos);
    console.log('   - btn-imagenes:', btnImagenes);
    console.log('   - btn-videos:', btnVideos);
    
    // Ocultar ambas secciones
    if (seccionImagenes) {
        seccionImagenes.classList.remove('seccion-activa');
        seccionImagenes.classList.add('seccion-inactiva');
        console.log('2. Ocultando sección imágenes');
    }
    if (seccionVideos) {
        seccionVideos.classList.remove('seccion-activa');
        seccionVideos.classList.add('seccion-inactiva');
        console.log('3. Ocultando sección videos');
    }
    
    // Desactivar ambos botones
    if (btnImagenes) {
        btnImagenes.classList.remove('btn-primary');
        btnImagenes.classList.add('btn-secondary');
        console.log('4. Desactivando botón imágenes');
    }
    if (btnVideos) {
        btnVideos.classList.remove('btn-primary');
        btnVideos.classList.add('btn-secondary');
        console.log('5. Desactivando botón videos');
    }
    
    // Mostrar sección seleccionada y activar botón correspondiente
    if (seccion === 'imagenes') {
        console.log('6. Mostrando sección imágenes');
        if (seccionImagenes) {
            seccionImagenes.classList.remove('seccion-inactiva');
            seccionImagenes.classList.add('seccion-activa');
            console.log('7. Sección imágenes activada');
        }
        if (btnImagenes) {
            btnImagenes.classList.remove('btn-secondary');
            btnImagenes.classList.add('btn-primary');
            console.log('8. Botón imágenes activado');
        }
    } else if (seccion === 'videos') {
        console.log('6. Mostrando sección videos');
        if (seccionVideos) {
            seccionVideos.classList.remove('seccion-inactiva');
            seccionVideos.classList.add('seccion-activa');
            console.log('7. Sección videos activada');
        }
        if (btnVideos) {
            btnVideos.classList.remove('btn-secondary');
            btnVideos.classList.add('btn-primary');
            console.log('8. Botón videos activado');
        }
        // Cargar videos
        console.log('9. Llamando a cargarVideos()');
        cargarVideos();
    }
    
    console.log('=== CAMBIO DE SECCIÓN COMPLETADO ===');
}

// Cargar videos desde JSON
async function cargarVideos() {
    try {
        console.log('=== CARGANDO VIDEOS ===');
        const timestamp = Date.now();
        const response = await fetch(`galeria.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Filtrar solo videos y ordenarlos por contenido más reciente primero
        const videos = ordenarContenido(data.imagenes.filter(item => item.tipo === 'video'));
        console.log('Videos encontrados:', videos.length);
        
        // Renderizar videos
        renderizarVideos(videos);
        
        return true;
    } catch (error) {
        console.error('Error cargando videos:', error);
        return false;
    }
}

// Renderizar videos
function renderizarVideos(videos) {
    console.log('=== RENDERIZANDO VIDEOS ===');
    const container = document.getElementById('videos-container');
    
    console.log('1. Container videos encontrado:', container);
    console.log('2. Total videos a renderizar:', videos.length);
    
    if (!container) {
        console.error('ERROR: No se encontró el contenedor de videos');
        return;
    }
    
    if (videos.length === 0) {
        console.log('3. No hay videos para mostrar');
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay videos disponibles</p></div>';
        return;
    }
    
    let html = '';
    videos.forEach((video, index) => {
        console.log(`4. Procesando video ${index + 1}:`, video);
        
        const videoHtml = `
            <div class="col-lg-4 col-md-6 mb-4 gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow video-card">
                    <div class="video-container">
                        <video controls class="video-player w-100" preload="metadata">
                            <source src="${video.src}" type="video/mp4">
                            Tu navegador no soporta videos.
                        </video>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${video.title}</h5>
                        <p class="card-text">${video.description}</p>
                        <small class="text-muted">${video.mes} ${video.año}</small>
                    </div>
                </div>
            </div>
        `;
        
        html += videoHtml;
    });
    
    console.log('5. Insertando HTML en container');
    container.innerHTML = html;
    
    // Forzar visibilidad con múltiples métodos
    const sectionVideos = document.getElementById('seccion-videos');
    if (sectionVideos) {
        console.log('6. Forzando visibilidad de sección videos');
        sectionVideos.classList.remove('seccion-inactiva');
        sectionVideos.classList.add('seccion-activa');
        
        // **CRÍTICO: Forzar estilos inline para sobreescribir CSS**
        sectionVideos.style.setProperty('display', 'block', 'important');
        sectionVideos.style.setProperty('visibility', 'visible', 'important');
        sectionVideos.style.setProperty('opacity', '1', 'important');
        sectionVideos.style.setProperty('position', 'relative', 'important');
        sectionVideos.style.setProperty('z-index', '1', 'important');
        
        console.log('7. Estado final de sección videos:');
        console.log('   - display:', sectionVideos.style.display);
        console.log('   - visibility:', sectionVideos.style.visibility);
        console.log('   - opacity:', sectionVideos.style.opacity);
        console.log('   - classes:', sectionVideos.className);
        console.log('   - computed style:', window.getComputedStyle(sectionVideos).display);
    }
    
    // También forzar el container
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    
    console.log('8. Videos renderizados exitosamente');
    
    // Inicializar AOS para los nuevos videos
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
}
