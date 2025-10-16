import { inicializarAplicacion } from './controllers/controllerFirstUse.js';
import { siguientePaso } from './controllers/controllerFirstUse.js';
import { anteriorPaso } from './controllers/controllerFirstUse.js';
import { cancelarPaso } from './controllers/controllerFirstUse.js';
import { obtenerCategorias } from './controllers/controllerPaso2.js';

// Variable para almacenar las instancias de la máscara, una por cada input.
// Usamos un Map para manejar múltiples inputs.
const phoneMasks = new Map();
// Variables para IMask (Deben ser globales o al menos a nivel de módulo)
let IMaskLib = null;
const intlTelInputInstances = new Map(); // Para almacenar instancias de intlTelInput

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