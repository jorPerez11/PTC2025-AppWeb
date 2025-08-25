// Constantes de API
const API_URL2 = "http://localhost:8080/api/firstuse/categorias";
const API_URL = "http://localhost:8080/api/firstuse/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";
const API_TECNICOS_PENDIENTES = "http://localhost:8080/api/firstuse/tecnicos-pendientes";
const API_ASIGNAR_CATEGORIA = "http://localhost:8080/api/firstuse/tecnicos";
const API_COMPANY_URL = 'http://localhost:8080/api';
const API_REGISTER_ADMIN = 'http://localhost:8080/api/firstuse/register-admin';
const API_USERS_URL = 'http://localhost:8080/api/users';

/**
 * Guarda la información de la compañía y el usuario administrador en la API.
 * Si ya existen los IDs, los datos se actualizan (PATCH). Si no, se crean (POST).
 * @param {object} companyData - Los datos de la compañía.
 * @param {object} adminData - Los datos del usuario administrador.
 * @param {string} [companyId=null] - El ID de la compañía si ya existe.
 * @param {string} [adminId=null] - El ID del usuario si ya existe.
 * @returns {Promise<object>} - Un objeto con las respuestas de ambas peticiones.
 */
export async function guardarPaso1EnAPI(companyData, adminData, companyId = null, adminId = null) {
    try {
        // Lógica de Compañía
        // El endpoint para POST ya no es necesario, ya que la API se encarga de eso.
        const companyUrl = companyId ? `${API_COMPANY_URL}/companies/${companyId}` : `${API_COMPANY_URL}/PostCompany`;
        const companyMethod = companyId ? 'PATCH' : 'POST';

        const companyResponse = await fetch(companyUrl, {
            method: companyMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        });

        if (!companyResponse.ok) {
            const errorText = await companyResponse.text();
            throw new Error(`Error al ${companyId ? 'actualizar' : 'crear'} la compañía: ${errorText}`);
        }
        const companyResult = await companyResponse.json();

        // Lógica de Usuario Administrador
        // Se usa el endpoint de registro para el primer POST y luego el de usuarios para el PATCH
        const adminUrl = adminId ? `${API_USERS_URL}/${adminId}` : API_REGISTER_ADMIN; 
        const adminMethod = adminId ? 'PATCH' : 'POST';

        const adminResponse = await fetch(adminUrl, {
            method: adminMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });

        if (!adminResponse.ok) {
            const errorText = await adminResponse.text();
            throw new Error(`Error al ${adminId ? 'actualizar' : 'crear'} al administrador: ${errorText}`);
        }
        const adminResult = await adminResponse.json();

        return { company: companyResult, admin: adminResult };
    } catch (error) {
        console.error("Error en guardarPaso1EnAPI:", error);
        throw error;
    }
}

/**
 * Llama al endpoint de backend para finalizar la configuración del administrador.
 * @param {number} userId - El ID del usuario administrador.
 * @returns {Promise<object>} - El objeto del usuario actualizado.
 */
export async function finalizarAdminSetupAPI(userId) {
    const response = await fetch(`http://localhost:8080/api/firstuse/finalize-admin/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const responseText = await response.text();

    if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    return JSON.parse(responseText);
}

export async function obtenerCategoriasAPI() {
    const response = await fetch(API_URL2);
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarCategoriaAPI(nombre) {
    const response = await fetch(API_URL2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

export async function editarCategoriaAPI(id, nombre) {
    const response = await fetch(`${API_URL2}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreDepartamento: nombre })
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
}

// En tu archivo serviceFirstUse.js
export async function eliminarCategoriaAPI(id) {
    try {
        console.log("Enviando DELETE para categoría:", id);
        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log("Respuesta recibida, status:", response.status);

        const responseText = await response.text();
        console.log("Contenido de la respuesta:", responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Respuesta inválida del servidor: ${responseText}`);
        }

        if (!response.ok) {
            throw new Error(responseData.error || `Error del servidor: ${response.status}`);
        }

        return responseData;
    } catch (error) {
        console.error("Error en eliminarCategoriaAPI:", error);
        throw error;
    }
}

// Servicio para agregar un técnico en estado "pendiente"
export async function agregarTecnicoPendienteAPI(datosTecnico, companyId) {
    if (!companyId) {
        throw new Error("companyId no es válido o está ausente.");
    }
    
    // Combinar los datos del técnico con el companyId
    const datosCompletosTecnico = {
        ...datosTecnico,
        companyId: companyId
    };
    const response = await fetch(API_TECNICOS_PENDIENTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCompletosTecnico)
    });

    const responseText = await response.text();

    if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    return JSON.parse(responseText);
}

// Servicio para asignar una categoría a un técnico pendiente y activarlo
export async function asignarCategoriaYActivarTecnicoAPI(id, categoryId) {
    const response = await fetch(`${API_ASIGNAR_CATEGORIA}/${id}/asignar-categoria`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: categoryId })
    });

    const responseText = await response.text();

    if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    return JSON.parse(responseText);
}

// Servicios para técnicos
export async function obtenerTecnicosAPI() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
}

export async function agregarTecnicoAPI(datosTecnico) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    // Leer la respuesta como texto primero
    const responseText = await response.text();

    if (!response.ok) {
        // Intentar parsear como JSON si es posible
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
            const errorData = JSON.parse(responseText);
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            errorMsg = responseText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
    return response.json();
}

export async function editarTecnicoAPI(id, datosTecnico) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTecnico)
    });
    if (!response.ok) {
        // Obtener más detalles del error
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }
    if (!response.ok) throw new Error("Error al actualizar el técnico");
    return response.json();
}

export async function eliminarTecnicoAPI(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    // Verifica si la respuesta no fue exitosa
    if (!response.ok) {
        const errorData = await response.text();
        console.error("Error del servidor:", response.status, errorData);
        throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
    }

    // Si la respuesta es OK (200, 204)
    // Solo intenta parsear como JSON si el content-type es JSON y hay contenido.
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json") && response.status !== 204 && response.status !== 200) {
        // Intenta parsear si hay contenido y es JSON
        try {
            return await response.json();
        } catch (e) {
            console.warn("La respuesta no es un JSON válido o está vacía. Detalles:", await response.text());
            return { message: "Operación exitosa, pero la respuesta no contenía JSON." };
        }
    } else {
        // Si no hay contenido JSON o el estado es 204 (No Content), devuelve un objeto vacío o un mensaje de éxito
        return { success: true, message: "Técnico eliminado correctamente." };
    }
}

// Servicio para subir imágenes
export async function subirImagenAPI(file) {
    const base64 = await toBase64(file);
    const formData = new FormData();
    formData.append("image", base64.split(",")[1]);

    const response = await fetch(IMG_API_URL, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    return data?.data?.url || "";
}

export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}