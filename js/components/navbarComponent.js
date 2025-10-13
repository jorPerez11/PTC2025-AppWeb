export class NavbarComponent {
    constructor() {
        this.basePath = this.getBasePath();
        this.userRole = this.getUserRole();
    }

    // Método para determinar la ruta base automáticamente
    getBasePath() {
        const currentPath = window.location.pathname;

        // Si está en una subcarpeta (como PlataformaWebInicio)
        if (currentPath.includes('/PlataformaWebInicio/')) {
            return '../';
        } else {
            return './';
        }
    }

    // Método para obtener el rol del usuario desde localStorage
    getUserRole() {
        try {
            // Intentar obtener el rol desde localStorage
            const userData = localStorage.getItem('user_rol') || 
                            localStorage.getItem('userRole') || 
                            localStorage.getItem('currentUser');
            
            if (userData) {
                // Si es un string JSON, parsearlo
                if (typeof userData === 'string' && userData.startsWith('{')) {
                    const user = JSON.parse(userData);
                    return user.rol?.displayName?.toLowerCase() || 
                           user.role?.toLowerCase() || 
                           user.user_rol?.toLowerCase();
                }
                // Si es directamente el rol
                return userData.toLowerCase();
            }
            
            console.warn('⚠️ No se encontró información de rol en localStorage');
            return 'admin'; // Valor por defecto
        } catch (error) {
            console.error('❌ Error obteniendo el rol del usuario:', error);
            return 'admin'; // Valor por defecto en caso de error
        }
    }

    // Método para determinar la ruta de clientes según el rol
    getClientesRoute() {
        const base = this.basePath;
        
        if (this.userRole.includes('tecnico') || this.userRole.includes('technician')) {
            return `${base}clientesTecnico.html`;
        } else {
            return `${base}clientesAdmin.html`;
        }
    }

    // Generar el HTML del navbar con rutas dinámicas
    render() {
        const base = this.basePath;
        const clientesRoute = this.getClientesRoute();

        // Lógica condicional para el enlace de Técnicos (solo Admin)
        const esAdmin = this.userRole.includes('admin');
        const tecnicosLink = esAdmin ? `
            <li class="nav-item active me-3">
                <a href="${base}tecnicoVistaAdmin.html" class="nav-link">Técnicos</a>
            </li>
        ` : '';

        return `
        <nav class="navbar fixed-top navbar-expand-xl navbar-dark" id="navbar">
            <div class="container-fluid justify-content-between">
                <a href="${base}PlataformaWebInicio/PW_Inicio.html" class="navbar-brand mb-0 h1 mx-auto">
                    <img src="${base}img/H2C_LOGO_WHITE.png" alt="H2C - Help Desk" width="60px" height="60px">
                    H2C
                </a>
                
                <!-- Botón hamburguesa -->
                <button type="button" data-bs-toggle="collapse" data-bs-target="#navbarContenido" class="navbar-toggler"
                    aria-controls="navbarContenido" aria-expanded="false" aria-label="Activar Navegación">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarContenido">
                    <div class="navbar-content ms-4">
                        <ul class="navbar-nav me-auto ms-2">
                            <li class="nav-item active mb-1 me-3">
                                <a href="${base}PlataformaWebInicio/PW_Inicio.html" class="nav-link">Inicio</a>
                            </li>
                            <li class="nav-item active me-3">
                                <a href="${base}tickets.html" class="nav-link">Tickets</a>
                            </li>
                            ${tecnicosLink}
                            <li class="nav-item active me-3">
                                <a href="${clientesRoute}" class="nav-link">Clientes</a>
                            </li>
                            <li class="nav-item active me-3">
                                <a href="${base}analitica.html" class="nav-link">Analítica</a>
                            </li>
                            <li class="nav-item active me-3">
                                <a href="${base}baseConocimiento.html" class="nav-link">Base de conocimientos</a>
                            </li>
                            <li class="nav-item active me-3">
                                <a href="${base}activities.html" class="nav-link">Actividades</a>
                            </li>
                            
                            <!-- Menú móvil -->
                            <div class="d-sm-block d-xl-none">
                                <hr class="nav-separator mt-2 mb-2">
                                <li class="nav-item active me-3">
                                    <img src="${base}img/notificationIcon.png" alt="">
                                    <a href="${base}navbarNotificaciones.html" class="nav-link">Notificaciones</a>
                                </li>
                                <li class="nav-item active me-3">
                                    <img src="${base}img/configIcon.png" alt="">
                                    <a href="${base}navbarConfig.html" class="nav-link">Configuración</a>
                                </li>
                                <li class="nav-item dropdown me-3">
                                    <a class="nav-link dropdown-toggle d-flex align-items-center" href="#"
                                        id="navbarDropdownMenuLinkMobile" role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        <img src="${base}img/userIcon.png" style="width: 2rem; margin-right: 4px;"
                                            alt="Icono de Usuario">
                                        Mi Perfil 
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLinkMobile">
                                        <li><a class="dropdown-item" href="${base}navbarConfig.html">
                                            <i class="bi bi-box-arrow-up-right me-2"></i>Ver Perfil</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item logout-btn" href="#" data-action="logout">
                                            <i class="bi bi-door-open me-2"></i>Cerrar Sesión</a></li>
                                    </ul>
                                </li>
                            </div>
                        </ul>
                    </div>
                </div>

                <!-- Menú desktop -->
                <div class="d-none align-items-center gap-2 d-xl-flex">
                    <a href="${base}navbarNotificaciones.html">
                        <button type="button" class="btn botonNotificaciones mx-2">
                            <img src="${base}img/notificationIcon.png" alt="Notificaciones">
                        </button>
                    </a>
                    <a href="${base}navbarConfig.html">
                        <button type="button" class="btn botonConfig me-2">
                            <img src="${base}img/configIcon.png" alt="Configuración">
                        </button>
                    </a>

                    <div class="separator"></div>

                    <div class="dropdown">
                        <button class="btn botonUser me-2 p-0 border-0 bg-transparent dropdown-toggle" type="button"
                            id="userDropdownDesktop" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="${base}img/userIcon.png" alt="Icono de Usuario">
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownDesktop">
                            <li><a class="dropdown-item" href="${base}navbarConfig.html">
                                <i class="bi bi-box-arrow-up-right me-2"></i>Ver Perfil</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item logout-btn" href="#" data-action="logout">
                                <i class="bi bi-door-open me-2"></i>Cerrar Sesión</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO"
        crossorigin="anonymous"></script>
        `;
    }

    // Inyectar el navbar en el DOM
    inject() {
        const navbarContainer = document.createElement('div');
        navbarContainer.innerHTML = this.render();
        document.body.insertBefore(navbarContainer.firstElementChild, document.body.firstChild);
    }
}