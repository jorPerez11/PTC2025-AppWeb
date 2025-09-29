// Importaciones
import { obtenerDatosPaso1, obtenerEquipoGuardado } from '../utils/storageHelperFirstUse.js';
import { finalizarAdminSetupAPI, activatePendingTechniciansAPI } from '../services/serviceFirstUse.js';
import { adminId } from './controllerFirstUse.js';

// Funciones específicas del Paso 4
export function restaurarDatosPaso4() {
    console.log("[restaurarDatosPaso4] Iniciando restauración de datos del Paso 4.");

    // 1. Recuperar todos los datos necesarios desde localStorage
    const listaTecnicos = JSON.parse(localStorage.getItem("listaTecnicos") || "[]");
    const listaCategorias = JSON.parse(localStorage.getItem("listaCategorias") || "[]");
    const datosPaso1 = JSON.parse(localStorage.getItem("datosPaso1") || "{}"); // Clave correcta
    const equipoGuardado = JSON.parse(localStorage.getItem("miEquipo") || "[]");
    const contenedor = document.getElementById("lista-integrantes-paso4");

    if (!contenedor) {
        console.error("[restaurarDatosPaso4] 'lista-integrantes-paso4' no encontrado.");
        return;
    }

    // 2. Mostrar datos de empresa
    const defaultEmpresa = "H2C - Help To Comply";
    // Usar la clave correcta: companyName
    const nombreEmpresa = datosPaso1.companyName?.trim() || defaultEmpresa;
    document.getElementById("displayNombreEmpresa").textContent = nombreEmpresa;

    // Usar la clave correcta: emailCompany
    document.getElementById("displayCorreoEmpresa").textContent = datosPaso1.emailCompany?.trim() || "N/A";

    // Usar la clave correcta: contactPhone
    const telEmpRaw = datosPaso1.contactPhone?.trim() || "";
    document.getElementById("displayTelefonoEmpresa").textContent = telEmpRaw ? formatoLegibleTelefono(telEmpRaw) : "N/A";

    // Usar la clave correcta: websiteUrl
    const sitio = datosPaso1.websiteUrl?.trim();
    const dispWeb = document.getElementById("displaySitioWebEmpresa");
    if (dispWeb) {
        if (sitio) {
            const href = sitio.match(/^https?:\/\//) ? sitio : `https://${sitio}`;
            dispWeb.innerHTML = `<a href="${href}" target="_blank" rel="noopener">${sitio}</a>`;
        } else {
            dispWeb.textContent = "N/A";
        }
    }

    // 3. Mostrar datos del administrador
    // Usar la clave correcta: name
    document.getElementById("displayNombreAdmin").textContent = datosPaso1.name?.trim() || "N/A";

    // Usar la clave correcta: email
    document.getElementById("displayCorreoAdmin").textContent = datosPaso1.email?.trim() || "N/A";

    // Usar la clave correcta: phone
    const telAdminRaw = datosPaso1.phone?.trim() || "";
    document.getElementById("displayTelefonoAdmin").textContent = telAdminRaw ? formatoLegibleTelefono(telAdminRaw) : "N/A";

    // 4. Agrupar técnicos por categoría
    const grupos = {};
    equipoGuardado.forEach(({ id, categoria }) => {
        const t = listaTecnicos.find(x => x.id == id);
        if (!t) return;

        // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
        // Se comparan los IDs como strings para evitar errores de tipo (número vs. string)
        const catObj = listaCategorias.find(c => String(c.id) == String(categoria));

        const catNombre = catObj?.nombreDepartamento || catObj?.nombre || "Sin categoría";
        if (!grupos[catNombre]) {
            grupos[catNombre] = [];
        }
        grupos[catNombre].push(t);
    });

    // 5. Colores fijos (hex) según la paleta
    const catColors = {
        "Soporte Técnico": "#F39C12", // Naranja amigable
        "Gestión de Usuarios": "#2ECC71", // Verde fresco
        "Incidentes Críticos": "#E74C3C", // Rojo alerta
        "Consultas": "#3498DB", // Azul profesional
        "Redes": "#9B59B6" // Púrpura distintivo
    };
    const defaultColor = "#95A5A6"; // Gris neutro

    // 6. Construir el HTML
    let html = "";

    if (Object.keys(grupos).length === 0) {
        html = `
            <div class="alert alert-info text-center">
                No hay integrantes agregados al equipo.
            </div>
        `;
    } else {
        // Ordenar según el orden definido en catColors
        const categoriasOrdenadas = Object.keys(catColors);

        // Primero, mostrar las categorías en el orden definido
        categoriasOrdenadas.forEach(catNombre => {
            if (grupos[catNombre]) {
                const color = catColors[catNombre] || defaultColor;

                html += `
                    <div class="mb-4">
                        <h5 class="fw-semibold mb-3 pb-2" style="color: ${color}; border-bottom: 2px solid ${color};">
                            ${catNombre}
                        </h5>
                    `;

                grupos[catNombre].forEach(tecnico => {
                    const foto = tecnico.Foto?.trim() ? tecnico.Foto : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    const correo = tecnico["Correo Electrónico"] || tecnico.Correo || "N/A";
                    const telefono = tecnico["Número de tel."] || tecnico.Telefono || "";

                    html += `
                        <div class="card mb-4 shadow-sm" style="border-left: 4px solid ${color};">
                            <div class="row g-0 align-items-center">
                                <div class="col-auto p-3">
                                    <img src="${foto}" alt="Foto de ${tecnico.Nombre}" class="rounded-circle" width="56" height="56">
                                </div>
                                <div class="col px-3">
                                    <h6 class="mb-1">${tecnico.Nombre}</h6>
                                    <p class="mb-1 text-muted small">
                                        <i class="bi bi-envelope-at" style="color: #dc2f02;"></i> ${correo}
                                    </p>
                                    <p class="mb-0 text-muted small">
                                        <i class="bi bi-telephone" style="color:rgb(33, 174, 21);"></i> ${formatoLegibleTelefono(telefono)}
                                    </p>
                                </div>
                                <div class="col-auto pe-3">
                                    <i class="bi bi-check-circle-fill" style="font-size:1.5rem; color:${color};"></i>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
            }
        });

        // Luego, mostrar cualquier categoría adicional que no esté en catColors (ordenadas alfabéticamente)
        const categoriasRestantes = Object.keys(grupos)
            .filter(cat => !categoriasOrdenadas.includes(cat))
            .sort();

        categoriasRestantes.forEach(catNombre => {
            const color = defaultColor;

            html += `
                <div class="mb-4">
                    <h5 class="fw-semibold mb-3 pb-2" style="color: ${color}; border-bottom: 2px solid ${color};">
                        ${catNombre}
                    </h5>
                `;

            grupos[catNombre].forEach(tecnico => {
                const foto = tecnico.Foto?.trim() ? tecnico.Foto : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                const correo = tecnico["Correo Electrónico"] || tecnico.Correo || "N/A";
                const telefono = tecnico["Número de tel."] || tecnico.Telefono || "";

                html += `
                    <div class="card mb-4 shadow-sm" style="border-left: 4px solid ${color};">
                        <div class="row g-0 align-items-center">
                            <div class="col-auto p-3">
                                <img src="${foto}" alt="Foto de ${tecnico.Nombre}" class="rounded-circle" width="56" height="56">
                            </div>
                            <div class="col px-3">
                                <h6 class="mb-1">${tecnico.Nombre}</h6>
                                <p class="mb-1 text-muted small">
                                    <i class="bi bi-envelope-at" style="color: #dc2f02;"></i> ${correo}
                                </p>
                                <p class="mb-0 text-muted small">
                                    <i class="bi bi-telephone" style="color:rgb(33, 174, 21);"></i> ${formatoLegibleTelefono(telefono)}
                                </p>
                            </div>
                            <div class="col-auto pe-3">
                                <i class="bi bi-check-circle-fill" style="font-size:1.5rem; color:${color};"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        });
    }

    // 7. Inyectar en el DOM
    contenedor.innerHTML = html;
    console.log("[restaurarDatosPaso4] Renderizado completado.");
}

export function formatoLegibleTelefono(telefono) {
    if (!telefono) return "N/A";

    let t = telefono.replace(/[^\d+]/g, "");

    if (!t.startsWith("+")) {
        if (t.startsWith("503")) {
            t = "+" + t;
        } else if (/^\d{8}$/.test(t)) {
            t = "+503" + t;
        } else {
            t = "+" + t;
        }
    }

    const partes = t.match(/^(\+\d{1,3})(\d+)$/);
    if (!partes) return telefono;
    const [, prefijo, resto] = partes;

    switch (prefijo) {
        case "+503":
            if (resto.length === 8) return `${prefijo} ${resto.substr(0, 4)}-${resto.substr(4)}`;
            break;
        case "+1":
            if (resto.length === 10) return `${prefijo} (${resto.substr(0, 3)}) ${resto.substr(3, 3)}-${resto.substr(6)}`;
            break;
        case "+52":
            if (resto.length === 10) return `${prefijo} ${resto.substr(0, 2)} ${resto.substr(2, 4)} ${resto.substr(6)}`;
            break;
        case "+57":
            if (resto.length === 10) return `${prefijo} ${resto.substr(0, 3)} ${resto.substr(3, 3)} ${resto.substr(6)}`;
            break;
    }

    const grupos = resto.match(/.{1,3}/g) || [resto];
    return `${prefijo} ${grupos.join(" ")}`;
}

export async function handleFinalizarSetup() {
    try {
        console.log("🔍 === INICIANDO handleFinalizarSetup ===");
        
        const userId = adminId;
        const companyId = Number(localStorage.getItem('companyId'));
        const equipoGuardado = JSON.parse(localStorage.getItem("miEquipo") || "[]");

        console.log("📊 Datos de depuración:");
        console.log("- Admin ID:", userId);
        console.log("- Company ID:", companyId);
        console.log("- Equipo guardado:", equipoGuardado);

        if (!companyId || companyId === 0) {
            throw new Error("No se encontró un companyId válido en localStorage.");
        }

        if (!userId) {
            throw new Error("No se encontró el ID del administrador.");
        }

        // 1. PRIMERO: Enviar credenciales a técnicos
        console.log("🚀 Paso 1: Enviando credenciales a técnicos...");
        console.log("📞 Llamando a activatePendingTechniciansAPI con companyId:", companyId);
        
        const techniciansResult = await activatePendingTechniciansAPI(companyId);
        console.log("✅ Resultado de envío de credenciales:", techniciansResult);

        // Validación más flexible
        if (!techniciansResult) {
            throw new Error("No se recibió respuesta del servidor.");
        }
        
        if (techniciansResult.error) {
            throw new Error(techniciansResult.error);
        }

        // 2. SEGUNDO: Finalizar configuración del admin
        console.log("👨‍💼 Paso 2: Finalizando configuración del admin...");
        const adminResult = await finalizarAdminSetupAPI(userId);
        console.log("✅ Admin configurado:", adminResult);

        if (!adminResult) {
            throw new Error("No se pudo finalizar la configuración del administrador.");
        }

        // 3. Mostrar mensaje de éxito
        const equipoCount = equipoGuardado.length;
        const tecnicosNotificados = techniciansResult.activatedCount || equipoCount;
        
        console.log("🎉 Proceso completado exitosamente");
        console.log("- Técnicos notificados:", tecnicosNotificados);
        console.log("- Admin activado: Sí");

        Swal.fire({
            icon: "success",
            title: "¡Configuración Completada!",
            html: `
                <div style="text-align: left;">
                <p>✓ Administrador activado y notificado</p>
                ${equipoCount > 0 ? `<p>✓ ${tecnicosNotificados} técnicos notificados con sus credenciales</p>` : ''}
                <p>✓ Se han enviado las credenciales por correo electrónico</p>
                </div>
            `,
            showConfirmButton: false,
            timer: 5000
        }).then(() => {
            // Limpiar localStorage y redirigir
            localStorage.removeItem('miEquipo');
            localStorage.removeItem('listaTecnicos');
            localStorage.removeItem('datosPaso1');
            window.location.href = 'login.html';
        });

    } catch (error) {
        console.error("❌ ERROR en handleFinalizarSetup:", error);

        Swal.fire({
            icon: "error",
            title: "Error en la Configuración",
            html: `
                <div style="text-align: left;">
                <p>No se pudo completar la configuración</p>
                <p><strong>Error:</strong> ${error.message || "Error desconocido"}</p>
                <p>Revisa la consola para más detalles.</p>
                </div>
            `,
            confirmButtonText: "Reintentar"
        });
    }
}