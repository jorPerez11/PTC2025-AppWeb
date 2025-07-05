alert('¡EL SCRIPT SE ESTÁ CARGANDO!');

// DIAGNÓSTICO COMPLETO - PASO A PASO
console.log('🔍 === INICIANDO DIAGNÓSTICO COMPLETO ===');

// 1. Verificar si el script se está cargando
console.log('✅ El script se está ejecutando');
console.log('📅 Timestamp:', new Date().toLocaleString());

// 2. Verificar estado del DOM
console.log('📄 Estado del DOM:', document.readyState);

// 3. Función para verificar elementos críticos
function verificarElementosCriticos() {
    console.log('🔍 === VERIFICANDO ELEMENTOS CRÍTICOS ===');
    
    const elementosRequeridos = [
        'lista-departamentos',
        'btnFlotanteAgregar', 
        'modal-agregar',
        'modal-editar',
        'busquedaDepartamento'
    ];
    
    elementosRequeridos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ Elemento encontrado: #${id}`, elemento);
        } else {
            console.error(`❌ Elemento NO encontrado: #${id}`);
        }
    });
}

// 4. Función para insertar contenido de prueba directamente
function insertarContenidoPrueba() {
    console.log('🧪 === INSERTANDO CONTENIDO DE PRUEBA ===');
    
    const lista = document.getElementById('lista-departamentos');
    if (!lista) {
        console.error('❌ No se puede insertar contenido - lista-departamentos no existe');
        return;
    }
    
    // Insertar contenido HTML directamente
    lista.innerHTML = `
        <div class="alert alert-info">
            <h4>🧪 CONTENIDO DE PRUEBA</h4>
            <p>Si ves este mensaje, el script está funcionando correctamente.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card shadow-sm mb-3">
            <div class="card-body">
                <h5 class="card-title">Departamento de Prueba 1</h5>
                <p class="card-text">Este es un departamento de prueba generado por JavaScript</p>
                <button class="btn btn-primary btn-sm" onclick="alert('Botón funciona!')">Probar Botón</button>
            </div>
        </div>
        
        <div class="card shadow-sm mb-3">
            <div class="card-body">
                <h5 class="card-title">Departamento de Prueba 2</h5>
                <p class="card-text">Segundo departamento de prueba</p>
                <button class="btn btn-secondary btn-sm" onclick="console.log('Botón 2 clickeado')">Probar Botón 2</button>
            </div>
        </div>
    `;
    
    console.log('✅ Contenido de prueba insertado');
}

// 5. Función para verificar errores de consola
function verificarErrores() {
    console.log('🔍 === VERIFICANDO ERRORES ===');
    
    // Capturar errores globales
    window.addEventListener('error', (e) => {
        console.error('❌ Error global capturado:', e.error);
        console.error('📁 Archivo:', e.filename);
        console.error('📍 Línea:', e.lineno);
        console.error('📍 Columna:', e.colno);
    });
    
    // Capturar errores de promesas
    window.addEventListener('unhandledrejection', (e) => {
        console.error('❌ Promesa rechazada:', e.reason);
    });
    
    console.log('✅ Listeners de error configurados');
}

// 6. Función para verificar dependencias
function verificarDependencias() {
    console.log('🔍 === VERIFICANDO DEPENDENCIAS ===');
    
    // Verificar Bootstrap
    if (typeof bootstrap !== 'undefined') {
        console.log('✅ Bootstrap cargado:', bootstrap);
    } else {
        console.warn('⚠️ Bootstrap no detectado');
    }
    
    // Verificar SweetAlert
    if (typeof Swal !== 'undefined') {
        console.log('✅ SweetAlert cargado:', Swal);
    } else {
        console.warn('⚠️ SweetAlert no detectado');
    }
    
    // Verificar jQuery (si se usa)
    if (typeof $ !== 'undefined') {
        console.log('✅ jQuery cargado:', $);
    } else {
        console.log('ℹ️ jQuery no detectado (no requerido)');
    }
}

