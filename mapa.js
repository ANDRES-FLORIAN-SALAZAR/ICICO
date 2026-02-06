// Mapa Interactivo de Casa de Oración - OpenStreetMap
(function() {
    'use strict';

    // Función para inicializar el mapa
    function initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;
        
        try {
            // Limpiar indicador de carga
            mapElement.innerHTML = '';
            
            // Ubicación de Casa de Oración - Solo dirección
            const CASA_ORACION_LOCATION = {
                address: "Crr 160 #133-18, Suba / Santa Cecilia, Bogotá, Colombia"
            };
            
            // Crear mapa educativo con OpenStreetMap centrado en ubicación exacta
            const map = L.map('map', {
                center: [4.740741, -74.130021],
                zoom: 17,
                scrollWheelZoom: false,
                zoomControl: true,
                attributionControl: true
            });
            
            // Agregar capa de tiles de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.openstreetmap.org/fixthemap">Reportar error</a>',
                maxZoom: 19,
                minZoom: 10
            }).addTo(map);
            
            // Crear icono personalizado de iglesia
            const churchIcon = L.divIcon({
                html: '<div style="background: #3182ce; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid #1a202c; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fas fa-church" style="font-size: 18px;"></i></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20],
                className: 'custom-church-marker'
            });
            
            // Agregar marcador principal sin popup
            const marker = L.marker([4.740741, -74.130021], {
                icon: churchIcon,
                title: 'Casa de Oración - Suba / Santa Cecilia'
            }).addTo(map);
            
            // Agregar círculo de proximidad (500 metros)
            const proximityCircle = L.circle([4.740741, -74.130021], {
                color: '#3182ce',
                fillColor: '#3182ce',
                fillOpacity: 0.1,
                radius: 500,
                weight: 2
            }).addTo(map);
            
            // Permitir zoom con scroll al hacer clic en el mapa
            map.on('click', function() {
                map.scrollWheelZoom.enable();
            });
            
            // Desactivar zoom cuando el mouse sale del mapa
            mapElement.addEventListener('mouseleave', function() {
                map.scrollWheelZoom.disable();
            });
            
            // Agregar control de escala
            L.control.scale({
                position: 'bottomleft',
                metric: true,
                imperial: false
            }).addTo(map);
            
            console.log('🗺️ Mapa de Casa de Oración cargado exitosamente');
            console.log('📍 Ubicación:', CASA_ORACION_LOCATION.address);
            
        } catch (error) {
            console.error('❌ Error al inicializar el mapa:', error);
            mapElement.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #e53e3e;">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Error al cargar el mapa</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    // Inicializar mapa cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMap);
    } else {
        initializeMap();
    }

})();
