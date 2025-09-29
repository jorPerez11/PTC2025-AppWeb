// js/controllers/navbarController.js

import { AuthManager } from './../utils/authManager.js';

class NavbarController {
    constructor() {
        this.authManager = new AuthManager();
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando NavbarController...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                await this.start();
            }
        } catch (error) {
            console.error('❌ Error inicializando NavbarController:', error);
        }
    }

    async start() {
        await this.loadUserData();
        this.setupEventListeners();
        this.setupNavbarByRole();
        console.log('✅ NavbarController inicializado correctamente');
    }

    async loadUserData() {
        try {
            this.currentUser = this.authManager.getCurrentUserInfo();
            if (this.currentUser) {
                console.log('👤 Usuario cargado:', this.currentUser);
                this.updateProfileImage();
            }
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
        }
    }

    setupEventListeners() {
        this.setupLogoutListener();
        this.setupMobileMenuClose();
        console.log('🎯 Event listeners del navbar configurados');
    }

    setupLogoutListener() {
        document.addEventListener('click', async (e) => {
            const logoutBtn = e.target.closest('.logout-btn') || 
                            e.target.closest('[data-action="logout"]');
            
            if (logoutBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Botón de logout clickeado');
                await this.authManager.logout();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('[href*="cerrar-sesion"]') || 
                e.target.closest('[href*="logout"]')) {
                e.preventDefault();
                this.authManager.logout();
            }
        });
    }

    setupMobileMenuClose() {
        // SOLUCIÓN: Solo seleccionar enlaces que NO sean dropdown toggles
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not([data-bs-toggle="dropdown"])');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarContent = document.getElementById('navbarContenido');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1200 && navbarContent.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }

    setupNavbarByRole() {
        if (this.currentUser) {
            const userRole = this.currentUser.rol?.displayName?.toLowerCase();
            
            if (userRole && userRole.includes('tecnico')) {
                this.adjustNavbarForTechnician();
            }
            
            this.highlightCurrentPage();
        }
    }

    adjustNavbarForTechnician() {
        const clientesLink = document.querySelector('a[href="clientesAdmin.html"]');
        if (clientesLink) {
            clientesLink.href = 'clientesTecnico.html';
            console.log('🎯 Enlace de Clientes ajustado para técnico');
        }
    }

    highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(currentPage)) {
                link.classList.add('active');
                link.style.color = '#F48C06';
            }
        });
    }

    updateProfileImage() {
        const profileImages = document.querySelectorAll('#userDropdownDesktop img, .navbar-nav img[alt*="Usuario"]');
        
        if (this.currentUser?.profilePictureUrl) {
            profileImages.forEach(img => {
                img.src = this.currentUser.profilePictureUrl;
                img.onerror = () => {
                    img.src = 'img/userIcon.png';
                };
            });
            console.log('🖼️ Imagen de perfil actualizada en navbar');
        }
    }

    updateUserProfile(imageUrl) {
        const profileImages = document.querySelectorAll('#userDropdownDesktop img, .navbar-nav img[alt*="Usuario"]');
        profileImages.forEach(img => {
            img.src = imageUrl;
        });
        console.log('🔄 Imagen de perfil actualizada desde externo');
    }

    getUserRole() {
        return this.currentUser?.rol?.displayName || 'Usuario';
    }
}

// Inicializar automáticamente cuando se importe
const navbarController = new NavbarController();
window.navbarController = navbarController;

export default NavbarController;