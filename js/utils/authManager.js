// js/utils/authManager.js

export class AuthManager {
    constructor() {
        this.loginPage = this.getLoginPagePath();
        this.preservedItems = ['appLanguage', 'uiTheme', 'userPreferences'];
    }

    // Determinar dinámicamente la ruta de login
    getLoginPagePath() {
        const currentPath = window.location.pathname;
        console.log('📍 Ruta actual:', currentPath);

        // Si estamos en localhost con estructura de carpetas completa
        if (currentPath.includes('/PTC2025-AppWeb/PlataformaWebInicio/')) {
            return '/PTC2025-AppWeb/index.html';  // Ruta absoluta desde subcarpeta profunda
        }
        // Si estamos en una subcarpeta (como PlataformaWebInicio)
        else if (currentPath.includes('/PlataformaWebInicio/')) {
            return '../index.html';  // Desde subcarpeta
        }
        // Si estamos en la raíz del proyecto
        else if (currentPath.includes('/PTC2025-AppWeb/')) {
            return 'index.html';     // Desde raíz del proyecto
        }
        // Para cualquier otro caso (desarrollo local, etc.)
        else {
            return './index.html';   // Ruta relativa por defecto
        }
    }

    async logout() {
        try {
            console.group('🔐 Proceso de logout');

            // ✅ 1. Mostrar confirmación
            const confirmLogout = await this.showLogoutConfirmation();
            if (!confirmLogout) {
                console.log('❌ Logout cancelado por el usuario');
                return false;
            }

            // ✅ 2. Limpiar datos ANTES de mostrar feedback
            console.log('🧹 Limpiando datos de autenticación...');
            await this.clearAuthDataImmediate();

            // ✅ 3. Mostrar feedback y redirigir DESPUÉS de limpiar
            await this.showLogoutFeedbackAndRedirect();

            console.groupEnd();
            return true;

        } catch (error) {
            console.error('❌ Error crítico en logout:', error);
            // Forzar limpieza y redirección incluso si hay error
            this.forceCleanupAndRedirect();
            return false;
        }
    }

    // Nuevo método para limpieza inmediata y más agresiva
    async clearAuthDataImmediate() {
        try {
            // 1. Limpiar localStorage COMPLETAMENTE
            localStorage.clear();
            console.log('🗑️ localStorage.clear() ejecutado');

            // 2. Limpiar sessionStorage
            sessionStorage.clear();
            console.log('🗑️ sessionStorage.clear() ejecutado');

            // 3. Limpiar cookies de forma más agresiva
            this.clearAllCookies();

            // 4. Limpiar memoria
            this.clearMemoryData();

            // 5. Forzar garbage collection (si está disponible)
            this.forceGarbageCollection();

            console.log('✅ Limpieza completa de datos');

            // Verificar que realmente se limpió
            setTimeout(() => {
                console.log('🔍 Verificación - Items en localStorage:', localStorage.length);
                console.log('🔍 Verificación - Items en sessionStorage:', sessionStorage.length);
            }, 100);

        } catch (error) {
            console.error('❌ Error en clearAuthDataImmediate:', error);
            // Intentar métodos alternativos
            this.alternativeCleanup();
        }
    }

