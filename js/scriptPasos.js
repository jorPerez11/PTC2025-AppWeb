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

window.onload = function() {
    console.log("window.onload activado: Inicializando aplicación.");
    inicializarAplicacion(); 
    
    // Si todavía usaste un setTimeout para la inicialización dentro de inicializarAplicacion,
    // puedes intentar reducirlo ahora o eliminarlo si el problema se resuelve.
};