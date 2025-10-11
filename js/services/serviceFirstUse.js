// 1. Importar la función `fetchWithAuth` que maneja el token internamente
import { fetchWithAuth, fetchPublic } from "../services/serviceLogin.js";

// Constantes de API
const API_URL2 = "https://ptchelpdesk-a73934db2774.herokuapp.com/api/firstuse/categorias";
const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api/firstuse/tecnicoData";
const IMG_API_URL = "https://api.imgbb.com/1/upload?key=2c2a83d4ddbff10c8af95b3159d53646";
const API_TECNICOS_PENDIENTES = "https://ptchelpdesk-a73934db2774.herokuapp.com/api/firstuse/tecnicos-pendientes";
const API_ASIGNAR_CATEGORIA = "https://ptchelpdesk-a73934db2774.herokuapp.com/api/firstuse/tecnicos";
const API_COMPANY_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';
const API_REGISTER_ADMIN = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/firstuse/register-admin';
const API_USERS_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/users';

// Función para el registro inicial (POST)
export async function guardarPaso1EnAPI(companyData, adminData) {
    // La función original lanza un error si alguna de las llamadas falla.
    // Usamos fetchPublic, que maneja errores HTTP pero omite la cookie.
    try {
        // 1. Llamada para la Compañía
        // 💡 CAMBIO: Usamos fetchPublic para omitir la cookie de autenticación.
        const companyResult = await fetchPublic(`${API_COMPANY_URL}/PostCompany`, {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
        // Si la llamada es exitosa, companyResult es el JSON parseado.

        // ---

        // 2. Llamada para el Administrador
        // 💡 CAMBIO: Usamos fetchPublic para omitir la cookie de autenticación.
        const adminResult = await fetchPublic(API_REGISTER_ADMIN, {
            method: 'POST',
            body: JSON.stringify(adminData)
        });
        // Si la llamada es exitosa, adminResult es el JSON parseado.

        // ---

        // 3. Devolver los resultados combinados
        return { company: companyResult, admin: adminResult };

    } catch (error) {
        // Manejo centralizado de errores.
        console.error('Error al guardar datos de Compañía/Administrador:', error);
        throw error;
    }
}

// Nueva función genérica para actualizaciones con PATCH
export async function updateDataInAPI(type, id, data) {
    
    // 1. Determinar la URL
    // Se asume que API_COMPANY_URL y API_USERS_URL están definidos
    const url = type === 'company' ? `${API_COMPANY_URL}/companies/${id}` : `${API_USERS_URL}/users/${id}`;

    // 2. Usar fetchPublic para manejar la petición
    // 💡 CAMBIO CLAVE: Usamos fetchPublic porque estos endpoints PATCH son 'permitAll()'.
    // fetchPublic ya se encarga de:
    // - Omitir las credenciales (cookies)
    // - Añadir el 'Content-Type: application/json' (gracias a la lógica de fetchWithAuth)
    // - Manejar errores HTTP y parsear el JSON de la respuesta
    
    // NOTA: fetchPublic ya tiene la lógica de error incorporada y lanza la excepción si !response.ok
    try {
        const result = await fetchPublic(url, {
            method: 'PATCH',
            // fetchPublic/fetchWithAuth ya maneja el Content-Type, solo necesitamos el body.
            body: JSON.stringify(data)
        });
        
        // Si no hay error, retorna el resultado JSON parseado por fetchPublic/fetchWithAuth
        return result; 

    } catch (error) {
        // Capturamos el error relanzado por fetchPublic/fetchWithAuth.
        
        // El error relanzado ya contiene un mensaje de error detallado (ej: "Error 400: Bad Request")
        // Aquí puedes refinar el mensaje si lo deseas o simplemente relanzar el error.
        
        // Ejemplo de refinamiento:
        const specificError = error.message.includes('Acceso denegado') 
            ? error 
            : new Error(`Error al actualizar ${type} con PATCH: ${error.message}`);
        
        throw specificError;
    }
}

// Función para eliminar registros de manera robusta
export async function deleteRecordsFromAPI(companyId, adminId) {
    // Intenta eliminar al usuario.
    const adminResponse = await fetch(`http://localhost:8080/api/users/${adminId}`, {
        method: 'DELETE',
    });

    // Si la respuesta es 404, significa que el registro no existe, lo cual está bien.
    // Si la respuesta es 204 (No Content), significa que la eliminación fue exitosa.
    if (!adminResponse.ok && adminResponse.status !== 404 && adminResponse.status !== 204) {
        // Lanza un error solo para otros códigos de estado.
        const errorData = await adminResponse.json().catch(() => ({ error: 'Error al parsear JSON.' }));
        throw new Error(errorData.error || `Error al eliminar al administrador: ${adminResponse.status}`);
    }

    // Intenta eliminar la compañía.
    const companyResponse = await fetch(`${API_COMPANY_URL}/companies/${companyId}`, {
        method: 'DELETE',
    });

    if (!companyResponse.ok && companyResponse.status !== 404 && companyResponse.status !== 204) {
        const errorData = await companyResponse.json().catch(() => ({ error: 'Error al parsear JSON.' }));
        throw new Error(errorData.error || `Error al eliminar la compañía: ${companyResponse.status}`);
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

/**
 * Activa todos los técnicos pendientes de una compañía y les envía correos
 * @param {number} companyId - ID de la compañía
 * @returns {Promise<object>} - Respuesta del servidor
 */
export async function activatePendingTechniciansAPI(companyId) {
    try {
        console.log("Enviando solicitud para activar técnicos pendientes, companyId:", companyId);
        
        const response = await fetch(`http://localhost:8080/api/firstuse/activate-pending-technicians`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId: companyId })
        });

        const responseText = await response.text();
        console.log("Respuesta del servidor (texto):", responseText);

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

        const result = JSON.parse(responseText);
        console.log("Técnicos activados exitosamente:", result);
        return result;
        
    } catch (error) {
        console.error("Error en activatePendingTechniciansAPI:", error);
        throw error;
    }
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