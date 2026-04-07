// Galería Nueva - Casa de Oración
console.log('Galería Nueva - Iniciando...');

let todasLasImagenes = [];
let imagenesFiltradas = [];
let paginaActual = 0;
const imagenesPorPagina = 6;

// Detectar mes actual
function detectarMesActual() {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fechaActual = new Date();
    const mesActual = meses[fechaActual.getMonth()];
    const añoActual = fechaActual.getFullYear();
    
    console.log(`Mes detectado: ${mesActual} ${añoActual}`);
    
    // Establecer automáticamente el mes y año actual en los filtros
    document.getElementById('filtro-mes').value = mesActual;
    document.getElementById('filtro-año').value = añoActual;
    
    return { mes: mesActual, año: añoActual };
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

// Cargar datos desde JSON
async function cargarImagenes() {
    try {
        const response = await fetch('galeria.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Ordenar y regenerar IDs automáticamente
        todasLasImagenes = ordenarYRegenerarIds(data.imagenes);
        imagenesFiltradas = [...todasLasImagenes];
        
        console.log('Imágenes cargadas y procesadas:', todasLasImagenes.length);
        
        // Mostrar todas las imágenes al cargar
        renderizarGaleria();
        
        return true;
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        return false;
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo').value;
    const mes = document.getElementById('filtro-mes').value;
    const año = document.getElementById('filtro-año').value;
    
    console.log('Aplicando filtros:', {tipo, mes, año});
    
    imagenesFiltradas = todasLasImagenes.filter(item => {
        // Filtrado por tipo
        const coincideTipo = tipo === 'todos' || item.tipo === tipo;
        
        // Filtrado por mes y año
        const coincideMes = mes === 'todos' || item.mes === mes;
        const coincideAño = !año || item.año == año;
        
        return coincideTipo && coincideMes && coincideAño;
    });
    
    console.log('Imágenes filtradas:', imagenesFiltradas.length);
    console.log('Primeros 3 elementos filtrados:', imagenesFiltradas.slice(0, 3));
    
    paginaActual = 0;
    renderizarGaleria();
}

// Renderizar galería
function renderizarGaleria() {
    console.log('=== RENDERIZANDO GALERÍA ===');
    const container = document.getElementById('galeria-container');
    const btnCargarMas = document.getElementById('btn-cargar-mas');
    
    console.log('1. Container encontrado:', container);
    console.log('2. Botón cargar más encontrado:', btnCargarMas);
    console.log('3. Total imágenes filtradas:', imagenesFiltradas.length);
    
    if (!container) {
        console.error('4. ERROR: No se encontró el contenedor');
        return;
    }
    
    if (imagenesFiltradas.length === 0) {
        console.log('5. No hay imágenes para mostrar');
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No hay imágenes para mostrar</p></div>';
        btnCargarMas.style.display = 'none';
        return;
    }
    
    // Calcular imágenes a mostrar
    const inicio = paginaActual * imagenesPorPagina;
    const fin = inicio + imagenesPorPagina;
    const imagenesMostrar = imagenesFiltradas.slice(inicio, fin);
    
    console.log(`6. Mostrando imágenes ${inicio + 1} a ${Math.min(fin, imagenesFiltradas.length)} de ${imagenesFiltradas.length}`);
    console.log('7. Imágenes a mostrar:', imagenesMostrar);
    
    // Generar HTML separando imágenes y videos
    let html = '';
    imagenesMostrar.forEach((item, index) => {
        if (item.tipo === 'video') {
            html += `
                <div class="col-lg-4 col-md-6 gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="card h-100 shadow">
                        <div class="video-container">
                            <video controls class="video-player" poster="${item.src.replace('.mp4', '.jpg')}">
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
        } else {
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
        }
    });
    
    console.log('9. HTML generado:', html.substring(0, 200) + '...');
    
    // Si es la primera página, reemplazar todo
    if (paginaActual === 0) {
        console.log('10. Primera página - reemplazando HTML');
        container.innerHTML = html;
    } else {
        console.log('11. Página adicional - agregando HTML');
        // Si no, agregar al final
        container.innerHTML += html;
    }
    
    // Mostrar/ocultar botón de cargar más
    const totalMostradas = (paginaActual + 1) * imagenesPorPagina;
    if (totalMostradas < imagenesFiltradas.length) {
        btnCargarMas.style.display = 'inline-block';
        btnCargarMas.textContent = `Cargar más (${imagenesFiltradas.length - totalMostradas} elementos restantes)`;
    } else {
        btnCargarMas.style.display = 'none';
    }
    
    // Inicializar AOS para las nuevas imágenes
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
    
    console.log('12. Galería renderizada exitosamente');
}

// Ver imagen en modal
function verImagen(src, title, description) {
    const modal = new bootstrap.Modal(document.getElementById('imagenModal'));
    document.getElementById('modal-imagen').src = src;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-descripcion').textContent = description;
    modal.show();
}

// Cargar más imágenes
function cargarMas() {
    paginaActual++;
    renderizarGaleria();
}

// Inicialización automática cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando galería...');
    
    // Cargar imágenes y mostrar todas
    setTimeout(() => {
        cargarImagenes().then(success => {
            if (success) {
                console.log('Galería inicializada exitosamente');
            } else {
                console.error('Error inicializando galería');
            }
        });
    }, 1000);
    
    // Renderizar galería inicial
    renderizarGaleria();
    
    // Agregar evento al botón de cargar más
    document.getElementById('btn-cargar-mas').addEventListener('click', cargarMas);
    
    console.log('Galería inicializada correctamente');
});
