// Variables globales
let todasLasImagenes = [];
let imagenesFiltradas = [];
let videosFiltrados = [];
let imagenesCargadas = false;
let videosCargados = false;

// Cambiar entre secciones
function mostrarSeccion(seccion) {
    console.log(`=== CAMBIANDO A SECCIÓN: ${seccion} ===`);
    
    // Ocultar ambas secciones
    document.getElementById('seccion-imagenes').style.display = 'none';
    document.getElementById('seccion-videos').style.display = 'none';
    
    // Desactivar ambos botones
    document.getElementById('btn-imagenes').classList.remove('btn-primary');
    document.getElementById('btn-imagenes').classList.add('btn-secondary');
    document.getElementById('btn-videos').classList.remove('btn-primary');
    document.getElementById('btn-videos').classList.add('btn-secondary');
    
    // Mostrar sección seleccionada y cargar contenido solo si es necesario
    if (seccion === 'imagenes') {
        console.log('Mostrando sección de imágenes');
        document.getElementById('seccion-imagenes').style.display = 'block';
        document.getElementById('btn-imagenes').classList.remove('btn-secondary');
        document.getElementById('btn-imagenes').classList.add('btn-primary');
        
        // Cargar imágenes solo si no han sido cargadas antes
        if (!imagenesCargadas) {
            console.log('Cargando imágenes por primera vez...');
            cargarImagenes();
        } else {
            console.log('Imágenes ya cargadas, mostrando...');
            renderizarImagenes();
        }
    } else if (seccion === 'videos') {
        console.log('Mostrando sección de videos');
        document.getElementById('seccion-videos').style.display = 'block';
        document.getElementById('btn-videos').classList.remove('btn-secondary');
        document.getElementById('btn-videos').classList.add('btn-primary');
        
        // Cargar videos solo si no han sido cargados antes
        if (!videosCargados) {
            console.log('Cargando videos por primera vez...');
            cargarVideos();
        } else {
            console.log('Videos ya cargados, mostrando...');
            renderizarVideos();
        }
    }
    
    console.log('=== CAMBIO DE SECCIÓN COMPLETADO ===');
}

// Ordenar y regenerar IDs
function ordenarYRegenerarIds(imagenes) {
    console.log('Ordenando imágenes y regenerando IDs...');
    
    // Ordenar por año y mes (2026 primero, luego 2025)
    const mesesOrden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    imagenes.sort((a, b) => {
        // Primero por año (2026 antes que 2025)
        if (a.año !== b.año) {
            return b.año - a.año;  // Invertido: 2026 - 2025
        }
        // Luego por mes
        return mesesOrden.indexOf(a.mes) - mesesOrden.indexOf(b.mes);
    });
    
    // Regenerar IDs en orden
    imagenes.forEach((imagen, index) => {
        imagen.id = index + 1;
    });
    
    console.log(`Imágenes ordenadas: ${imagenes.length} imágenes`);
    console.log('Primeras 3 imágenes:', imagenes.slice(0, 3));
    console.log('Años presentes:', [...new Set(imagenes.map(img => img.año))]);
    
    return imagenes;
}

