import { NavbarComponent } from './components/navbarComponent.js';
import NavbarController from './controllers/navbarController.js';

class NavbarLoader {
    constructor() {
        this.navbarComponent = new NavbarComponent();
        this.navbarController = null;
    }

    async init() {
        try {
            
            // 1. Inyectar el navbar component
            this.navbarComponent.inject();
            
            // 2. Inicializar el navbar controller
            this.navbarController = new NavbarController();
            await this.navbarController.start();
            
            
        } catch (error) {
            console.error('❌ Error inicializando NavbarLoader:', error);
        }
    }
}

// Inicializar automáticamente
const navbarLoader = new NavbarLoader();

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => navbarLoader.init());
} else {
    navbarLoader.init();
}

export default NavbarLoader;