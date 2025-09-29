import {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity
} from '../services/activitiesService.js';

const activitiesGrid = document.getElementById('activitiesGrid');
const activityForm = document.getElementById('activityForm');
const createActivityModal = document.getElementById('createActivityModal');
const createActivityModalLabel = document.getElementById('createActivityModalLabel');
const createActivitySubmitBtn = document.getElementById('createActivitySubmitBtn');
const titleInput = document.getElementById('activityTitle');
const descriptionInput = document.getElementById('activityDescription');
const activityIdInput = document.getElementById('activityId');
const formatBar = document.querySelector('.format-bar');
const searchInput = document.getElementById('searchInput');
const ticketsPerPage = document.getElementById('ticketsPerPage');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

let currentPage = 0; 
let currentSize = 4; 
let totalPages = 0;

let activitiesData = [];

//  función para cargar y renderizar las tarjetas de actividades
async function loadActivities(forceReload = false) { 
    try {
        const searchTerm = searchInput.value.trim();

        // 🚨 CORRECCIÓN: Ahora llamamos a la API con currentPage, currentSize, y searchTerm
        const response = await getActivities(currentPage, currentSize, searchTerm);
        
        activitiesData = response.content || [];
        totalPages = response.totalPages || 0;

        activitiesGrid.innerHTML = '';
        const activitiesToRender = activitiesData;
        
        if (activitiesToRender.length > 0) {
            activitiesToRender.forEach(activity => {
                const cardHtml = createActivityCard(activity);
                activitiesGrid.innerHTML += cardHtml;
            });
        } else {
            activitiesGrid.innerHTML = '<p class="text-center text-muted">No se encontraron actividades.</p>';
        }

        updatePaginationControls();

    } catch (error) {
        console.error("Error al cargar actividades:", error);
        activitiesGrid.innerHTML = `<p class="text-center text-danger">Error al cargar las actividades. Por favor, inténtelo de nuevo.</p>`;
    }
}


function updatePaginationControls() {
    currentPageSpan.textContent = currentPage + 1; // muestra la página actual (base 1)

    // habilita/deshabilita el boton "Anterior"
    prevPageBtn.classList.toggle('disabled', currentPage === 0);

    // habilita/deshabilita el boton "Siguiente"
    nextPageBtn.classList.toggle('disabled', currentPage >= totalPages - 1 || totalPages === 0);
};

async function eliminarActividad(id) {
    try {
        await deleteActivity(id);
        
        Swal.fire('¡Eliminada!', 'La actividad ha sido eliminada con éxito.', 'success');
        
        await loadActivities(); 

    } catch (error) {
        console.error("Error al eliminar la actividad:", error);
        Swal.fire('Error', 'Hubo un problema al intentar eliminar la actividad.', 'error');
    }
}


function addLineBreaks(text, maxLength) {
    if (text.length > maxLength) {
        let breakPoint = text.substring(0, maxLength).lastIndexOf(" ");
        if (breakPoint === -1) {
            breakPoint = maxLength;
        }
        return text.substring(0, breakPoint) + "<br>" + text.substring(breakPoint + 1);
    }
    return text;
}

function createActivityCard(activity) {
    const descriptionHtmlParts = [];
    const lines = activity.activityDescription.split('\n');
    let inList = false;

    lines.forEach((line, index) => {
        let processedLine = line;

        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedLine = processedLine.replace(/__(.*?)__/g, '<u>$1</u>');

        if (processedLine.match(/^\[( |x)\]\s/)) {
            if (!inList) {
                descriptionHtmlParts.push('<ul class="list-unstyled mb-0">');
                inList = true;
            }
            const isChecked = processedLine.startsWith('[x]');
            const taskText = processedLine.replace(/^\[( |x)\]\s/, '');
            descriptionHtmlParts.push(`
                <li class="d-flex align-items-start">
                    <input type="checkbox" class="form-check-input me-2 mt-1" ${isChecked ? 'checked' : ''} data-activity-id="${activity.id}" data-task-index="${index}">
                    <span class="${isChecked ? 'text-decoration-line-through text-muted' : ''}">${taskText}</span>
                </li>
            `);
        } else {
            if (inList) {
                descriptionHtmlParts.push('</ul>');
                inList = false;
            }
            descriptionHtmlParts.push(addLineBreaks(processedLine, 46));
        }
    });

    if (inList) {
        descriptionHtmlParts.push('</ul>');
    }

    const processedDescription = descriptionHtmlParts.join('');
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div class="card-agendada shadow-sm">
                <div class="card-agendada-header pb-3">
                    <h5 class="card-agendada-title">${activity.activityTitle}</h5>
                    <button type="button" data-action="delete" class="btn-close-agendada delete-activity-btn" data-id="${activity.id}" aria-label="Close"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="card-agendada-body pb-5 mb-5">
                    <div class="activity-description">${processedDescription}</div>
                </div>
                <div class="card-agendada-footer mt-5">
                    <button class="btn btn-edit-agendada edit-activity-btn" data-action="update" data-id="${activity.id}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

//Motor de busqueda 
searchInput.addEventListener('input', (event) => {
    currentPage = 0;
    loadActivities();
});

ticketsPerPage.addEventListener('change', () => {
    // Actualiza currentSize
    currentSize = parseInt(ticketsPerPage.value);
    currentPage = 0;

    loadActivities();
});

// Manejador del botopn "Anterior"
prevPageBtn.addEventListener('click', (event) => {
    event.preventDefault(); 
    if (currentPage > 0) {
        currentPage--;
        loadActivities();
    }
});

// Manejador del boton "Siguiente"
nextPageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentPage < totalPages - 1) { 
        currentPage++;
        loadActivities();
    }
});

