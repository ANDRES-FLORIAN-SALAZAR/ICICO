// Gestor de contenido simple - Lee desde localStorage
class SimpleContentManager {
    constructor() {
        this.loadData();
    }

    loadData() {
        const savedData = localStorage.getItem('casaOracionData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        } else {
            this.data = {
                anuncios: [],
                eventos: [],
                predicas: [],
                galeria: []
            };
        }
    }

    getAnuncios() {
        return this.data.anuncios || [];
    }

    getEventos() {
        return this.data.eventos || [];
    }

    getPredicas() {
        return this.data.predicas || [];
    }

    getGaleria() {
        return this.data.galeria || [];
    }

    // Renderizar anuncios
    renderAnuncios(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const anuncios = this.getAnuncios();
        if (anuncios.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay anuncios disponibles.</p>';
            return;
        }

        container.innerHTML = '';
        anuncios.forEach(anuncio => {
            const anuncioElement = document.createElement('div');
            anuncioElement.className = 'alert alert-info fade-in';
            anuncioElement.innerHTML = `
                <h5><i class="fas fa-bullhorn me-2"></i>${anuncio.titulo}</h5>
                <p>${anuncio.contenido}</p>
                <small class="text-muted"><i class="fas fa-calendar me-1"></i>${anuncio.fecha}</small>
            `;
            container.appendChild(anuncioElement);
        });
    }

    // Renderizar eventos
    renderEventos(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const eventos = this.getEventos();
        if (eventos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay eventos programados.</p>';
            return;
        }

        container.innerHTML = '';
        eventos.forEach(evento => {
            const eventoElement = document.createElement('div');
            eventoElement.className = 'col-md-6 col-lg-4 mb-4';
            eventoElement.innerHTML = `
                <div class="card h-100 shadow-sm event-card">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-calendar-alt me-2 text-primary"></i>${evento.titulo}
                        </h5>
                        <p class="card-text">${evento.descripcion}</p>
                        <div class="event-details">
                            <p class="mb-2">
                                <i class="fas fa-clock me-2 text-warning"></i>
                                <strong>Fecha:</strong> ${evento.fecha}
                            </p>
                            <p class="mb-0">
                                <i class="fas fa-clock me-2 text-info"></i>
                                <strong>Hora:</strong> ${evento.hora}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(eventoElement);
        });
    }

    // Renderizar predicaciones
    renderPredicas(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const predicas = this.getPredicas();
        if (predicas.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay predicaciones disponibles.</p>';
            return;
        }

        container.innerHTML = '';
        predicas.forEach(predica => {
            const predicaElement = document.createElement('div');
            predicaElement.className = 'col-md-6 col-lg-4 mb-4';
            predicaElement.innerHTML = `
                <div class="card h-100 shadow-sm sermon-card">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-bible me-2 text-success"></i>${predica.titulo}
                        </h5>
                        <p class="card-text">${predica.descripcion}</p>
                        <div class="sermon-details">
                            <p class="mb-2">
                                <i class="fas fa-user me-2 text-primary"></i>
                                <strong>Predicador:</strong> ${predica.predicador}
                            </p>
                            <p class="mb-0">
                                <i class="fas fa-calendar me-2 text-warning"></i>
                                <strong>Fecha:</strong> ${predica.fecha}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(predicaElement);
        });
    }

    // Renderizar galería
    renderGaleria(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const galeria = this.getGaleria();
        if (galeria.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay contenido en la galería.</p>';
            return;
        }

        container.innerHTML = '';
        galeria.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'col-md-6 col-lg-4 mb-4';
            
            if (item.tipo === 'imagen') {
                itemElement.innerHTML = `
                    <div class="card h-100 shadow-sm gallery-card">
                        <img src="${item.url}" class="card-img-top gallery-image" alt="${item.titulo}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${item.titulo}</h5>
                            <p class="card-text">${item.descripcion}</p>
                        </div>
                    </div>
                `;
            } else if (item.tipo === 'video') {
                itemElement.innerHTML = `
                    <div class="card h-100 shadow-sm gallery-card">
                        <div class="video-container" style="height: 200px;">
                            ${item.url.includes('youtube') || item.url.includes('youtu.be') ? 
                                `<iframe src="${item.url}" class="card-img-top" frameborder="0" allowfullscreen style="height: 100%; width: 100%;"></iframe>` :
                                `<video controls class="card-img-top" style="height: 100%; width: 100%;">
                                    <source src="${item.url}" type="video/mp4">
                                    Tu navegador no soporta videos.
                                </video>`
                            }
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${item.titulo}</h5>
                            <p class="card-text">${item.descripcion}</p>
                        </div>
                    </div>
                `;
            }
            
            container.appendChild(itemElement);
        });
    }
}

// Crear instancia global
window.contentLoader = new SimpleContentManager();

// Funciones de conveniencia para uso en las páginas
window.loadAnuncios = (containerId) => window.contentLoader.renderAnuncios(containerId);
window.loadEventos = (containerId) => window.contentLoader.renderEventos(containerId);
window.loadPredicas = (containerId) => window.contentLoader.renderPredicas(containerId);
window.loadGaleria = (containerId) => window.contentLoader.renderGaleria(containerId);
