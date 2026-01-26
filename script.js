// JavaScript para Casa de Oración - Solo funciones públicas
(function() {
    'use strict';

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initializeAOS();
        initializeNavigation();
        initializeAnimations();
        initializeCounters();
        initializeScrollEffects();
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
        // Navegación suave al hacer clic en enlaces internos
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

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

    // Inicializar animaciones
    function initializeAnimations() {
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

    // Crear partículas animadas
    function createParticles() {
        const particlesContainer = document.querySelector('.hero-particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4}px;
                height: ${Math.random() * 4}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.8});
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
        
        // Animación adicional
        shape.addEventListener('animationiteration', () => {
            const randomDuration = 3 + Math.random() * 4;
            shape.style.animationDuration = `${randomDuration}s`;
        });
    }

    // Inicializar contadores animados
    function initializeCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200;

        const countUp = (counter) => {
            const target = +counter.getAttribute('data-count');
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => countUp(counter), 10);
            } else {
                counter.innerText = target;
            }
        };

        // Usar Intersection Observer para activar contadores cuando sean visibles
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Inicializar efectos de scroll
    function initializeScrollEffects() {
        // Animación de elementos al hacer scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos con animación
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }

    // Función para mostrar notificaciones (genérica)
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-info-circle me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.closest('.alert').remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Función para validar formularios
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        return isValid;
    }

    // Función para mostrar loading
    function showLoading(element, text = 'Cargando...') {
        element.disabled = true;
        element.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${text}
        `;
    }

    // Función para restaurar botón
    function restoreButton(element, originalText) {
        element.disabled = false;
        element.innerHTML = originalText;
    }

    // Exponer funciones globalmente si es necesario
    window.showNotification = showNotification;
    window.validateForm = validateForm;
    window.showLoading = showLoading;
    window.restoreButton = restoreButton;

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
    
    .animate-in {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-in.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .navbar.scrolled {
        background: rgba(44, 62, 80, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);
