import { inicializarAplicacion } from './controllers/controllerFirstUse.js';
import { siguientePaso } from './controllers/controllerFirstUse.js';
import { anteriorPaso } from './controllers/controllerFirstUse.js';
import { cancelarPaso } from './controllers/controllerFirstUse.js';

window.siguientePaso = siguientePaso;
window.anteriorPaso = anteriorPaso;
window.cancelarPaso = cancelarPaso;
document.addEventListener('DOMContentLoaded', inicializarAplicacion);