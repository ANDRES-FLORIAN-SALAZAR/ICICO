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
    });

    // Inicializar navegación
    function initializeNavigation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Cambiar estilo de navbar al hacer scroll
        window.addEventListener('scroll', function() {
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
        if (!counters.length) return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
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

            if (!('IntersectionObserver' in window)) {
                updateCounter();
                return;
            }

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
        
        shape.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3}px;
            height: ${Math.random() * 3}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.6});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${duration}s ${delay}s infinite ease-in-out`;
    }

    // Animación CSS para partículas flotantes
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
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
    `;
    document.head.appendChild(animationStyle);

})();
