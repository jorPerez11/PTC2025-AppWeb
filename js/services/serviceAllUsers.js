// serviceAllUsers.js

// Endpoint de la API para obtener los datos de los técnicos.
const API_TECNICO_URL = 'https://retoolapi.dev/L79ky8/dataTecnico';
// Endpoint de la API para obtener las categorías de los técnicos.
const API_CATEGORIAS_URL = "https://retoolapi.dev/mNwaIw/categorias";

/**
 * Obtiene todos los técnicos desde la API.
 * @returns {Promise<Array<Object>>} Un array de objetos con los datos de los técnicos.
 * @throws {Error} Si la respuesta de la red no es exitosa.
 */
export async function getTecnicosFromAPI() {
    try {
        const res = await fetch(API_TECNICO_URL);
        if (!res.ok) {
            throw new Error(`Error al obtener técnicos: Status ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error en getTecnicosFromAPI:', err);
        throw err;
    }
}

/**
 * Obtiene las categorías de técnicos desde la API.
 * @returns {Promise<Array<Object>>} Un array de objetos con las categorías.
 * @throws {Error} Si la respuesta de la red no es exitosa.
 */
export async function getCategoriasFromAPI() {
    try {
        const res = await fetch(API_CATEGORIAS_URL);
        if (!res.ok) {
            throw new Error(`Error al obtener categorías: Status ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error en getCategoriasFromAPI:', err);
        throw err;
    }
}

/**
 * Obtiene los detalles de un técnico específico por su ID.
 * @param {string|number} tecnicoId - El ID del técnico a buscar.
 * @returns {Promise<Object>} El objeto del técnico.
 * @throws {Error} Si el técnico no se encuentra o hay un error de red.
 */
export async function getTecnicoById(tecnicoId) {
    const url = `${API_TECNICO_URL}/${tecnicoId}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error al obtener técnico ${tecnicoId}: Status ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error en getTecnicoById:', err);
        throw err;
    }
}

/**
 * Actualiza la categoría de un técnico en la API.
 * @param {string|number} tecnicoId - El ID del técnico a actualizar.
 * @param {string} newCategory - La nueva categoría del técnico.
 * @returns {Promise<Object>} El objeto del técnico actualizado.
 * @throws {Error} Si la actualización falla.
 */
export async function updateTecnicoCategoryInAPI(tecnicoId, newCategory) {
    const url = `${API_TECNICO_URL}/${tecnicoId}`;
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: newCategory })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Falló la actualización con status ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error en updateTecnicoCategoryInAPI:', err);
        throw err;
    }
}