    // Método más agresivo para limpiar cookies
    clearAllCookies() {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Eliminar cookie con múltiples configuraciones
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
        }
        console.log('🍪 Todas las cookies eliminadas');
    }

    // Método para mostrar feedback y redirigir
    async showLogoutFeedbackAndRedirect() {
        return new Promise((resolve) => {
            Swal.fire({
                title: '¡Hasta pronto!',
                text: 'Has cerrado sesión correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                customClass: {
                    popup: 'custom-swal-popup'
                },
                willClose: () => {
                    console.log('🔄 Redirigiendo a página de login...');
                    window.location.href = this.loginPage;
                    resolve();
                }
            });
        });
    }

    // Método de limpieza alternativa por si falla la principal
    alternativeCleanup() {
        console.log('🔄 Ejecutando limpieza alternativa...');

        // Intentar eliminar item por item
        const keysToRemove = [
            'authToken', 'username', 'rolld', 'userToken', 'refreshToken',
            'userSession', 'userData', 'currentUser', 'userProfile'
        ];

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            } catch (e) {
                console.log(`❌ No se pudo eliminar ${key}:`, e);
            }
        });

        // Intentar limpiar con diferentes métodos
        try {
            localStorage.clear();
        } catch (e) {
            console.log('❌ localStorage.clear() falló:', e);
        }

        try {
            sessionStorage.clear();
        } catch (e) {
            console.log('❌ sessionStorage.clear() falló:', e);
        }
    }

    // Forzar garbage collection (si el navegador lo permite)
    forceGarbageCollection() {
        if (window.gc) {
            window.gc();
            console.log('🧹 Garbage collection forzado');
        } else if (window.CollectGarbage) {
            window.CollectGarbage();
            console.log('🧹 Garbage collection forzado (IE)');
        }
    }

    // Método de emergencia para limpiar y redirigir
    forceCleanupAndRedirect() {
        console.log('🚨 Ejecutando limpieza de emergencia');

        try {
            localStorage.clear();
            sessionStorage.clear();
            this.clearAllCookies();
        } catch (error) {
            console.error('❌ Error en limpieza de emergencia:', error);
        }

        // Redirigir inmediatamente
        window.location.href = this.loginPage;
    }

    async showLogoutConfirmation() {
        try {
            const result = await Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir de la aplicación?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#F48C06',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                customClass: {
                    popup: 'custom-swal-popup'
                }
            });

            return result.isConfirmed;
        } catch (error) {
            console.error('❌ Error en confirmación de logout:', error);
            return false;
        }
    }

    async clearAuthData() {
        console.log('🧹 Limpiando datos de autenticación...');

        // SOLUCIÓN: Limpiar localStorage COMPLETAMENTE
        localStorage.clear();
        console.log('🗑️ localStorage limpiado completamente');

        // Limpiar sessionStorage completamente
        sessionStorage.clear();
        console.log('🗑️ sessionStorage limpiado');

        // Limpiar cookies de autenticación
        this.clearAuthCookies();

        // Limpiar cualquier dato en memoria
        this.clearMemoryData();

        // Limpiar datos de la API si existen
        this.clearApiData();

        console.log('✅ Todos los datos de autenticación eliminados');
    }

    clearAuthCookies() {
        const authCookies = [
            'userToken',
            'refreshToken',
            'userSession',
            'userData',
            'rememberMe',
            'authToken',
            'sessionId',
            'access_token',
            'refresh_token'
        ];

        authCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
            console.log(`🍪 Cookie eliminada: ${cookieName}`);
        });
    }

    deleteCookie(name) {
        const domain = window.location.hostname;
        const path = '/';

        // Eliminar cookie con diferentes configuraciones para asegurar
        const cookieConfigurations = [
            `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`,
            `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`,
            `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`,
            `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`
        ];

        cookieConfigurations.forEach(config => {
            document.cookie = config;
        });
    }

    clearMemoryData() {
        // Limpiar variables globales específicas
        const globalVars = ['currentUser', 'userToken', 'apiToken', 'authData', 'userProfile'];

        globalVars.forEach(varName => {
            if (window[varName]) {
                delete window[varName];
                console.log(`🧠 Variable global eliminada: ${varName}`);
            }
        });

        // Limpiar intervalos o timeouts de la sesión
        this.clearIntervals();
    }

    clearIntervals() {
        // Limpiar el intervalo más alto posible (aproximación)
        const maxIntervalId = setTimeout(() => { }, 0);
        for (let i = maxIntervalId; i > 0; i--) {
            clearTimeout(i);
            clearInterval(i);
        }
        console.log('⏰ Intervalos y timeouts limpiados');
    }

    clearApiData() {
        // Si usas Axios o similar, limpiar headers
        if (window.axios && window.axios.defaults.headers.common) {
            delete window.axios.defaults.headers.common['Authorization'];
            console.log('🔑 Headers de autorización de Axios eliminados');
        }

        // Si tienes un cliente API personalizado
        if (window.apiClient) {
            window.apiClient.clearAuth();
            console.log('🔌 Cliente API limpiado');
        }
    }

    showLogoutFeedback() {
        Swal.fire({
            title: '¡Hasta pronto!',
            text: 'Has cerrado sesión correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }

    // Método para verificar si hay sesión activa
    isLoggedIn() {
        const hasLocalStorage = !!localStorage.getItem('userToken');
        const hasSessionStorage = !!sessionStorage.getItem('userSession');
        const hasCookie = this.getCookie('userToken');

        console.log('🔍 Estado de sesión:', {
            localStorage: hasLocalStorage,
            sessionStorage: hasSessionStorage,
            cookie: hasCookie
        });

        return hasLocalStorage || hasSessionStorage || hasCookie;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Método para obtener información del usuario actual (si existe)
    getCurrentUserInfo() {
        try {
            const userData = localStorage.getItem('userData') ||
                sessionStorage.getItem('userData') ||
                this.getCookie('userData');

            if (userData) {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error obteniendo info del usuario:', error);
        }
        return null;
    }
}