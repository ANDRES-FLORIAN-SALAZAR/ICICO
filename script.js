// JavaScript básico para Casa de Oración
(function() {
    'use strict';

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initializeAOS();
        initializeNavigation();
        initializeAnimations();
        initializeEvents();
    });

    // Inicializar AOS (Animate On Scroll)
    function initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
        }
    }

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

    // Inicializar eventos
    function initializeEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        const events = [
            {
                title: 'Culto General',
                description: 'Únete a nuestro culto principal de adoración y enseñanza',
                icon: 'fa-church',
                day: 'Domingo',
                time: '10:00 AM',
                color: 'primary'
            },
            {
                title: 'Reunión de Oración',
                description: 'Tiempo dedicado a la oración comunitaria',
                icon: 'fa-praying-hands',
                day: 'Martes',
                time: '7:00 PM',
                color: 'success'
            },
            {
                title: 'Estudio Bíblico',
                description: 'Profundiza en la Palabra de Dios',
                icon: 'fa-bible',
                day: 'Jueves',
                time: '7:00 PM',
                color: 'info'
            },
            {
                title: 'Ayuno Congregacional',
                description: 'Ayuno y oración especial por la iglesia y la comunidad',
                icon: 'fa-cross',
                day: 'Último Domingo',
                time: '10:00 AM',
                color: 'warning'
            },
        ];

        events.forEach((event, index) => {
            const eventCard = createEventCard(event, index);
            eventsContainer.appendChild(eventCard);
        });
    }

    // Crear tarjeta de evento
    function createEventCard(event, index) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        col.setAttribute('data-aos', 'fade-up');
        col.setAttribute('data-aos-delay', (index + 1) * 100);

        col.innerHTML = `
            <div class="card h-100 shadow event-card">
                <div class="card-header bg-${event.color} text-white text-center">
                    <i class="fas ${event.icon} fa-2x mb-2"></i>
                    <h5 class="mb-0">${event.title}</h5>
                </div>
                <div class="card-body text-center">
                    <p class="card-text">${event.description}</p>
                    <div class="event-details">
                        <p class="mb-2">
                            <i class="fas fa-calendar-alt me-2 text-${event.color}"></i>
                            <strong>${event.day}</strong>
                        </p>
                        <p class="mb-0">
                            <i class="fas fa-clock me-2 text-${event.color}"></i>
                            <strong>${event.time}</strong>
                        </p>
                    </div>
                </div>
            </div>
        `;

        return col;
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