// 7. Función para probar la API
async function probarAPICompleta() {
    console.log('🔍 === PROBANDO API ===');
    
    const API_URL = "https://retoolapi.dev/Tw7Xso/Departamentos";
    
    try {
        console.log('📡 Realizando petición a:', API_URL);
        
        const response = await fetch(API_URL);
        console.log('📊 Respuesta recibida:', response);
        console.log('📊 Status:', response.status);
        console.log('📊 StatusText:', response.statusText);
        console.log('📊 Headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos de la API:', data);
        console.log('📊 Tipo de datos:', typeof data);
        console.log('📊 Es array:', Array.isArray(data));
        console.log('📊 Longitud:', data.length);
        
        return data;
        
    } catch (error) {
        console.error('❌ Error en API:', error);
        console.error('📊 Tipo de error:', typeof error);
        console.error('📊 Mensaje:', error.message);
        console.error('📊 Stack:', error.stack);
        
        return null;
    }
}

// 8. Función para verificar la carga de archivos
function verificarCargaArchivos() {
    console.log('🔍 === VERIFICANDO CARGA DE ARCHIVOS ===');
    
    // Verificar scripts cargados
    const scripts = document.querySelectorAll('script');
    console.log(`📄 Scripts encontrados: ${scripts.length}`);
    
    scripts.forEach((script, index) => {
        console.log(`📄 Script ${index + 1}:`, script.src || 'inline');
    });
    
    // Verificar estilos cargados
    const estilos = document.querySelectorAll('link[rel="stylesheet"]');
    console.log(`🎨 Estilos encontrados: ${estilos.length}`);
    
    estilos.forEach((style, index) => {
        console.log(`🎨 Estilo ${index + 1}:`, style.href);
    });
}

// 9. Función principal de diagnóstico
async function ejecutarDiagnosticoCompleto() {
    console.log('🚀 === EJECUTANDO DIAGNÓSTICO COMPLETO ===');
    
    // Paso 1: Verificar elementos
    verificarElementosCriticos();
    
    // Paso 2: Verificar dependencias
    verificarDependencias();
    
    // Paso 3: Verificar carga de archivos
    verificarCargaArchivos();
    
    // Paso 4: Configurar captura de errores
    verificarErrores();
    
    // Paso 5: Insertar contenido de prueba
    insertarContenidoPrueba();
    
    // Paso 6: Probar API
    const datosAPI = await probarAPICompleta();
    
    // Paso 7: Mostrar resumen
    console.log('🏁 === RESUMEN DEL DIAGNÓSTICO ===');
    console.log('📊 DOM State:', document.readyState);
    console.log('📊 API Response:', datosAPI ? 'OK' : 'FALLO');
    console.log('📊 Contenido insertado:', document.getElementById('lista-departamentos') ? 'OK' : 'FALLO');
    
    // Paso 8: Crear botón de prueba adicional
    const btnPrueba = document.createElement('button');
    btnPrueba.textContent = 'BOTÓN DE PRUEBA JS';
    btnPrueba.className = 'btn btn-success btn-lg';
    btnPrueba.style.position = 'fixed';
    btnPrueba.style.top = '10px';
    btnPrueba.style.right = '10px';
    btnPrueba.style.zIndex = '9999';
    btnPrueba.onclick = () => {
        alert('¡JavaScript está funcionando!');
        console.log('✅ Botón de prueba clickeado');
    };
    
    document.body.appendChild(btnPrueba);
    console.log('✅ Botón de prueba agregado');
}

// 10. Ejecutar diagnóstico de múltiples maneras
console.log('🔧 Configurando ejecución del diagnóstico...');

// Método 1: DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded disparado');
    ejecutarDiagnosticoCompleto();
});

// Método 2: Si DOM ya está listo
if (document.readyState === 'loading') {
    console.log('📄 DOM está cargando...');
} else {
    console.log('📄 DOM ya está listo, ejecutando inmediatamente');
    ejecutarDiagnosticoCompleto();
}

// Método 3: Timeout como fallback
setTimeout(() => {
    console.log('⏰ Ejecutando diagnóstico por timeout');
    ejecutarDiagnosticoCompleto();
}, 1000);

// Método 4: Window load
window.addEventListener('load', () => {
    console.log('🎯 Window load disparado');
    ejecutarDiagnosticoCompleto();
});

console.log('✅ === SCRIPT DE DIAGNÓSTICO CONFIGURADO ===');