// Cargar solo imágenes
async function cargarImagenes() {
    try {
        console.log('=== CARGANDO IMÁGENES ===');
        const response = await fetch('galeria.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        console.log('JSON crudo:', data);
        console.log('Elementos en JSON:', data.imagenes.length);
        
        // Filtrar solo imágenes
        todasLasImagenes = ordenarYRegenerarIds(data.imagenes.filter(item => item.tipo === 'imagen'));
        imagenesFiltradas = [...todasLasImagenes];
        
        console.log('Imágenes cargadas y procesadas:', todasLasImagenes.length);
        
        // Marcar como cargadas y renderizar
        imagenesCargadas = true;
        renderizarImagenes();
        
        return true;
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        return false;
    }
}

// Cargar solo videos
async function cargarVideos() {
    try {
        console.log('=== CARGANDO VIDEOS ===');
        console.log('Iniciando carga de videos...');
        
        const response = await fetch('galeria.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        console.log('JSON crudo:', data);
        console.log('Elementos en JSON:', data.imagenes.length);
        console.log('Elementos tipo video en JSON:', data.imagenes.filter(item => item.tipo === 'video'));
        
        // Filtrar solo videos
        videosFiltrados = ordenarYRegenerarIds(data.imagenes.filter(item => item.tipo === 'video'));
        
        console.log('Videos filtrados:', videosFiltrados);
        console.log('Videos cargados y procesados:', videosFiltrados.length);
        
        // Verificar si hay videos antes de renderizar
        if (videosFiltrados.length === 0) {
            console.error('ERROR: No se encontraron videos en el JSON');
            alert('No se encontraron videos disponibles');
            return false;
        }
        
        // Marcar como cargados y renderizar
        videosCargados = true;
        renderizarVideos();
        
        return true;
    } catch (error) {
        console.error('Error cargando videos:', error);
        alert('Error al cargar los videos: ' + error.message);
        return false;
    }
}

// Renderizar imágenes
function renderizarImagenes() {
    console.log('=== RENDERIZANDO IMÁGENES ===');
    const container = document.getElementById('galeria-container');
    const btnCargarMas = document.getElementById('btn-cargar-mas-imagenes');
    
    console.log('1. Container imágenes encontrado:', container);
    console.log('2. Botón cargar más encontrado:', btnCargarMas);
    console.log('3. Total imágenes filtradas:', imagenesFiltradas.length);
    
    if (!container) {
        console.error('4. ERROR: No se encontró el contenedor de imágenes');
        return;
    }
    
    if (imagenesFiltradas.length === 0) {
        console.log('5. No hay imágenes para mostrar');
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay imágenes para mostrar</p></div>';
        btnCargarMas.style.display = 'none';
        return;
    }
    
    // Mostrar todas las imágenes sin paginación
    const imagenesMostrar = imagenesFiltradas;
    
    console.log(`6. Mostrando todas las imágenes: ${imagenesMostrar.length}`);
    console.log('7. Imágenes a mostrar:', imagenesMostrar);
    
    // Generar HTML para imágenes
    let html = '';
    imagenesMostrar.forEach((item, index) => {
        console.log(`8. Procesando imagen ${index + 1}:`, item);
        html += `
            <div class="col-lg-4 col-md-6 gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow">
                    <img src="${item.src}" alt="${item.alt}" onclick="verImagen('${item.src}', '${item.title}', '${item.description}')" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <small class="text-muted">${item.mes} ${item.año}</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log('9. HTML generado:', html.substring(0, 200) + '...');
    
    // Reemplazar todo el contenido
    container.innerHTML = html;
    
    // Ocultar botón de cargar más ya que mostramos todo
    btnCargarMas.style.display = 'none';
    
    // Inicializar AOS para las nuevas imágenes
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('10. Galería de imágenes renderizada exitosamente');
}

// Renderizar videos
function renderizarVideos() {
    console.log('=== RENDERIZANDO VIDEOS ===');
    const container = document.getElementById('videos-container');
    const btnCargarMas = document.getElementById('btn-cargar-mas-videos');
    
    console.log('1. Container videos encontrado:', container);
    console.log('2. Botón cargar más encontrado:', btnCargarMas);
    console.log('3. Total videos filtrados:', videosFiltrados.length);
    
    if (!container) {
        console.error('4. ERROR: No se encontró el contenedor de videos');
        return;
    }
    
    if (videosFiltrados.length === 0) {
        console.log('5. No hay videos para mostrar');
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay videos para mostrar</p></div>';
        btnCargarMas.style.display = 'none';
        return;
    }
    
    // Mostrar todos los videos sin paginación
    const videosMostrar = videosFiltrados;
    
    console.log(`6. Mostrando todos los videos: ${videosMostrar.length}`);
    console.log('7. Videos a mostrar:', videosMostrar);
    
    // Generar HTML para videos
    let html = '';
    videosMostrar.forEach((item, index) => {
        console.log(`8. Procesando video ${index + 1}:`, item);
        console.log(`   - src: ${item.src}`);
        console.log(`   - title: ${item.title}`);
        console.log(`   - tipo: ${item.tipo}`);
        
        const videoHtml = `
            <div class="col-lg-4 col-md-6 gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card h-100 shadow">
                    <div class="video-container">
                        <video controls class="video-player">
                            <source src="${item.src}" type="video/mp4">
                            Tu navegador no soporta videos.
                        </video>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <small class="text-muted">${item.mes} ${item.año}</small>
                    </div>
                </div>
            </div>
        `;
        
        console.log(`   - HTML generado para video:`, videoHtml);
        html += videoHtml;
    });
    
    console.log('9. HTML completo generado:', html.substring(0, 500) + '...');
    
    // Reemplazar todo el contenido
    container.innerHTML = html;
    
    // Ocultar botón de cargar más ya que mostramos todo
    btnCargarMas.style.display = 'none';
    
    // Inicializar AOS para los nuevos videos
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('10. Galería de videos renderizada exitosamente');
    console.log('11. Contenedor del video después de renderizar:', container.innerHTML);
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
    
    // No cargar contenido automáticamente, esperar a que el usuario seleccione
    
    // Mostrar sección de imágenes por defecto (sin cargar contenido)
    mostrarSeccion('imagenes');
    
    console.log('Galería inicializada correctamente - esperando selección del usuario');
});
