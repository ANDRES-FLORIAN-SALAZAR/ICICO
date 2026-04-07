// Galería Nueva - Casa de Oración
console.log('Galería Nueva - Iniciando...');

let todasLasImagenes = [];
let imagenesFiltradas = [];
let paginaActual = 0;
const imagenesPorPagina = 6;

// Cargar datos desde JSON
async function cargarImagenes() {
    try {
        const response = await fetch('galeria-nueva.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        todasLasImagenes = data.imagenes;
        imagenesFiltradas = [...todasLasImagenes];
        console.log('Imágenes cargadas:', todasLasImagenes.length);
        return true;
    } catch (error) {
        console.error('Error cargando imágenes:', error);
        return false;
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const mes = document.getElementById('filtro-mes').value;
    const año = document.getElementById('filtro-año').value;
    
    console.log('Aplicando filtros:', {mes, año});
    
    imagenesFiltradas = todasLasImagenes.filter(imagen => {
        const coincideMes = mes === 'todos' || imagen.mes === mes;
        const coincideAño = !año || imagen.año == año;
        return coincideMes && coincideAño;
    });
    
    console.log('Imágenes filtradas:', imagenesFiltradas.length);
    
    paginaActual = 0;
    renderizarGaleria();
}

// Renderizar galería
function renderizarGaleria() {
    const container = document.getElementById('galeria-container');
    const btnCargarMas = document.getElementById('btn-cargar-mas');
    
    if (!container) {
        console.error('No se encontró el contenedor');
        return;
    }
    
    // Calcular imágenes a mostrar
    const inicio = paginaActual * imagenesPorPagina;
    const fin = inicio + imagenesPorPagina;
    const imagenesMostrar = imagenesFiltradas.slice(inicio, fin);
    
    console.log(`Mostrando imágenes ${inicio + 1} a ${Math.min(fin, imagenesFiltradas.length)} de ${imagenesFiltradas.length}`);
    
    // Generar HTML
    let html = '';
    imagenesMostrar.forEach((imagen, index) => {
        html += `
            <div class="col-lg-4 col-md-6 gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
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
    
    // Si es la primera página, reemplazar todo
    if (paginaActual === 0) {
        container.innerHTML = html;
    } else {
        // Si no, agregar al final
        container.innerHTML += html;
    }
    
    // Mostrar/ocultar botón de cargar más
    const totalMostradas = (paginaActual + 1) * imagenesPorPagina;
    if (totalMostradas < imagenesFiltradas.length) {
        btnCargarMas.style.display = 'inline-block';
        btnCargarMas.textContent = `Cargar más (${imagenesFiltradas.length - totalMostradas} imágenes restantes)`;
    } else {
        btnCargarMas.style.display = 'none';
    }
    
    // Inicializar AOS para las nuevas imágenes
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM listo, iniciando galería...');
    
    // Cargar imágenes
    const cargado = await cargarImagenes();
    if (!cargado) {
        document.getElementById('galeria-container').innerHTML = 
            '<div class="col-12 text-center"><p class="text-danger">Error cargando las imágenes</p></div>';
        return;
    }
    
    // Renderizar galería inicial
    renderizarGaleria();
    
    // Agregar evento al botón de cargar más
    document.getElementById('btn-cargar-mas').addEventListener('click', cargarMas);
    
    console.log('Galería inicializada correctamente');
});