function openUpdateModal(activity) {
    activityIdInput.value = activity.id;
    titleInput.value = activity.activityTitle;
    descriptionInput.value = activity.activityDescription;
    
    createActivityModalLabel.textContent = "Actualizar Actividad";
    createActivitySubmitBtn.textContent = "Actualizar";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
}


// Delegación de eventos para manejar clics en cualquier parte de la cuadrícula
activitiesGrid.addEventListener('click', async (event) => {
    // Verifica si el clic fue en un checkbox
    if (event.target.matches('.activity-description input[type="checkbox"]')) {
        const checkbox = event.target;
        const activityId = parseInt(checkbox.dataset.activityId);
        const taskIndex = parseInt(checkbox.dataset.taskIndex);

        const activity = activitiesData.find(a => a.id === activityId);
        if (!activity) {
            console.error('Actividad no encontrada para el checkbox.');
            return;
        }

        const lines = activity.activityDescription.split('\n');
        if (lines[taskIndex]) {
            const isChecked = checkbox.checked;
            if (isChecked) {
                // Reemplaza [ ] por [x]
                lines[taskIndex] = lines[taskIndex].replace(/^\[ \]/, '[x]');
            } else {
                // Reemplaza [x] por [ ]
                lines[taskIndex] = lines[taskIndex].replace(/^\[x\]/, '[ ]');
            }
            const newDescription = lines.join('\n');
            
            try {
                const newTitle = activity.activityTitle;
                await updateActivity({ activityTitle: newTitle, activityDescription: newDescription }, activityId);

                // Opcional: actualiza el caché de datos y vuelve a renderizar para reflejar el cambio
                activity.activityDescription = newDescription;
                loadActivities();

            } catch (error) {
                console.error("Error al actualizar la actividad:", error);
                Swal.fire('Error', 'No se pudo actualizar la actividad.', 'error');
            }
        }
    }
    
    const clickedElement = event.target.closest('[data-action]');
    if (!clickedElement) return;

    if (clickedElement.matches('.edit-activity-btn')) {
        const activityId = parseInt(clickedElement.dataset.id);
        const activityToUpdate = activitiesData.find(a => a.id === activityId);
        if (activityToUpdate) {
            openUpdateModal(activityToUpdate);
        }
    } else if (clickedElement.matches('.delete-activity-btn')) {
        const activityId = parseInt(clickedElement.dataset.id);
        
        // eliminacion de actividad
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar esta actividad? ¡No se puede revertir!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', 
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarActividad(activityId);
            }
        });
    }
});






// funciones de creacion y actualizacion
const createActivityBtn = document.getElementById('createActivityBtn');
createActivityBtn.addEventListener('click', () => {
    activityIdInput.value = '';
    activityForm.reset();
    createActivityModalLabel.textContent = "Crear Actividad";
    createActivitySubmitBtn.textContent = "Crear";
    
    const myModal = new bootstrap.Modal(createActivityModal);
    myModal.show();
});

document.addEventListener('click', function(event) {
    if (event.target.matches('[data-bs-toggle="dropdown"]')) {
        const dropdownElement = event.target.closest('.dropdown');
        new bootstrap.Dropdown(dropdownElement).toggle();
    }
});

// manejador de eventos para la barra de herramientas de formato
formatBar.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]').dataset.action;
    let start = descriptionInput.selectionStart;
    let end = descriptionInput.selectionEnd;
    let selectedText = descriptionInput.value.substring(start, end);

    let formattedText = '';
    let newCursorPos = end;

    switch(action) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            newCursorPos = start + 2;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            newCursorPos = start + 2;
            break;
        case 'list':
            const lines = selectedText.split('\n');
            formattedText = lines.map(line => `[ ] ${line}`).join('\n');
            newCursorPos = start + 4;
            break;
        default:
            return;
    }

    descriptionInput.value = descriptionInput.value.substring(0, start) + formattedText + descriptionInput.value.substring(end);
    
    // Vuelve a colocar el cursor
    descriptionInput.focus();
    descriptionInput.setSelectionRange(newCursorPos, newCursorPos);
});

// Manejador de envío del formulario
activityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = activityIdInput.value;
    const title = titleInput.value;
    const description = descriptionInput.value;

    if (title.length > 100) {
        Swal.fire('Error', 'El título no puede exceder los 100 caracteres.', 'error');
        return; // Detiene la ejecución si hay un error
    }

    if (description.length > 255) {
        Swal.fire('Error', 'La descripción no puede exceder los 255 caracteres.', 'error');
        return; // Detiene la ejecución si hay un error
    }
    
    const data = {
        activityTitle: title,
        activityDescription: description
    };

    try {
        if (id) {
            await updateActivity(data, id);
            Swal.fire('¡Éxito!', 'La actividad ha sido actualizada.', 'success');
        } else {
            await createActivity(data);
            Swal.fire('¡Éxito!', 'La actividad ha sido creada.', 'success');
            currentPage = 0;
        }
        
        const modalInstance = bootstrap.Modal.getInstance(createActivityModal);
        modalInstance.hide();
        activityForm.reset();
        await loadActivities(true);
        
    } catch (error) {
        console.error("Error al procesar la actividad:", error);
        Swal.fire('Error', 'No se pudo procesar la actividad.', 'error');

        if (title.length > 100) {
        Swal.fire('Error', 'El título no puede exceder los 100 caracteres.', 'error');
    }

    if (description.length > 255) {
        Swal.fire('Error', 'La descripción no puede exceder los 255 caracteres.', 'error');
    }
    }
});

//  carga de actividades al cargar la página
document.addEventListener('DOMContentLoaded', loadActivities);