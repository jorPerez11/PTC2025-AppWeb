import { inicializarAplicacion } from './controllers/controllerFirstUse.js';
import { siguientePaso } from './controllers/controllerFirstUse.js';
import { anteriorPaso } from './controllers/controllerFirstUse.js';
import { cancelarPaso } from './controllers/controllerFirstUse.js';
import { obtenerCategorias } from './controllers/controllerPaso2.js';

// Hacer las funciones disponibles globalmente
window.obtenerCategorias = obtenerCategorias;
window.siguientePaso = siguientePaso;
window.anteriorPaso = anteriorPaso;
window.cancelarPaso = cancelarPaso;

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);