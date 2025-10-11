// La URL base la API, apuntando al controlador de usuarios.
const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/users';

// URL para endpoints de compañías (nueva constante)
const COMPANY_API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

/**
 * Envía las credenciales al backend para su validación.
 * @param {object} credentials - Un objeto con 'username' y 'password'.
 * @returns {Promise<object>} - La respuesta del servidor (token, rolId, etc.).
 */
export async function login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Credenciales inválidas');
    }
    return response.json();
}

/**
 * Verifica si ya existe al menos una compañía en el backend.
 * Esta versión incluye pausas de SweetAlert para debugging.
 * @returns {Promise<boolean>} - True si hay compañías, false si no.
 */
export async function checkCompanyExistence() {
    let result = false;

    // Función auxiliar para mostrar alertas de forma segura
    const safeSwal = (config) => {
        if (typeof Swal !== 'undefined' && Swal.fire) {
            return Swal.fire(config); // Retorna la promesa de Swal.fire
        } else {
            console.warn("SweetAlert no está disponible. Usando alert() nativo. Mensaje: " + config.text);
            alert(config.title + "\n" + config.text);
            return Promise.resolve(true); // Resuelve inmediatamente
        }
    };

    try {
        console.log("-> Iniciando verificación de existencia de compañías...");
        const response = await fetch(`${COMPANY_API_URL}/check-company-existence`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("-> 🛑 Error del servidor al verificar la existencia de compañías:", response.status, errorText);

            // 🚨 PAUSA 1: Alerta SweetAlert para Error HTTP. Espera a que el usuario presione "Aceptar".
            await safeSwal({
                icon: 'error',
                title: 'Error de Verificación (Revisar Consola)',
                text: `El servidor respondió con el código ${response.status}. Mensaje: ${errorText.substring(0, 100)}...`,
                confirmButtonText: 'Continuar (No Redirigir)' 
                // Nota: Usamos "Continuar" pero devolvemos 'false' para que el controlador tome la decisión.
            });

            return false;
        }

        const responseData = await response.json();
        result = typeof responseData === 'boolean' ? responseData : responseData?.exists || false;

        console.log(`-> ✅ Éxito - Respuesta JSON completa:`, responseData);
        console.log(`-> ✅ Resultado procesado (companyExists): ${result}`);
        
        // 🚨 PAUSA 2: Alerta SweetAlert para Éxito. Espera a que el usuario presione "Continuar".
        await safeSwal({
            icon: result ? 'success' : 'info',
            title: 'Verificación de Compañía Completa (Revisar Consola)',
            html: `Resultado del Backend: <strong>${result}</strong><br>
                  ${result ? '¡Hay compañías! (Se mantendrá en la página).' : 'No hay compañías. (Se redirigirá).'}<br><br>
                  Presiona 'Continuar' para que el script siga su curso.`,
            confirmButtonText: 'Continuar'
        });
        
        return result;

    } catch (error) {
        console.error("-> 🛑 Fallo de red/fetch al verificar la existencia de compañías:", error);

        // 🚨 PAUSA 3: Alerta SweetAlert para Fallo de Red. Espera a que el usuario presione "Cerrar".
        await safeSwal({
            icon: 'warning',
            title: 'Error de Conexión (Revisar Consola)',
            text: `Fallo al intentar conectar con el servidor: ${error.message}`,
            confirmButtonText: 'Cerrar'
        });

        // En caso de fallo de red, se asume que no podemos confirmar, devolvemos false (lo cual redirige en el controlador).
        return false;
    }
}

/**
 * Envía los datos de un nuevo usuario para registrarlo en el sistema.
 * @param {object} userData - Objeto con los datos del usuario (fullName, username, email, password).
 * @returns {Promise<object>} - El objeto del usuario registrado devuelto por la API.
 */
export async function register(userData) {
    // Hacemos la petición POST al endpoint /register de tu API.
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // El cuerpo debe coincidir con el UserDTO de Spring.
        body: JSON.stringify(userData)
    });

    // Si la respuesta no es exitosa (ej. 400 Bad Request por usuario duplicado),
    // leemos el mensaje de error del cuerpo.
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Error al registrar el usuario.');
    }

    // Si el registro es exitoso (código 201 CREATED), devolvemos la respuesta.
    return response.json();
}