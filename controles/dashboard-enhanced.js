// Extensiones para mejorar el dashboard
class DashboardEnhancements {
    static init() {
        this.addSmoothTransitions();
        this.addLoadingStates();
        this.addVisualFeedback();
    }
    
    static addSmoothTransitions() {
        // Transiciones suaves entre módulos
        document.addEventListener('DOMContentLoaded', () => {
            const links = document.querySelectorAll('a[data-modulo]');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetModule = link.getAttribute('data-modulo');
                    this.animateModuleTransition(targetModule);
                });
            });
        });
    }
    
    static animateModuleTransition(module) {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.style.opacity = '0';
            contentArea.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                window.dashboard.cambiarModulo(module);
                
                setTimeout(() => {
                    contentArea.style.opacity = '1';
                    contentArea.style.transform = 'translateY(0)';
                }, 300);
            }, 200);
        }
    }
    
    static addLoadingStates() {
        // Estados de carga mejorados
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            document.body.classList.add('loading');
            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                document.body.classList.remove('loading');
            }
        };
    }
    
    static addVisualFeedback() {
        // Feedback visual para interacciones
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, button, [data-click-feedback]')) {
                this.createRippleEffect(e);
            }
        });
    }
    
    static createRippleEffect(event) {
        const button = event.target;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) ripple.remove();
        
        button.appendChild(circle);
    }
}

// Inicializar mejoras cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    DashboardEnhancements.init();
});