// Galería Nueva - Casa de Oración
console.log('Galería Nueva - Iniciando...');

let todasLasImagenes = [];
let imagenesFiltradas = [];
let paginaActual = 0;
const imagenesPorPagina = 6;

// Cargar datos desde JSON
async function cargarImagenes() {
    try {
        const response = await fetch('galeria.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Filtrar solo imágenes
        todasLasImagenes = data.imagenes.filter(item => item.tipo === 'imagen');
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
    const btnCargarMas = document.getElementById('btn-cargar-mas');
    
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
    const btnCargarMas = document.getElementById('btn-cargar-mas');
    if (btnCargarMas) {
        btnCargarMas.addEventListener('click', cargarMas);
    }
    
    console.log('Galería inicializada correctamente');
});
