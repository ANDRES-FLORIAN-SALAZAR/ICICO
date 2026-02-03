// JavaScript básico para Casa de Oración
(function() {
    'use strict';

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
        }

        // Inicializar navegación
        initializeNavigation();
        
        // Inicializar contadores animados
        animateCounters();
        
        // Inicializar partículas del hero
        initHeroParticles();
        
        // Inicializar formas flotantes
        initFloatingShapes();
        
        // Inicializar imagen fullscreen
        initImageFullscreen();
    });

    // Inicializar navegación
    function initializeNavigation() {
        // Cambiar estilo de navbar al hacer scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Inicializar animaciones básicas
    function initializeAnimations() {
        // Animación de contador de estadísticas
        animateCounters();
        
        // Animación de partículas hero
        const heroParticles = document.querySelector('.hero-particles');
        if (heroParticles) {
            createParticles();
        }

        // Animación de formas flotantes
        const floatingShapes = document.querySelectorAll('.shape');
        floatingShapes.forEach((shape, index) => {
            animateShape(shape, index);
        });
    }

    // Animar contadores de estadísticas
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Iniciar cuando el elemento sea visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    // Crear partículas animadas
    function createParticles() {
        const particlesContainer = document.querySelector('.hero-particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3}px;
                height: ${Math.random() * 3}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.6});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${5 + Math.random() * 10}s infinite ease-in-out;
            `;
            particlesContainer.appendChild(particle);
        }
    }

    // Animar formas flotantes
    function animateShape(shape, index) {
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 2;
        
        shape.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
    }

    
})();

// Animación CSS para partículas flotantes
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) translateX(0px);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(10px) translateX(-10px);
        }
        75% {
            transform: translateY(-10px) translateX(20px);
        }
    }
    
    .particle {
        animation: float linear infinite;
    }
    
    .navbar.scrolled {
        background: rgba(44, 62, 80, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// Función para imagen fullscreen - Solo para Galería
function initImageFullscreen() {
    // Verificar si estamos en la página de galería
    if (!window.location.pathname.includes('galeria.html')) {
        return;
    }
    
    // Crear modal para imagen fullscreen
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = '<img src="" alt="Imagen fullscreen">';
    document.body.appendChild(modal);
    
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
        // Buscar todas las imágenes en la página
        const allImages = document.querySelectorAll('img');
        console.log('Total de imágenes encontradas:', allImages.length);
        
        allImages.forEach((img, index) => {
            console.log(`Imagen ${index}:`, img.src, img.className);
            img.classList.add('clickable-image');
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click en imagen:', this.src);
                openImageFullscreen(this.src);
            });
        });
        
        // Cerrar modal al hacer click
        modal.addEventListener('click', closeImageFullscreen);
        
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeImageFullscreen();
            }
        });
    }, 1000); // Esperar 1 segundo
}

function openImageFullscreen(imageSrc) {
    const modal = document.querySelector('.image-modal');
    const modalImg = modal.querySelector('img');
    modalImg.src = imageSrc;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function closeImageFullscreen() {
    const modal = document.querySelector('.image-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll
}
