// activityController.js

// 1. Importa las funciones del servicio.
import {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity
} from '../services/activitiesService.js';

// 2. Obtén referencias a los elementos del DOM.
const activitiesGrid = document.getElementById('activitiesGrid');
const activityForm = document.getElementById('activityForm');
const createActivityModal = document.getElementById('createActivityModal');
const createActivityModalLabel = document.getElementById('createActivityModalLabel');
const createActivitySubmitBtn = document.getElementById('createActivitySubmitBtn');
const titleInput = document.getElementById('activityTitle');
const descriptionInput = document.getElementById('activityDescription');
const activityIdInput = document.getElementById('activityId');

// 3. Función para cargar y renderizar las tarjetas de actividades.
async function loadActivities() {
    try {
        const response = await getActivities();
        activitiesGrid.innerHTML = ''; // Limpia el contenedor antes de renderizar

        const activitiesToRender = response.content;
        
        if (activitiesToRender && activitiesToRender.length > 0) {
            activitiesToRender.forEach(activity => {
                const cardHtml = createActivityCard(activity);
                activitiesGrid.innerHTML += cardHtml;
            });
            // 💡 Llama a esta función aquí para asegurarte de que los listeners se adjunten después de que las tarjetas se hayan creado.
            addCardEventListeners();
        } else {
            activitiesGrid.innerHTML = '<p class="text-center text-muted">No se encontraron actividades.</p>';
        }
    } catch (error) {
        console.error("Error al cargar actividades:", error);
        activitiesGrid.innerHTML = `<p class="text-center text-danger">Error al cargar las actividades. Por favor, inténtelo de nuevo.</p>`;
    }
}
//hoas

//Cambios Jor
// 4. Función para generar el HTML de una tarjeta individual.
function createActivityCard(activity) {
    // 💡 Se ha corregido la capitalización de las propiedades.
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div class="card-custom">
                <h6 class="fw-semibold fs-5 mb-3">${activity.activityTitle}</h6>
                <p class="text-muted flex-grow-1">${activity.activityDescription}</p>
                
                <div class="dropdown more-options">
                    <button class="btn btn-sm btn-icon border-0 p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" data-action="update" data-id="${activity.id}">
                            <i class="bi bi-pencil-square me-2"></i>Actualizar actividad
                        </a></li>
                        <li><a class="dropdown-item" data-action="delete" data-id="${activity.id}">
                            <i class="bi bi-trash3-fill me-2"></i>Eliminar actividad
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// 5. Agrega listeners para los botones de las tarjetas
function addCardEventListeners() {
    document.querySelectorAll('[data-action="update"]').forEach(btn => {
        btn.addEventListener('click', async (event) => {
            const activityId = event.currentTarget.dataset.id;
            try {
                // Obtener el objeto completo de la actividad (idealmente desde una caché o volviéndola a buscar)
                const response = await getActivities();
                // 💡 Aquí también se ha corregido el nombre de la propiedad.
                const activityToUpdate = response.content.find(a => a.activity_id === parseInt(activityId));
                if (activityToUpdate) {
                    openUpdateModal(activityToUpdate);
                }
            } catch (error) {
                console.error("Error al obtener la actividad para actualizar:", error);
                Swal.fire('Error', 'No se pudo cargar la actividad para su edición.', 'error');
            }
        });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async (event) => {
            const activityId = event.currentTarget.dataset.id;
            Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await deleteActivity(parseInt(activityId)); 
                        Swal.fire('¡Eliminada!', 'La actividad ha sido eliminada.', 'success');
                        loadActivities(); // Recarga la lista de actividades
                    } catch (error) {
                        Swal.fire('Error', 'No se pudo eliminar la actividad.', 'error');
                    }
                }
            });
        });
    });
}

// 6. Funciones del modal (Crear y Actualizar)
const createActivityBtn = document.getElementById('createActivityBtn');
createActivityBtn.addEventListener('click', () => {
    // Configura el modal para "Crear"
    activityIdInput.value = '';
    activityForm.reset();
    createActivityModalLabel.textContent = "Crear Actividad";
    createActivitySubmitBtn.textContent = "Crear";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
});

function openUpdateModal(activity) {
    // 💡 Aquí también se ha corregido la capitalización de las propiedades.
    activityIdInput.value = activity.activity_id;
    titleInput.value = activity.activitytitle;
    descriptionInput.value = activity.activitydescription;
    
    createActivityModalLabel.textContent = "Actualizar Actividad";
    createActivitySubmitBtn.textContent = "Actualizar";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
}

document.addEventListener('click', function(event) {
    if (event.target.matches('[data-bs-toggle="dropdown"]')) {
        const dropdownElement = event.target.closest('.dropdown');
        new bootstrap.Dropdown(dropdownElement).toggle();
    }
});

// 7. Manejador de envío del formulario
activityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = activityIdInput.value;
    const title = titleInput.value;
    const description = descriptionInput.value;

    // 💡 Se ha corregido la capitalización de los datos enviados a la API.
    const data = {
        activityTitle: title,
        activityDescription: description
    };

    try {
        if (id) {
            // Lógica de actualización
            await updateActivity(data, id);
            Swal.fire('¡Éxito!', 'La actividad ha sido actualizada.', 'success');
        } else {
            // Lógica de creación
            await createActivity(data);
            Swal.fire('¡Éxito!', 'La actividad ha sido creada.', 'success');
        }
        
        // Acciones comunes después del éxito
        const modalInstance = bootstrap.Modal.getInstance(createActivityModal);
        modalInstance.hide();
        activityForm.reset();
        loadActivities(); // Recarga la lista para mostrar el cambio
        
    } catch (error) {
        console.error("Error al procesar la actividad:", error);
        Swal.fire('Error', 'No se pudo procesar la actividad.', 'error');
    }
});

// 8. Inicia la carga de actividades al cargar la página
document.addEventListener('DOMContentLoaded', loadActivities);
